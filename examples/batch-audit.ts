/**
 * Batch Audit Example
 * 
 * Audit multiple skills and generate a report.
 * 
 * Run: npx tsx examples/batch-audit.ts
 */

import { SkillGuardClient, AuditResult } from 'skillguard-client';

const SKILLS_TO_AUDIT = [
  'https://clawdhub.com/skills/weather',
  'https://clawdhub.com/skills/github',
  'https://clawdhub.com/skills/summarize',
];

async function main() {
  const client = new SkillGuardClient({
    privateKey: process.env.PRIVATE_KEY!,
  });

  console.log('🔍 Batch Auditing', SKILLS_TO_AUDIT.length, 'skills...\n');

  const results: { url: string; result: AuditResult }[] = [];

  for (const skillUrl of SKILLS_TO_AUDIT) {
    console.log(`Auditing: ${skillUrl}`);
    try {
      const result = await client.quickAudit(skillUrl); // Use quick for batch
      results.push({ url: skillUrl, result });
      console.log(`  ✓ Score: ${result.risk_score}, Recommendation: ${result.recommendation}`);
    } catch (error) {
      console.log(`  ✗ Error: ${error.message}`);
    }
  }

  // Generate report
  console.log('\n📊 Audit Report');
  console.log('================\n');

  const safe = results.filter(r => r.result.recommendation === 'SAFE');
  const caution = results.filter(r => r.result.recommendation === 'CAUTION');
  const dangerous = results.filter(r => 
    r.result.recommendation === 'DANGEROUS' || r.result.recommendation === 'BLOCKED'
  );

  console.log(`✅ Safe: ${safe.length}`);
  safe.forEach(r => console.log(`   - ${r.url}`));

  console.log(`\n⚠️ Caution: ${caution.length}`);
  caution.forEach(r => console.log(`   - ${r.url} (score: ${r.result.risk_score})`));

  console.log(`\n🚫 Dangerous: ${dangerous.length}`);
  dangerous.forEach(r => console.log(`   - ${r.url} (score: ${r.result.risk_score})`));

  // Total cost
  const totalCost = results.length * 0.05; // Quick audit = $0.05
  console.log(`\n💰 Total Cost: $${totalCost.toFixed(2)} USDC`);
}

main().catch(console.error);
