import { NextResponse } from "next/server";

const API_URL = process.env.BACKEND_API_URL || "http://localhost:3001";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/skill.md`, {
      method: "GET",
      cache: "no-store",
    });

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
      },
    });
  } catch (error: any) {
    console.error("skill.md proxy error:", error);
    return new NextResponse("Failed to reach backend", { status: 503 });
  }
}
