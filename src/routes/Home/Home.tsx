import { LoaderData } from '@/routes/Home/loader';
import { getAdaptiveMediaSrc, getImage, getIngress, getKeywords, getTitle } from '@/utils/cms';
import { CardCarousel, CardCarouselItem, HeroCard, MediaCard, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLoaderData } from 'react-router';

interface CardsProps {
  className?: string;
}

const Cards = ({ className = '' }: CardsProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  return (
    <div
      className={`mx-auto flex max-w-[1140px] flex-col gap-3 sm:gap-11 px-5 sm:px-6 hyphens-auto xl:hyphens-none ${className}`.trim()}
    >
      <div className="sm:mb-[40px] max-w-2xl">
        <HeroCard backgroundColor="#00818AF2" content={t('home.card-1-content')} title={t('home.card-1-title')} />
      </div>
      <div className="grid grid-flow-row auto-rows-max grid-cols-1 gap-3 sm:gap-7 md:grid-cols-3">
        <HeroCard
          to={`${t('slugs.information-resources')}`}
          linkComponent={Link}
          size="sm"
          textColor="#000"
          backgroundColor="#339DDFF2"
          title={t('home.card-2-title')}
          content={t('home.card-2-content')}
        />
        <HeroCard
          to={`/${language}`}
          linkComponent={Link}
          size="sm"
          textColor="#000"
          backgroundColor="#CD4EB3F2"
          title={t('home.card-3-title')}
          content={t('home.card-3-content')}
        />
        <HeroCard
          to={`/${language}`}
          linkComponent={Link}
          size="sm"
          textColor="#000"
          backgroundColor="#EE7C45F2"
          title={t('home.card-4-title')}
          content={t('home.card-4-content')}
        />
      </div>
    </div>
  );
};

const Home = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { sm } = useMediaQueries();
  const { data } = useLoaderData<LoaderData>();
  const [carouselItems, setCarouselItems] = React.useState<CardCarouselItem[]>([]);

  React.useEffect(() => {
    const items = data.items.map((item) => {
      const title = getTitle(item);
      const imageContent = getImage(item);
      const ingress = getIngress(item);
      const keywords = getKeywords(item);
      const id = `${item.id ?? ''}`;
      const imageSrc = getAdaptiveMediaSrc(imageContent?.id, imageContent?.title, 'thumbnail');

      return {
        id,
        component: (
          <MediaCard
            label={title}
            description={ingress ?? ''}
            imageSrc={imageSrc}
            imageAlt={imageContent?.title ?? ''}
            to={`/${language}/${t('slugs.content-details')}/${id}`}
            linkComponent={Link}
            tags={keywords}
          />
        ),
      };
    });
    setCarouselItems(items);
  }, [data, language, t]);

  return (
    <main role="main" className="mx-auto w-full max-w-(--breakpoint-xl)" id="jod-main">
      <title>{t('osaamispolku')}</title>
      <div className="h-[320px] sm:h-auto mx-auto bg-[url(@/../assets/ohjaaja-hero.avif)] bg-[length:auto_680px] bg-[top_-4rem_right_-10rem] sm:bg-[length:auto_auto] sm:bg-[top_-10rem_left_-20rem] sm:py-8">
        {sm && <Cards />}
      </div>
      {!sm && <Cards className="relative -top-11" />}
      <div className="mx-auto grid w-full max-w-[1140px] grow grid-cols-3 gap-6 px-5 pb-6 pt-8 print:p-0">
        <div className="col-span-3 print:col-span-3 flex flex-col gap-8">
          <div>
            <h2 className="text-heading-2-mobile sm:text-heading-2 mb-5">{t('home.new-content')}</h2>
            <CardCarousel
              itemWidth={261}
              items={carouselItems}
              translations={{
                prevTrigger: t('carousel.prev'),
                nextTrigger: t('carousel.next'),
                indicator: (index: number) => t('carousel.indicator', { index: index + 1 }),
              }}
            />
          </div>
          <div>
            <h2 className="text-heading-2-mobile sm:text-heading-2 mb-5">{t('home.popular-content')}</h2>
            <p className="bg-todo h-[328px] flex items-center justify-center rounded">TODO</p>
          </div>
          <div>
            <h2 className="text-heading-2-mobile sm:text-heading-2 mb-5 bg-todo">Kirjaudu palveluun</h2>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
