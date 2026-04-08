"use client";

import { DatingCardData } from "@/lib/dating-card";

interface DatingCardImageProps {
  cardData: DatingCardData;
}

export function DatingCardImage({ cardData }: DatingCardImageProps) {
  const {
    bio,
    interestTags,
    idealPartnerTraits,
    bestTimeToDM,
    guiltyPleasure,
    contentStyle,
  } = cardData;

  return (
    <div
      style={{
        width: "600px",
        maxWidth: "100%",
        background: "linear-gradient(160deg, #1a0a2e 0%, #0f0f1a 40%, #1a0a2e 100%)",
        borderRadius: "24px",
        padding: "32px",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#fff",
        boxShadow: "0 32px 80px rgba(108, 71, 255, 0.3), 0 0 0 1px rgba(255,255,255,0.08)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow blobs */}
      <div
        style={{
          position: "absolute",
          top: "-60px",
          left: "-60px",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(108,71,255,0.4) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-80px",
          right: "-40px",
          width: "240px",
          height: "240px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,107,157,0.35) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(90deg, #6c47ff, #ff6b9d)",
          borderRadius: "12px",
          padding: "16px 20px",
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            opacity: 0.9,
            marginBottom: "4px",
          }}
        >
          YOUR VIEWPULSE DATING CARD
        </div>
        <div style={{ fontSize: "12px", opacity: 0.75 }}>
          Based on your watch history
        </div>
      </div>

      {/* Bio */}
      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
          borderRadius: "14px",
          padding: "20px",
          marginBottom: "20px",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "15px",
            lineHeight: 1.65,
            color: "#f0eeff",
            fontStyle: "italic",
          }}
        >
          &ldquo;{bio}&rdquo;
        </p>
      </div>

      {/* Interest Tags */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "20px",
        }}
      >
        {interestTags.slice(0, 8).map((tag) => (
          <span
            key={tag}
            style={{
              background: "linear-gradient(90deg, rgba(108,71,255,0.7), rgba(255,107,157,0.7))",
              borderRadius: "20px",
              padding: "5px 12px",
              fontSize: "12px",
              fontWeight: 600,
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(108,71,255,0.6), rgba(255,107,157,0.6), transparent)",
          marginBottom: "20px",
        }}
      />

      {/* Insights row */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
        <InsightRow icon="⏰" label="Best time to DM" value={bestTimeToDM} />
        <InsightRow icon="📺" label="Content style" value={contentStyle} />
        <InsightRow icon="😈" label="Guilty pleasure" value={guiltyPleasure} />
      </div>

      {/* Ideal Partner */}
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)",
          borderRadius: "14px",
          padding: "18px 20px",
          border: "1px solid rgba(255,107,157,0.25)",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#ff6b9d",
            marginBottom: "12px",
          }}
        >
          You&apos;re looking for someone who&hellip;
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {idealPartnerTraits.map((trait, i) => (
            <li
              key={i}
              style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}
            >
              {trait}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          fontSize: "11px",
          color: "rgba(255,255,255,0.35)",
          marginTop: "8px",
        }}
      >
        Powered by{" "}
        <span style={{ color: "rgba(255,107,157,0.7)", fontWeight: 600 }}>
          Viewpulse
        </span>{" "}
        · viewpulse.io
      </div>
    </div>
  );
}

function InsightRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        background: "rgba(255,255,255,0.04)",
        borderRadius: "10px",
        padding: "10px 14px",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <span style={{ fontSize: "16px", flexShrink: 0, marginTop: "1px" }}>{icon}</span>
      <div>
        <div
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            marginBottom: "3px",
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.9)", lineHeight: 1.45 }}>
          {value}
        </div>
      </div>
    </div>
  );
}
