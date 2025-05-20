import { client } from './client';

const KIINNOSTUKSET_PATH = '/api/profiili/kiinnostukset';

export const getKiinnostukset = async () => {
  const { data, error } = await client.GET(KIINNOSTUKSET_PATH);

  if (!error) {
    return data ?? [];
  }

  return [];
};
export const addKiinnostus = async (asiasanaId: number) => {
  const { data, error } = await client.POST(KIINNOSTUKSET_PATH, {
    body: {
      asiasanaId,
    },
  });

  if (!error) {
    return data;
  }

  return null;
};

export const deleteKiinnostus = async (id: string) => {
  await client.DELETE(KIINNOSTUKSET_PATH, {
    params: {
      query: { id },
    },
  });
};
