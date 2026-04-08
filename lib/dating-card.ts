import { WatchEvent } from "./parser";
import { AnalyticsResult } from "./analytics";

export interface DatingCardData {
  bio: string;
  interestTags: string[];
  idealPartnerTraits: string[];
  bestTimeToDM: string;
  guiltyPleasure: string;
  contentStyle: string;
}

export interface DatingCardResult {
  imageUrl?: string;
  cardData: DatingCardData;
  fallback: boolean;
}

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "your", "you", "are", "was", "were",
  "have", "has", "had", "how", "what", "when", "where", "why", "who", "into", "about",
  "after", "before", "than", "then", "its", "it", "our", "out", "all", "not", "can",
  "will", "just", "now", "new", "official", "video", "music", "feat", "ft", "live", "youtube",
  "hd", "4k", "hd", "vs", "one", "two", "make", "know", "want", "see", "get", "got",
]);

function extractKeywords(events: WatchEvent[]): string[] {
  const counts = new Map<string, number>();
  for (const event of events) {
    const words = event.title.toLowerCase().split(/[^a-z0-9]+/g);
    for (const word of words) {
      if (word.length < 3) continue;
      if (STOP_WORDS.has(word)) continue;
      if (/^\d+$/.test(word)) continue;
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([w]) => w);
}

function getTopChannelsList(events: WatchEvent[]): string[] {
  const map = new Map<string, number>();
  for (const e of events) map.set(e.channelName, (map.get(e.channelName) ?? 0) + 1);
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([n]) => n);
}

function describeTimePersonality(peakHour: number): string {
  if (peakHour >= 5 && peakHour < 9) return "an early bird who catches the morning worm";
  if (peakHour >= 9 && peakHour < 12) return "a late-morning optimizer who peaks before noon";
  if (peakHour >= 12 && peakHour < 14) return "a midday marathoner who watches through lunch";
  if (peakHour >= 14 && peakHour < 17) return "an afternoon deep-diver who loses hours to the algorithm";
  if (peakHour >= 17 && peakHour < 20) return "an evening unwind devotee who decompresses with content";
  if (peakHour >= 20 && peakHour < 23) return "a night owl who finds their creative peak after dark";
  return "an anytime watcher with no fixed schedule";
}

