import { expect, test } from './fixtures';

// The real Suomi.fi login is covered by the smoke tests against the test environment.
// Here the backend's login and logout endpoints are faked, so only the UI's part of the flow is tested.

test('user logs in from the header', async ({ page, open, backend }) => {
  await open();
  const header = page.getByTestId('app-header');

  await header.getByRole('link', { name: 'Kirjaudu' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Luo oma ohjaajan profiili' })).toBeVisible();
  await page.getByRole('main').getByRole('link', { name: 'Kirjaudu' }).click();

  await expect(header.getByRole('button', { name: 'Testi' })).toBeVisible();
  expect(backend.loginRequests).toHaveLength(1);
  expect(backend.loginRequests[0].searchParams.get('lang')).toBe('fi');
});

test('user logs out from the user menu', async ({ page, open, backend }) => {
  backend.signIn();
  await open();
  const header = page.getByTestId('app-header');

  await header.getByRole('button', { name: 'Testi' }).click();
  await header.getByRole('button', { name: 'Kirjaudu ulos' }).click();

  await expect(header.getByRole('link', { name: 'Kirjaudu' })).toBeVisible();
  expect(backend.logoutRequests).toEqual([{ _csrf: 'test-csrf-token', lang: 'fi' }]);
});

test('user menu links to the profile', async ({ page, open, backend }) => {
  backend.signIn();
  await open();
  const header = page.getByTestId('app-header');

  await header.getByRole('button', { name: 'Testi' }).click();
  await header.getByRole('link', { name: 'Ohjaajan profiili' }).click();

  await expect(page).toHaveURL('/ohjaaja/fi/ohjaajan-profiili/etusivu');
});
