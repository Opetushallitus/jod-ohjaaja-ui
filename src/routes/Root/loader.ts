import i18n, { defaultLang, LangCode, supportedLanguageCodes } from '@/i18n/config';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { LoaderFunction, replace } from 'react-router';

export default (async ({ params: { lng }, context }) => {
  const { fetchSuosikit, clearSuosikit } = useSuosikitStore.getState();
  // Redirect if the language is not supported
  if (lng && !supportedLanguageCodes.includes(lng as LangCode)) {
    return replace(`/${defaultLang}`);
  }

  // Change language if it is different from the current language
  if (lng && lng !== i18n.language && supportedLanguageCodes.includes(lng as LangCode)) {
    await i18n.changeLanguage(lng);
  }

  const isLoggedIn = !!context;
  await (isLoggedIn ? fetchSuosikit() : clearSuosikit());

  return context;
}) satisfies LoaderFunction;
