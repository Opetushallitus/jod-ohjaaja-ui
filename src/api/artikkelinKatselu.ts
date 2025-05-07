import { isLoggedIn } from '@/auth/auth';
import { getAnonId } from '@/utils/anonId';
import { client } from './client';

const ARTIKKELIN_KATSELU_PATH = '/api/artikkeli/katselu';
const ARTIKKELIN_KATSELU_VIIMEKSI_PATH = '/api/artikkeli/katselu/viimeksi-katsellut';
export const addArtikkelinKatselu = async (artikkeliId: number) => {
  const anonyymiId = (await isLoggedIn()) ? undefined : getAnonId();
  const { data, error } = await client.POST(ARTIKKELIN_KATSELU_PATH, {
    body: {
      artikkeliId,
      anonyymiId,
    },
  });

  if (!error) {
    return data;
  }

  return null;
};

export const getMostRecentViewedArtikkeliIds = async () => {
  const { data, error } = await client.GET(ARTIKKELIN_KATSELU_VIIMEKSI_PATH);
  if (!error) {
    return data;
  }
  return null;
};
