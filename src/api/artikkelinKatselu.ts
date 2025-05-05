import { isLoggedIn } from '@/auth/auth';
import { getAnonId } from '@/utils/anonId';
import { client } from './client';

const ARTIKKELIN_KATSELU_PATH = '/api/artikkeli/katselu';
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
