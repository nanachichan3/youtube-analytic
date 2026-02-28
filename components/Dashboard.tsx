'use client';

import { useMemo, useState } from 'react';
import { WatchEvent } from '@/lib/parser';
import { githubUrl } from '@/lib/links';
import { computeAnalytics } from '@/lib/analytics';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

function formatDate(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'your', 'you', 'are', 'was', 'were', 'have',
  'has', 'had', 'how', 'what', 'when', 'where', 'why', 'who', 'into', 'about', 'after', 'before',
  'than', 'then', 'its', 'it', 'our', 'out', 'all', 'not', 'can', 'will', 'just', 'now', 'new',
  'official', 'video', 'music', 'feat', 'ft', 'live', 'youtube'
]);

function extractKeywords(events: WatchEvent[]) {
  const counts = new Map<string, number>();
  for (const event of events) {
    const words = event.title.toLowerCase().split(/[^a-z0-9]+/g);
    for (const word of words) {
      if (word.length < 3) continue;
      if (STOP_WORDS.has(word)) continue;
      if (/^\\d+$/.test(word)) continue;
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }

  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 36);
  const max = sorted[0]?.[1] ?? 1;
  return sorted.map(([word, count]) => ({
    word,
    count,
    weight: Math.max(1, Math.ceil((count / max) * 5))
  }));
}

