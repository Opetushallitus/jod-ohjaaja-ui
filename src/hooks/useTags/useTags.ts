import React from 'react';

import { getTags } from '@/services/cms-tag-api';
import { type Category } from '@/types/cms-content';

export const useTags = () => {
  const [tags, setTags] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await getTags();
        setTags(response);
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    void fetchTags();
  }, []);

  return {
    tags,
    loading,
  };
};
