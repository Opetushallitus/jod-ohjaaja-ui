import { LoaderFunction } from 'react-router';

import { client } from '@/api/client';
import { getKiinnostukset } from '@/api/kiinnostukset';
import { OhjaajaCsrfDto } from '@/types/auth';

const loader = (async ({ context }) => {
  const [kiinnostukset, tyoskentelyPaikka] = await Promise.all([
    getKiinnostukset(),
    // oxlint-disable-next-line typescript/await-thenable
    (await client.GET('/api/profiili/ohjaaja')).data?.tyoskentelyPaikka,
  ]);
  return { kiinnostukset, firstName: context?.etunimi, lastName: context?.sukunimi, tyoskentelyPaikka };
}) satisfies LoaderFunction<OhjaajaCsrfDto | null>;
export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;
