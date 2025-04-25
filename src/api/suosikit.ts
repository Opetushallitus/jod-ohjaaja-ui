import { client } from './client';

const SUOSIKIT_PATH = '/api/profiili/suosikit';

export const getSuosikit = async () => {
  const { data, error } = await client.GET(SUOSIKIT_PATH);

  if (!error) {
    return data ?? [];
  }

  return [];
};
export const addSuosikki = async (artikkeliId: number) => {
  const { data, error } = await client.POST(SUOSIKIT_PATH, {
    body: {
      artikkeliId,
    },
  });

  if (!error) {
    return data;
  }

  return null;
};

export const deleteSuosikki = async (id: string) => {
  await client.DELETE(SUOSIKIT_PATH, {
    params: {
      query: { id },
    },
  });
};
