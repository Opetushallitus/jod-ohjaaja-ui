import { expect, test } from './fixtures';

test.describe('suggest new content', () => {
  test('signed-in user sends a content suggestion', async ({ page, open, backend }) => {
    backend.signIn();
    await open();

    await page.getByRole('button', { name: 'Ehdota sisältöä' }).click();
    const modal = page.getByTestId('suggest-new-content-modal');
    await expect(modal.getByText('Sisällön ehdottaminen').first()).toBeVisible();

    const send = modal.getByRole('button', { name: 'Lähetä ehdotus' });
    // The form can be sent only when the required fields are filled and the optional link is valid.
    await expect(send).toBeDisabled();
    const link = modal.getByLabel('Linkki ehdottamaasi sisältöön');
    await modal.getByLabel('Ehdotuksesi sisällöksi').fill('Uusi ohjausmenetelmä');
    await modal.getByLabel('Kuvaile omin sanoin sisältöä').fill('Hyödyllinen ryhmäohjauksessa.');
    // Fields are validated when they lose focus.
    await link.fill('ei linkki');
    await link.blur();
    await expect(modal.getByText('Syötä kelvollinen linkki esim. https://www.osaamispolku.fi')).toBeVisible();
    await expect(send).toBeDisabled();

    await link.fill('https://example.com/menetelma');
    await link.blur();
    await expect(modal.getByText('Syötä kelvollinen linkki esim. https://www.osaamispolku.fi')).toBeHidden();
    await send.click();

    await expect(send).toBeHidden();
    expect(backend.sisaltoehdotukset).toEqual([
      expect.objectContaining({
        sisalto: 'Uusi ohjausmenetelmä',
        linkki: 'https://example.com/menetelma',
        kuvaus: 'Hyödyllinen ryhmäohjauksessa.',
        kieli: 'fi',
      }),
    ]);
  });

  test('anonymous user is guided to log in to suggest content', async ({ page, open }) => {
    await open('asiakastyon-tueksi/itsetuntemus');

    await expect(page.getByRole('heading', { name: 'Ehdota uutta sisältöä palveluun' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Kirjaudu palveluun' })).toHaveAttribute(
      'href',
      '/ohjaaja/fi/kirjaudu-sisaan',
    );
    await expect(page.getByRole('button', { name: 'Ehdota sisältöä' })).toBeHidden();
  });
});

test('user sends feedback from the footer', async ({ page, open, backend }) => {
  await open();

  await page.getByRole('button', { name: 'Anna palautetta' }).click();
  const modal = page.getByTestId('feedback-modal');
  await modal.getByRole('radio', { name: 'Ohjaajan osio' }).check();
  await modal.getByRole('radio', { name: 'Kehitysehdotus' }).check();
  await modal.getByRole('textbox', { name: /^Palaute/ }).fill('Hakuun lisää suodattimia.');
  await modal.getByRole('button', { name: 'Lähetä' }).click();

  await expect(page.getByText('Kiitos palautteestasi!').first()).toBeVisible();
  expect(backend.palautteet).toEqual([
    expect.objectContaining({
      section: 'Ohjaajan osio',
      type: 'Kehitysehdotus',
      message: 'Hakuun lisää suodattimia.',
      language: 'fi',
    }),
  ]);
});
