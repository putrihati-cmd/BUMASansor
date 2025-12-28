export default function sitemap() {
    const baseUrl = 'https://infiatin.store';

    const routes = [
        '',
        '/products',
        '/cart',
        '/checkout',
        '/about',
        '/help',
        '/contact',
        '/auth/login',
        '/auth/register',
        '/terms',
        '/privacy',
        '/refund-policy',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
    }));

    return routes;
}

