export function getYouTubeEmbedUrl(inputUrl: string): string | null {
  try {
    const parsed = new URL(inputUrl)
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      if (parsed.pathname === '/watch') {
        const id = parsed.searchParams.get('v')
        return id ? `https://www.youtube.com/embed/${id}` : null
      }

      const pathParts = parsed.pathname.split('/').filter(Boolean)
      if (pathParts.length >= 2 && (pathParts[0] === 'embed' || pathParts[0] === 'shorts')) {
        return `https://www.youtube.com/embed/${pathParts[1]}`
      }
    }
  } catch {
    return null
  }

  if (inputUrl.includes('youtube.com/embed/')) return inputUrl

  return null
}

export function getYouTubeWatchUrl(inputUrl: string): string | null {
  const embedUrl = getYouTubeEmbedUrl(inputUrl)
  if (!embedUrl) return null

  try {
    const parsed = new URL(embedUrl)
    const pathParts = parsed.pathname.split('/').filter(Boolean)
    const videoId = pathParts.length >= 2 && pathParts[0] === 'embed' ? pathParts[1] : null
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null
  } catch {
    return null
  }
}

export async function isYouTubeVideoAvailable(inputUrl: string): Promise<boolean> {
  const watchUrl = getYouTubeWatchUrl(inputUrl)
  if (!watchUrl) return false

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
      {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      }
    )

    return response.ok
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

export function normalizeCourseContentUrl(contentType: string, inputUrl: string | null | undefined): string | null {
  const trimmed = inputUrl?.trim()
  if (!trimmed) return null

  if (contentType === 'video') {
    const embedUrl = getYouTubeEmbedUrl(trimmed)
    return embedUrl ? trimmed : null
  }

  return trimmed
}