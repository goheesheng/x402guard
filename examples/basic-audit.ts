/**
 * Basic Audit Example
 * 
 * Run: npx tsx examples/basic-audit.ts
 */

import { SkillGuardClient } from 'skillguard-client';

async function main() {
  // Initialize client with your wallet
  const client = new SkillGuardClient({
    privateKey: process.env.PRIVATE_KEY!,
    // apiUrl: 'http://localhost:3000', // for local development
  });

  // Check API health (free)
  const health = await client.health();
  console.log('API Status:', health.status);

  // Audit a skill
  console.log('\n🔍 Auditing skill...');
  const result = await client.auditSkill({
    skillUrl: 'https://clawdhub.com/skills/weather',
    tier: 'standard',
  });

  console.log('\n📊 Audit Results:');
  console.log('   Risk Score:', result.risk_score, '/100');
  console.log('   Risk Level:', result.risk_level);
  console.log('   Recommendation:', result.recommendation);
  console.log('   Audit ID:', result.audit_id);

  if (result.findings.malware.length > 0) {
    console.log('\n⚠️ Malware Detected:');
    result.findings.malware.forEach(m => {
      console.log(`   - ${m.rule}: ${m.description}`);
    });
  }

  if (result.findings.network.length > 0) {
    console.log('\n🌐 Network Calls:');
    result.findings.network.forEach(n => {
      console.log(`   - ${n.url} (external: ${n.external})`);
    });
  }

  // Decision
  console.log('\n' + (result.recommendation === 'SAFE' 
    ? '✅ Safe to install!' 
    : '⚠️ Review findings before installing'));
}

main().catch(console.error);
