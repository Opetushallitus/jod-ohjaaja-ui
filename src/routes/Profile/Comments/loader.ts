import { getOmatArtikkelinKommentit } from '@/api/artikkelinKommentit';
import { LoaderFunction } from 'react-router';

const loader = (async () => {
  const firstPage = await getOmatArtikkelinKommentit(0);
  const omatKommentit = [...firstPage.sisalto];

  const pageCount = firstPage.sivuja;
  const rest = await Promise.all(Array.from({ length: pageCount - 1 }, (_, i) => getOmatArtikkelinKommentit(i + 1)));

  for (const sivu of rest) {
    omatKommentit.push(...sivu.sisalto);
  }

  return {
    omatKommentit,
  };
}) satisfies LoaderFunction;
export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;
