import { client } from './client';

export const getArtikkelinKommentit = async (artikkeliId: number, sivu: number) => {
  const { data, error } = await client.GET(`/api/artikkeli/kommentit`, {
    params: {
      query: {
        artikkeliId,
        sivu,
        koko: 4,
      },
    },
  });
  if (!error) {
    return data;
  }
  return {
    sisalto: [],
    maara: 0,
    sivuja: 0,
  };
};

export const addArtikkelinKommentti = async (artikkeliId: number, kommentti: string) => {
  const { data, error } = await client.POST(`/api/artikkeli/kommentit`, {
    body: {
      artikkeliId,
      kommentti,
    },
  });
  if (!error) {
    return data;
  }
  throw new Error('Failed to add comment');
};

export const deleteArtikkelinKommentti = async (id: string) => {
  const { error } = await client.DELETE('/api/artikkeli/kommentit/{id}', {
    params: {
      path: {
        id,
      },
    },
  });
  if (!error) {
    return true;
  }
  throw new Error('Failed to delete comment');
};
