export const getAnonId = () => {
  const anonId = localStorage.getItem('anonId');

  if (!anonId) {
    const newAnonId = crypto.randomUUID();
    localStorage.setItem('anonId', newAnonId);
    return newAnonId;
  }

  return anonId;
};