function AreaChart({
  data,
  strokeColor = 'rgba(255,255,255,0.9)',
  fillColor = 'rgba(255,255,255,0.12)',
}: {
  data: number[];
  strokeColor?: string;
  fillColor?: string;
}) {
  if (data.length < 2) return null;
  const W = 400;
  const H = 80;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - (v / max) * (H - 6),
  }));

  const line = pts.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    const prev = pts[i - 1];
    const cpX = ((prev.x + pt.x) / 2).toFixed(1);
    return `${acc} C ${cpX},${prev.y.toFixed(1)} ${cpX},${pt.y.toFixed(1)} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }, '');

  const area = `${line} L ${W},${H} L 0,${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: '80px', display: 'block' }}>
      <path d={area} fill={fillColor} />
      <path d={line} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BarColumns({
  data,
  barColor = 'rgba(255,255,255,0.75)',
  textColor = 'rgba(255,255,255,0.45)',
}: {
  data: { label: string; value: number }[];
  barColor?: string;
  textColor?: string;
}) {
  if (data.length === 0) return null;
  const H = 80;
  const W = 400;
  const max = Math.max(...data.map((d) => d.value), 1);
  const gap = 6;
  const barW = W / data.length - gap;

  return (
    <svg viewBox={`0 0 ${W} ${H + 18}`} preserveAspectRatio="none" style={{ width: '100%', height: '98px', display: 'block' }}>
      {data.map((d, i) => {
        const barH = Math.max(3, (d.value / max) * H);
        const x = i * (W / data.length) + gap / 2;
        const y = H - barH;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barW} height={barH} fill={barColor} rx="3" />
            <text x={x + barW / 2} y={H + 14} textAnchor="middle" fontSize="9" fill={textColor}>
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function HourBars({ dist, peakHour }: { dist: number[]; peakHour: number }) {
  const max = Math.max(...dist, 1);
  return (
    <div className="hour-bars">
      {dist.map((v, i) => (
        <div
          key={i}
          className={`hour-bar${i === peakHour ? ' peak' : ''}`}
          style={{ height: `${Math.max(4, (v / max) * 100)}%` }}
          title={`${formatHour(i)}: ${v} videos`}
        />
      ))}
    </div>
  );
}

function ChannelBars({
  channels,
  selectedChannel,
  onSelectChannel
}: {
  channels: Array<{ name: string; count: number; pct: number; url?: string }>;
  selectedChannel: string | null;
  onSelectChannel: (name: string) => void;
}) {
  return (
    <div className="channel-bars">
      {channels.slice(0, 10).map((ch) => (
        <button
          key={ch.name}
          className={`channel-row${selectedChannel === ch.name ? ' selected' : ''}`}
          onClick={() => onSelectChannel(ch.name)}
          type="button"
          title={`Show watched videos from ${ch.name}`}
        >
          <span className="channel-name-label">{ch.name}</span>
          <div className="channel-bar-track">
            <div className="channel-bar-fill" style={{ width: `${ch.pct}%` }} />
          </div>
          <span className="channel-count-label">{ch.count.toLocaleString()}</span>
        </button>
      ))}
    </div>
  );
}

type Filter = 'all' | 'youtube' | 'youtube-music';
type ExportTheme = 'noir' | 'ivory';
type ExportVariant = 'executive' | 'studio' | 'minimal';

type DragMode = 'none' | 'start' | 'end' | 'range';

interface DashboardProps {
  events: WatchEvent[];
  onReset: () => void;
}

interface ExportOptions {
  title: string;
  theme: ExportTheme;
  variant: ExportVariant;
  includeSummary: boolean;
  includeChannels: boolean;
  includeTrend: boolean;
  includeBinge: boolean;
  notes: string;
}

const previewVariants: ExportVariant[] = ['executive', 'studio', 'minimal'];

export function Dashboard({ events, onReset }: DashboardProps) {
  const sortedEvents = useMemo(
    () => events.slice().sort((a, b) => a.watchedAt.getTime() - b.watchedAt.getTime()),
    [events]
  );

  const { minDate, maxDate } = useMemo(() => {
    const fallback = new Date();
    return {
      minDate: sortedEvents[0]?.watchedAt ?? fallback,
      maxDate: sortedEvents[sortedEvents.length - 1]?.watchedAt ?? fallback,
    };
  }, [sortedEvents]);

  const [startDate, setStartDate] = useState<Date>(minDate);
  const [endDate, setEndDate] = useState<Date>(maxDate);
  const [showExport, setShowExport] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [debugQuery, setDebugQuery] = useState('');
  const [debugPage, setDebugPage] = useState(1);
  const [exportStatus, setExportStatus] = useState('');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    title: 'YouTube Watch History Report',
    theme: 'noir',
    variant: 'executive',
    includeSummary: true,
    includeChannels: true,
    includeTrend: true,
    includeBinge: true,
    notes: '',
  });

  const [dragState, setDragState] = useState<{
    mode: DragMode;
    anchorIndex: number;
    baseStart: number;
    baseEnd: number;
  }>({ mode: 'none', anchorIndex: 0, baseStart: 0, baseEnd: 0 });

  const timelineBuckets = useMemo(() => {
    if (sortedEvents.length === 0) return [];
    const start = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    const counts = new Map<string, number>();

    for (const event of sortedEvents) {
      const key = `${event.watchedAt.getFullYear()}-${String(event.watchedAt.getMonth() + 1).padStart(2, '0')}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const buckets: Array<{ key: string; label: string; count: number; startMs: number; endMs: number }> = [];

    const cursor = new Date(start);
    while (cursor <= end) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth();
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;
      const label = `${MONTHS[month]} '${String(year).slice(2)}`;
      const bucketStart = new Date(year, month, 1, 0, 0, 0, 0);
      const bucketEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
      buckets.push({ key, label, count: counts.get(key) ?? 0, startMs: bucketStart.getTime(), endMs: bucketEnd.getTime() });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    return buckets;
  }, [sortedEvents, minDate, maxDate]);

  const startIndex = Math.max(0, timelineBuckets.findIndex((bucket) => bucket.endMs >= startDate.getTime()));
  const endIndex = Math.max(
    startIndex,
    timelineBuckets.findIndex((bucket) => bucket.startMs <= endDate.getTime() && bucket.endMs >= endDate.getTime())
  );

  const filteredByZone = useMemo(
    () => events.filter((event) => {
      const ts = event.watchedAt.getTime();
      return ts >= startDate.getTime() && ts <= endDate.getTime();
    }),
    [events, startDate, endDate]
  );

  const hasYT = filteredByZone.some((e) => e.source === 'youtube');
  const hasMusic = filteredByZone.some((e) => e.source === 'youtube-music');
  const hasBoth = hasYT && hasMusic;

  const a = useMemo(() => computeAnalytics(filteredByZone, filter), [filteredByZone, filter]);
  const sourceEvents = useMemo(
    () => (filter === 'all' ? filteredByZone : filteredByZone.filter((event) => event.source === filter)),
    [filteredByZone, filter]
  );
  const activeChannel = useMemo(() => {
    if (selectedChannel && a.topChannels.some((ch) => ch.name === selectedChannel)) return selectedChannel;
    return a.topChannels[0]?.name ?? null;
  }, [selectedChannel, a.topChannels]);
  const channelTopVideos = useMemo(() => {
    if (!activeChannel) return [];
    const channelEvents = sourceEvents.filter((event) => event.channelName === activeChannel);
    const titleMap = new Map<string, { count: number; lastWatchedAt: Date }>();
    for (const event of channelEvents) {
      const existing = titleMap.get(event.title);
      if (existing) {
        existing.count += 1;
        if (event.watchedAt > existing.lastWatchedAt) existing.lastWatchedAt = event.watchedAt;
      } else {
        titleMap.set(event.title, { count: 1, lastWatchedAt: event.watchedAt });
      }
    }
    return Array.from(titleMap.entries())
      .map(([title, v]) => ({ title, count: v.count, lastWatchedAt: v.lastWatchedAt }))
      .sort((aVideo, bVideo) => bVideo.count - aVideo.count || bVideo.lastWatchedAt.getTime() - aVideo.lastWatchedAt.getTime())
      .slice(0, 14);
  }, [sourceEvents, activeChannel]);
  const keywordCloud = useMemo(() => extractKeywords(sourceEvents), [sourceEvents]);
  const includedEvents = useMemo(() => {
    const sourceFiltered =
      filter === 'all' ? filteredByZone : filteredByZone.filter((event) => event.source === filter);
    const q = debugQuery.trim().toLowerCase();
    const textFiltered =
      q.length === 0
        ? sourceFiltered
        : sourceFiltered.filter((event) =>
            `${event.title} ${event.channelName} ${event.source}`.toLowerCase().includes(q)
          );
    return textFiltered.slice().sort((aEvent, bEvent) => bEvent.watchedAt.getTime() - aEvent.watchedAt.getTime());
  }, [filteredByZone, filter, debugQuery]);

  const debugPageSize = 50;
  const debugTotalPages = Math.max(1, Math.ceil(includedEvents.length / debugPageSize));
  const safeDebugPage = Math.min(debugPage, debugTotalPages);
  const debugPageItems = useMemo(() => {
    const start = (safeDebugPage - 1) * debugPageSize;
    return includedEvents.slice(start, start + debugPageSize);
  }, [includedEvents, safeDebugPage]);

  const ytPct = a.totalWatched > 0 ? Math.round((a.youtubeCount / a.totalWatched) * 100) : 0;
  const zoneCoverage = events.length > 0 ? Math.round((filteredByZone.length / events.length) * 100) : 0;
  const timelineMax = Math.max(...timelineBuckets.map((b) => b.count), 1);

  const setRangeByIndex = (nextStartIndex: number, nextEndIndex: number) => {
    if (timelineBuckets.length === 0) return;
    const maxIdx = timelineBuckets.length - 1;
    const safeStart = Math.max(0, Math.min(nextStartIndex, maxIdx));
    const safeEnd = Math.max(safeStart, Math.min(nextEndIndex, maxIdx));
    setStartDate(new Date(timelineBuckets[safeStart].startMs));
    setEndDate(new Date(timelineBuckets[safeEnd].endMs));
  };

  const indexFromPointer = (clientX: number, rect: DOMRect) => {
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / Math.max(1, rect.width)));
    return Math.round(pct * Math.max(0, timelineBuckets.length - 1));
  };

  const startDrag = (
    e: React.PointerEvent<HTMLElement>,
    mode: DragMode,
    anchor = startIndex
  ) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragState({ mode, anchorIndex: anchor, baseStart: startIndex, baseEnd: endIndex });
  };

  const onScalePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.mode === 'none') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const idx = indexFromPointer(e.clientX, rect);

    if (dragState.mode === 'start') {
      setRangeByIndex(Math.min(idx, endIndex), endIndex);
      return;
    }

    if (dragState.mode === 'end') {
      setRangeByIndex(startIndex, Math.max(idx, startIndex));
      return;
    }

    if (dragState.mode === 'range') {
      const width = dragState.baseEnd - dragState.baseStart;
      const shift = idx - dragState.anchorIndex;
      const maxStart = Math.max(0, timelineBuckets.length - 1 - width);
      const nextStart = Math.max(0, Math.min(maxStart, dragState.baseStart + shift));
      setRangeByIndex(nextStart, nextStart + width);
    }
  };

  const endDrag = () => {
    if (dragState.mode !== 'none') {
      setDragState((prev) => ({ ...prev, mode: 'none' }));
    }
  };

  const sparkPath = useMemo(() => {
    if (timelineBuckets.length < 2) return '';
    const W = 1000;
    const H = 120;
    const points = timelineBuckets.map((bucket, i) => {
      const x = (i / (timelineBuckets.length - 1)) * W;
      const y = H - (bucket.count / timelineMax) * (H - 10);
      return { x, y };
    });

    const line = points.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`;
      const prev = points[i - 1];
      const cpX = ((prev.x + pt.x) / 2).toFixed(2);
      return `${acc} C ${cpX} ${prev.y.toFixed(2)} ${cpX} ${pt.y.toFixed(2)} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`;
    }, '');

    return `${line} L 1000 120 L 0 120 Z`;
  }, [timelineBuckets, timelineMax]);

  const createReportHtml = (variant: ExportVariant) => {
    const isNoir = exportOptions.theme === 'noir';
    const baseBg = isNoir ? '#101417' : '#f7f1e8';
    const cardBg = isNoir ? '#181f24' : '#fffdf8';
    const text = isNoir ? '#f1f4f8' : '#1b2026';
    const muted = isNoir ? '#9aa7b5' : '#5a6672';
    const accent = '#e52d27';

    const variantClass = `variant-${variant}`;

    const channelRows = a.topChannels
      .slice(0, 15)
      .map(
        (ch, idx) =>
          `<tr><td>${idx + 1}</td><td>${escapeHtml(ch.name)}</td><td>${ch.count.toLocaleString()}</td><td>${ch.pct}%</td></tr>`
      )
      .join('');
    const yearlyRows = a.yearlyBreakdown.map((y) => `<tr><td>${y.year}</td><td>${y.count.toLocaleString()}</td></tr>`).join('');
    const bingeRows = a.topBingeDays.map((day) => `<tr><td>${escapeHtml(day.dateLabel)}</td><td>${day.count.toLocaleString()}</td></tr>`).join('');

    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(exportOptions.title)}</title>
<style>
body { font-family: Georgia, serif; margin:0; background:${baseBg}; color:${text}; }
.wrap { max-width: 940px; margin: 0 auto; padding: 28px; }
.hero { border:1px solid ${isNoir ? '#26303a' : '#dfd7cc'}; background:${cardBg}; border-radius:16px; padding:24px; }
.eyebrow { font: 700 11px/1 Arial, sans-serif; letter-spacing:.18em; text-transform:uppercase; color:${muted}; margin-bottom:8px; }
h1 { font: 700 42px/1.02 Arial, sans-serif; margin:0 0 8px; }
.sub { color:${muted}; font-size:14px; }
.grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-top:14px; }
.metric { background:${cardBg}; border:1px solid ${isNoir ? '#26303a' : '#dfd7cc'}; border-radius:12px; padding:12px; }
.metric b { display:block; font:700 26px/1 Arial, sans-serif; margin-bottom:4px; }
.section { margin-top:16px; background:${cardBg}; border:1px solid ${isNoir ? '#26303a' : '#dfd7cc'}; border-radius:12px; padding:14px; }
h2 { font:700 20px/1.2 Arial, sans-serif; margin:0 0 10px; }
table { width:100%; border-collapse:collapse; font-size:13px; }
th, td { border-bottom:1px solid ${isNoir ? '#26303a' : '#e4ddd3'}; padding:8px 6px; text-align:left; }
th { color:${muted}; font-weight:600; }
.trend { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; font-size:13px; }
.trend div { background:${isNoir ? '#111920' : '#f6efe4'}; border:1px solid ${isNoir ? '#26303a' : '#e1d8cb'}; border-radius:8px; padding:8px; }
.notes { white-space:pre-wrap; color:${muted}; font-size:13px; }
.brand { margin-top:18px; font-size:12px; color:${muted}; }
.accent { color:${accent}; }
.variant-studio .hero { background: linear-gradient(135deg, #1c232b, #202a36); }
.variant-studio .grid .metric { border-style:dashed; }
.variant-minimal body, .variant-minimal .hero, .variant-minimal .section, .variant-minimal .metric { border-radius:0; }
@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body class="${variantClass}">
  <div class="wrap">
    <section class="hero">
      <div class="eyebrow">YouTube Analytics Export · ${variant.toUpperCase()}</div>
      <h1>${escapeHtml(exportOptions.title)}</h1>
      <div class="sub">Zone: ${escapeHtml(formatDate(startDate))} to ${escapeHtml(formatDate(endDate))} · Filter: ${escapeHtml(filter.toUpperCase())}</div>
      <div class="grid">
        <div class="metric"><b>${a.totalWatched.toLocaleString()}</b>Total watched</div>
        <div class="metric"><b>${formatHour(a.peakHour)}</b>Peak hour</div>
        <div class="metric"><b>${a.uniqueChannels.toLocaleString()}</b>Unique channels</div>
        <div class="metric"><b>${a.avgPerDay}</b>Avg per day</div>
      </div>
    </section>
    ${exportOptions.includeSummary ? `<section class="section"><h2>Summary</h2><p class="sub">Coverage: ${zoneCoverage}% of full history · YouTube: ${a.youtubeCount.toLocaleString()} · Music: ${a.musicCount.toLocaleString()} · Top year: ${a.topYear}</p></section>` : ''}
    ${exportOptions.includeChannels ? `<section class="section"><h2>Top Channels</h2><table><thead><tr><th>#</th><th>Channel</th><th>Views</th><th>Share</th></tr></thead><tbody>${channelRows || '<tr><td colspan="4">No channel data</td></tr>'}</tbody></table></section>` : ''}
    ${exportOptions.includeTrend ? `<section class="section"><h2>Trends</h2><div class="trend"><div><strong>Monthly points</strong><br/>${a.monthlyTrend.length}</div><div><strong>Year span</strong><br/>${a.yearlyBreakdown.length} years</div><div><strong>Most active day</strong><br/>${escapeHtml(a.peakDay)}</div></div><table style="margin-top:10px;"><thead><tr><th>Year</th><th>Videos</th></tr></thead><tbody>${yearlyRows || '<tr><td colspan="2">No yearly trend data</td></tr>'}</tbody></table></section>` : ''}
    ${exportOptions.includeBinge ? `<section class="section"><h2>Binge Days</h2><table><thead><tr><th>Date</th><th>Videos</th></tr></thead><tbody>${bingeRows || '<tr><td colspan="2">No binge data</td></tr>'}</tbody></table></section>` : ''}
    ${exportOptions.notes.trim() ? `<section class="section"><h2>Notes</h2><div class="notes">${escapeHtml(exportOptions.notes)}</div></section>` : ''}
    <div class="brand">Generated with <span class="accent">YouTube Analytics by Self Degree</span> on ${escapeHtml(formatDate(new Date()))} · Source: ${escapeHtml(githubUrl)}</div>
  </div>
</body>
</html>`;
  };

  const exportPdf = () => {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc || !iframe.contentWindow) {
        setExportStatus('Could not create print preview window.');
        iframe.remove();
        return;
      }

      doc.open();
      doc.write(createReportHtml(exportOptions.variant));
      doc.close();

      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => iframe.remove(), 1000);
      };

      setTimeout(() => {
        if (document.body.contains(iframe)) {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => iframe.remove(), 1000);
        }
      }, 600);

      setExportStatus('Print dialog opened. Use "Save as PDF" to export.');
    } catch {
      setExportStatus('PDF export failed. Please retry.');
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <p className="db-eyebrow">Analysis Complete</p>
          <h2 className="db-title">Your Watch History</h2>
        </div>
        <div className="db-header-actions">
          {hasBoth && (
            <div className="source-toggle">
              <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
              <button className={filter === 'youtube' ? 'active' : ''} onClick={() => setFilter('youtube')}>YouTube</button>
              <button className={filter === 'youtube-music' ? 'active' : ''} onClick={() => setFilter('youtube-music')}>Music</button>
            </div>
          )}
          <button className="db-reset-btn" onClick={onReset}>← Start over</button>
          <button className="db-reset-btn" onClick={() => setShowExport((prev) => !prev)}>
            {showExport ? 'Close export' : 'Export PDF'}
          </button>
          <button
            className="db-reset-btn"
            onClick={() => {
              setShowDebug((prev) => !prev);
              setDebugPage(1);
            }}
          >
            {showDebug ? 'Close debug' : 'Debug included videos'}
          </button>
        </div>
      </div>

      <div className="timeline-panel">
        <div className="timeline-head">
          <div>
            <p className="db-eyebrow">Chronology</p>
            <h3 className="timeline-title">Grafana-style brush timeline</h3>
          </div>
          <div className="timeline-meta">
            <span>{filteredByZone.length.toLocaleString()} events</span>
            <span>{zoneCoverage}% coverage</span>
            <span>{isoDate(startDate)} → {isoDate(endDate)}</span>
          </div>
        </div>

        <div className="timeline-presets">
          <button className="db-reset-btn" onClick={() => setRangeByIndex(Math.max(0, timelineBuckets.length - 12), timelineBuckets.length - 1)}>Last 12 months</button>
          <button className="db-reset-btn" onClick={() => setRangeByIndex(Math.max(0, timelineBuckets.length - 36), timelineBuckets.length - 1)}>Last 3 years</button>
          <button className="db-reset-btn" onClick={() => setRangeByIndex(0, Math.max(0, timelineBuckets.length - 1))}>All time</button>
        </div>

        <div className="timeline-scale" onPointerMove={onScalePointerMove} onPointerUp={endDrag} onPointerLeave={endDrag}>
          <svg className="timeline-spark" viewBox="0 0 1000 120" preserveAspectRatio="none" role="img" aria-label="Watch history activity scale">
            <defs>
              <linearGradient id="timelineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff7f50" />
                <stop offset="100%" stopColor="#e52d27" />
              </linearGradient>
            </defs>
            {sparkPath ? <path d={sparkPath} fill="url(#timelineGradient)" opacity="0.45" /> : null}
          </svg>

          {timelineBuckets.length > 0 && (
            <>
              <div
                className="timeline-selection"
                style={{
                  left: `${(startIndex / Math.max(1, timelineBuckets.length - 1)) * 100}%`,
                  width: `${((endIndex - startIndex + 1) / Math.max(1, timelineBuckets.length)) * 100}%`,
                }}
                onPointerDown={(e) => startDrag(e, 'range', indexFromPointer(e.clientX, e.currentTarget.parentElement!.getBoundingClientRect()))}
              >
                <button
                  className="timeline-handle start"
                  aria-label="Drag start"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    startDrag(e, 'start');
                  }}
                />
                <button
                  className="timeline-handle end"
                  aria-label="Drag end"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    startDrag(e, 'end');
                  }}
                />
              </div>
            </>
          )}
        </div>

        <div className="timeline-labels">
          <span>{timelineBuckets[0]?.label}</span>
          <span>{timelineBuckets[Math.floor(timelineBuckets.length / 2)]?.label}</span>
          <span>{timelineBuckets[timelineBuckets.length - 1]?.label}</span>
        </div>
      </div>

      {showExport && (
        <div className="export-panel">
          <div className="export-grid">
            <label>
              Report title
              <input type="text" value={exportOptions.title} onChange={(e) => setExportOptions((prev) => ({ ...prev, title: e.target.value }))} />
            </label>
            <label>
              Theme
              <select value={exportOptions.theme} onChange={(e) => setExportOptions((prev) => ({ ...prev, theme: e.target.value as ExportTheme }))}>
                <option value="noir">Noir</option>
                <option value="ivory">Ivory</option>
              </select>
            </label>
          </div>

          <div className="export-checks">
            <label><input type="checkbox" checked={exportOptions.includeSummary} onChange={(e) => setExportOptions((prev) => ({ ...prev, includeSummary: e.target.checked }))} /> Summary</label>
            <label><input type="checkbox" checked={exportOptions.includeChannels} onChange={(e) => setExportOptions((prev) => ({ ...prev, includeChannels: e.target.checked }))} /> Top channels</label>
            <label><input type="checkbox" checked={exportOptions.includeTrend} onChange={(e) => setExportOptions((prev) => ({ ...prev, includeTrend: e.target.checked }))} /> Trends</label>
            <label><input type="checkbox" checked={exportOptions.includeBinge} onChange={(e) => setExportOptions((prev) => ({ ...prev, includeBinge: e.target.checked }))} /> Binge days</label>
          </div>

          <label className="export-notes">
            Notes
            <textarea rows={4} value={exportOptions.notes} onChange={(e) => setExportOptions((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Add commentary for this export..." />
          </label>

          <div className="export-variants">
            {previewVariants.map((variant) => (
              <button
                key={variant}
                className={`export-variant-btn${exportOptions.variant === variant ? ' active' : ''}`}
                onClick={() => setExportOptions((prev) => ({ ...prev, variant }))}
              >
                {variant}
              </button>
            ))}
          </div>

          <div className="export-previews">
            {previewVariants.map((variant) => (
              <article key={variant} className={`export-preview-card${exportOptions.variant === variant ? ' active' : ''}`}>
                <header>
                  <strong>{variant}</strong>
                  <button onClick={() => setExportOptions((prev) => ({ ...prev, variant }))}>Use</button>
                </header>
                <iframe title={`${variant} preview`} srcDoc={createReportHtml(variant)} />
              </article>
            ))}
          </div>

          <div className="hero-actions">
            <button className="btn-primary" onClick={exportPdf}>Generate pretty PDF</button>
            {exportStatus ? <span className="export-status">{exportStatus}</span> : null}
            <a href={githubUrl} className="btn-outline" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      )}

      {showDebug && (
        <section className="debug-panel">
          <div className="debug-head">
            <div>
              <p className="db-eyebrow">Debug</p>
              <h3 className="timeline-title">Videos included in current statistics</h3>
            </div>
            <span className="debug-count">{includedEvents.length.toLocaleString()} included</span>
          </div>
          <div className="debug-controls">
            <input
              value={debugQuery}
              onChange={(e) => {
                setDebugQuery(e.target.value);
                setDebugPage(1);
              }}
              placeholder="Search title/channel/source..."
              aria-label="Search included videos"
            />
            <span>Page {safeDebugPage} / {debugTotalPages}</span>
          </div>
          <div className="debug-table-wrap">
            <table className="debug-table">
              <thead>
                <tr>
                  <th>Watched At</th>
                  <th>Title</th>
                  <th>Channel</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {debugPageItems.map((event, idx) => (
                  <tr key={`${event.watchedAt.getTime()}-${event.title}-${idx}`}>
                    <td>{event.watchedAt.toLocaleString()}</td>
                    <td>{event.title}</td>
                    <td>{event.channelName}</td>
                    <td>{event.source}</td>
                  </tr>
                ))}
                {debugPageItems.length === 0 && (
                  <tr>
                    <td colSpan={4}>No videos match current filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="debug-pager">
            <button className="db-reset-btn" disabled={safeDebugPage <= 1} onClick={() => setDebugPage((p) => Math.max(1, p - 1))}>
              Prev
            </button>
            <button className="db-reset-btn" disabled={safeDebugPage >= debugTotalPages} onClick={() => setDebugPage((p) => Math.min(debugTotalPages, p + 1))}>
              Next
            </button>
          </div>
        </section>
      )}

      <div className="db-grid">
        <div className="db-tile tile-dark span-2">
          <span className="tile-tag">Total Watched</span>
          <div className="tile-big">{formatNum(a.totalWatched)}</div>
          <p className="tile-sub">videos in your history</p>
        </div>

        <div className="db-tile tile-red span-2">
          <span className="tile-tag">Date Range</span>
          <div className="tile-big tile-big--sm">{formatDate(a.dateFrom)}</div>
          <p className="tile-sub">to {formatDate(a.dateTo)} · {a.daysSpan.toLocaleString()} days</p>
        </div>

        <div className="db-tile tile-blue span-2">
          <span className="tile-tag">Peak Hour</span>
          <div className="tile-big">{formatHour(a.peakHour)}</div>
          <p className="tile-sub">most active hour of day</p>
        </div>

        <div className="db-tile tile-off span-2">
          <span className="tile-tag">Unique Channels</span>
          <div className="tile-big tile-big--ink">{formatNum(a.uniqueChannels)}</div>
          <p className="tile-sub tile-sub--muted">creators watched</p>
        </div>

        <div className="db-tile tile-green span-2">
          <span className="tile-tag">Avg / Day</span>
          <div className="tile-big">{a.avgPerDay}</div>
          <p className="tile-sub">videos per day average</p>
        </div>

        <div className="db-tile tile-yellow span-2">
          <span className="tile-tag">YouTube vs Music</span>
          <div className="tile-big tile-big--yellow">{ytPct}%</div>
          <p className="tile-sub tile-sub--dark">
            {a.youtubeCount.toLocaleString()} YT · {a.musicCount.toLocaleString()} Music
          </p>
          <div className="split-bar-track">
            <div className="split-bar-fill" style={{ width: `${ytPct}%` }} />
          </div>
        </div>

        <div className="db-tile tile-card span-7">
          <span className="tile-tag tile-tag--muted">Top Channels</span>
          <ChannelBars channels={a.topChannels} selectedChannel={activeChannel} onSelectChannel={setSelectedChannel} />
        </div>

        <div className="db-tile tile-dark span-5">
          <span className="tile-tag">Hourly Activity</span>
          <p className="tile-sub" style={{ marginBottom: '0.5rem' }}>
            Peak at {formatHour(a.peakHour)} · Most active: {a.peakDay}s
          </p>
          <HourBars dist={a.hourlyDist} peakHour={a.peakHour} />
          <div className="hour-labels">
            <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>11 PM</span>
          </div>
        </div>

        <div className="db-tile tile-dark span-8">
          <span className="tile-tag">Monthly Trend</span>
          <p className="tile-sub" style={{ marginBottom: '0.75rem' }}>Videos watched per month</p>
          <AreaChart data={a.monthlyTrend.map((m) => m.count)} />
          {a.monthlyTrend.length > 1 && (
            <div className="trend-labels">
              <span>{a.monthlyTrend[0]?.label}</span>
              <span>{a.monthlyTrend[Math.floor(a.monthlyTrend.length / 2)]?.label}</span>
              <span>{a.monthlyTrend[a.monthlyTrend.length - 1]?.label}</span>
            </div>
          )}
        </div>

        <div className="db-tile tile-red span-4">
          <span className="tile-tag">Binge Record</span>
          {a.topBingeDays[0] ? (
            <>
              <div className="tile-big">{a.topBingeDays[0].count}</div>
              <p className="tile-sub">videos in one day</p>
              <p className="binge-record-date">{a.topBingeDays[0].dateLabel}</p>
              {a.topBingeDays.length > 1 && (
                <div className="binge-list">
                  {a.topBingeDays.slice(1, 4).map((day, i) => (
                    <div key={i} className="binge-item">
                      <span className="binge-date">{day.dateLabel}</span>
                      <span className="binge-count">{day.count} videos</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="tile-sub">No data</p>
          )}
        </div>

        <div className="db-tile tile-off span-12">
          <span className="tile-tag tile-tag--muted">Year by Year</span>
          <p className="tile-sub tile-sub--muted" style={{ marginBottom: '0.75rem' }}>
            Most active year: <strong>{a.topYear}</strong> · History spans {a.yearlyBreakdown.length} year{a.yearlyBreakdown.length !== 1 ? 's' : ''}
          </p>
          <BarColumns data={a.yearlyBreakdown.map((y) => ({ label: String(y.year), value: y.count }))} barColor="var(--ink)" textColor="var(--muted)" />
        </div>

        <div className="db-tile tile-card span-7">
          <span className="tile-tag tile-tag--muted">Channel Drilldown</span>
          <p className="tile-sub tile-sub--muted" style={{ marginBottom: '0.7rem' }}>
            {activeChannel ? `Most watched videos from ${activeChannel}` : 'Select a channel from Top Channels'}
          </p>
          <div className="channel-video-list">
            {channelTopVideos.map((video) => (
              <div key={video.title} className="channel-video-item">
                <p className="channel-video-title">{video.title}</p>
                <p className="channel-video-meta">
                  watched {video.count} time{video.count === 1 ? '' : 's'} · last {video.lastWatchedAt.toLocaleDateString()}
                </p>
              </div>
            ))}
            {channelTopVideos.length === 0 && (
              <p className="tile-sub tile-sub--muted">No videos available for this channel in current range.</p>
            )}
          </div>
        </div>

        <div className="db-tile tile-dark span-5">
          <span className="tile-tag">Keyword Bubbles</span>
          <p className="tile-sub" style={{ marginBottom: '0.8rem' }}>
            Frequent words from included video titles
          </p>
          <div className="keyword-cloud">
            {keywordCloud.map((item) => (
              <span key={item.word} className={`keyword-bubble w${item.weight}`} title={`${item.word}: ${item.count}`}>
                {item.word}
              </span>
            ))}
            {keywordCloud.length === 0 && <span className="tile-sub">No keyword data</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
