export interface WatchEvent {
  title: string;
  videoId?: string;
  channelName: string;
  channelUrl?: string;
  watchedAt: Date;
  source: 'youtube' | 'youtube-music';
}

const MIN_VALID_WATCH_DATE = new Date('2005-01-01T00:00:00.000Z');

function getMaxValidWatchDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
}

function isValidWatchDate(value: Date): boolean {
  const time = value.getTime();
  if (Number.isNaN(time)) return false;
  return time >= MIN_VALID_WATCH_DATE.getTime() && time <= getMaxValidWatchDate().getTime();
}

/**
 * Parses Google Takeout watch-history.html
 * Note: Uses DOMParser – only call from client-side code.
 */
export function parseHTMLExport(content: string): WatchEvent[] {
  if (typeof window === 'undefined') return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const cells = doc.querySelectorAll('.outer-cell');
  const events: WatchEvent[] = [];

  cells.forEach((cell) => {
    try {
      // Detect source from header cell
      const headerText = cell.querySelector('.header-cell p')?.textContent?.trim() ?? '';
      const source: 'youtube' | 'youtube-music' = headerText.includes('Music')
        ? 'youtube-music'
        : 'youtube';

      const contentCell = cell.querySelector('.content-cell');
      if (!contentCell) return;

      const links = Array.from(contentCell.querySelectorAll('a'));
      if (links.length === 0) return; // Deleted/removed video

      // First link is the video
      const videoHref = links[0].getAttribute('href') ?? '';
      const title = links[0].textContent?.trim() ?? '';
      if (!title) return;

      // Extract videoId from URL
      let videoId: string | undefined;
      const vidMatch = videoHref.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
      if (vidMatch) videoId = vidMatch[1];

      // Second link is channel
      let channelName = 'Unknown';
      let channelUrl: string | undefined;
      if (links.length > 1) {
        channelName = links[1].textContent?.trim() || 'Unknown';
        channelUrl = links[1].getAttribute('href') ?? undefined;
      }

      // Date: find the text node that looks like a date (contains 4-digit year)
      const fullText = contentCell.textContent ?? '';
      const lines = fullText.split('\n').map((s) => s.trim()).filter(Boolean);
      const dateLine = lines.find(
        (l) => /\d{4}/.test(l) && /[A-Z][a-z]{2}/.test(l)
      );
      if (!dateLine) return;

      // Strip timezone suffix (e.g. "EST", "PDT", "CEST")
      const cleanDate = dateLine.replace(/\s+[A-Z]{2,5}$/, '').trim();
      const watchedAt = new Date(cleanDate);
      if (!isValidWatchDate(watchedAt)) return;

      events.push({ title, videoId, channelName, channelUrl, watchedAt, source });
    } catch {
      // Skip malformed entries
    }
  });

  return events;
}

/**
 * Parses Google Takeout watch-history.json
 * Pure JS – no browser APIs required.
 */
export function parseJSONExport(content: string): WatchEvent[] {
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    return [];
  }

  if (!Array.isArray(data)) return [];

  const events: WatchEvent[] = [];

  for (const item of data) {
    try {
      if (typeof item !== 'object' || item === null) continue;
      const record = item as Record<string, unknown>;

      // Filter by activityControls
      const controls = record.activityControls;
      if (!Array.isArray(controls)) continue;
      const strs = controls as string[];
      const isYT = strs.some((c) => c.includes('YouTube watch history'));
      const isMusic = strs.some((c) => c.includes('YouTube Music watch history'));
      if (!isYT && !isMusic) continue;

      // Source detection
      const products = record.products;
      const source: 'youtube' | 'youtube-music' =
        Array.isArray(products) && (products as string[]).includes('YouTube Music')
          ? 'youtube-music'
          : 'youtube';

      // Title – strip "Watched " prefix
      let title = String(record.title ?? '').replace(/^Watched\s+/, '').trim();
      if (!title || title === 'Watched') continue;

      // videoId from titleUrl
      const titleUrl = record.titleUrl as string | undefined;
      let videoId: string | undefined;
      if (titleUrl) {
        const m = titleUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        if (m) videoId = m[1];
      }

      // Channel from subtitles array
      let channelName = 'Unknown';
      let channelUrl: string | undefined;
      const subs = record.subtitles;
      if (Array.isArray(subs) && subs.length > 0) {
        const sub = subs[0] as Record<string, unknown>;
        channelName = String(sub.name ?? 'Unknown');
        channelUrl = sub.url as string | undefined;
      }

      // Time (ISO 8601)
      const timeStr = record.time as string;
      if (!timeStr) continue;
      const watchedAt = new Date(timeStr);
      if (!isValidWatchDate(watchedAt)) continue;

      events.push({ title, videoId, channelName, channelUrl, watchedAt, source });
    } catch {
      // Skip malformed entries
    }
  }

  return events;
}

/** Auto-detects format from filename and parses accordingly. */
export async function parseExportFile(file: File): Promise<WatchEvent[]> {
  const content = await file.text();
  if (file.name.toLowerCase().endsWith('.json')) {
    return parseJSONExport(content);
  }
  return parseHTMLExport(content);
}
