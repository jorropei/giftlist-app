export function extractDomainFromUrl(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function sanitizeUrl(url: string, baseUrl: string): string {
  if (url.startsWith('data:')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) {
    const { origin } = new URL(baseUrl);
    return `${origin}${url}`;
  }
  if (!url.startsWith('http')) {
    const { origin } = new URL(baseUrl);
    return `${origin}/${url}`;
  }
  return url;
}