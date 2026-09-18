import { copyToClipboard } from './clipboard';

export const share = async (title: string, text: string, url: string) => {
  const data = {
    title,
    text,
    url,
  };
  if (navigator.share && navigator.canShare(data)) {
    try {
      await navigator.share(data);
    } catch (_) {
      //User canceled or sharing failed
    }
  } else {
    await copyToClipboard(url);
  }
};
