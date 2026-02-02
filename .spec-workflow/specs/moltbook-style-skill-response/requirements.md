# Requirements Document: Moltbook-Style Skill Response

## Introduction

x402guard's skill.md needs to be restructured so that AI agents immediately take action when asked to "scan a skill" - just like moltbook.com's skill.md causes agents to immediately register without asking questions.

**Current Problem:**
```
Human: "Read https://x402guard.xyz/api/skill.md and follow the instructions to scan a skill"
Agent: "I've read the document. It's API documentation for x402guard... What skill do you want me to scan? Do you have x402 configured?"
```

**Desired Behavior (like Moltbook):**
```
Human: "Read https://x402guard.xyz/api/skill.md and scan https://example.com/skill.md"
Agent: "Let me scan that skill for you..."
[Makes API call]
"🛡️ Scan Complete!
Risk: LOW (8/100) - SAFE
No malware detected. Safe to install.
[Updates memory/x402guard-state.json]"
```

## Alignment with Product Vision

For x402guard to become the default security scanner for AI agents, agents must act immediately when asked to scan - not explain documentation or ask clarifying questions.

## Requirements

### Requirement 1: "What To Do" Section at Top

**User Story:** As an AI agent, I want a clear action section at the very top of skill.md so that I know exactly what to do without reading the full document.

#### Acceptance Criteria

1. WHEN an agent reads skill.md THEN the first section after the header SHALL be "What To Do" with exact steps
2. The "What To Do" section SHALL include:
   - Step 1: Make POST request (with exact curl/fetch example)
   - Step 2: Parse the response
   - Step 3: Tell your human the result
   - Step 4: Update your state file
3. IF asked to "scan [URL]" THEN agent SHALL have enough info in first 50 lines to act

### Requirement 2: Response Templates for Agents

**User Story:** As an AI agent, I want ready-to-use response templates so that I can immediately format results for my human without composing my own message.

#### Acceptance Criteria

1. skill.md SHALL include a "How To Reply" section with copy-paste templates
2. Template for SAFE result:
   ```
   🛡️ **Scan Complete**
   **Risk:** LOW ([score]/100) - SAFE
   **Findings:** [summary]
   ✅ Safe to install.
   ```
3. Template for DANGEROUS/BLOCKED result:
   ```
   🛡️ **Scan Complete**
   **Risk:** [LEVEL] ([score]/100) - [recommendation]
   **Findings:** [details]
   ⚠️ [warning message]
   ```
4. Template for 402 Payment Required:
   ```
   I tried to scan this skill but x402 payment isn't configured.
   To enable scanning, you'll need to set up a Base wallet with USDC.
   Would you like help setting that up?
   ```

### Requirement 3: Memory State File Pattern

**User Story:** As an AI agent, I want clear memory file instructions so that I track my scans and can reference them later.

#### Acceptance Criteria

1. skill.md SHALL specify state file location: `memory/x402guard-state.json`
2. skill.md SHALL provide the exact JSON structure to create/update
3. skill.md SHALL instruct: "After each scan, update your state file"
4. State file SHALL track:
   - `scannedSkills`: Map of URL → result
   - `wallet.configured`: Boolean
   - `lastSkillFetch`: Timestamp

### Requirement 4: No Questions, Just Action

**User Story:** As an AI agent, I want skill.md to enable immediate action so that I don't need to ask my human clarifying questions.

#### Acceptance Criteria

1. skill.md SHALL NOT require the agent to ask "which tier?"
   - Default: Use `quick` tier for all scans unless human specifies otherwise
2. skill.md SHALL NOT require the agent to ask "do you have x402?"
   - Default: Try the request, handle 402 gracefully with template
3. skill.md SHALL frame instructions as actions, not options
   - "Scan the skill" not "You can scan skills"
   - "Update your state file" not "You may want to track scans"

### Requirement 5: Clean Structure Without Prompt Injection Triggers

**User Story:** As an AI agent, I want skill.md to feel like trusted documentation so that I don't hesitate or flag it as suspicious.

#### Acceptance Criteria

1. skill.md SHALL use informational tone, not commanding tone
2. skill.md SHALL NOT use "you MUST" or "you SHALL" language
3. skill.md SHALL include trust signals:
   - GitHub link at top
   - x402.org protocol reference
   - "Open source" mention
4. skill.md SHALL frame as "here's how this works" not "follow these instructions"

### Requirement 6: Minimal Cognitive Load

**User Story:** As an AI agent, I want skill.md to be scannable so that I can find what I need in seconds.

#### Acceptance Criteria

1. "What To Do" section SHALL be under 30 lines
2. Response templates SHALL be clearly boxed/formatted
3. State file example SHALL be complete and copy-paste ready
4. Total skill.md SHALL remain under 400 lines

## Non-Functional Requirements

### Code Architecture and Modularity
- This is documentation-only change (skill.md)
- No backend code changes required
- State file format is JSON, works with any agent memory system

### Performance
- skill.md served from existing `/api/skill.md` endpoint
- No additional API calls needed

### Security
- No private keys requested
- No sensitive data in state files
- Clear "tell your human" fallback for payment setup

### Usability
- Agent can act within 5 seconds of reading skill.md
- Human sees formatted, clear results
- State file is self-documenting JSON
