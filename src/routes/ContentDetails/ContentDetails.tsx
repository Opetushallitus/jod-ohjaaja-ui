import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLoaderData, useLocation } from 'react-router';
import { useShallow } from 'zustand/react/shallow';

import { CookieConsentGuard, tidyClasses as tc } from '@jod/design-system';
import {
  JodDownload,
  JodFavorite,
  JodFavoriteFilled,
  JodOpenInNew,
  JodPrint,
  JodShare,
} from '@jod/design-system/icons';

import { FeatureCard, GuidanceCard, MainLayout } from '@/components';
import { createLoginDialogFooter } from '@/components/createLoginDialogFooter';
import { useFeature } from '@/hooks/useFeatures/useFeatures';
import { useLoginLink } from '@/hooks/useLoginLink';
import { useModal } from '@/hooks/useModal';
import { useOhjaajaProfile } from '@/stores/useSessionManagerStore';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { ContentDocument, ContentLink } from '@/types/cms-content';
import { copyToClipboard } from '@/utils/clipboard';
import { getAdaptiveMediaSrc, getContentSegments, getDocuments, getImage, getKeywords, getLinks } from '@/utils/cms';
import { getSearchUrl } from '@/utils/navigation';
import { getLinkTo } from '@/utils/routeUtils';

import { LoaderData } from './loader';

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  className?: string;
  onClick: () => void;
}

export const ActionButton = ({ label, icon, className = '', onClick, ...rest }: ActionButtonProps) => {
  return (
    <button
      aria-label={label}
      className={tc(
        `flex cursor-pointer items-center gap-x-3 p-2 text-button-sm text-nowrap focus:outline-accent ${className}`,
      )}
      onClick={onClick}
      type="button"
      {...rest}
    >
      {icon}
      {label}
    </button>
  );
};

const Comments = React.lazy(() => import('@/components/Comments/Comments'));

interface DocumentsAndLinksProps {
  documents: ContentDocument[];
  links: ContentLink[];
}

