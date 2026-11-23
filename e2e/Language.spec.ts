import { expect, test } from './fixtures';

test('user changes the language from the header', async ({ page, isMobile, open }) => {
  await open();

  await page.getByTestId('language-button-trigger').click();
  await page.getByRole('link', { name: 'På svenska' }).click();

  await expect(page).toHaveURL('/ohjaaja/sv');
  await expect(page.getByRole('heading', { level: 1, name: 'Vägledar-delen' })).toBeVisible();
  if (isMobile) {
    // On narrow screens the search field opens from the search button.
    await page.getByTestId('app-header').getByRole('button', { name: 'Sök' }).click();
  }
  await expect(page.getByRole('searchbox', { name: 'Sök i Vägledar-delen' })).toBeVisible();

  // The navigation comes from the CMS in every language.
  await page.getByTestId('open-nav-menu').click();
  await expect(
    page.getByRole('navigation').getByRole('link', { name: 'Vägledarens informationsinnehåll' }),
  ).toHaveAttribute('href', '/ohjaaja/sv/vagledarens-informationsinnehall');
});

test('English navigation opens the English category page', async ({ page, open }) => {
  await open('', 'en');

  await page.getByTestId('open-nav-menu').click();
  await page.getByRole('navigation').getByRole('link', { name: "Guidance practitioner's information content" }).click();

  await expect(page).toHaveURL('/ohjaaja/en/guidance-practitioner-s-information-content');
  await expect(
    page.getByRole('heading', { level: 1, name: "Guidance practitioner's information content" }),
  ).toBeVisible();
});
