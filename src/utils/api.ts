export async function fetchJsonSafe<T = any>(url: string, options?: RequestInit, fallback: T | null = null): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return fallback;
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();
    
    // Check if the response is HTML
    if (text.trim().startsWith('<') || text.trim().startsWith('<!')) {
      return fallback;
    }

    if (contentType.includes('application/json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
      try {
        return JSON.parse(text) as T;
      } catch {
        return fallback;
      }
    }

    return fallback;
  } catch (err) {
    return fallback;
  }
}

export async function parseResponseJsonSafe(res: Response): Promise<{ data: any; isHtml: boolean; error?: string }> {
  try {
    const text = await res.text();
    if (text.trim().startsWith('<') || text.trim().startsWith('<!')) {
      return { data: null, isHtml: true, error: 'Server returned HTML instead of JSON' };
    }
    const data = JSON.parse(text);
    return { data, isHtml: false };
  } catch (e: any) {
    return { data: null, isHtml: true, error: e?.message || 'Failed to parse JSON' };
  }
}
