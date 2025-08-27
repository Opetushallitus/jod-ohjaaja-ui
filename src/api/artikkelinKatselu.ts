import { client } from './client';

const ARTIKKELIN_KATSELU_PATH = '/api/artikkeli/katselu/{artikkeliErc}';
const KATSOTUIMMAT_ARTIKKELIT_PATH = '/api/artikkeli/katselu/katsotuimmat';
const ARTIKKELIN_KATSELU_VIIMEKSI_PATH = '/api/artikkeli/viimeksi-katsellut';
export const addArtikkelinKatselu = async (artikkeliErc?: string) => {
  if (artikkeliErc !== undefined) {
    await client.POST(ARTIKKELIN_KATSELU_PATH, {
      params: {
        path: {
          artikkeliErc,
        },
      },
    });
  }
};

export const getMostRecentViewedArtikkeliErcs = async () => {
  const { data, error } = await client.GET(ARTIKKELIN_KATSELU_VIIMEKSI_PATH);
  if (!error) {
    return data;
  }
  return null;
};

export const getMostViewedArtikkeliErcs = async (filterByArtikkeliErcs?: string[]) => {
  const { data, error } = await client.GET(KATSOTUIMMAT_ARTIKKELIT_PATH, {
    querySerializer: {
      array: {
        style: 'form',
        explode: false,
      },
    },
    params: {
      query: {
        filterByArtikkeliErcs: filterByArtikkeliErcs,
      },
    },
  });
  if (!error && data && Array.isArray(data.sisalto)) {
    return data.sisalto;
  }
  return [] as string[];
};
