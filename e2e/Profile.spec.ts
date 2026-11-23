import { expect, test } from './fixtures';

test('anonymous user is redirected from the profile to the home page', async ({ page, open }) => {
  await open('ohjaajan-profiili/omat-tiedot');

  await expect(page).toHaveURL('/ohjaaja/fi');
  await expect(page.getByTestId('home')).toBeVisible();
});

test.describe('own details', () => {
  test.beforeEach(async ({ backend, open }) => {
    backend.signIn();
    await open('ohjaajan-profiili/omat-tiedot');
  });

  test('user selects a workplace', async ({ page, backend }) => {
    const details = page.getByTestId('profile-details');
    await expect(details.getByRole('heading', { level: 1, name: 'Omat tietosi' })).toBeVisible();

    await details.getByTestId('profile-details-workplace-button').click();
    await page.getByRole('option', { name: 'Oppilaitos / korkeakoulu' }).click();

    await expect(page.getByText('Päivitys onnistui.')).toBeVisible();
    await expect.poll(() => backend.tyoskentelyPaikka).toBe('KORKEAKOULU');
  });

  test('user adds and removes an interest', async ({ page, backend }) => {
    const interests = page.getByRole('group', { name: 'Kiinnostukseni' });
    const tag = interests.getByRole('checkbox', { name: /Itsetuntemus/ });

    // The checkbox is controlled: its state changes only after the backend has saved the selection.
    await tag.click();
    await expect(page.getByText('Kiinnostus lisätty.')).toBeVisible();
    await expect(tag).toBeChecked();
    expect(backend.kiinnostukset.map((k) => k.asiasanaId)).toEqual([44909]);

    await tag.click();
    await expect(page.getByText('Kiinnostus poistettu.')).toBeVisible();
    await expect(tag).not.toBeChecked();
    expect(backend.kiinnostukset).toEqual([]);
  });
});
