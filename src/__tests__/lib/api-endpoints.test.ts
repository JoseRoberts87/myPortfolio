/**
 * Coverage for the remaining src/lib/api.ts surface: the endpoint helpers not
 * exercised in api.test.ts, the query-string builders (including the
 * `!== undefined` branches that must append a literal `0`), the shared
 * fetchApi error branches, and the FormData upload path.
 */

import {
  detectObjectsInImage,
  getSchedulerStatus,
  getPipelineRuns,
  getPipelineMetrics,
  getArticles,
  getArticle,
  syncNewsArticles,
  getArticleSourceStats,
  getEntities,
  getArticleEntities,
  getEntityStats,
  processArticleEntities,
  getKeywords,
  getArticleKeywords,
  getKeywordStats,
  getTrendingKeywords,
  processArticleKeywords,
  getRedditPost,
} from '@/lib/api';

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

/** Resolve fetch with an ok JSON response returning `body`. */
function okJson(body: unknown) {
  return {
    ok: true,
    json: async () => body,
    headers: { get: () => 'application/json' },
  };
}

/** Resolve fetch with a non-ok response whose json() yields `errorBody`. */
function errJson(status: number, statusText: string, errorBody: unknown) {
  return {
    ok: false,
    status,
    statusText,
    json: async () => errorBody,
  };
}

const BASE = 'http://localhost:8000/api/v1';

/** The URL fetch was called with on its most recent invocation. */
function lastUrl(): string {
  return mockFetch.mock.calls[mockFetch.mock.calls.length - 1][0] as string;
}

beforeEach(() => jest.clearAllMocks());

describe('fetchApi error branches', () => {
  it('throws the backend-provided detail message on a non-ok response', async () => {
    mockFetch.mockResolvedValueOnce(errJson(400, 'Bad Request', { detail: 'nope' }));
    await expect(getArticleSourceStats()).rejects.toThrow('nope');
  });

  it('falls back to the HTTP status line when the error body has no detail', async () => {
    mockFetch.mockResolvedValueOnce(errJson(503, 'Service Unavailable', {}));
    await expect(getEntityStats()).rejects.toThrow('HTTP 503: Service Unavailable');
  });

  it('falls back to a generic message when the error body is not valid JSON', async () => {
    // json() rejects -> the `.catch(() => ({ detail: 'Unknown error' }))` kicks in.
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => {
        throw new Error('invalid json');
      },
    });
    await expect(getEntityStats()).rejects.toThrow('Unknown error');
  });

  it('wraps a non-Error rejection as "An unexpected error occurred"', async () => {
    mockFetch.mockRejectedValueOnce('a string, not an Error');
    await expect(getEntityStats()).rejects.toThrow('An unexpected error occurred');
  });
});

describe('detectObjectsInImage', () => {
  const file = new File(['bytes'], 'photo.png', { type: 'image/png' });

  it('posts multipart FormData and returns the parsed detections', async () => {
    const payload = {
      detections: [{ class_name: 'person', confidence: 0.9, bbox: [1, 2, 3, 4] }],
      image_width: 640,
      image_height: 480,
    };
    mockFetch.mockResolvedValueOnce(okJson(payload));

    const result = await detectObjectsInImage(file);

    expect(lastUrl()).toBe(`${BASE}/computer-vision/detect/image`);
    const init = mockFetch.mock.calls[0][1];
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get('file')).toBe(file);
    expect(result).toEqual(payload);
  });

  it('appends confidence and return_annotated query params when provided', async () => {
    mockFetch.mockResolvedValueOnce(
      okJson({ detections: [], image_width: 0, image_height: 0 })
    );

    await detectObjectsInImage(file, { confidence: 0.25, returnAnnotated: true });

    expect(lastUrl()).toBe(
      `${BASE}/computer-vision/detect/image?confidence=0.25&return_annotated=true`
    );
  });

  it('appends confidence=0 because it uses an explicit !== undefined check', async () => {
    mockFetch.mockResolvedValueOnce(
      okJson({ detections: [], image_width: 0, image_height: 0 })
    );

    await detectObjectsInImage(file, { confidence: 0 });

    expect(lastUrl()).toBe(`${BASE}/computer-vision/detect/image?confidence=0`);
  });

  it('throws the detail message on a non-ok upload response', async () => {
    mockFetch.mockResolvedValueOnce(errJson(413, 'Payload Too Large', { detail: 'too big' }));
    await expect(detectObjectsInImage(file)).rejects.toThrow('too big');
  });

  it('falls back to the HTTP status line when the upload error body has no detail', async () => {
    mockFetch.mockResolvedValueOnce(errJson(415, 'Unsupported Media Type', {}));
    await expect(detectObjectsInImage(file)).rejects.toThrow(
      'HTTP 415: Unsupported Media Type'
    );
  });
});