const ContentDetails = () => {
  const { data } = useLoaderData<LoaderData>();
  const user = useOhjaajaProfile();
  const {
    i18n: { language },
    t,
  } = useTranslation();

  const { showDialog, closeAllModals } = useModal();
  const location = useLocation();
  const state = location.state;
  const loginLink = useLoginLink({
    callbackURL: state?.callbackURL
      ? `/${language}/${state?.callbackURL}`
      : `/${language}/${t('slugs.profile.index')}/${t('slugs.profile.front')}`,
  });

  const commentsEnabled = useFeature('COMMENTS');

  const [suosikit, toggleSuosikki] = useSuosikitStore(useShallow((state) => [state.suosikit, state.toggleSuosikki]));

  const isFavorite = suosikit.some((suosikki) => suosikki.artikkeliErc === data.externalReferenceCode);
  const handleFavoriteClick = () => {
    if (!user) {
      showDialog({
        title: t('common:login'),
        description: t('login-for-favorites'),
        footer: createLoginDialogFooter(t, loginLink, closeAllModals),
      });
    } else if (data.externalReferenceCode !== undefined) {
      void toggleSuosikki(data.externalReferenceCode);
    }
  };

  const dateCreated = data.dateCreated
    ? new Intl.DateTimeFormat([language], {
        dateStyle: 'medium',
      }).format(new Date(data.dateCreated))
    : '';
  const dateModified = data.dateModified
    ? new Intl.DateTimeFormat([language], { dateStyle: 'medium' }).format(new Date(data.dateModified))
    : '';

  const image = getImage(data);
  const contentSegments = getContentSegments(data);
  const links = getLinks(data);
  const documents = getDocuments(data);
  const keywords = getKeywords(data);

  const imageSrc = getAdaptiveMediaSrc(image?.id, image?.title, 'article');
  const imageAlt = image?.description;
  const imageCopyright = imageAlt?.split(' Kuva: ').length === 2 ? imageAlt?.split(' Kuva: ')[1] : undefined;

  const richTextClasses = tc([
    '[&_p]:my-5',
    '[&_p]:first:my-0',
    '[&_li]:my-2',
    '[&_li]:ml-6',
    '[&_li]:list-item',
    '[&_ul]:list-disc',
    '[&_ol]:list-decimal',
    '[&_strong]:font-bold',
    '[&_img]:inline',
    '[&_table]:border-collapse',
    '[&_table]:border',
    '[&_table]:border-gray-400',
    '[&_table_td]:border',
    '[&_table_td]:border-gray-400',
    '[&_table>caption]:font-bold',
    '[&_table>caption]:text-left',
    '[&_h1]:text-heading-1',
    '[&_h2]:text-heading-2',
    '[&_h3]:text-heading-3',
    '[&_h4]:text-heading-4',
    '[&_a]:text-accent',
  ]);

  const doPrint = () => {
    globalThis.print();
  };

  return (
    <MainLayout
      featuredContentChildren={
        <>
          {user ? undefined : (
            <FeatureCard
              buttonText={t('profile.login-page.page-title')}
              level="h2"
              title={t('access-content-later-title')}
              content={t('access-content-later-content')}
              backgroundColor="var(--ds-color-secondary-2-dark)"
              data-testid="access-content-later-card"
              linkComponent={getLinkTo(`/${language}/${t('slugs.profile.login')}`)}
            />
          )}
          <GuidanceCard />
        </>
      }
    >
      <title>{data.title}</title>
      <div className="col-span-2 flex flex-col gap-6 bg-white p-7 sm:gap-7" data-testid="content-details">
        <h1 className="text-heading-1 wrap-break-word hyphens-auto" data-testid="content-title">
          {data.title}
        </h1>
        <div className="flex" data-testid="content-created">
          <div className="mx-1 -mt-6">{t('content-details.date-created')}</div>
          <div className="mx-3 -mt-6">{dateCreated}</div>
        </div>
        <div className="flex" data-testid="content-modified">
          <div className="mx-1 -mt-7">{t('content-details.date-modified')}</div>
          <div className="mx-3 -mt-7">{dateModified}</div>
        </div>
        <div className="space-between flex flex-col gap-5 sm:flex-row sm:gap-6">
          <div className="flex flex-col">
            {image && (
              <div data-testid="content-image" className="max-h-[217px] max-w-[386px] shrink-0">
                <img src={imageSrc} alt={image.description} className="object-contain object-left" />
              </div>
            )}
            {imageCopyright && (
              <span className="block font-arial text-body-xs text-secondary-gray">@ {imageCopyright}</span>
            )}
          </div>

          <div
            className="flex flex-1 flex-row flex-wrap place-items-end justify-end gap-3 sm:flex-col sm:justify-start print:hidden"
            data-testid="content-actions"
          >
            <ActionButton
              label={isFavorite ? t('remove-from-favorites') : t('add-to-favorites')}
              icon={
                isFavorite ? (
                  <JodFavoriteFilled aria-hidden className="text-accent" />
                ) : (
                  <JodFavorite aria-hidden className="text-accent" />
                )
              }
              onClick={handleFavoriteClick}
              data-testid="action-favorite"
            ></ActionButton>
            <ActionButton
              label={t('common:share')}
              icon={<JodShare className="text-accent" />}
              onClick={() => copyToClipboard(globalThis.location.href)}
              data-testid="action-share"
            />
            {!!globalThis.print && (
              <ActionButton
                label={t('common:print')}
                icon={<JodPrint className="text-accent" />}
                onClick={doPrint}
                data-testid="action-print"
              />
            )}
          </div>
        </div>
        {contentSegments.length > 0 && (
          <div className={richTextClasses} data-testid="content-body">
            {contentSegments.map((segment) =>
              segment.type === 'html' ? (
                <div key={segment.html} dangerouslySetInnerHTML={{ __html: segment.html }} />
              ) : (
                <CookieConsentGuard key={segment.src} categories={['thirdPartyContent']} fallback>
                  <iframe
                    src={segment.src}
                    title="YouTube video player"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="aspect-video w-full"
                  />
                </CookieConsentGuard>
              ),
            )}
          </div>
        )}

        <DocumentsAndLinks documents={documents} links={links} />
        {keywords.length > 0 && (
          <ul
            className="flex flex-row flex-wrap divide-x pt-3 text-attrib-value text-accent"
            data-testid="content-tags"
          >
            {keywords.map((tag) => (
              <li
                key={tag.id}
                className="border-border-gray px-2 first:pl-0 last:pr-0"
                data-testid={`content-tag-${tag.id}`}
              >
                <Link to={getSearchUrl(t, language, [`${tag.id}`])} data-testid={`content-tag-link-${tag.id}`}>
                  {tag.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {data.externalReferenceCode && commentsEnabled && (
        <Comments articleErc={data.externalReferenceCode} userId={user?.id} />
      )}
    </MainLayout>
  );
};

const DocumentsAndLinks = ({ documents, links }: DocumentsAndLinksProps) => {
  const hasDocumentsOrLinks = documents.length > 0 || links.length > 0;
  const { t } = useTranslation();
  return (
    hasDocumentsOrLinks && (
      <div className="w-full rounded-sm bg-bg-gray p-5" data-testid="content-attachments">
        <h2 className="text-heading-4" data-testid="content-attachments-title">
          {t('content-details.additional-content')}
        </h2>
        {documents.map((document) => (
          <a
            key={document.id}
            href={document.contentUrl}
            target="_blank"
            className="ml-4 flex items-center gap-3 text-heading-4 text-accent"
            data-testid={`content-document-${document.id}`}
            onClick={() => {
              globalThis._paq?.push(['trackEvent', 'ohjaaja.Tiedon käyttöaste', 'Lataus', document.title]);
            }}
          >
            {document.title} <JodDownload size={20} />
          </a>
        ))}
        {links.map((link, index) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="external noopener noreferrer"
            className="ml-4 flex items-center gap-3 text-heading-4 text-accent"
            data-testid={`content-link-${index + 1}`}
          >
            {link.text} <JodOpenInNew size={20} ariaLabel={t('common:external-link')} />
          </a>
        ))}
      </div>
    )
  );
};

export default ContentDetails;
