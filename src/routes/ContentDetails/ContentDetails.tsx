import { MainLayout } from '@/components';
import { useFeature } from '@/hooks/useFeatures/useFeatures';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { ContentDocument, ContentLink } from '@/types/cms-content';
import { copyToClipboard } from '@/utils/clipboard';
import { getContent, getDocuments, getImage, getKeywords, getLinks } from '@/utils/cms';
import { getSearchUrl } from '@/utils/navigation';
import { tidyClasses as tc } from '@jod/design-system';
import {
  JodDownload,
  JodFavorite,
  JodFavoriteFilled,
  JodOpenInNew,
  JodPrint,
  JodShare,
} from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLoaderData } from 'react-router';
import { useShallow } from 'zustand/react/shallow';
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
        `cursor-pointer flex items-center gap-x-3 p-2 text-button-sm text-nowrap focus:outline-accent ${className}`,
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
  const { data, isLoggedIn, userId } = useLoaderData<LoaderData>();
  const {
    i18n: { language },
    t,
  } = useTranslation();

  const commentsEnabled = useFeature('COMMENTS');

  const [suosikit, toggleSuosikki] = useSuosikitStore(useShallow((state) => [state.suosikit, state.toggleSuosikki]));

  const isFavorite = suosikit.some((suosikki) => suosikki.artikkeliId === data.id);
  const handleFavoriteClick = () => {
    if (data.id !== undefined) {
      toggleSuosikki(data.id);
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
  const content = getContent(data);
  const links = getLinks(data);
  const documents = getDocuments(data);
  const keywords = getKeywords(data);

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
    window.print();
  };

  return (
    <MainLayout>
      <div className="bg-white p-7 col-span-2 flex flex-col sm:gap-7 gap-6">
        <h1 className="text-heading-1 hyphens-auto">{data.title}</h1>
        <div className="flex">
          <div className="-mt-6 mx-1">{t('content-details.date-created')}</div>
          <div className="-mt-6 mx-3">{dateCreated}</div>
        </div>
        <div className="flex">
          <div className="-mt-7 mx-1">{t('content-details.date-modified')}</div>
          <div className="-mt-7 mx-3">{dateModified}</div>
        </div>
        <div className="flex sm:flex-row flex-col sm:gap-6 gap-5 space-between">
          {image && (
            <div>
              <img src={image.contentUrl} alt={image.description} />
            </div>
          )}

          <div className="flex sm:flex-col flex-row sm:justify-start justify-end flex-1 place-items-end gap-3 print:hidden">
            {isLoggedIn && (
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
              ></ActionButton>
            )}
            <ActionButton
              label={t('share')}
              icon={<JodShare className="text-accent" />}
              onClick={() => copyToClipboard(window.location.href)}
            />
            {!!window.print && (
              <ActionButton label={t('print')} icon={<JodPrint className="text-accent" />} onClick={doPrint} />
            )}
          </div>
        </div>
        {content && <div className={richTextClasses} dangerouslySetInnerHTML={{ __html: content }} />}

        <DocumentsAndLinks documents={documents} links={links} />
        {keywords.length > 0 && (
          <ul className="text-attrib-value flex flex-row divide-x flex-wrap pt-3 text-accent">
            {keywords.map((tag) => (
              <li key={tag.id} className="px-2 first:pl-0 last:pr-0 border-border-gray">
                <Link to={getSearchUrl(t, language, [`${tag.id}`])}>{tag.name}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {data.id && commentsEnabled && <Comments articleId={data.id} userId={userId} />}
    </MainLayout>
  );
};

const DocumentsAndLinks = ({ documents, links }: DocumentsAndLinksProps) => {
  const hasDocumentsOrLinks = documents.length > 0 || links.length > 0;
  const { t } = useTranslation();
  return (
    hasDocumentsOrLinks && (
      <div className="w-full bg-bg-gray p-5 rounded-sm">
        <h3 className="text-heading-4">{t('content-details.additional-content')}</h3>
        {documents.map((document) => (
          <a
            key={document.id}
            href={document.contentUrl}
            target="_blank"
            className="flex text-heading-4 text-accent items-center gap-3 ml-4"
          >
            {document.title} <JodDownload size={20} />
          </a>
        ))}
        {links.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="external noopener noreferrer"
            className="flex text-heading-4 text-accent items-center gap-3 ml-4"
          >
            {link.text} <JodOpenInNew size={20} />
          </a>
        ))}
      </div>
    )
  );
};

export default ContentDetails;