describe('scheduler / pipeline history helpers', () => {
  it('getSchedulerStatus hits the jobs status endpoint', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ running: true, jobs: [] }));
    await getSchedulerStatus();
    expect(lastUrl()).toBe(`${BASE}/jobs/status`);
  });

  it('getPipelineRuns builds no query string without params', async () => {
    mockFetch.mockResolvedValueOnce(okJson([]));
    await getPipelineRuns();
    expect(lastUrl()).toBe(`${BASE}/jobs/runs/history`);
  });

  it('getPipelineRuns appends limit, pipeline_name and status', async () => {
    mockFetch.mockResolvedValueOnce(okJson([]));
    await getPipelineRuns({ limit: 5, pipeline_name: 'reddit', status: 'success' });
    expect(lastUrl()).toBe(
      `${BASE}/jobs/runs/history?limit=5&pipeline_name=reddit&status=success`
    );
  });

  it('getPipelineMetrics builds no query string without params', async () => {
    mockFetch.mockResolvedValueOnce(okJson({}));
    await getPipelineMetrics();
    expect(lastUrl()).toBe(`${BASE}/jobs/metrics/summary`);
  });

  it('getPipelineMetrics appends pipeline_name and days', async () => {
    mockFetch.mockResolvedValueOnce(okJson({}));
    await getPipelineMetrics({ pipeline_name: 'news', days: 14 });
    expect(lastUrl()).toBe(`${BASE}/jobs/metrics/summary?pipeline_name=news&days=14`);
  });
});

describe('articles helpers', () => {
  it('getArticles builds no query string without params', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ articles: [], total: 0 }));
    await getArticles();
    expect(lastUrl()).toBe(`${BASE}/articles/`);
  });

  it('getArticles serializes every supported filter', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ articles: [], total: 0 }));
    await getArticles({
      source_type: 'news',
      source_name: 'BBC',
      category: 'tech',
      sentiment: 'positive',
      author: 'jane',
      language: 'en',
      search_query: 'ai',
      from_date: '2026-01-01',
      to_date: '2026-02-01',
      page: 2,
      page_size: 25,
      sort_by: 'published_at',
      sort_order: 'desc',
    });
    const url = new URL(lastUrl());
    expect(url.pathname).toBe('/api/v1/articles/');
    expect(url.searchParams.get('source_type')).toBe('news');
    expect(url.searchParams.get('source_name')).toBe('BBC');
    expect(url.searchParams.get('category')).toBe('tech');
    expect(url.searchParams.get('sentiment')).toBe('positive');
    expect(url.searchParams.get('author')).toBe('jane');
    expect(url.searchParams.get('language')).toBe('en');
    expect(url.searchParams.get('search_query')).toBe('ai');
    expect(url.searchParams.get('from_date')).toBe('2026-01-01');
    expect(url.searchParams.get('to_date')).toBe('2026-02-01');
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('page_size')).toBe('25');
    expect(url.searchParams.get('sort_by')).toBe('published_at');
    expect(url.searchParams.get('sort_order')).toBe('desc');
  });

  it('getArticle fetches a single article by id', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ id: 42 }));
    const result = await getArticle(42);
    expect(lastUrl()).toBe(`${BASE}/articles/42`);
    expect(result).toEqual({ id: 42 });
  });

  it('syncNewsArticles posts with no query string when no params given', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ status: 'ok', message: 'synced' }));
    await syncNewsArticles();
    expect(lastUrl()).toBe(`${BASE}/articles/sync/news`);
    expect(mockFetch.mock.calls[0][1].method).toBe('POST');
  });

  it('syncNewsArticles appends category, sources and page_size', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ status: 'ok', message: 'synced' }));
    await syncNewsArticles({ category: 'tech', sources: 'bbc,cnn', page_size: 10 });
    expect(lastUrl()).toBe(
      `${BASE}/articles/sync/news?category=tech&sources=bbc%2Ccnn&page_size=10`
    );
  });

  it('getArticleSourceStats hits the source-stats endpoint', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ sources: [] }));
    await getArticleSourceStats();
    expect(lastUrl()).toBe(`${BASE}/articles/stats/sources`);
  });
});

