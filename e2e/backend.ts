import type { Page, Request, Route } from '@playwright/test';

import type { components } from '../src/api/schema';
import type { Category, StructuredContent, StructuredContentPage } from '../src/types/cms-content';
import type { CMSNavigationMenu } from '../src/types/cms-navigation';
import articlesJson from './fixtures/cms/articles.json' with { type: 'json' };
import navigationJson from './fixtures/cms/navigation.json' with { type: 'json' };
import tagsJson from './fixtures/cms/tags.json' with { type: 'json' };

type Schemas = components['schemas'];
type Tyoskentelypaikka = NonNullable<Schemas['OhjaajaDto']['tyoskentelyPaikka']>;

// CMS fixtures are trimmed copies of real responses from the public Liferay site.
export const navigation = navigationJson as unknown as CMSNavigationMenu;
export const articles = articlesJson as unknown as StructuredContent[];
export const tags = tagsJson as unknown as Category[];

const CMS_PREFIX = '/ohjaaja/cms/o';
const EMPTY_IMAGE = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';

export const testUser = {
  id: '9f7f1b52-6d0e-4f43-9d2c-2f5a4f0f2a11',
  etunimi: 'Testi',
  sukunimi: 'Ohjaaja',
};

let idCounter = 0;
const nextId = () => `00000000-0000-4000-8000-${String(++idCounter).padStart(12, '0')}`;

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

const sivu = <T>(items: T[]) => ({ sisalto: items, maara: items.length, sivuja: items.length > 0 ? 1 : 0 });

const numbersAfter = (filter: string, operator: 'eq' | 'ne') =>
  [...filter.matchAll(new RegExp(String.raw`t ${operator} (\d+)`, 'g'))].map((m) => Number(m[1]));

const categoryIdsOf = (article: StructuredContent) =>
  (article.taxonomyCategoryBriefs ?? []).map((brief) => brief.taxonomyCategoryId);

/**
 * In-memory stand-in for the Ohjaaja backend and the Liferay CMS.
 *
 * Every request to the backend or the CMS is answered from this state, so the tests never reach a real service.
 * Requests that are not implemented here fail with 501 and are collected in `unhandledRequests`; the test fixture
 * fails the test if any were made, so that new API calls are noticed instead of silently hitting the network.
 */
export class FakeBackend {
  /** The signed-in user, or null for an anonymous session. */
  user: Schemas['OhjaajaCsrfDto'] | null = null;
  tyoskentelyPaikka: Tyoskentelypaikka | undefined = undefined;
  suosikit: Schemas['SuosikkiDto'][] = [];
  kiinnostukset: Schemas['KiinnostusDto'][] = [];
  comments: Schemas['ArtikkelinKommenttiDto'][] = [];
  reportedCommentIds: string[] = [];
  viewedArticleErcs: string[] = [];
  mostViewedArticleErcs: string[] = articles.map((article) => article.externalReferenceCode!);
  features: Record<string, boolean> = { COMMENTS: true };
  sisaltoehdotukset: Schemas['SisaltoEhdotusDto'][] = [];
  palautteet: Record<string, unknown>[] = [];
  exportCount = 0;
  /** Login redirects (`/ohjaaja/login`) made by the browser. */
  readonly loginRequests: URL[] = [];
  /** Form fields of logout submissions (`POST /ohjaaja/logout`); `deletion=true` deletes the profile. */
  readonly logoutRequests: Record<string, string>[] = [];
  /** CMS articles, a copy of the fixtures that a test may modify. */
  articles: StructuredContent[] = structuredClone(articles);
  readonly unhandledRequests: string[] = [];

  signIn(user: Partial<Schemas['OhjaajaCsrfDto']> = {}) {
    this.user = {
      ...testUser,
      csrf: { token: 'test-csrf-token', headerName: 'X-CSRF-TOKEN', parameterName: '_csrf' },
      ...user,
    };
  }

  addComment(artikkeliErc: string, kommentti: string, ohjaajaId = 'another-user', luotu = new Date()) {
    const comment = { id: nextId(), artikkeliErc, kommentti, ohjaajaId, luotu: luotu.toISOString() };
    this.comments.unshift(comment);
    return comment;
  }

  async install(page: Page) {
    // Keep the tests hermetic: third-party scripts (e.g. the chatbot) are not loaded.
    await page.route(
      (url) => url.hostname !== 'localhost',
      (route) => route.abort('blockedbyclient'),
    );
    await page.route(
      (url) => url.pathname.startsWith('/ohjaaja/api/') || url.pathname.startsWith('/api/'),
      (route) => this.handleApi(route),
    );
    await page.route(
      (url) => url.pathname.startsWith('/ohjaaja/cms/'),
      (route) => this.handleCms(route),
    );
    await page.route(
      (url) => url.pathname === '/ohjaaja/login' || url.pathname === '/ohjaaja/logout',
      (route) => this.handleAuth(route),
    );
    // Translations are bundled; a missing translation origin makes the app use them.
    await page.route(
      (url) => url.pathname.startsWith('/i18n/'),
      (route) => route.fulfill({ status: 404 }),
    );
    await page.route('**/ohjaaja/config/notifications.json', (route) => json(route, []));
    await page.route(/\/(favicon[^/]*|apple-touch-icon\.png|safari-pinned-tab\.svg)$/, (route) =>
      route.fulfill({ status: 200, contentType: 'image/svg+xml', body: EMPTY_IMAGE }),
    );
  }

