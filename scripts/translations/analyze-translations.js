#!/usr/bin/env node

/**
 * Translation Key Analyzer
 *
 * Analyzes translation keys in the codebase and compares them with translation files
 * to detect:
 * 1. Missing translations (keys in code but not in translation files)
 * 2. Unused translations (keys in translation files but not used in code)
 * 3. Dynamic translation keys (cannot be statically analyzed)
 *
 * Supports i18next plural forms (_one, _other, _many, _few, _zero)
 *
 * Usage:
 *   node scripts/translations/analyze-translations.js
 *   node scripts/translations/analyze-translations.js --list-unused
 *   node scripts/translations/analyze-translations.js --list-missing fi,en
 *   node scripts/translations/analyze-translations.js --list-unused --list-missing fi,en,sv
 *   node scripts/translations/analyze-translations.js --ci --check-langs fi,sv
 *
 * CI Mode:
 *   --ci                       Exit with code 1 if issues found (for git hooks/CI)
 *   --check-langs fi,sv        Languages to check in CI mode (default: fi,sv)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LANGUAGES = ['fi', 'en', 'sv'];
const PLURAL_SUFFIXES = ['_one', '_other', '_many', '_few', '_zero'];
const SRC_DIR = path.join(__dirname, '../../src');
const I18N_DIR = path.join(SRC_DIR, 'i18n');
const CODE_EXTENSIONS = ['.ts', '.tsx'];

// Parse command line arguments
const args = process.argv.slice(2);
const listUnused = args.includes('--list-unused');
const listMissingArg = args.find((arg) => arg.startsWith('--list-missing'));
const listMissingLangs = listMissingArg
  ? (args[args.indexOf(listMissingArg) + 1] || 'fi,en,sv').split(',').map((l) => l.trim())
  : null;
const ciMode = args.includes('--ci');
const checkLangsArg = args.find((arg) => arg.startsWith('--check-langs'));
const checkLangs = checkLangsArg ? args[args.indexOf(checkLangsArg) + 1].split(',').map((l) => l.trim()) : ['fi', 'sv'];

/**
 * Flatten nested JSON object to dot notation
 * Example: { a: { b: 'value' } } => { 'a.b': 'value' }
 */
function flattenObject(obj, prefix = '') {
  const result = {};

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(result, flattenObject(obj[key], newKey));
    } else {
      result[newKey] = obj[key];
    }
  }

  return result;
}

/**
 * Load and merge translation files for a language
 * Returns { translations, keyToFile } where keyToFile maps each key to its source file
 */
function loadTranslations(lang) {
  const translations = {};
  const keyToFile = {};
  const langDir = path.join(I18N_DIR, lang);

  // Load main translation file
  const mainFile = path.join(langDir, 'translation.json');
  if (fs.existsSync(mainFile)) {
    const content = JSON.parse(fs.readFileSync(mainFile, 'utf-8'));
    const flattened = flattenObject(content);
    Object.assign(translations, flattened);
    for (const key of Object.keys(flattened)) {
      keyToFile[key] = 'translation.json';
    }
  }

  // Load draft translation file (overrides main)
  const draftFile = path.join(langDir, 'draft.translation.json');
  if (fs.existsSync(draftFile)) {
    const content = JSON.parse(fs.readFileSync(draftFile, 'utf-8'));
    const flattened = flattenObject(content);
    Object.assign(translations, flattened);
    for (const key of Object.keys(flattened)) {
      keyToFile[key] = 'draft.translation.json';
    }
  }

  return { translations, keyToFile };
}

/**
 * Get all files with specific extensions recursively
 */