function generateBio(
  topChannels: string[],
  keywords: string[],
  contentStyle: string
): string {
  const top = topChannels.slice(0, 3).join(", ");
  const trait = keywords[0] ?? "thoughtful";
  const style = contentStyle.includes("deep") ? "deep dives" : "quick hits";

  const templates = [
    `Swipe right if you also believe ${top} is a legitimate lifestyle. I have strong opinions about ${trait} and I'm not afraid to share them. Looking for someone who can handle my ${style}.`,
    `My friends describe me as someone who has watched more ${trait} content than any human should. I want someone who's ready for late-night video essays and weekend binge sessions. Must love ${top}.`,
    `I'm basically ${top} in human form. When I'm not watching content about ${trait}, I'm thinking about content about ${trait}. Seeking a fellow rabbit hole explorer for deep conversations and deeper dives.`,
    `Self-proclaimed expert in ${trait} and proud of it. I've seen every video ${top} ever made and I'm not sorry about it. Looking for someone who appreciates a good ${style}.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateInterestTags(keywords: string[], topChannels: string[]): string[] {
  const tags = new Set<string>();
  // Map keywords to human-readable tags
  for (const kw of keywords.slice(0, 12)) {
    if (kw.includes("ai") || kw.includes("machine") || kw.includes("coding")) tags.add("🤖 AI & Tech");
    if (kw.includes("game") || kw.includes("minecraft") || kw.includes("dota")) tags.add("🎮 Gaming");
    if (kw.includes("cook") || kw.includes("recipe") || kw.includes("food")) tags.add("🍳 Cooking");
    if (kw.includes("finance") || kw.includes("invest") || kw.includes("stock")) tags.add("💰 Finance");
    if (kw.includes("philos") || kw.includes("buddha") || kw.includes("mindful")) tags.add("🧘 Philosophy");
    if (kw.includes("workout") || kw.includes("fitness") || kw.includes("gym")) tags.add("💪 Fitness");
    if (kw.includes("music") || kw.includes("song") || kw.includes("album")) tags.add("🎵 Music");
    if (kw.includes("travel") || kw.includes("vlog") || kw.includes("trip")) tags.add("✈️ Travel");
    if (kw.includes("design") || kw.includes("art") || kw.includes("creative")) tags.add("🎨 Design & Art");
    if (kw.includes("science") || kw.includes("physics") || kw.includes("cosmos")) tags.add("🔬 Science");
    if (kw.includes("comedy") || kw.includes("funny") || kw.includes("meme")) tags.add("😂 Comedy");
    if (kw.includes("sport") || kw.includes("football") || kw.includes("basketball")) tags.add("⚽ Sports");
    if (kw.includes("entrepreneur") || kw.includes("startup") || kw.includes("business")) tags.add("🚀 Startups");
    if (kw.includes("movie") || kw.includes("film") || kw.includes("review")) tags.add("🎬 Films");
    if (kw.includes("book") || kw.includes("read") || kw.includes("literary")) tags.add("📚 Reading");
    if (kw.includes("history") || kw.includes("war") || kw.includes("ancient")) tags.add("📜 History");
  }

  // Channel-based tags
  for (const ch of topChannels.slice(0, 5)) {
    const lower = ch.toLowerCase();
    if (lower.includes("tech") || lower.includes("coder") || lower.includes("dev")) tags.add("💻 Coding");
    if (lower.includes("game")) tags.add("🎮 Gaming");
    if (lower.includes("music")) tags.add("🎵 Music");
    if (lower.includes("vlog") || lower.includes("daily")) tags.add("📹 Vlogs");
    if (lower.includes("podcast") || lower.includes("interview")) tags.add("🎙️ Podcasts");
    if (lower.includes("cooking") || lower.includes("food")) tags.add("🍳 Cooking");
  }

  const tagList = Array.from(tags).slice(0, 8);
  while (tagList.length < 8) tagList.push("🔍 Curious Explorer");
  return tagList;
}

function generateIdealPartnerTraits(
  topChannels: string[],
  keywords: string[],
  avgPerDay: number
): string[] {
  const traits: string[] = [];
  const kw = keywords[0] ?? "";

  if (kw.includes("ai") || kw.includes("tech")) {
    traits.push("Gets excited about new AI tools and wants to experiment together");
    traits.push("Appreciates the beauty in both code and chaos");
  } else if (kw.includes("philos") || kw.includes("mindful")) {
    traits.push("Enjoys deep conversations about meaning and existence");
    traits.push("Knows when to be present and when to go down a research spiral");
  } else if (avgPerDay > 50) {
    traits.push("Doesn't judge your screen time — they match your energy");
    traits.push("Ready for weekend binges and weekday wind-downs alike");
  } else {
    traits.push("Values quality over quantity — a few great videos over endless scrolling");
    traits.push("Can discuss both light entertainment and meaningful content");
  }

  if (topChannels.some((c) => c.toLowerCase().includes("theo"))) {
    traits.push("Loves long-form conversations and intellectual rabbit holes");
  }
  if (topChannels.some((c) => c.toLowerCase().includes("fireship"))) {
    traits.push("Appreciates wit, speed, and getting to the point fast");
  }

  while (traits.length < 3) traits.push("Shares your curiosity for the weird corners of the internet");
  return traits.slice(0, 3);
}

function generateBestTimeToDM(peakHour: number): string {
  const slots = [
    "6–7 AM — they're up early, coffee in hand, phone nearby",
    "7–8 AM — morning commute, perfect for a casual opener",
    "12–1 PM — lunch break scroll, highest reply potential",
    "5–6 PM — the post-work decompression window",
    "8–10 PM — prime-time viewing hours, most responsive",
    "10 PM–1 AM — night owl territory, deep engagement",
  ];
  const bucket = Math.floor(peakHour / 4);
  return slots[Math.min(bucket, slots.length - 1)];
}

function generateGuiltyPleasure(events: WatchEvent[]): string {
  const titles = events.map((e) => e.title.toLowerCase());
  const keywords = extractKeywords(events);

  if (keywords.some((k) => k.includes("minecraft") || k.includes("gaming"))) {
    return "You've definitely watched a 4-hour Minecraft let’s play all the way through. Multiple times.";
  }
  if (keywords.some((k) => k.includes("drama") || k.includes("celebrity"))) {
    return "Deep down, you love a good celebrity drama breakdown. The algorithm knows.";
  }
  if (keywords.some((k) => k.includes("meme") || k.includes("compilation"))) {
    return "Those 'hilarious fails' compilations? Watched all 47 of them. No judgment here.";
  }
  if (keywords.some((k) => k.includes("trailer") || k.includes("review"))) {
    return "You watch movie trailers with more dedication than most people watch actual movies.";
  }
  if (keywords.some((k) => k.includes("unboxing") || k.includes("haul"))) {
    return "The urge to watch strangers open mystery boxes is strong with this one.";
  }
  if (keywords.some((k) => k.includes("romance") || k.includes("relationship"))) {
    return "You're definitely the type to watch 'signs they like you' videos at 2 AM and relate.";
  }

  return "You absolutely watched a full season of something purely for the drama, not the plot.";
}

function buildCardPrompt(cardData: DatingCardData): string {
  const {
    bio,
    interestTags,
    idealPartnerTraits,
    bestTimeToDM,
    guiltyPleasure,
    contentStyle,
  } = cardData;

  const tags = interestTags.join("  ·  ");

  return `Design a bold dating profile card with a dark aesthetic, vertical portrait format (1200x1600px).

LAYOUT (top to bottom):
1. HEADER: gradient purple (#6c47ff) to pink (#ff6b9d) bar with white text: "YOUR VIEWPULSE DATING CARD" in bold uppercase sans-serif, small tagline beneath: "Based on your watch history"
2. BIO SECTION: white bold text on dark glass card, bio: "${bio.replace(/"/g, "'")}"
3. INTEREST TAGS: 8 small pill badges in purple/pink gradient with white text: ${tags}
4. DIVIDER LINE: subtle gradient line
5. BEST TIME TO SLIDE IN: icon + "Best time to DM:" label + insight: "${bestTimeToDM}"
6. CONTENT STYLE: icon + "Content style:" label + "${contentStyle}"
7. GUILTY PLEASURE: icon + "Guilty pleasure:" label + "${guiltyPleasure}"
8. IDEAL PARTNER SECTION: dark glass card with header "You're looking for someone who..." and 3 bullet points: ${idealPartnerTraits.map((t) => `• ${t}`).join("  ")}
9. FOOTER: small text "Powered by Viewpulse · viewpulse.io"

STYLE REQUIREMENTS:
- Dark background (#0f0f1a) with purple-pink gradient accents
- Glassmorphism card elements (frosted glass effect with backdrop blur)
- Bold sans-serif typography (Inter style)
- Neon purple (#6c47ff) and hot pink (#ff6b9d) accents
- Dating app aesthetic — swipeable card feel
- NO photographs, NO real faces — purely typographic with icon badges
- Portrait 1200x1600px format
- Clean, modern, shareable card design`;
}

export async function generateDatingCard(
  events: WatchEvent[],
  analytics: AnalyticsResult
): Promise<DatingCardResult> {
  // Build card data
  const keywords = extractKeywords(events);
  const topChannels = getTopChannelsList(events);
  const contentStyle = describeTimePersonality(analytics.peakHour);

  const cardData: DatingCardData = {
    bio: generateBio(topChannels, keywords, contentStyle),
    interestTags: generateInterestTags(keywords, topChannels),
    idealPartnerTraits: generateIdealPartnerTraits(topChannels, keywords, analytics.avgPerDay),
    bestTimeToDM: generateBestTimeToDM(analytics.peakHour),
    guiltyPleasure: generateGuiltyPleasure(events),
    contentStyle:
      analytics.avgPerDay > 30
        ? `Marathon watcher — ${analytics.avgPerDay} videos/day average`
        : analytics.avgPerDay > 10
        ? `Regular viewer — ${analytics.avgPerDay} videos/day average`
        : `Casual watcher — ${analytics.avgPerDay} videos/day average`,
  };

  // Try FAL image generation via REST API
  const falKey = process.env.FAL_API_KEY;
  if (!falKey) {
    return { cardData, fallback: true };
  }

  try {
    const prompt = buildCardPrompt(cardData);
    const response = await fetch(
      "https://queue.fal.run/fal-ai/flux-pro/kontext/max/text-to-image",
      {
        method: "POST",
        headers: {
          Authorization: `Key ${falKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: {
            prompt,
            aspect_ratio: "3:4",
            num_images: 1,
          },
        }),
      }
    );

    if (response.ok) {
      const result = await response.json() as { images?: Array<{ url: string }> };
      const imageUrl = result?.images?.[0]?.url;
      if (imageUrl) {
        return { imageUrl, cardData, fallback: false };
      }
    } else {
      console.error("[dating-card] FAL API error:", response.status, await response.text());
    }
  } catch (err) {
    console.error("[dating-card] FAL generation failed:", err);
  }

  return { cardData, fallback: true };
}
