import { useLoginLink } from '@/hooks/useLoginLink';
import { useModal } from '@/hooks/useModal';
import { type LangCode } from '@/i18n/config';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { type StructuredContent } from '@/types/cms-content';
import { findContentValueByName, getAdaptiveMediaSrc, getKeywords } from '@/utils/cms';
import { getSearchUrl } from '@/utils/navigation';
import { getArticlePath } from '@/utils/navigation-paths';
import { MediaCard } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { useShallow } from 'zustand/react/shallow';
import { createLoginDialogFooter } from '../createLoginDialogFooter';

interface ArticleCardProps {
  article: StructuredContent;
  variant: 'horizontal' | 'vertical';
  isLoggedIn: boolean;
}

export const ArticleCard = ({ article, variant, isLoggedIn }: ArticleCardProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { showDialog, closeAllModals } = useModal();
  const location = useLocation();
  const state = location.state;
  const loginLink = useLoginLink({
    callbackURL: state?.callbackURL ? `/${language}/${state?.callbackURL}` : `/${language}`,
  });

  const [suosikit, toggleSuosikki] = useSuosikitStore(useShallow((state) => [state.suosikit, state.toggleSuosikki]));

  const imageContent = findContentValueByName(article, 'image')?.image;
  const ingress = findContentValueByName(article, 'ingress')?.data;
  const id = `${article.id ?? ''}`;
  const imageSrc = getAdaptiveMediaSrc(imageContent?.id, imageContent?.title, 'thumbnail');
  const path = getArticlePath(article.id ?? 0, language as LangCode);
  const keywords = getKeywords(article);
  const isFavorite = suosikit.some((suosikki) => suosikki.artikkeliErc === article.externalReferenceCode);

  const handleFavoriteClick = () => {
    if (!isLoggedIn) {
      showDialog({
        title: t('login'),
        description: t('login-for-favorites'),
        footer: createLoginDialogFooter(t, loginLink, closeAllModals),
      });
    } else if (article.externalReferenceCode !== undefined) {
      toggleSuosikki(article.externalReferenceCode);
    }
  };

  return (
    <MediaCard
      key={id}
      variant={variant}
      label={article.title ?? ''}
      description={ingress ?? ''}
      imageSrc={imageSrc}
      imageAlt={imageContent?.title ?? ''}
      to={path}
      linkComponent={Link}
      tags={keywords.map((keyword) => ({ label: keyword.name, to: getSearchUrl(t, language, [`${keyword.id}`]) }))}
      isFavorite={isFavorite}
      onFavoriteClick={handleFavoriteClick}
      favoriteLabel={isFavorite ? t('remove-from-favorites') : t('add-to-favorites')}
      data-testid={`article-card-${id}`}
    />
  );
};
