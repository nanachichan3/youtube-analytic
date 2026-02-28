import { WatchEvent } from './parser';

export interface AnalyticsResult {
  totalWatched: number;
  youtubeCount: number;
  musicCount: number;
  uniqueChannels: number;
  dateFrom: Date;
  dateTo: Date;
  daysSpan: number;
  avgPerDay: number;
  topChannels: Array<{ name: string; count: number; pct: number; url?: string }>;
  hourlyDist: number[];   // 24 values
  weekdayDist: number[];  // 7 values (Sun=0)
  monthlyTrend: Array<{ key: string; label: string; count: number }>;
  yearlyBreakdown: Array<{ year: number; count: number }>;
  topBingeDays: Array<{ dateLabel: string; count: number; topTitle: string }>;
  peakHour: number;
  peakDay: string;
  topYear: number;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function emptyResult(): AnalyticsResult {
  const now = new Date();
  return {
    totalWatched: 0, youtubeCount: 0, musicCount: 0,
    uniqueChannels: 0, dateFrom: now, dateTo: now, daysSpan: 0, avgPerDay: 0,
    topChannels: [], hourlyDist: Array(24).fill(0), weekdayDist: Array(7).fill(0),
    monthlyTrend: [], yearlyBreakdown: [], topBingeDays: [],
    peakHour: 0, peakDay: 'Sunday', topYear: now.getFullYear(),
  };
}

export function computeAnalytics(
  events: WatchEvent[],
  sourceFilter: 'youtube' | 'youtube-music' | 'all' = 'all'
): AnalyticsResult {
  const filtered =
    sourceFilter === 'all' ? events : events.filter((e) => e.source === sourceFilter);

  if (filtered.length === 0) return emptyResult();

  // ── Source counts (always from full filtered set, not re-filtered) ──
  const youtubeCount = filtered.filter((e) => e.source === 'youtube').length;
  const musicCount = filtered.filter((e) => e.source === 'youtube-music').length;

  // ── Channels ──
  const channelMap = new Map<string, { count: number; url?: string }>();
  for (const event of filtered) {
    const existing = channelMap.get(event.channelName);
    if (existing) {
      existing.count++;
    } else {
      channelMap.set(event.channelName, { count: 1, url: event.channelUrl });
    }
  }

  const sortedChannels = Array.from(channelMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 15);

  const maxChannelCount = sortedChannels[0]?.[1].count ?? 1;
  const topChannels = sortedChannels.map(([name, { count, url }]) => ({
    name,
    count,
    pct: Math.round((count / maxChannelCount) * 100),
    url,
  }));

  // ── Date range ──
  const sorted = filtered.slice().sort((a, b) => a.watchedAt.getTime() - b.watchedAt.getTime());
  const dateFrom = sorted[0].watchedAt;
  const dateTo = sorted[sorted.length - 1].watchedAt;
  const daysSpan = Math.max(
    1,
    Math.round((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24))
  );
  const avgPerDay = Math.round((filtered.length / daysSpan) * 10) / 10;

  // ── Distributions ──
  const hourlyDist = Array(24).fill(0);
  const weekdayDist = Array(7).fill(0);
  for (const event of filtered) {
    hourlyDist[event.watchedAt.getHours()]++;
    weekdayDist[event.watchedAt.getDay()]++;
  }

  // ── Monthly trend ──
  const monthMap = new Map<string, number>();
  for (const event of filtered) {
    const y = event.watchedAt.getFullYear();
    const m = event.watchedAt.getMonth();
    const key = `${y}-${String(m + 1).padStart(2, '0')}`;
    monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
  }
  const monthlyTrend = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => {
      const [y, m] = key.split('-');
      const label = `${MONTHS[parseInt(m) - 1]} '${y.slice(2)}`;
      return { key, label, count };
    });

  // ── Yearly breakdown ──
  const yearMap = new Map<number, number>();
  for (const event of filtered) {
    const year = event.watchedAt.getFullYear();
    yearMap.set(year, (yearMap.get(year) ?? 0) + 1);
  }
  const yearlyBreakdown = Array.from(yearMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, count]) => ({ year, count }));

  // ── Binge days ──
  const dayMap = new Map<string, { count: number; events: WatchEvent[] }>();
  for (const event of filtered) {
    const d = event.watchedAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const existing = dayMap.get(key);
    if (existing) {
      existing.count++;
      existing.events.push(event);
    } else {
      dayMap.set(key, { count: 1, events: [event] });
    }
  }

  const topBingeDays = Array.from(dayMap.entries())
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)
    .map(([key, { count, events: dayEvents }]) => {
      const [y, m, d] = key.split('-');
      const dateLabel = `${MONTHS[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
      const topTitle = dayEvents[0]?.title ?? '';
      return { dateLabel, count, topTitle };
    });

  // ── Peak values ──
  const peakHour = hourlyDist.indexOf(Math.max(...hourlyDist));
  const peakDay = DAYS[weekdayDist.indexOf(Math.max(...weekdayDist))];
  const topYear =
    yearlyBreakdown.length > 0
      ? yearlyBreakdown.reduce((a, b) => (a.count > b.count ? a : b)).year
      : new Date().getFullYear();

  return {
    totalWatched: filtered.length,
    youtubeCount,
    musicCount,
    uniqueChannels: channelMap.size,
    dateFrom,
    dateTo,
    daysSpan,
    avgPerDay,
    topChannels,
    hourlyDist,
    weekdayDist,
    monthlyTrend,
    yearlyBreakdown,
    topBingeDays,
    peakHour,
    peakDay,
    topYear,
  };
}
