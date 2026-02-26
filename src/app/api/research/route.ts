import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { CompanyReport } from "@/lib/types";

// Vercel Hobby plan has a 10s hard limit; Pro plan supports up to 60s.
// This export only takes effect on Pro/Enterprise plans.
export const maxDuration = 60;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY environment variable is not set. " +
        "Add it to your Vercel project settings under Settings > Environment Variables."
    );
  }
  return new Anthropic({ apiKey });
}

export async function POST(request: NextRequest) {
  try {
    const client = getClient();

    const { query } = await request.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Please provide a company name or website." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a marketing intelligence analyst. Research companies and produce structured JSON reports. Use web search to find current information. Be concise and factual. Respond ONLY with raw JSON, no markdown.`;

    const userPrompt = `Research "${query.trim()}" and return a JSON object (no markdown, no code fences):
{
  "companyName": "Official name",
  "website": "URL",
  "overview": "1-2 paragraph overview",
  "businessModel": "How they make money",
  "targetMarket": "Target customers",
  "productsAndServices": ["Product 1", "Product 2"],
  "competitors": [{"name": "Name", "description": "How they compete"}],
  "recentNews": [{"headline": "Headline", "summary": "Summary"}],
  "marketPosition": {"category": "Leader|Challenger|Niche Player|Emerging", "explanation": "Why"}
}
Include 3-5 competitors and 2-3 recent news items.`;

    console.log("[research] Starting research for query:", query.trim());

    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: systemPrompt,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 3,
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
    });

    console.log(
      "[research] API response received. Stop reason:",
      response.stop_reason,
      "Content blocks:",
      response.content.length
    );

    // Extract text content from the response
    let reportText = "";
    for (const block of response.content) {
      if (block.type === "text") {
        reportText += block.text;
      }
    }

    if (!reportText) {
      console.error(
        "[research] No text in response. Block types:",
        response.content.map((b) => b.type)
      );
      throw new Error(
        "No text response received from the research. Please try again."
      );
    }

    // Parse the JSON from the response
    let report: CompanyReport;
    try {
      report = JSON.parse(reportText.trim());
    } catch {
      // Try to extract JSON from markdown code fences or surrounding text
      const jsonMatch = reportText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        report = JSON.parse(jsonMatch[0]);
      } else {
        console.error(
          "[research] Failed to parse JSON. Raw text (first 500 chars):",
          reportText.slice(0, 500)
        );
        throw new Error("Could not parse research results. Please try again.");
      }
    }

    // Validate required fields exist
    if (!report.companyName || !report.overview) {
      console.error(
        "[research] Missing required fields. Got keys:",
        Object.keys(report)
      );
      throw new Error("Incomplete research results. Please try again.");
    }

    console.log(
      "[research] Success. Report for:",
      report.companyName
    );
    return NextResponse.json({ success: true, report });
  } catch (error) {
    const isAnthropicError =
      error instanceof Anthropic.APIError;

    if (isAnthropicError) {
      console.error(
        `[research] Anthropic API error: status=${error.status} type=${error.error?.type} message=${error.message}`
      );
      const userMessage =
        error.status === 401
          ? "Invalid API key. Check ANTHROPIC_API_KEY in your Vercel environment variables."
          : error.status === 429
            ? "Rate limit exceeded. Please wait a moment and try again."
            : `API error (${error.status}): ${error.message}`;
      return NextResponse.json(
        { success: false, error: userMessage },
        { status: error.status || 500 }
      );
    }

    console.error(
      "[research] Error:",
      error instanceof Error ? error.message : error,
      error instanceof Error ? error.stack : ""
    );
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
