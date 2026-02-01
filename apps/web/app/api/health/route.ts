import { NextResponse } from "next/server";

const API_URL = process.env.BACKEND_API_URL || "http://localhost:3001";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { status: "error", message: "Backend returned non-JSON response" },
        { status: 503 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Health check proxy error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to reach backend" },
      { status: 503 }
    );
  }
}
