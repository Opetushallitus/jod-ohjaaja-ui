import { getKiinnostukset } from '@/api/kiinnostukset';
import { LoaderFunction } from 'react-router';

const loader = (async ({ context }) => {
  const kiinnostukset = await getKiinnostukset();
  return { kiinnostukset, firstName: context?.etunimi, lastName: context?.sukunimi };
}) satisfies LoaderFunction;
export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;
