import { client } from './client';

export const getArtikkelinKommentit = async (artikkeliErc: string, sivu: number) => {
  const { data, error } = await client.GET(`/api/artikkeli/kommentit`, {
    params: {
      query: {
        artikkeliErc,
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

export const getOmatArtikkelinKommentit = async (sivu: number) => {
  const { data, error } = await client.GET(`/api/artikkeli/kommentit/omat`, {
    params: {
      query: {
        sivu,
        koko: 50,
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

export const addArtikkelinKommentti = async (artikkeliErc: string, kommentti: string) => {
  const { data, error } = await client.POST(`/api/artikkeli/kommentit`, {
    body: {
      artikkeliErc,
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

export const ilmiannaArtikkelinKommentti = async (id: string) => {
  const { error } = await client.POST('/api/artikkeli/kommentit/{id}/ilmianto', {
    params: {
      path: {
        id,
      },
    },
  });
  if (!error) {
    return true;
  }
  throw new Error('Failed to report comment');
};
