import { MainLayout } from '@/components';
import { findContentValueByName } from '@/utils/cms';
import { Tag, tidyClasses as tc } from '@jod/design-system';
import DOMPurify from 'dompurify';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { LoaderData } from './loader';

const ContentDetails = () => {
  const { data } = useLoaderData<LoaderData>();
  const { i18n } = useTranslation();
  const date = data.dateCreated
    ? new Intl.DateTimeFormat([i18n.language], {
        dateStyle: 'medium',
      }).format(new Date(data.dateCreated))
    : '';

  const taxonomies = data.taxonomyCategoryBriefs?.map((taxonomy) => taxonomy.taxonomyCategoryName);
  const image = findContentValueByName(data, 'image')?.image;
  const description = findContentValueByName(data, 'content')?.data;
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
  ]);

  return (
    <MainLayout navChildren={<div className="bg-todo">TODO: Navigation</div>}>
      <div className="bg-white p-7 col-span-2 flex flex-col gap-7">
        <h1 className="text-heading-1">{data.title}</h1>
        <div className="-mt-6">{date}</div>
        {image && (
          <div>
            <img src={image.contentUrl} alt={image.description} />
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          {taxonomies?.map((taxonomy) => (
            <Tag key={taxonomy} label={taxonomy} variant="presentation" title={taxonomy} />
          ))}
        </div>
        {description && (
          <div className={richTextClasses} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }} />
        )}
      </div>
    </MainLayout>
  );
};

export default ContentDetails;
