import i18n from '@/i18n/config';
import { Middleware } from 'openapi-fetch';
import toast from 'react-hot-toast/headless';
import { paths } from '../schema';

const modifyingMethods = ['PUT', 'POST', 'DELETE', 'PATCH'] as const;

type Method = (typeof modifyingMethods)[number];

const isModifyingMethod = (method: string): method is Method => {
  return modifyingMethods.includes(method as Method);
};

const ignoredOperations: Partial<Record<keyof paths, Method>> = {
  '/api/artikkeli/katselu/{artikkeliErc}': 'POST',
};

const messages: Partial<Record<keyof paths, Partial<Record<Method, { success: string; failed: string }>>>> = {
  '/api/artikkeli/kommentit': {
    POST: {
      success: i18n.t('toast.add-comment-success'),
      failed: i18n.t('toast.add-comment-failed'),
    },
  },
  '/api/artikkeli/kommentit/{id}': {
    DELETE: {
      success: i18n.t('toast.delete-comment-success'),
      failed: i18n.t('toast.delete-comment-failed'),
    },
  },
  '/api/artikkeli/kommentit/{id}/ilmianto': {
    POST: {
      success: i18n.t('toast.report-comment-success'),
      failed: i18n.t('toast.report-comment-failed'),
    },
  },
  '/api/profiili/kiinnostukset': {
    POST: {
      success: i18n.t('toast.add-interest-success'),
      failed: i18n.t('toast.add-interest-failed'),
    },
    DELETE: {
      success: i18n.t('toast.delete-interest-success'),
      failed: i18n.t('toast.delete-interest-failed'),
    },
  },
  '/api/profiili/suosikit': {
    POST: {
      success: i18n.t('toast.add-favorite-success'),
      failed: i18n.t('toast.add-favorite-failed'),
    },
    DELETE: {
      success: i18n.t('toast.delete-favorite-success'),
      failed: i18n.t('toast.delete-favorite-failed'),
    },
  },
};

const defaultMessages = {
  POST: {
    success: i18n.t('toast.add-default-success'),
    failed: i18n.t('toast.add-default-failed'),
  },
  DELETE: {
    success: i18n.t('toast.delete-default-success'),
    failed: i18n.t('toast.delete-default-failed'),
  },
  PUT: {
    success: i18n.t('toast.update-default-success'),
    failed: i18n.t('toast.update-default-failed'),
  },
  PATCH: {
    success: i18n.t('toast.update-default-success'),
    failed: i18n.t('toast.update-default-failed'),
  },
};

const showToast = (method: Method, url: keyof paths, response: Response) => {
  const suffix = response.ok ? 'success' : 'failed';
  const toastFn = response.ok ? toast.success : toast.error;

  const message = messages[url]?.[method]?.[suffix] ?? defaultMessages[method][suffix];

  toastFn(message);
};

const stripUrlPrefix = (url: string): string => {
  const apiIndex = url.indexOf('/api/');
  return apiIndex !== -1 ? url.slice(apiIndex) : url;
};

const getUuidTagPathPart = (url: string): string => {
  if (url.startsWith('/api/artikkeli/katselu')) {
    return '/{artikkeliErc}';
  }
  return '/{id}';
};

const removeQuery = (url: string): string => {
  const questionMarkIndex = url.indexOf('?');
  return questionMarkIndex !== -1 ? url.slice(0, questionMarkIndex) : url;
};

export const toastMiddleware: Middleware = {
  onResponse({ response, request }) {
    const strippedUrl = removeQuery(stripUrlPrefix(request.url));
    // Regular expression to detect UUID at the end of the path
    const uuidRegex = /\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
    const urlWithoutUUID = strippedUrl.replace(uuidRegex, getUuidTagPathPart(strippedUrl)) as keyof paths;
    const ignoredPathMethod = ignoredOperations[urlWithoutUUID];
    if (isModifyingMethod(request.method) && request.method !== ignoredPathMethod) {
      showToast(request.method, urlWithoutUUID, response);
    }
    return response;
  },
};
