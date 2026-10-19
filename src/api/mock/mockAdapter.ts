import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { HttpError, dispatch } from './mockServer';

/**
 * Axios adapter that routes requests to the in-browser mock server instead of the network.
 * Services stay 100% identical between mock mode and a real backend.
 */
const latency = () => new Promise((resolve) => setTimeout(resolve, 250 + Math.random() * 350));

const toResponse = (config: InternalAxiosRequestConfig, status: number, data: unknown): AxiosResponse => ({
  data,
  status,
  statusText: String(status),
  headers: new AxiosHeaders({ 'content-type': 'application/json' }),
  config,
  request: {},
});

export const mockAdapter: AxiosAdapter = async (config) => {
  await latency();

  const method = (config.method ?? 'get').toUpperCase();
  const rawUrl = config.url ?? '';
  const base = config.baseURL ?? '';
  const [pathPart, queryString = ''] = (rawUrl.startsWith(base) ? rawUrl.slice(base.length) : rawUrl).split('?');
  const path = '/' + pathPart.replace(/^\/+/, '');

  const query: Record<string, string> = Object.fromEntries(new URLSearchParams(queryString));
  Object.entries((config.params ?? {}) as Record<string, unknown>).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query[k] = String(v);
  });

  let body: Record<string, unknown> = {};
  if (typeof config.data === 'string' && config.data) {
    try {
      body = JSON.parse(config.data);
    } catch {
      body = {};
    }
  } else if (config.data && typeof config.data === 'object') {
    body = config.data as Record<string, unknown>;
  }

  const authHeader = config.headers?.get?.('Authorization') ?? config.headers?.Authorization;

  try {
    const { status, data } = dispatch(method, path, query, body, authHeader ? String(authHeader) : undefined);
    return toResponse(config, status, data);
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    const message = err instanceof Error ? err.message : 'Internal server error';
    const response = toResponse(config, status, { status, message, timestamp: new Date().toISOString() });
    throw new AxiosError(
      message,
      status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
      config,
      {},
      response,
    );
  }
};
