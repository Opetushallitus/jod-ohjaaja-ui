import { crear, vahto } from './articles';
import { expect, test } from './fixtures';

test('searches from the header search field', async ({ page, isMobile, open }) => {
  await open();
  const header = page.getByTestId('app-header');
  if (isMobile) {
    // On narrow screens the search field opens from the search button.
    await header.getByRole('button', { name: 'Hae' }).click();
  }

  await header.getByRole('searchbox', { name: 'Hae Ohjaajan osiosta' }).fill('CREAR');
  await header.getByRole('button', { name: 'Hae' }).click();

  await expect(page).toHaveURL('/ohjaaja/fi/haku?q=CREAR');
  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { level: 1, name: 'Etsi Ohjaajan osiosta' })).toBeVisible();
  await expect(main.getByText('Näytetään 1 tulos')).toBeVisible();
  await expect(main.getByRole('link', { name: new RegExp(crear.title) })).toBeVisible();
});

test('a new search on the search page updates the results', async ({ page, open }) => {
  await open('haku?q=CREAR');
  const main = page.getByRole('main');
  const searchField = main.getByRole('textbox', { name: 'Kirjoita hakusanat' });
  await expect(searchField).toHaveValue('CREAR');

  await searchField.fill('VAHTO');
  await main.getByRole('button', { name: 'Hae' }).click();

  await expect(page).toHaveURL('/ohjaaja/fi/haku?q=VAHTO');
  await expect(main.getByRole('link', { name: new RegExp(vahto.title) })).toBeVisible();
  await expect(main.getByRole('link', { name: new RegExp(crear.title) })).toBeHidden();
});

test('a too short search term is rejected', async ({ page, open }) => {
  await open('haku');
  const main = page.getByRole('main');

  await main.getByRole('textbox', { name: 'Kirjoita hakusanat' }).fill('ab');
  await main.getByRole('button', { name: 'Hae' }).click();

  await expect(main.getByText('Hakusanassa on oltava vähintään 3 merkkiä')).toBeVisible();
  await expect(page).toHaveURL('/ohjaaja/fi/haku');
});

test('an article keyword opens the search filtered by the keyword', async ({ page, isMobile, open }) => {
  await open(crear.path);

  await page.getByTestId('content-tags').getByRole('link', { name: 'Monialaisuus' }).click();

  await expect(page).toHaveURL('/ohjaaja/fi/haku?t=47796');
  const main = page.getByRole('main');
  await expect(main.getByText('Näytetään 1 tulos')).toBeVisible();
  await expect(main.getByRole('link', { name: new RegExp(crear.title) })).toBeVisible();
  if (isMobile) {
    // On narrow screens the filters are collapsed.
    await main.getByRole('button', { name: /^Suodata/ }).click();
  }
  const keywords = page.getByRole('group', { name: 'Asiasanat' });
  await expect(keywords.getByRole('checkbox', { name: 'Monialaisuus' })).toBeChecked();
  await expect(keywords.getByRole('checkbox', { name: 'Itsetuntemus' })).not.toBeChecked();
});
