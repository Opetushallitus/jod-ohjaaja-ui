import i18n from '@/i18n/config';
import toast from 'react-hot-toast/headless';

/** Copies the given text to clipboard and shows a toast.
  Clipboard is not working on local dev-environment on iOS Safari, because it is not secure context (https://).
*/
export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(i18n.t('link-copied'));
  } catch (_e) {
    toast.error(i18n.t('link-copy-failed'));
  }
};
