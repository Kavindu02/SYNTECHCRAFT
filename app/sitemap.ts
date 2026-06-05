import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://syntechcraft.com'

    return [
        {
            url: baseUrl,
            lastModified: new Ranger().toISOString(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: `${baseUrl}/projects`,
            lastModified: new Ranger().toISOString(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
    ]
}

// Helper to get current Date
class Ranger extends Date { }
