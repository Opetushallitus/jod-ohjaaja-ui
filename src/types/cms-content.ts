// https://app.swaggerhub.com/apis/liferayinc/headless-delivery/v1.0#/TaxonomyCategoryBrief
export interface TaxonomyBrief {
  taxonomyCategoryId: number;
  taxonomyCategoryName: string;
}

// https://app.swaggerhub.com/apis/liferayinc/headless-delivery/v1.0#/ContentDocument
export interface ContentDocument {
  contentType: string;
  contentUrl: string;
  description: string;
  encodingFormat: string;
  fileExtension: string;
  id: number;
  sizeInBytes: number;
  title: string;
}

// https://app.swaggerhub.com/apis/liferayinc/headless-delivery/v1.0#/ContentFieldValue
export interface ContentFieldValue {
  data?: string;
  image?: ContentDocument;
  geo?: Record<string, unknown>;
  link?: string;
  document?: ContentDocument;
}

// https://app.swaggerhub.com/apis/liferayinc/headless-delivery/v1.0#/ContentField
export interface ContentField {
  contentFieldValue: ContentFieldValue;
  dataType: string;
  inputControl?: string;
  label: string;
  name: string;
  nestedContentFields: ContentField[];
  repeatable: boolean;
}

// https://app.swaggerhub.com/apis/liferayinc/headless-delivery/v1.0#/StructuredContent
export interface StructuredContent {
  actions?: Record<string, unknown>;
  availableLanguages?: string[];
  contentFields?: ContentField[];
  contentStructureId: number;
  creator?: Record<string, string | number>;
  customFields?: unknown[];
  dateCreated?: string;
  dateModified?: string;
  description?: string;
  externalReferenceCode?: string;
  friendlyUrlPath?: string;
  id?: number;
  key?: string;
  keywords?: string[];
  neverExpire?: boolean;
  numberOfComments?: number;
  priority?: number;
  relatedContents?: unknown[];
  renderedContents?: Record<string, unknown>[];
  siteId?: number;
  strucuturedContentFolderId?: number;
  subscribed?: boolean;
  taxonomyCategoryBriefs?: TaxonomyBrief[];
  title: string;
  uuid?: string;
}

// https://app.swaggerhub.com/apis/liferayinc/headless-delivery/v1.0#/StructuredContent/getSiteStructuredContentsPage
export interface StructuredContentPage {
  actions: Record<string, unknown>;
  facets: unknown[];
  items: StructuredContent[];
  lastPage: number;
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface ContentLink {
  text: string;
  url: string;
}