describe('entity helpers', () => {
  it('getEntities builds no query string without params', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ entities: [], total: 0 }));
    await getEntities();
    expect(lastUrl()).toBe(`${BASE}/entities/`);
  });

  it('getEntities appends article_id=0 via the !== undefined guard', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ entities: [], total: 0 }));
    await getEntities({ article_id: 0 });
    expect(lastUrl()).toBe(`${BASE}/entities/?article_id=0`);
  });

  it('getEntities appends the remaining filters', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ entities: [], total: 0 }));
    await getEntities({
      article_id: 7,
      entity_type: 'PERSON',
      entity_text: 'Ada',
      limit: 10,
      offset: 20,
    });
    expect(lastUrl()).toBe(
      `${BASE}/entities/?article_id=7&entity_type=PERSON&entity_text=Ada&limit=10&offset=20`
    );
  });

  it('getArticleEntities fetches entities for one article', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ entities: [], total: 0 }));
    await getArticleEntities(9);
    expect(lastUrl()).toBe(`${BASE}/entities/article/9`);
  });

  it('getEntityStats hits the entity stats endpoint', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ total: 0 }));
    await getEntityStats();
    expect(lastUrl()).toBe(`${BASE}/entities/stats`);
  });

  it('processArticleEntities posts to the process-article endpoint', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ entities: [], total: 0 }));
    await processArticleEntities(3);
    expect(lastUrl()).toBe(`${BASE}/entities/process-article/3`);
    expect(mockFetch.mock.calls[0][1].method).toBe('POST');
  });
});

describe('keyword helpers', () => {
  it('getKeywords builds no query string without params', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ keywords: [], total: 0 }));
    await getKeywords();
    expect(lastUrl()).toBe(`${BASE}/keywords/`);
  });

  it('getKeywords appends article_id=0 and min_score=0 via !== undefined guards', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ keywords: [], total: 0 }));
    await getKeywords({ article_id: 0, min_score: 0 });
    expect(lastUrl()).toBe(`${BASE}/keywords/?article_id=0&min_score=0`);
  });

  it('getKeywords appends keyword, limit and offset', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ keywords: [], total: 0 }));
    await getKeywords({ keyword: 'ai', min_score: 0.5, limit: 5, offset: 10 });
    expect(lastUrl()).toBe(
      `${BASE}/keywords/?keyword=ai&min_score=0.5&limit=5&offset=10`
    );
  });

  it('getArticleKeywords fetches keywords for one article', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ keywords: [], total: 0 }));
    await getArticleKeywords(11);
    expect(lastUrl()).toBe(`${BASE}/keywords/article/11`);
  });

  it('getKeywordStats hits the keyword stats endpoint', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ total: 0 }));
    await getKeywordStats();
    expect(lastUrl()).toBe(`${BASE}/keywords/stats`);
  });

  it('getTrendingKeywords builds no query string without params', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ keywords: [] }));
    await getTrendingKeywords();
    expect(lastUrl()).toBe(`${BASE}/keywords/trending`);
  });

  it('getTrendingKeywords appends time_window and limit', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ keywords: [] }));
    await getTrendingKeywords({ time_window: '7d', limit: 8 });
    expect(lastUrl()).toBe(`${BASE}/keywords/trending?time_window=7d&limit=8`);
  });

  it('processArticleKeywords posts to the process-article endpoint', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ keywords: [], total: 0 }));
    await processArticleKeywords(4);
    expect(lastUrl()).toBe(`${BASE}/keywords/process-article/4`);
    expect(mockFetch.mock.calls[0][1].method).toBe('POST');
  });
});

describe('getRedditPost path building', () => {
  it('interpolates the post id into the path', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ id: 'abc' }));
    await getRedditPost('abc');
    expect(lastUrl()).toBe(`${BASE}/reddit/posts/abc`);
  });
});
