import { client } from './client';

const ARTIKKELIN_KATSELU_PATH = '/api/artikkeli/katselu/{artikkeliId}';
const KATSOTUIMMAT_ARTIKKELIT_PATH = '/api/artikkeli/katselu/katsotuimmat';
const ARTIKKELIN_KATSELU_VIIMEKSI_PATH = '/api/artikkeli/viimeksi-katsellut';
export const addArtikkelinKatselu = async (artikkeliId: number) => {
  await client.POST(ARTIKKELIN_KATSELU_PATH, {
    params: {
      path: {
        artikkeliId,
      },
    },
  });
};

export const getMostRecentViewedArtikkeliIds = async () => {
  const { data, error } = await client.GET(ARTIKKELIN_KATSELU_VIIMEKSI_PATH);
  if (!error) {
    return data;
  }
  return null;
};

export const getMostViewedArtikkeliIds = async (filterByArtikkeliIds?: number[]) => {
  const { data, error } = await client.GET(KATSOTUIMMAT_ARTIKKELIT_PATH, {
    querySerializer: {
      array: {
        style: 'form',
        explode: false,
      },
    },
    params: {
      query: {
        filterByArtikkeliIds: filterByArtikkeliIds,
      },
    },
  });
  if (!error && data && Array.isArray(data.sisalto)) {
    return data.sisalto;
  }
  return [] as number[];
};
