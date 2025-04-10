import { LangCode } from '@/i18n/config';
import { StructuredContent } from '@/types/cms-content';
import { describe, expect, it } from 'vitest';
import {
  getAcceptLanguageHeader,
  getContent,
  getDocuments,
  getImage,
  getIngress,
  getKeywords,
  getLinks,
  getTitle,
} from './cms';

const createTestData = (title: string, keywords: { id: string; name: string }[] | undefined = undefined) => {
  const structuredContent: StructuredContent = {
    title,
    contentFields: [],
    contentStructureId: 0,
    taxonomyCategoryBriefs: keywords?.map((keyword) => ({
      taxonomyCategoryName: keyword.name,
      taxonomyCategoryId: parseInt(keyword.id),
      embeddedTaxonomyCategory: {
        type: 'TAG',
      },
    })),
  };
  const api = {
    get() {
      return structuredContent;
    },
    addIngress(ingress: string) {
      structuredContent.contentFields?.push({
        contentFieldValue: { data: ingress },
        dataType: 'string',
        inputControl: 'text',
        label: 'ingress',
        name: 'ingress',
        nestedContentFields: [],
        repeatable: false,
      });
      return api;
    },
    addImage(image: string) {
      structuredContent.contentFields?.push({
        contentFieldValue: {
          image: {
            contentType: 'Document',
            contentUrl: `/test/path/${image}`,
            description: '',
            encodingFormat: 'image/jpeg',
            fileExtension: 'jpg',
            id: 32430,
            sizeInBytes: 3414318,
            title: image,
          },
        },
        dataType: 'image',
        label: 'image',
        name: 'image',
        nestedContentFields: [],
        repeatable: false,
      });
      return api;
    },
    addContent(content: string) {
      structuredContent.contentFields?.push({
        contentFieldValue: { data: content },
        dataType: 'string',
        inputControl: 'text',
        label: 'content',
        name: 'content',
        nestedContentFields: [],
        repeatable: false,
      });
      return api;
    },
    addLink(text: string, url: string | undefined) {
      const link = {
        contentFieldValue: {},
        dataType: '',
        label: 'link',
        name: 'link',
        nestedContentFields: [
          {
            contentFieldValue: { data: text },
            dataType: 'string',
            label: 'linktext',
            name: 'linktext',
            nestedContentFields: [],
            repeatable: false,
          },
        ],
        repeatable: true,
      };

      if (url !== undefined) {
        link.nestedContentFields.push({
          contentFieldValue: { data: url },
          dataType: 'string',
          label: 'linkurl',
          name: 'linkurl',
          nestedContentFields: [],
          repeatable: false,
        });
      }
      structuredContent.contentFields?.push(link);
      return api;
    },

    addDocument(document: string) {
      structuredContent.contentFields?.push({
        contentFieldValue: {
          document: {
            contentType: 'Document',
            contentUrl: `/test/path/${document}`,
            description: '',
            encodingFormat: 'application/pdf',
            fileExtension: 'pdf',
            id: 32430,
            sizeInBytes: 3414318,
            title: document,
          },
        },
        dataType: 'document',
        label: 'document',
        name: 'document',
        nestedContentFields: [],
        repeatable: true,
      });
      return api;
    },
  };
  return api;
};

