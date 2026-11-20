import { crear } from './articles';
import { expect, test } from './fixtures';

const YOUTUBE_EMBED = '<div class="embed-responsive" data-embed-id="https://www.youtube.com/embed/abc123"></div>';

test.beforeEach(async ({ backend }) => {
  // Add a YouTube embed to an article, it is third-party content that requires consent.
  const article = backend.articles.find((a) => a.id === crear.id)!;
  const content = article.contentFields!.find((field) => field.fieldReference === 'content')!;
  content.contentFieldValue.data += YOUTUBE_EMBED;
});

test('YouTube content is blocked until all cookies are accepted', async ({ page }) => {
  await page.goto(`/ohjaaja/fi/${crear.path}`);
  const modal = page.getByTestId('cookie-consent-modal');
  // The modal element itself is a zero-size wrapper, so visibility is checked from its title.
  const modalTitle = modal.getByTestId('title');
  const video = page.getByTitle('YouTube video player');

  await expect(modalTitle).toBeVisible();
  await modal.getByTestId('decline-optional').click();
  await expect(modalTitle).toBeHidden();
  await expect(video).toBeHidden();

  await page.getByRole('button', { name: 'Evästeasetukset' }).click();
  await expect(modalTitle).toBeVisible();
  await modal.getByTestId('accept-all').click();
  await expect(modalTitle).toBeHidden();
  await expect(video).toBeVisible();
});

test('the consent is remembered after a reload', async ({ page }) => {
  await page.goto('/ohjaaja/fi');
  await page.getByTestId('cookie-consent-modal').getByTestId('accept-all').click();

  await page.reload();

  await expect(page.getByTestId('home')).toBeVisible();
  await expect(page.getByTestId('cookie-consent-modal').getByTestId('title')).toBeHidden();
});

test('the cookie settings can be read in other languages', async ({ page }) => {
  await page.goto('/ohjaaja/fi');
  const modal = page.getByTestId('cookie-consent-modal');
  await expect(modal.getByTestId('title')).toHaveText('Käytämme evästeitä');

  await modal.getByTestId('language-button-trigger').click();
  await modal.getByTestId('language-button-menu-item-sv').click();
  await expect(modal.getByTestId('title')).toHaveText('Vi använder cookies');

  await modal.getByTestId('language-button-trigger').click();
  await modal.getByTestId('language-button-menu-item-en').click();
  await expect(modal.getByTestId('title')).toHaveText('We use cookies');
});
