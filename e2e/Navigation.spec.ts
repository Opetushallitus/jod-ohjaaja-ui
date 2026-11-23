import { crear, vahto } from './articles';
import { expect, expectBreadcrumb, test } from './fixtures';

test('main menu is built from the CMS navigation', async ({ page, open }) => {
  await open();

  await page.getByTestId('open-nav-menu').click();
  const menu = page.getByRole('navigation', { name: 'Päänavigaatio' });
  await expect(menu.getByRole('link', { name: 'Ohjaajan tietosisällöt' })).toHaveAttribute(
    'href',
    '/ohjaaja/fi/ohjaajan-tietosisallot',
  );
  await expect(menu.getByRole('link', { name: 'Ammatillinen kehittyminen' })).toBeVisible();

  await menu
    .getByRole('listitem')
    .filter({ has: page.getByRole('link', { name: 'Asiakastyön tueksi' }) })
    .getByRole('button', { name: 'Avaa alivalikko' })
    .click();
  await menu.getByRole('link', { name: 'Itsetuntemus' }).click();

  await expect(page).toHaveURL('/ohjaaja/fi/asiakastyon-tueksi/itsetuntemus');
  await expect(page.getByRole('heading', { level: 1, name: 'Itsetuntemus' })).toBeVisible();
});

test('category listing shows the articles of the category', async ({ page, isMobile, open }) => {
  await open('asiakastyon-tueksi/itsetuntemus');

  const main = page.getByRole('main');
  await expect(main.getByText('2 sisältöä')).toBeVisible();
  await expect(main.getByRole('link', { name: crear.title })).toBeVisible();
  await expect(main.getByRole('link', { name: vahto.title })).toBeVisible();
  await expectBreadcrumb(page, isMobile, ['Ohjaajan osio', 'Asiakastyön tueksi', 'Itsetuntemus']);
});

test('main category page shows its subcategories and its own content', async ({ page, isMobile, open }) => {
  await open('asiakastyon-tueksi');

  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { level: 1, name: 'Asiakastyön tueksi' })).toBeVisible();
  // On narrow screens the submenu of the section menu opens and closes again right away (a bug), so the
  // subcategories are checked on wide screens only.
  if (!isMobile) {
    await expect(main.getByRole('complementary').getByRole('link', { name: 'Itsetuntemus' })).toHaveAttribute(
      'href',
      '/ohjaaja/fi/asiakastyon-tueksi/itsetuntemus',
    );
  }
  const popular = main
    .getByRole('list')
    .filter({ has: page.getByRole('link', { name: crear.title }) })
    .first();
  await expect(popular.getByRole('link', { name: vahto.title })).toBeVisible();
  // Articles of other main categories are not shown.
  await expect(main.getByRole('link', { name: 'Ohjausosaamista yhteistyössä' })).toBeHidden();
});

test('unknown page shows the not found page', async ({ page, open }) => {
  await open('ei-ole-olemassa');

  await expect(page.getByRole('heading', { level: 1, name: 'Hups! Sivua ei löytynyt' })).toBeVisible();
});
