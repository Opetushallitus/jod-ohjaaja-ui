import { crear, vahto } from './articles';
import { expect, test } from './fixtures';

test.describe('anonymous user', () => {
  test('sees the categories and the content carousels', async ({ page, open }) => {
    await open();

    const home = page.getByTestId('home');
    await expect(home.getByRole('heading', { level: 1, name: 'Ohjaajan osio' })).toBeVisible();
    await expect(home.getByRole('link', { name: 'Siirry tietosisältöihin' })).toHaveAttribute(
      'href',
      '/ohjaaja/fi/ohjaajan-tietosisallot',
    );
    await expect(home.getByRole('link', { name: 'Tutki menetelmiä' })).toHaveAttribute(
      'href',
      '/ohjaaja/fi/asiakastyon-tueksi',
    );
    await expect(home.getByRole('link', { name: 'Tutustu materiaaleihin' })).toHaveAttribute(
      'href',
      '/ohjaaja/fi/ammatillinen-kehittyminen',
    );
    await expect(
      page.getByTestId('popular-content-article-carousel').getByRole('link', { name: crear.title }),
    ).toBeVisible();
    await expect(
      page.getByTestId('new-content-article-carousel').getByRole('link', { name: crear.title }),
    ).toBeVisible();
    await expect(home.getByRole('link', { name: 'Kirjaudu Ohjaajan osioon' })).toBeVisible();
    await expect(page.getByTestId('recently-watched-list')).toBeHidden();
  });

  test('is asked to log in when saving a favorite', async ({ page, open, backend }) => {
    await open();

    await page
      .getByTestId('popular-content-article-carousel')
      .getByRole('listitem')
      .filter({ has: page.getByRole('link', { name: crear.title }) })
      .getByRole('button', { name: 'Tallenna suosikiksi' })
      .click();

    await expect(page.getByRole('dialog')).toContainText('Kirjaudu sisään Ohjaajan osioon');
    expect(backend.suosikit).toEqual([]);
  });

  test('opens an article from a carousel', async ({ page, open }) => {
    await open();

    await page.getByTestId('popular-content-article-carousel').getByRole('link', { name: crear.title }).click();

    await expect(page).toHaveURL(`/ohjaaja/fi/${crear.path}`);
    await expect(page.getByRole('heading', { level: 1, name: crear.title })).toBeVisible();
  });
});

test.describe('signed-in user', () => {
  test.beforeEach(({ backend }) => {
    backend.signIn();
  });

  test('saves and removes a favorite from a carousel', async ({ page, open, backend }) => {
    await open();
    const card = page
      .getByTestId('popular-content-article-carousel')
      .getByRole('listitem')
      .filter({ has: page.getByRole('link', { name: crear.title }) });

    await card.getByRole('button', { name: 'Tallenna suosikiksi' }).click();
    await expect(page.getByText('Suosikki lisätty.')).toBeVisible();
    await expect.poll(() => backend.suosikit.map((s) => s.artikkeliErc)).toEqual([crear.erc]);

    await card.getByRole('button', { name: 'Poista suosikeista' }).click();
    await expect(page.getByText('Suosikki poistettu.')).toBeVisible();
    await expect.poll(() => backend.suosikit).toEqual([]);
  });

  test('sees a viewed article in the recently watched list', async ({ page, open }) => {
    await open();
    await page.getByTestId('popular-content-article-carousel').getByRole('link', { name: crear.title }).click();
    await expect(page.getByRole('heading', { level: 1, name: crear.title })).toBeVisible();

    await page.goBack();

    await expect(page.getByTestId('recently-watched-list').getByRole('link', { name: crear.title })).toBeVisible();
  });

  test('sees content matching own interests', async ({ page, open, backend }) => {
    backend.kiinnostukset.push({ id: 'k1', asiasanaId: 47796 }); // Monialaisuus, a keyword of CREAR only
    await open();

    const carousel = page.getByTestId('best-matching-content-article-carousel');
    await expect(carousel.getByRole('heading', { name: 'Sinua voisi kiinnostaa' })).toBeVisible();
    await expect(carousel.getByRole('link', { name: crear.title })).toBeVisible();
    await expect(carousel.getByRole('link', { name: vahto.title })).toBeHidden();
  });

  test('without interests is guided to choose them', async ({ page, open }) => {
    await open();

    await expect(page.getByRole('heading', { name: 'Haluatko nähdä sinua kiinnostavaa sisältöä?' })).toBeVisible();
    await page.getByRole('link', { name: 'Omat tietosi' }).click();
    await expect(page).toHaveURL('/ohjaaja/fi/ohjaajan-profiili/omat-tiedot');
  });
});
