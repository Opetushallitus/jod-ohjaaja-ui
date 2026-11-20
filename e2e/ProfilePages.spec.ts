import { crear, vahto } from './articles';
import { expect, test } from './fixtures';

test.beforeEach(({ backend }) => {
  backend.signIn();
});

test('profile front page greets the user', async ({ page, open }) => {
  await open('ohjaajan-profiili');

  await expect(page).toHaveURL('/ohjaaja/fi/ohjaajan-profiili/etusivu');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Hei Testi – tervetuloa ohjaajan profiiliin!' }),
  ).toBeVisible();
});

test.describe('favorites', () => {
  test('lists, sorts and removes saved favorites', async ({ page, open, backend }) => {
    backend.suosikit.push(
      { id: 's1', artikkeliErc: crear.erc, luotu: '2026-01-01T00:00:00Z' },
      { id: 's2', artikkeliErc: vahto.erc, luotu: '2026-02-01T00:00:00Z' },
    );
    await open('ohjaajan-profiili/suosikit');
    const main = page.getByRole('main');
    const titles = main.getByRole('link').filter({ hasText: /^(CREAR|VAHTO)/ });

    await expect(main.getByText('Olet tallentanut 2 suosikkia.')).toBeVisible();
    await expect(main.getByRole('heading', { name: 'Asiakastyön tueksi (2)' })).toBeVisible();
    await expect(titles).toHaveText([new RegExp(`^${crear.title}`), new RegExp(`^${vahto.title}`)]);

    await main.getByRole('button', { name: 'Järjestä' }).click();
    await page.getByRole('radio', { name: 'Aakkosittain Ö - A' }).click();
    await expect(titles).toHaveText([new RegExp(`^${vahto.title}`), new RegExp(`^${crear.title}`)]);

    await page.keyboard.press('Escape');

    // The innermost element that holds both the article link and its favorite button is the article card.
    const vahtoCard = main
      .locator('div')
      .filter({ has: page.getByRole('link', { name: vahto.title }) })
      .filter({ has: page.getByRole('button', { name: 'Poista suosikeista' }) })
      .last();
    await vahtoCard.getByRole('button', { name: 'Poista suosikeista' }).click();
    await expect(page.getByText('Suosikki poistettu.')).toBeVisible();
    await expect(main.getByText('Olet tallentanut yhden suosikin.')).toBeVisible();
    expect(backend.suosikit.map((s) => s.artikkeliErc)).toEqual([crear.erc]);
  });

  test('shows an empty state without favorites', async ({ page, open }) => {
    await open('ohjaajan-profiili/suosikit');

    await expect(page.getByRole('main').getByText('Et ole vielä tallentanut suosikkeja.')).toBeVisible();
  });
});

test.describe('own comments', () => {
  test('lists the articles the user has commented', async ({ page, open, backend }) => {
    backend.addComment(crear.erc, 'Oma kommentti', backend.user!.id);
    backend.addComment(vahto.erc, 'Toisen käyttäjän kommentti');
    await open('ohjaajan-profiili/omat-kommentit');
    const main = page.getByRole('main');

    await expect(main.getByText('Olet jättänyt kommentteja 1 sisältöön.')).toBeVisible();
    await expect(main.getByRole('link', { name: crear.title })).toBeVisible();
    await expect(main.getByRole('link', { name: vahto.title })).toBeHidden();

    await main.getByRole('link', { name: crear.title }).click();
    await expect(page.getByTestId('comments').getByTestId('comment-text')).toHaveText(['Oma kommentti']);
  });

  test('shows an empty state without comments', async ({ page, open }) => {
    await open('ohjaajan-profiili/omat-kommentit');

    await expect(page.getByRole('main').getByText('Et ole vielä kommentoinut sisältöjä')).toBeVisible();
  });
});

test.describe('settings', () => {
  test.beforeEach(async ({ open }) => {
    await open('ohjaajan-profiili/asetukset');
  });

  test('user downloads the profile data', async ({ page, backend }) => {
    await page.getByRole('button', { name: 'Lataa ohjaajan profiilin tiedot (JSON)' }).click();

    // The browser downloads the file directly from the backend. WebKit does not report it as a download event,
    // so the test checks that the export was requested.
    await expect.poll(() => backend.exportCount).toBe(1);
  });

  test('user deletes the profile', async ({ page, backend }) => {
    const dialog = page.getByTestId('preferences-delete-dialog');

    await page.getByRole('button', { name: 'Poista ohjaajan profiili' }).click();
    await dialog.getByRole('button', { name: 'Peruuta' }).click();
    await expect(dialog.getByRole('button', { name: 'Peruuta' })).toBeHidden();
    expect(backend.logoutRequests).toEqual([]);

    await page.getByRole('button', { name: 'Poista ohjaajan profiili' }).click();
    await dialog.getByRole('button', { name: 'Poista' }).click();

    await expect(page).toHaveURL('/ohjaaja/fi');
    await expect(page.getByTestId('app-header').getByRole('link', { name: 'Kirjaudu' })).toBeVisible();
    expect(backend.logoutRequests).toEqual([{ _csrf: 'test-csrf-token', lang: 'fi', deletion: 'true' }]);
  });
});