function getAllFiles(dir, extensions, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and other irrelevant directories
      if (!['node_modules', 'dist', 'build', 'coverage', '.git'].includes(file)) {
        getAllFiles(filePath, extensions, fileList);
      }
    } else if (extensions.some((ext) => file.endsWith(ext))) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Extract translation keys from code
 * Returns { keysMap, dynamicKeys }
 * - keysMap: Map of key -> [files where it's used]
 * - dynamicKeys: Array of { file, line, code } for dynamic translation keys
 */
function extractKeysFromCode() {
  const keysMap = new Map();
  const dynamicKeys = [];
  const files = getAllFiles(SRC_DIR, CODE_EXTENSIONS);

  // Regex patterns for different usage scenarios
  const patterns = [
    // t('key') or t("key") - including with options
    /\bt\s*\(\s*['"`]([^'"`]+)['"`]/g,

    // i18n.t('key') or i18n.t("key")
    /i18n\.t\s*\(\s*['"`]([^'"`]+)['"`]/g,

    // <Trans i18nKey="key" /> or <Trans i18nKey='key' />
    /i18nKey\s*=\s*['"`]([^'"`]+)['"`]/g,

    // i18n.exists('key')
    /i18n\.exists\s*\(\s*['"`]([^'"`]+)['"`]/g,
  ];

  // Patterns for detecting dynamic keys (must check these first)
  const dynamicPatterns = [
    // t(`template ${var}`) - template literals with interpolation
    {
      pattern: /\bt\s*\(\s*`[^`]*\$\{[^`]*`/g,
      name: 't() with template literal',
    },
    // t('string' + anything) or t("string" + anything) - string concatenation
    {
      pattern: /\bt\s*\(\s*['"][^'"]*['"]\s*\+/g,
      name: 't() with string concatenation',
    },
    // t(variable) without options - direct variable usage
    // Matches t(variable) or t(variable.property) but not t(variable, {...})
    {
      pattern: /\bt\s*\(\s*[a-zA-Z_$][a-zA-Z0-9_$.]*\s*\)/g,
      name: 't() with variable',
    },
    // i18n.t with template literals
    {
      pattern: /i18n\.t\s*\(\s*`[^`]*\$\{[^`]*`/g,
      name: 'i18n.t() with template literal',
    },
    // i18n.t with concatenation
    {
      pattern: /i18n\.t\s*\(\s*['"][^'"]*['"]\s*\+/g,
      name: 'i18n.t() with string concatenation',
    },
    // i18n.t(variable) without options
    {
      pattern: /i18n\.t\s*\(\s*[a-zA-Z_$][a-zA-Z0-9_$.]*\s*\)/g,
      name: 'i18n.t() with variable',
    },
    // <Trans i18nKey={variable} />
    {
      pattern: /i18nKey\s*=\s*\{[^}]+\}/g,
      name: '<Trans i18nKey={...} />',
    },
  ];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = path.relative(SRC_DIR, file);
    const lines = content.split('\n');

    // Detect dynamic keys first
    const dynamicMatches = new Set();
    for (const { pattern, name } of dynamicPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        // Find line number
        const position = match.index;
        let lineNum = 1;
        let charCount = 0;
        for (let i = 0; i < lines.length; i++) {
          charCount += lines[i].length + 1; // +1 for newline
          if (charCount > position) {
            lineNum = i + 1;
            break;
          }
        }

        // Extract the line of code
        const codeLine = lines[lineNum - 1].trim();

        // Create a unique identifier for this match to avoid duplicates
        const matchId = `${relativePath}:${lineNum}:${codeLine}`;
        if (!dynamicMatches.has(matchId)) {
          dynamicMatches.add(matchId);
          dynamicKeys.push({
            file: relativePath,
            line: lineNum,
            code: codeLine.length > 100 ? codeLine.substring(0, 100) + '...' : codeLine,
            type: name,
          });
        }
      }
    }

    // Extract static keys
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const key = match[1];

        // Skip if key contains template literals or variables
        if (key.includes('${') || key.includes('`')) {
          continue;
        }

        if (!keysMap.has(key)) {
          keysMap.set(key, []);
        }
        keysMap.get(key).push(relativePath);
      }
    }
  }

  return { keysMap, dynamicKeys };
}

/**
 * Get base key without plural suffix
 */
function getBaseKey(key) {
  for (const suffix of PLURAL_SUFFIXES) {
    if (key.endsWith(suffix)) {
      return key.slice(0, -suffix.length);
    }
  }
  return key;
}

/**
 * Check if a key is a plural form
 */
function isPluralKey(key) {
  return PLURAL_SUFFIXES.some((suffix) => key.endsWith(suffix));
}

/**
 * Get all plural variants for a base key that exist in translations
 */
function getPluralVariants(baseKey, translations) {
  const variants = [];
  for (const suffix of PLURAL_SUFFIXES) {
    const pluralKey = baseKey + suffix;
    if (translations.hasOwnProperty(pluralKey)) {
      variants.push(pluralKey);
    }
  }
  return variants;
}

/**
 * Analyze translations
 */
function analyzeTranslations() {
  console.log('🔍 Analyzing translation keys...\n');

  // Extract keys from code
  const { keysMap: codeKeys, dynamicKeys } = extractKeysFromCode();
  console.log(`Found ${codeKeys.size} unique translation keys in code`);
  if (dynamicKeys.length > 0) {
    console.log(`⚠️  Found ${dynamicKeys.length} dynamic translation key(s) that cannot be analyzed`);
  }
  console.log('');

  // Load translations for all languages
  const translationsByLang = {};
  for (const lang of LANGUAGES) {
    translationsByLang[lang] = loadTranslations(lang);
    console.log(`Loaded ${Object.keys(translationsByLang[lang].translations).length} translation keys for ${lang}`);
  }
  console.log('');

  // Analyze each language
  const results = { dynamicKeys };

  for (const lang of LANGUAGES) {
    const { translations, keyToFile } = translationsByLang[lang];
    const translationKeys = new Set(Object.keys(translations));

    // Build expected keys for this language
    const expectedKeys = new Map();
    for (const [key, files] of codeKeys.entries()) {
      // Check if this key has plural variants in translations
      const pluralVariants = getPluralVariants(key, translations);

      if (pluralVariants.length > 0) {
        // If plural variants exist, we expect all of them (not the base key)
        for (const pluralKey of pluralVariants) {
          expectedKeys.set(pluralKey, files);
        }
      } else {
        // No plural variants, expect the base key
        expectedKeys.set(key, files);
      }
    }

    // Find missing translations (in code but not in translation files)
    const missing = [];
    for (const [key, files] of expectedKeys.entries()) {
      if (!translationKeys.has(key)) {
        missing.push({ key, files: [...new Set(files)] });
      }
    }

    // Find unused translations (in translation files but not in code)
    const unused = [];
    for (const key of translationKeys) {
      const baseKey = getBaseKey(key);

      // A translation key is used if:
      // 1. It's directly in codeKeys (base form), OR
      // 2. It's a plural variant and its base key is in codeKeys
      const isUsed = codeKeys.has(key) || (isPluralKey(key) && codeKeys.has(baseKey));

      if (!isUsed) {
        unused.push({ key, file: keyToFile[key] });
      }
    }

    results[lang] = { missing, unused, translations };
  }

  return results;
}

/**
 * Print results
 */
function printResults(results) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    TRANSLATION ANALYSIS REPORT                ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Summary
  console.log('📊 SUMMARY\n');
  console.log('┌─────────┬─────────────────────┬──────────────────────┐');
  console.log('│ Language│ Missing Translations│ Unused Translations  │');
  console.log('├─────────┼─────────────────────┼──────────────────────┤');

  for (const lang of LANGUAGES) {
    const { missing, unused } = results[lang];
    console.log(
      `│   ${lang.toUpperCase()}   │         ${String(missing.length).padStart(3)}         │          ${String(unused.length).padStart(3)}         │`,
    );
  }

  console.log('└─────────┴─────────────────────┴──────────────────────┘\n');

  // Detailed unused translations
  if (listUnused) {
    console.log('\n📝 UNUSED TRANSLATIONS (keys in translation files but not used in code)\n');

    for (const lang of LANGUAGES) {
      const { unused } = results[lang];
      if (unused.length > 0) {
        console.log(`\n${lang.toUpperCase()} (${unused.length} unused keys):`);
        console.log('─'.repeat(70));

        // Group by base key for plural forms
        const grouped = {};
        for (const { key, file } of unused) {
          const baseKey = getBaseKey(key);
          if (!grouped[baseKey]) {
            grouped[baseKey] = { keys: [], files: new Set() };
          }
          grouped[baseKey].keys.push(key);
          grouped[baseKey].files.add(file);
        }

        for (const [baseKey, { keys, files }] of Object.entries(grouped)) {
          if (keys.length === 1) {
            console.log(`  • ${keys[0]}`);
          } else {
            console.log(`  • ${baseKey} (plural forms: ${keys.map((k) => k.replace(baseKey, '')).join(', ')})`);
          }
          const filesList = [...files].join(', ');
          console.log(`    Found in: ${lang}/${filesList}`);
        }
      }
    }
  }

  // Detailed missing translations
  if (listMissingLangs) {
    console.log('\n\n⚠️  MISSING TRANSLATIONS (keys in code but not in translation files)\n');

    for (const lang of LANGUAGES) {
      if (!listMissingLangs.includes(lang)) continue;

      const { missing } = results[lang];
      if (missing.length > 0) {
        console.log(`\n${lang.toUpperCase()} (${missing.length} missing keys):`);
        console.log('─'.repeat(70));

        // Group by base key for plural forms
        const grouped = {};
        for (const { key, files } of missing) {
          const baseKey = getBaseKey(key);
          if (!grouped[baseKey]) {
            grouped[baseKey] = { keys: [], files: new Set() };
          }
          grouped[baseKey].keys.push(key);
          for (const f of files) {
            grouped[baseKey].files.add(f);
          }
        }

        for (const [baseKey, { keys, files }] of Object.entries(grouped)) {
          if (keys.length === 1) {
            console.log(`  • ${keys[0]}`);
          } else {
            console.log(`  • ${baseKey} (plural forms: ${keys.map((k) => k.replace(baseKey, '')).join(', ')})`);
          }
          const filesList = [...files].slice(0, 3).join(', ');
          const moreCount = files.size > 3 ? ` +${files.size - 3} more` : '';
          console.log(`    Used in: ${filesList}${moreCount}`);
        }
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════\n');

  // Dynamic keys warning (skip details in CI mode)
  if (results.dynamicKeys && results.dynamicKeys.length > 0 && !ciMode) {
    console.log('⚠️  DYNAMIC TRANSLATION KEYS (cannot be statically analyzed)\n');
    console.log(`Found ${results.dynamicKeys.length} dynamic translation key(s):\n`);

    // Group by file
    const byFile = {};
    for (const { file, line, code, type } of results.dynamicKeys) {
      if (!byFile[file]) {
        byFile[file] = [];
      }
      byFile[file].push({ line, code, type });
    }

    for (const [file, entries] of Object.entries(byFile)) {
      console.log(`📄 ${file}`);
      for (const { line, code, type } of entries) {
        console.log(`   Line ${line}: ${code}`);
        console.log(`   Type: ${type}`);
      }
      console.log('');
    }

    console.log('💡 Dynamic keys use variables or string concatenation, making static analysis');
    console.log('   impossible. Consider using static keys when possible.\n');
    console.log('═══════════════════════════════════════════════════════════════\n');
  }

  // Show help if no detailed flags were used
  if (!listUnused && !listMissingLangs && !ciMode) {
    console.log('💡 TIP: Use flags to see detailed lists:');
    console.log('   --list-unused              List all unused translation keys');
    console.log('   --list-missing fi,en,sv    List missing keys for specified languages\n');
  }

  // CI mode: check for issues and return exit status
  if (ciMode) {
    const hasDynamicKeys = results.dynamicKeys && results.dynamicKeys.length > 0;
    let hasMissingKeys = false;
    let hasUnusedKeys = false;

    for (const lang of checkLangs) {
      if (results[lang]) {
        if (results[lang].missing.length > 0) hasMissingKeys = true;
        if (results[lang].unused.length > 0) hasUnusedKeys = true;
      }
    }

    if (hasDynamicKeys || hasMissingKeys || hasUnusedKeys) {
      console.log('❌ Translation validation failed!\n');
      if (hasDynamicKeys) {
        console.log(`   • ${results.dynamicKeys.length} dynamic translation key(s) found`);
      }
      if (hasMissingKeys) {
        console.log(`   • Missing translations in: ${checkLangs.join(', ')}`);
      }
      if (hasUnusedKeys) {
        console.log(`   • Unused translations in: ${checkLangs.join(', ')}`);
      }
      console.log('\nRun without --ci flag for detailed information.\n');
      return 1; // Indicate failure
    } else {
      console.log(`✅ Translation validation passed for languages: ${checkLangs.join(', ')}\n`);
      return 0; // Indicate success
    }
  }

  return 0;
}

// Main execution
try {
  const results = analyzeTranslations();
  const exitCode = printResults(results);
  process.exit(exitCode);
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
