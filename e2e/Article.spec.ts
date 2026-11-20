import { crear } from './articles';
import { expect, expectBreadcrumb, test } from './fixtures';

test('shows the article content from the CMS', async ({ page, isMobile, open }) => {
  await open(crear.path);

  const article = page.getByTestId('content-details');
  await expect(article.getByRole('heading', { level: 1, name: crear.title })).toBeVisible();
  await expectBreadcrumb(page, isMobile, ['Ohjaajan osio', 'Asiakastyön tueksi', 'Itsetuntemus', crear.title]);
  await expect(article.getByRole('img', { name: 'Kuvituskuva' })).toBeVisible();
  await expect(article.getByTestId('content-body')).toContainText(
    'CREAR on digitaalinen palvelutarpeen arviointityökalu',
  );
  await expect(article.getByRole('heading', { name: 'Lisätietoja' })).toBeVisible();
  await expect(article.getByRole('link', { name: /^CREAR-arviointiväline/ })).toHaveAttribute(
    'href',
    'https://retumittari.fi/',
  );
  await expect(article.getByTestId('content-tags').getByRole('link', { name: 'Monialaisuus' })).toHaveAttribute(
    'href',
    '/ohjaaja/fi/haku?t=47796',
  );
});

test('signed-in user saves the article as a favorite', async ({ page, open, backend }) => {
  backend.signIn();
  await open(crear.path);

  await page.getByTestId('content-details').getByRole('button', { name: 'Tallenna suosikiksi' }).click();

  await expect(page.getByText('Suosikki lisätty.')).toBeVisible();
  await expect.poll(() => backend.suosikit.map((s) => s.artikkeliErc)).toEqual([crear.erc]);
  await expect(page.getByTestId('content-details').getByRole('button', { name: 'Poista suosikeista' })).toBeVisible();
});

test.describe('comments', () => {
  test('anonymous user can read but not write comments', async ({ page, open, backend }) => {
    backend.addComment(crear.erc, 'Hyvä työkalu ryhmäohjaukseen.');
    await open(crear.path);

    const comments = page.getByTestId('comments');
    await expect(comments.getByTestId('comment-text')).toHaveText(['Hyvä työkalu ryhmäohjaukseen.']);
    await expect(comments.getByRole('textbox')).toBeHidden();
    await expect(comments.getByRole('button', { name: 'Poista' })).toBeHidden();
  });

  test('signed-in user adds and deletes an own comment', async ({ page, open, backend }) => {
    backend.signIn();
    await open(crear.path);
    const comments = page.getByTestId('comments');
    await expect(comments.getByTestId('comments-empty')).toHaveText('Ei vielä kommentteja.');

    await comments.getByRole('textbox').fill('Testikommentti');
    await comments.getByRole('button', { name: 'Lähetä' }).click();
    await expect(page.getByText('Kommentti lisätty.')).toBeVisible();
    await expect(comments.getByTestId('comment-text')).toHaveText(['Testikommentti']);
    expect(backend.comments).toMatchObject([{ artikkeliErc: crear.erc, kommentti: 'Testikommentti' }]);

    // Cancelling keeps the comment.
    await comments.getByRole('button', { name: 'Poista' }).click();
    await page.getByRole('button', { name: 'Peruuta' }).click();
    await expect(comments.getByTestId('comment-text')).toHaveText(['Testikommentti']);

    await comments.getByRole('button', { name: 'Poista' }).click();
    await page.getByRole('button', { name: 'Poista kommentti' }).click();
    await expect(page.getByText('Kommentti poistettu.')).toBeVisible();
    await expect(comments.getByTestId('comments-empty')).toBeVisible();
    expect(backend.comments).toEqual([]);
  });

  test('user reports an inappropriate comment', async ({ page, open, backend }) => {
    const comment = backend.addComment(crear.erc, 'Asiaton kommentti');
    await open(crear.path);
    const comments = page.getByTestId('comments');

    await comments.getByRole('button', { name: 'Ilmianna' }).click();
    await page.getByRole('button', { name: 'Vahvista ilmianto' }).click();

    await expect(page.getByText('Kommentti ilmoitettu.')).toBeVisible();
    expect(backend.reportedCommentIds).toEqual([comment.id]);
  });

  test('are hidden when the feature is disabled', async ({ page, open, backend }) => {
    backend.features.COMMENTS = false;
    const featureChecked = page.waitForResponse('**/api/feature/COMMENTS');
    await open(crear.path);
    await featureChecked;

    await expect(page.getByTestId('content-details')).toBeVisible();
    await expect(page.getByTestId('comments')).toBeHidden();
  });
});
