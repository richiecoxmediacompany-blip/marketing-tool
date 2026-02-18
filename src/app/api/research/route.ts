import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { CompanyReport } from "@/lib/types";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
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

    // Extract text content from the response
    let reportText = "";
    for (const block of response.content) {
      if (block.type === "text") {
        reportText += block.text;
      }
    }

    // Parse the JSON from the response
    // Try to extract JSON from the response text
    let report: CompanyReport;
    try {
      // First try direct parse
      report = JSON.parse(reportText.trim());
    } catch {
      // Try to extract JSON from markdown code fences or surrounding text
      const jsonMatch = reportText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        report = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse research results");
      }
    }

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Research API error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
