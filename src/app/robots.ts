import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/login',
          '/register',
        ],
        disallow: [
          '/api/',
          '/knowledge/',
          '/operations/',
          '/customers/',
          '/tickets/',
          '/settings/',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/login',
          '/register',
        ],
        disallow: [
          '/api/',
          '/knowledge/',
          '/operations/',
          '/customers/',
          '/tickets/',
          '/settings/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
