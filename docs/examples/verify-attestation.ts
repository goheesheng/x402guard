/**
 * Example: Scan a skill and verify the attestation.
 *
 * Demonstrates the full trust flow:
 * 1. Scan a skill → get signed attestation
 * 2. Pass attestation to another party
 * 3. That party verifies it independently
 *
 * Run: npx tsx docs/examples/verify-attestation.ts
 *
 * Requires: local server running on port 3007
 *   cd server && ACP_INTERNAL_SECRET=test-secret PORT=3007 npx tsx src/index.ts
 */

const API_URL = process.env.API_URL || "http://localhost:3007";
const ACP_SECRET = process.env.ACP_INTERNAL_SECRET || "test-secret";

async function main() {
  console.log("x402guard Attestation Verification Example\n");

  // Step 1: Scan a skill
  console.log("Step 1: Scanning skill...");
  const scanResponse = await fetch(`${API_URL}/api/audit/quick`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-ACP-Secret": ACP_SECRET,
    },
    body: JSON.stringify({
      skill_content: "# Safe Skill\nDoes nothing dangerous.",
    }),
  });

  const scanResult = await scanResponse.json() as any;
  console.log(`  Gate decision: ${scanResult.gate_decision}`);
  console.log(`  Risk score: ${scanResult.risk_score}`);
  console.log(`  Attestation signed: ${!!scanResult.attestation?.signature}`);
  console.log(`  Signer: ${scanResult.attestation?.signer}`);

  // Step 2: Extract the attestation (this is what you'd pass to another party)
  const attestation = scanResult.attestation;
  console.log(`\nStep 2: Attestation to share:`);
  console.log(JSON.stringify(attestation, null, 2));

  // Step 3: Verify the attestation (any party can do this)
  console.log(`\nStep 3: Verifying attestation...`);
  const verifyResponse = await fetch(`${API_URL}/api/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(attestation),
  });

  const verifyResult = await verifyResponse.json() as any;
  console.log(`  Valid: ${verifyResult.verification.valid}`);
  console.log(`  Signer: ${verifyResult.verification.signer}`);
  console.log(`  Matches: ${verifyResult.verification.matches}`);

  // Step 4: Use the verification in a gate decision
  if (verifyResult.verification.valid && scanResult.gate_decision === "allow") {
    console.log("\nResult: Skill is verified safe. Install it.");
  } else {
    console.log("\nResult: Skill failed verification. Do not install.");
  }
}

main().catch(console.error);
