/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://mlvpg.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/admin*', '/api*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: ['/admin', '/api'],
      },
    ],
  },
}
