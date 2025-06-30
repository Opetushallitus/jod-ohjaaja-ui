import { client } from '@/api/client';
import { getKiinnostukset } from '@/api/kiinnostukset';
import { LoaderFunction } from 'react-router';

const loader = (async ({ context }) => {
  const [kiinnostukset, tyoskentelyPaikka] = await Promise.all([
    getKiinnostukset(),
    (await client.GET('/api/profiili/ohjaaja')).data?.tyoskentelyPaikka,
  ]);
  return { kiinnostukset, firstName: context?.etunimi, lastName: context?.sukunimi, tyoskentelyPaikka };
}) satisfies LoaderFunction;
export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;
