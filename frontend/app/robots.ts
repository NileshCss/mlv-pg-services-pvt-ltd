import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/(auth)/'],
      },
    ],
    sitemap: 'https://mlvpg.com/sitemap.xml',
    host: 'https://mlvpg.com',
  }
}
