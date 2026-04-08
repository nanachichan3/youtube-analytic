import { NextRequest, NextResponse } from "next/server";
import { generateDatingCard } from "@/lib/dating-card";
import { WatchEvent } from "@/lib/parser";
import { AnalyticsResult } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { events, analytics } = body as {
      events: WatchEvent[];
      analytics: AnalyticsResult;
    };

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "No watch events provided" },
        { status: 400 }
      );
    }

    if (events.length < 10) {
      return NextResponse.json(
        { error: "Need at least 10 videos to generate a dating card" },
        { status: 400 }
      );
    }

    if (events.length < 50) {
      console.warn("[dating-card] Small dataset:", events.length, "videos");
    }

    // Reconstruct Date objects from serialized JSON
    const reconstructedEvents: WatchEvent[] = events.map((e) => ({
      ...e,
      watchedAt: new Date(e.watchedAt),
    }));

    const result = await generateDatingCard(reconstructedEvents, analytics);

    return NextResponse.json({
      imageUrl: result.imageUrl ?? null,
      cardData: result.cardData,
      fallback: result.fallback,
    });
  } catch (err) {
    console.error("[dating-card/generate] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate dating card" },
      { status: 500 }
    );
  }
}
