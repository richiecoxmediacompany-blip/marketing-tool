import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { CompanyReport } from "@/lib/types";

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

    const systemPrompt = `You are a marketing intelligence analyst. Your job is to research companies and produce structured reports. Use web search to find current, accurate information about the company. Be thorough and factual. If you cannot find information about something, say so honestly rather than making things up.`;

    const userPrompt = `Research the company "${query.trim()}" and produce a detailed marketing intelligence report. Search the web for current information about this company.

Return your findings as a JSON object with exactly this structure (no markdown, no code fences, just raw JSON):
{
  "companyName": "Official company name",
  "website": "company website URL",
  "overview": "2-3 paragraph overview of what the company does",
  "businessModel": "Detailed explanation of how they make money",
  "targetMarket": "Description of their target customers and market segments",
  "productsAndServices": ["Product/Service 1", "Product/Service 2", ...],
  "competitors": [
    {"name": "Competitor Name", "description": "Brief description of how they compete"},
    ...
  ],
  "recentNews": [
    {"headline": "News headline", "summary": "Brief summary of the news item"},
    ...
  ],
  "marketPosition": {
    "category": "Leader" or "Challenger" or "Niche Player" or "Emerging",
    "explanation": "Why they hold this position"
  }
}

Include 3-5 competitors and 3-5 recent news items. Make sure all information is current and accurate based on your web search results.`;

    console.log("[research] Starting research for query:", query.trim());

    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 16000,
      system: systemPrompt,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 10,
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
