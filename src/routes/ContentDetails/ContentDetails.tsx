import { MainLayout } from '@/components';
import { ContentDocument, ContentLink } from '@/types/cms-content';
import { getContent, getDocuments, getImage, getKeywords, getLinks } from '@/utils/cms';
import { tidyClasses as tc } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { MdOutlineFileDownload, MdOutlineLink } from 'react-icons/md';
import { useLoaderData } from 'react-router';
import { LoaderData } from './loader';

interface DocumentsAndLinksProps {
  documents: ContentDocument[];
  links: ContentLink[];
}

const ContentDetails = () => {
  const { data } = useLoaderData<LoaderData>();
  const {
    i18n: { language },
    t,
  } = useTranslation();

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
    '[&_a]:text-link',
  ]);

  return (
    <MainLayout navChildren={<div className="bg-todo">TODO: Navigation</div>}>
      <div className="bg-white p-7 col-span-2 flex flex-col gap-7">
        <h1 className="text-heading-1">{data.title}</h1>
        <div className="flex">
          <div className="-mt-6 mx-1">{t('content-details.date-created')}</div>
          <div className="-mt-6 mx-3">{dateCreated}</div>
        </div>
        <div className="flex">
          <div className="-mt-7 mx-1">{t('content-details.date-modified')}</div>
          <div className="-mt-7 mx-3">{dateModified}</div>
        </div>
        {image && (
          <div>
            <img src={image.contentUrl} alt={image.description} />
          </div>
        )}
        {content && <div className={richTextClasses} dangerouslySetInnerHTML={{ __html: content }} />}

        <DocumentsAndLinks documents={documents} links={links} />
        {keywords.length > 0 && (
          <ul className="text-attrib-value flex flex-row divide-x flex-wrap pt-3 text-accent ">
            {keywords.map((tag) => (
              <li key={tag} className="px-2 first:pl-0 last:pr-0 border-border-gray">
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
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
            {document.title} <MdOutlineFileDownload size={20} />
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
            {link.text} <MdOutlineLink size={20} />
          </a>
        ))}
      </div>
    )
  );
};

export default ContentDetails;
