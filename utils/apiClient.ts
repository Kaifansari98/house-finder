export const API_BASE_URL = 'https://new.housefindercrm.com/api/';

type QueryParams = Record<string, string | number | boolean | undefined | null>;

type ApiBody = BodyInit | Record<string, unknown> | undefined | null;

type ApiClientOptions = Omit<RequestInit, 'body'> & {
  query?: QueryParams;
  body?: ApiBody;
};

const buildUrl = (path: string, query?: QueryParams) => {
  const sanitizedPath = path.replace(/^\//, '');
  const url = new URL(sanitizedPath, API_BASE_URL);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
};

const parseBody = (body: ApiBody) => {
  if (body === undefined || body === null) return body;
  if (typeof body === 'string' || body instanceof FormData || body instanceof Blob) {
    return body;
  }

  return JSON.stringify(body);
};

export const apiClient = async <TResponse>(
  path: string,
  options: ApiClientOptions = {},
): Promise<TResponse> => {
  const { query, headers, body, ...restOptions } = options;
  const url = buildUrl(path, query);

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: parseBody(body),
    ...restOptions,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    const errorPayload = isJson ? await response.json() : await response.text();
    throw new Error(typeof errorPayload === 'string' ? errorPayload : JSON.stringify(errorPayload));
  }

  if (!isJson) {
    return (await response.text()) as TResponse;
  }

  return (await response.json()) as TResponse;
};
