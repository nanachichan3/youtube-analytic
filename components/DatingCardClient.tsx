"use client";

import { useCallback, useRef, useState } from "react";
import { parseExportFile, WatchEvent } from "@/lib/parser";
import { computeAnalytics, AnalyticsResult } from "@/lib/analytics";
import { DatingCardData } from "@/lib/dating-card";
import { DatingCardImage } from "./DatingCardImage";

type Phase =
  | { name: "landing" }
  | { name: "loading" }
  | { name: "generating" }
  | { name: "card"; cardData: DatingCardData; imageUrl: string | null }
  | { name: "error"; message: string };

interface DatingCardClientProps {
  /** Pre-loaded watch events (when used inside the dashboard). Skips file upload. */
  preloadedEvents?: WatchEvent[];
  /** Pre-loaded analytics (when used inside the dashboard). Skips computeAnalytics. */
  preloadedAnalytics?: AnalyticsResult;
}

export function DatingCardClient({ preloadedEvents, preloadedAnalytics }: DatingCardClientProps) {
  const [phase, setPhase] = useState<Phase>(
    preloadedEvents && preloadedAnalytics
      ? { name: "generating" }
      : { name: "landing" }
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateCard = useCallback(
    async (events: WatchEvent[], analytics: AnalyticsResult) => {
      setPhase({ name: "generating" });
      try {
        const response = await fetch("/api/dating-card/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ events, analytics }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(err.error ?? `Server error ${response.status}`);
        }

        const result = await response.json();
        setPhase({
          name: "card",
          cardData: result.cardData,
          imageUrl: result.imageUrl ?? null,
        });
      } catch (err) {
        setPhase({ name: "error", message: String(err) });
      }
    },
    []
  );

  // If preloaded data is provided, kick off generation immediately
  const hasPreloaded = Boolean(preloadedEvents && preloadedAnalytics);
  const preloadedRef = useRef(false);
  if (hasPreloaded && !preloadedRef.current) {
    preloadedRef.current = true;
    void generateCard(preloadedEvents!, preloadedAnalytics!);
  }

  const handleFile = useCallback(
    async (file: File) => {
      setPhase({ name: "loading" });
      try {
        const events = await parseExportFile(file);
        if (events.length === 0) {
          setPhase({
            name: "error",
            message:
              "No watch history found in this file. Make sure you uploaded watch-history.html or watch-history.json from Google Takeout.",
          });
          return;
        }
        if (events.length < 10) {
          setPhase({
            name: "error",
            message: `Only ${events.length} videos found — need at least 10 to generate a dating card.`,
          });
          return;
        }
        if (events.length < 50) {
          console.warn("[dating-card] Small dataset:", events.length, "videos");
        }

        const analytics = computeAnalytics(events);
        await generateCard(events, analytics);
      } catch (err) {
        setPhase({ name: "error", message: String(err) });
      }
    },
    [generateCard]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // ── Loading state ───────────────────────────────────────────────
  if (phase.name === "loading") {
    return (
      <div className="loading-overlay">
        <div className="loading-card">
          <div className="loading-spinner" />
          <p className="loading-title">Parsing your history…</p>
          <p className="loading-sub">Extracting watch events from your Google Takeout</p>
        </div>
      </div>
    );
  }

  // ── Generating state ────────────────────────────────────────────
  if (phase.name === "generating") {
    return (
      <div className="loading-overlay">
        <div className="loading-card">
          <div className="loading-spinner" />
          <p className="loading-title">Analyzing your soul…</p>
          <p className="loading-sub">Generating your AI dating card from watch patterns</p>
        </div>
      </div>
    );
  }

  // ── Card reveal state ───────────────────────────────────────────
  if (phase.name === "card") {
    return (
      <div className="dating-card-reveal">
        <div className="card-reveal-header">
          <p className="db-eyebrow">Your Dating Card</p>
          <h2 className="db-title">Swipe right to share</h2>
          <p className="loading-sub" style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }}>
            Based on {phase.cardData.interestTags.length * 10}+ videos analyzed
          </p>
        </div>

        {phase.imageUrl ? (
          <div className="card-image-wrapper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={phase.imageUrl}
              alt="Your AI-generated dating card"
              className="card-generated-img"
            />
          </div>
        ) : (
          <div className="card-html-wrapper">
            <DatingCardImage cardData={phase.cardData} />
            <p className="card-screenshot-hint">Screenshot this card to share it</p>
          </div>
        )}

        <div className="card-insights">
          <h3 style={{ marginBottom: "1rem", fontSize: "1rem", color: "var(--ink)" }}>
            What we found
          </h3>
          <div className="insight-grid">
            <div className="insight-item">
              <span className="insight-label">Content style</span>
              <span className="insight-value">{phase.cardData.contentStyle}</span>
            </div>
            <div className="insight-item">
              <span className="insight-label">Ideal DM time</span>
              <span className="insight-value">{phase.cardData.bestTimeToDM}</span>
            </div>
            <div className="insight-item">
              <span className="insight-label">Guilty pleasure</span>
              <span className="insight-value">{phase.cardData.guiltyPleasure}</span>
            </div>
          </div>
        </div>

        <div className="hero-actions" style={{ marginTop: "1.5rem", justifyContent: "center" }}>
          <button
            className="btn-primary"
            onClick={() =>
              window.open(
                phase.imageUrl
                  ? phase.imageUrl
                  : "https://viewpulse.io",
                "_blank"
              )
            }
          >
            {phase.imageUrl ? "Open full image" : "Visit Viewpulse"}
          </button>
          <button
            className="btn-outline"
            onClick={() => {
              preloadedRef.current = false;
              setPhase({ name: "landing" });
            }}
          >
            Generate another card
          </button>
        </div>
      </div>
    );
  }

  // ── Landing (+ error) state ────────────────────────────────────
  return (
    <div className="dating-card-upload">
      {phase.name === "error" && (
        <div className="error-banner">
          <span>
            <strong>Error:</strong> {phase.message}
          </span>
          <button onClick={() => setPhase({ name: "landing" })}>Try again</button>
        </div>
      )}

      {/* Hero */}
      <div className="hero-card-band">
        <div className="hero-glow" aria-hidden="true" />
        <p className="hero-eyebrow">Use Case · Fun</p>
        <h1>
          Your YouTube
          <br />
          <span className="txt-red">Dating Card</span>
        </h1>
        <p className="hero-lead">
          Upload your Google Takeout YouTube export and get an AI-generated dating profile
          card that reveals your personality, interests, and ideal partner type — based
          purely on what you watch.
        </p>
      </div>

      {/* Upload */}
      <section className="upload-panel" id="upload">
        <p className="panel-label">Step 1 — Upload your history</p>
        <h2 className="panel-title">Drop your Takeout file to begin</h2>

        <div
          className={`upload-zone${isDragging ? " upload-zone--drag" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          aria-label="Upload watch history file"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.json"
            style={{ display: "none" }}
            onChange={onFileChange}
          />
          <div className="upload-orb">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 16V4m0 0L8 8m4-4l4 4" />
              <path d="M4 20h16" />
            </svg>
          </div>
          <p className="upload-title">Drag &amp; drop your export file</p>
          <p className="upload-sub">
            Supports <strong>watch-history.html</strong> and <strong>watch-history.json</strong>{" "}
            from Google Takeout
          </p>
          <div className="format-row">
            <span className="format-chip">watch-history.html</span>
            <span className="format-chip">watch-history.json</span>
            <span className="format-chip">Google Takeout ZIP</span>
          </div>
        </div>

        <p className="upload-note">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Your data is processed locally — nothing is sent to any server without your consent.
        </p>
      </section>

      {/* What you get */}
      <section className="glass-panel" style={{ margin: "2rem auto", maxWidth: "680px" }}>
        <h2 style={{ marginTop: 0 }}>What your card reveals</h2>
        <ul style={{ lineHeight: 1.8 }}>
          <li>A witty bio generated from your watch patterns</li>
          <li>8 interest tags extracted from your content taste</li>
          <li>3 ideal partner traits inferred from what you watch</li>
          <li>Best time to DM you (from your peak watch hours)</li>
          <li>Your guilty pleasure content obsession</li>
          <li>AI-generated image card (or shareable HTML fallback)</li>
        </ul>
      </section>
    </div>
  );
}
