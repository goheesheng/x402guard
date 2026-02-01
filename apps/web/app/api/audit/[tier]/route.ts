import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.BACKEND_API_URL || "http://localhost:3001";

export async function POST(
  request: NextRequest,
  { params }: { params: { tier: string } }
) {
  const tier = params.tier;

  // Validate tier
  if (!["quick", "standard", "deep"].includes(tier)) {
    return NextResponse.json(
      { error: "Invalid tier. Must be quick, standard, or deep" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    // Forward all headers including x402 payment headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Forward payment-related headers
    const paymentHeader = request.headers.get("X-Payment");
    if (paymentHeader) {
      headers["X-Payment"] = paymentHeader;
    }

    const response = await fetch(`${API_URL}/api/audit/${tier}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Create response with forwarded headers
    const nextResponse = NextResponse.json(data, { status: response.status });

    // Forward x402 payment headers for 402 responses
    const paymentRequiredHeader = response.headers.get("X-Payment-Required");
    if (paymentRequiredHeader) {
      nextResponse.headers.set("X-Payment-Required", paymentRequiredHeader);
    }

    const paymentResponseHeader = response.headers.get("X-Payment-Response");
    if (paymentResponseHeader) {
      nextResponse.headers.set("X-Payment-Response", paymentResponseHeader);
    }

    return nextResponse;
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request to backend" },
      { status: 500 }
    );
  }
}