  private unhandled(route: Route, request: Request) {
    this.unhandledRequests.push(`${request.method()} ${request.url()}`);
    return route.fulfill({ status: 501, body: 'Not mocked in e2e/backend.ts' });
  }

  /** Stands in for the Suomi.fi login and the logout of the backend: both end in a redirect back to the UI. */
  private async handleAuth(route: Route) {
    const request = route.request();
    const url = new URL(request.url());
    // A 302 cannot be fulfilled in WebKit, so the redirect is done with an HTML page instead.
    const redirect = (location: string) =>
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `<!doctype html><meta http-equiv="refresh" content="0;url=${location}">`,
      });

    if (url.pathname === '/ohjaaja/login') {
      this.loginRequests.push(url);
      this.signIn();
      const callback = url.searchParams.get('callback');
      return redirect(callback?.startsWith('/') ? `/ohjaaja${callback}` : '/ohjaaja/fi');
    }
    const form = Object.fromEntries(new URLSearchParams(request.postData() ?? ''));
    this.logoutRequests.push(form);
    this.user = null;
    if (form.deletion === 'true') {
      this.tyoskentelyPaikka = undefined;
      this.suosikit = [];
      this.kiinnostukset = [];
    }
    return redirect(`/ohjaaja/${form.lang ?? 'fi'}`);
  }

  private async handleApi(route: Route) {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname.replace(/^\/ohjaaja\/api|^\/api/, '');
    const body = () => request.postDataJSON() as Record<string, unknown>;
    let match: RegExpMatchArray | null;

    if (path === '/palaute' && method === 'POST') {
      this.palautteet.push(body());
      return route.fulfill({ status: 201 });
    }
    if ((match = path.match(/^\/feature\/(\w+)$/))) {
      return json(route, { feature: match[1], enabled: this.features[match[1]] ?? false });
    }
    if (path === '/artikkeli/katselu/katsotuimmat' && method === 'GET') {
      const filter = url.searchParams.get('filterByArtikkeliErcs')?.split(',');
      return json(route, sivu(this.mostViewedArticleErcs.filter((erc) => !filter || filter.includes(erc))));
    }
    if ((match = path.match(/^\/artikkeli\/katselu\/([^/]+)$/)) && method === 'POST') {
      if (this.user) {
        this.viewedArticleErcs = [match[1], ...this.viewedArticleErcs.filter((erc) => erc !== match![1])];
      }
      return route.fulfill({ status: 200 });
    }
    if (path === '/artikkeli/kommentit' && method === 'GET') {
      const erc = url.searchParams.get('artikkeliErc');
      return json(route, sivu(this.comments.filter((comment) => comment.artikkeliErc === erc)));
    }

    // Reporting a comment does not require a session.
    if ((match = path.match(/^\/artikkeli\/kommentit\/([^/]+)\/ilmianto$/)) && method === 'POST') {
      this.reportedCommentIds.push(match[1]);
      return route.fulfill({ status: 200 });
    }

    // Everything below requires a session.
    if (!this.user) {
      return path === '/profiili/ohjaaja' && method === 'GET'
        ? route.fulfill({ status: 401 })
        : this.unhandled(route, request);
    }

    if (path === '/profiili/ohjaaja') {
      if (method === 'GET') {
        return json(route, { ...this.user, tyoskentelyPaikka: this.tyoskentelyPaikka });
      }
      if (method === 'PUT') {
        this.tyoskentelyPaikka = body().tyoskentelyPaikka as Tyoskentelypaikka;
        return route.fulfill({ status: 200 });
      }
    }
    if (path === '/profiili/suosikit') {
      if (method === 'GET') {
        return json(route, this.suosikit);
      }
      if (method === 'POST') {
        const suosikki = { id: nextId(), artikkeliErc: String(body().artikkeliErc), luotu: new Date().toISOString() };
        this.suosikit.push(suosikki);
        return json(route, suosikki.id);
      }
      if (method === 'DELETE') {
        this.suosikit = this.suosikit.filter((suosikki) => suosikki.id !== url.searchParams.get('id'));
        return route.fulfill({ status: 204 });
      }
    }
    if (path === '/profiili/kiinnostukset') {
      if (method === 'GET') {
        return json(route, this.kiinnostukset);
      }
      if (method === 'POST') {
        const kiinnostus = { id: nextId(), asiasanaId: Number(body().asiasanaId), luotu: new Date().toISOString() };
        this.kiinnostukset.push(kiinnostus);
        return json(route, kiinnostus.id);
      }
      if (method === 'DELETE') {
        this.kiinnostukset = this.kiinnostukset.filter((k) => k.id !== url.searchParams.get('id'));
        return route.fulfill({ status: 204 });
      }
    }
    if (path === '/profiili/ohjaaja/vienti' && method === 'GET') {
      this.exportCount++;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Content-Disposition': 'attachment; filename="ohjaaja.json"' },
        body: JSON.stringify({ id: this.user.id, tyoskentelyPaikka: this.tyoskentelyPaikka, suosikit: this.suosikit }),
      });
    }
    if (path === '/artikkeli/kommentit/omat' && method === 'GET') {
      return json(route, sivu(this.ownCommentedArticles(this.user.id!)));
    }
    if (path === '/artikkeli/viimeksi-katsellut' && method === 'GET') {
      return json(route, sivu(this.viewedArticleErcs));
    }
    if (path === '/artikkeli/kommentit' && method === 'POST') {
      const { artikkeliErc, kommentti } = body() as { artikkeliErc: string; kommentti: string };
      return json(route, this.addComment(artikkeliErc, kommentti, this.user.id));
    }
    if ((match = path.match(/^\/artikkeli\/kommentit\/([^/]+)$/)) && method === 'DELETE') {
      this.comments = this.comments.filter((comment) => comment.id !== match![1]);
      return route.fulfill({ status: 200 });
    }
    if (path === '/sisaltoehdotus' && method === 'POST') {
      this.sisaltoehdotukset.push(body() as Schemas['SisaltoEhdotusDto']);
      return route.fulfill({ status: 200 });
    }

    return this.unhandled(route, request);
  }

  private ownCommentedArticles(ohjaajaId: string): Schemas['KommentoidutArtikkelitDto'][] {
    const byArticle = new Map<string, Schemas['ArtikkelinKommenttiDto'][]>();
    for (const comment of this.comments.filter((c) => c.ohjaajaId === ohjaajaId)) {
      byArticle.set(comment.artikkeliErc, [...(byArticle.get(comment.artikkeliErc) ?? []), comment]);
    }
    return [...byArticle].map(([artikkeliErc, comments]) => {
      const times = comments.map((comment) => comment.luotu!).sort((a, b) => a.localeCompare(b));
      return {
        artikkeliErc,
        uusinKommenttiAika: times.at(-1)!,
        vanhinKommenttiAika: times[0],
        kommenttiMaara: comments.length,
      };
    });
  }

  private async handleCms(route: Route) {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    let match: RegExpMatchArray | null;

    if (path.startsWith('/ohjaaja/cms/documents/') || path.startsWith(`${CMS_PREFIX}/adaptive-media/`)) {
      return route.fulfill({ status: 200, contentType: 'image/svg+xml', body: EMPTY_IMAGE });
    }
    if (path === `${CMS_PREFIX}/jod-navigation/20117`) {
      return json(route, navigation);
    }
    if (path === `${CMS_PREFIX}/jod-tags/20117`) {
      return json(route, tags);
    }
    if ((match = path.match(/\/headless-delivery\/v1\.0\/structured-contents\/(\d+)$/))) {
      const article = this.articles.find((a) => a.id === Number(match![1]));
      return article ? json(route, article) : json(route, { status: 'NOT_FOUND' }, 404);
    }
    if (path === `${CMS_PREFIX}/headless-delivery/v1.0/sites/20117/structured-contents`) {
      return json(route, this.queryArticles(url.searchParams));
    }

    return this.unhandled(route, request);
  }

  /** Implements the subset of the Liferay headless-delivery filters that the app uses. */
  private queryArticles(params: URLSearchParams): StructuredContentPage {
    const filter = params.get('filter') ?? '';
    const ids = [...filter.matchAll(/'(\d+)'/g)].map((m) => Number(m[1]));
    const included = numbersAfter(filter, 'eq');
    const excluded = numbersAfter(filter, 'ne');
    const search = (params.get('search') ?? '').toLocaleLowerCase('fi');

    let items = this.articles.filter((article) => {
      const categoryIds = categoryIdsOf(article);
      return (
        (ids.length === 0 || ids.includes(article.id!)) &&
        (included.length === 0 || included.some((id) => categoryIds.includes(id))) &&
        !excluded.some((id) => categoryIds.includes(id)) &&
        (search === '' || article.title.toLocaleLowerCase('fi').includes(search))
      );
    });

    const [field, direction] = (params.get('sort') ?? '').split(':');
    if (field === 'title' || field === 'dateCreated') {
      items = [...items].sort((a, b) => String(a[field]).localeCompare(String(b[field]), 'fi'));
      if (direction === 'desc') {
        items.reverse();
      }
    }

    const pageNumber = Number(params.get('page') ?? 1);
    const pageSize = Number(params.get('pageSize') ?? 20);
    return {
      actions: {},
      facets: [],
      items: items.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
      lastPage: Math.max(1, Math.ceil(items.length / pageSize)),
      page: pageNumber,
      pageSize,
      totalCount: items.length,
    };
  }
}