describe('CMS utils', () => {
  describe('getAcceptLanguageHeader', () => {
    it('should return the header object with the corrent language string for a valid LangCode', () => {
      const langs = ['fi', 'en', 'sv'] as LangCode[];
      const resourceLanguages = ['fi-FI', 'en-US', 'sv-SE'];
      langs.forEach((lang, i) => {
        expect(getAcceptLanguageHeader(lang)['Accept-Language']).toBe(resourceLanguages[i]);
      });
    });

    it('should default to finnish with invalid input', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invalidLangs = [null, undefined, '', 0, false, NaN, {}] as any[];
      invalidLangs.forEach((lang) => {
        expect(getAcceptLanguageHeader(lang)['Accept-Language']).toBe('fi-FI');
      });
    });
  });

  describe('getContent', () => {
    it('should return the content if it exists', () => {
      const content = 'test content';
      const item = createTestData('test title').addContent(content).get();
      expect(getContent(item)).toBe(content);
    });

    it('should return an empty string if the content does not exist', () => {
      const item = createTestData('test title').get();
      expect(getContent(item)).toBe('');
    });
  });

  describe('getImage', () => {
    it('should return the image if it exists', () => {
      const image = 'test.jpg';
      const item = createTestData('test title').addImage(image).get();
      expect(getImage(item)?.contentUrl).toBe(`/test/path/${image}`);
    });

    it('should return undefined if the image does not exist', () => {
      const item = createTestData('test title').get();
      expect(getImage(item)).toBeUndefined();
    });
  });

  describe('getIngress', () => {
    it('should return the ingress if it exists', () => {
      const ingress = 'test ingress';
      const item = createTestData('test title').addIngress(ingress).get();
      expect(getIngress(item)).toBe(ingress);
    });

    it('should return an empty string if the ingress does not exist', () => {
      const item = createTestData('test title').get();
      expect(getIngress(item)).toBe('');
    });
  });

  describe('getLinks', () => {
    it('should return the links if they exist', () => {
      const linkText = 'test link text';
      const linkUrl = 'test link url';
      const item = createTestData('test title').addLink(linkText, linkUrl).get();
      expect(getLinks(item)).toEqual([{ text: linkText, url: linkUrl }]);
    });

    it('should return an empty array if the links do not exist', () => {
      const item = createTestData('test title').get();
      expect(getLinks(item)).toEqual([]);
    });

    it('should return an empty array if the links are missing text or url', () => {
      const item = createTestData('test title').addLink('test link text', undefined).get();
      expect(getLinks(item)).toEqual([]);
    });

    it('should return multiple links if they exist', () => {
      const item = createTestData('test title')
        .addLink('test link text 1', 'test link url 1')
        .addLink('test link text 2', 'test link url 2')
        .get();
      expect(getLinks(item)).toEqual([
        { text: 'test link text 1', url: 'test link url 1' },
        { text: 'test link text 2', url: 'test link url 2' },
      ]);
    });
  });

  describe('getDocuments', () => {
    it('should return the documents if they exist', () => {
      const document = 'test.pdf';
      const item = createTestData('test title').addDocument(document).get();
      expect(getDocuments(item)).toEqual([
        expect.objectContaining({ contentUrl: `/test/path/${document}`, title: document }),
      ]);
    });

    it('should return an empty array if the documents do not exist', () => {
      const item = createTestData('test title').get();
      expect(getDocuments(item)).toEqual([]);
    });

    it('shoud return multiple documents if they exist', () => {
      const item = createTestData('test title')
        .addDocument('test document 1.pdf')
        .addDocument('test document 2.pdf')
        .get();
      expect(getDocuments(item)).toEqual([
        expect.objectContaining({ contentUrl: '/test/path/test document 1.pdf', title: 'test document 1.pdf' }),
        expect.objectContaining({ contentUrl: '/test/path/test document 2.pdf', title: 'test document 2.pdf' }),
      ]);
    });
  });

  describe('getTitle', () => {
    it('should return the title', () => {
      const title = 'test title';
      const item = createTestData(title).get();
      expect(getTitle(item)).toBe(title);
    });
  });

  describe('getKeywords', () => {
    it('should return the keywords if they exist', () => {
      const keywords = [
        { id: '1', name: 'test' },
        { id: '2', name: 'keywords' },
      ];
      const item = createTestData('test title', keywords).get();
      expect(getKeywords(item)).toEqual(keywords);
    });

    it('should return an empty array if the keywords do not exist', () => {
      const item = createTestData('test title').get();
      expect(getKeywords(item)).toEqual([]);
    });
  });
});
