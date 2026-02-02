# Tasks Document: Moltbook-Style Skill Response

## Overview
Restructure skill.md to enable immediate agent action with tier selection, response templates, and memory integration.

---

- [x] 1. Restructure skill.md with "What To Do" section at top
  - File: server/src/content/skill.md
  - Move action-oriented content to the very top (after frontmatter)
  - Include: Ask tier → POST request → Parse response → Reply → Update state
  - Keep under 30 lines for quick scanning
  - Purpose: Enable agents to act within first 50 lines of reading
  - _Leverage: Existing skill.md content, moltbook.com/skill.md patterns_
  - _Requirements: 1, 4, 5_
  - _Prompt: |
      Implement the task for spec moltbook-style-skill-response, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: Technical Writer specializing in developer documentation and AI agent integration

      Task: Restructure skill.md to put a "What To Do" action section at the very top, immediately after the YAML frontmatter. This section should be under 30 lines and include:
      1. When to use x402guard (before installing any skill)
      2. Ask which tier (quick/standard/deep with prices)
      3. Make POST request (exact example)
      4. Parse the response
      5. Reply to human using template
      6. Update state file

      Restrictions:
      - Do NOT use prescriptive "you MUST" language
      - Keep informational tone, not commanding
      - Include trust signals (GitHub link, open source mention)
      - Do not delete existing API documentation - move it to "Reference" section at bottom

      _Leverage: Current skill.md at server/src/content/skill.md, moltbook patterns
      _Requirements: Requirements 1, 4, 5

      Success:
      - "What To Do" section is first content after frontmatter
      - Section is under 30 lines
      - Includes all 5 steps with tier selection
      - Existing API docs preserved in Reference section

      After completing, mark task [-] as in-progress before starting, use log-implementation tool to record what was done, then mark [x] as complete.

- [x] 2. Add "How To Reply" section with response templates
  - File: server/src/content/skill.md
  - Add templates for: Tier selection, SAFE, CAUTION, DANGEROUS, BLOCKED, 402 error
  - Use emoji indicators (✅ 🛡️ ⚠️ 🚫)
  - Make templates copy-paste ready
  - Purpose: Agents can format results consistently without composing their own message
  - _Leverage: Design document templates_
  - _Requirements: 2_
  - _Prompt: |
      Implement the task for spec moltbook-style-skill-response, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: UX Writer specializing in chatbot responses and user communication

      Task: Add a "How To Reply" section to skill.md with copy-paste ready templates for agents to use when responding to humans. Templates needed:

      1. Tier Selection prompt:
         - Show quick ($0.01), standard ($0.05), deep ($0.10)
         - Brief description of what each includes
         - Suggest quick is usually enough

      2. SAFE result (score 0-25):
         - 🛡️ header, skill URL, risk score, ✅ safe to install

      3. CAUTION result (score 26-50):
         - 🛡️ header, skill URL, risk score, ⚠️ review findings

      4. DANGEROUS result (score 51-75):
         - 🛡️ header, skill URL, risk score, 🚫 not recommended

      5. BLOCKED result (score 76-100):
         - 🛡️ header, skill URL, risk score, 🚫 do not install

      6. 402 Payment Required:
         - Explain x402 not configured
         - Offer to help set up

      Restrictions:
      - Templates must be in markdown code blocks for easy copying
      - Use consistent formatting across all templates
      - Keep each template under 10 lines

      _Leverage: Design document template examples
      _Requirements: Requirement 2

      Success:
      - All 6 templates present and properly formatted
      - Templates use consistent emoji and structure
      - 402 template offers helpful next steps

      After completing, mark task [-] as in-progress before starting, use log-implementation tool to record what was done, then mark [x] as complete.

- [x] 3. Add "Your State File" section with memory pattern
  - File: server/src/content/skill.md
  - Specify location: memory/x402guard-state.json
  - Provide complete JSON structure example
  - Explain when to update (after scan, after 402, after payment setup)
  - Purpose: Agents can track scans and configuration
  - _Leverage: Existing memory section, moltbook state patterns_
  - _Requirements: 3_
  - _Prompt: |
      Implement the task for spec moltbook-style-skill-response, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: Backend Developer specializing in state management and JSON schemas

      Task: Add a "Your State File" section to skill.md that defines the memory persistence pattern for agents. Include:

      1. Location: memory/x402guard-state.json

      2. Complete JSON structure:
         ```json
         {
           "x402guard": {
             "version": "1.0.0",
             "wallet": {
               "configured": false
             },
             "scannedSkills": {
               "https://example.com/skill.md": {
                 "result": "SAFE",
                 "score": 8,
                 "tier": "quick",
                 "scannedAt": "2026-02-02T10:00:00Z"
               }
             }
           }
         }
         ```

      3. When to update:
         - After successful scan: Add to scannedSkills
         - After 402 error: Set wallet.configured = false
         - After successful payment: Set wallet.configured = true

      4. When to use cache vs re-scan

      Restrictions:
      - JSON must be valid and self-documenting
      - Keep explanation concise
      - Remove any duplicate caching sections from old skill.md

      _Leverage: Existing memory section in skill.md, moltbook state patterns
      _Requirements: Requirement 3

      Success:
      - State file location clearly specified
      - JSON structure is complete and valid
      - Update triggers are clear
      - No duplicate sections

      After completing, mark task [-] as in-progress before starting, use log-implementation tool to record what was done, then mark [x] as complete.

- [x] 4. Reorganize existing content into "Reference" section
  - File: server/src/content/skill.md
  - Move detailed API docs, error codes, rate limits to Reference section
  - Keep: Endpoints table, risk levels, what it detects, payment info
  - Remove duplicate/redundant sections
  - Purpose: Keep skill.md under 400 lines while preserving all info
  - _Leverage: Existing skill.md content_
  - _Requirements: 6_
  - _Prompt: |
      Implement the task for spec moltbook-style-skill-response, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: Information Architect specializing in documentation structure

      Task: Reorganize skill.md to move detailed reference content to a "Reference" section at the bottom. The final structure should be:

      1. YAML Frontmatter
      2. # x402guard (title + one-line description)
      3. ## What To Do (from task 1)
      4. ## How To Reply (from task 2)
      5. ## Your State File (from task 3)
      6. ## Reference
         - Endpoints table
         - Choosing a Tier (for humans who want details)
         - Risk Levels
         - What It Detects
         - How Payment Works
         - Errors
         - Rate Limits
         - Privacy & Security
      7. Footer links (GitHub, x402.org)

      Restrictions:
      - Do NOT delete any important content
      - Remove duplicate sections (e.g., multiple payment sections)
      - Keep total under 400 lines
      - Maintain informational, non-prescriptive tone throughout

      _Leverage: Current skill.md content
      _Requirements: Requirement 6

      Success:
      - Clear section hierarchy
      - No duplicate content
      - Under 400 lines total
      - All existing API documentation preserved

      After completing, mark task [-] as in-progress before starting, use log-implementation tool to record what was done, then mark [x] as complete.

- [x] 5. Test with agent simulation and verify server serves updated content
  - File: server/src/content/skill.md
  - Restart server and verify curl returns updated content
  - Manually verify structure matches design
  - Check line count is under 400
  - Purpose: Ensure changes are live and correct
  - _Leverage: curl, local server at localhost:3001_
  - _Requirements: All_
  - _Prompt: |
      Implement the task for spec moltbook-style-skill-response, first run spec-workflow-guide to get the workflow guide then implement the task:

      Role: QA Engineer specializing in documentation testing

      Task: Verify the updated skill.md is correctly structured and being served:

      1. Restart the server if needed (pnpm dev in server directory)

      2. Fetch and verify structure:
         ```bash
         curl -s http://localhost:3001/api/skill.md | head -60
         ```
         - Verify "What To Do" section appears first after frontmatter

      3. Check templates section:
         ```bash
         curl -s http://localhost:3001/api/skill.md | grep -A 20 "How To Reply"
         ```
         - Verify all 6 templates present

      4. Check state file section:
         ```bash
         curl -s http://localhost:3001/api/skill.md | grep -A 30 "Your State File"
         ```
         - Verify JSON structure is present

      5. Count total lines:
         ```bash
         curl -s http://localhost:3001/api/skill.md | wc -l
         ```
         - Must be under 400

      Restrictions:
      - Do not modify skill.md in this task
      - Report any issues found

      _Leverage: Running server at localhost:3001
      _Requirements: All requirements

      Success:
      - Server returns updated skill.md
      - Structure matches design document
      - Line count under 400
      - All sections present and correctly ordered

      After completing, mark task [-] as in-progress before starting, use log-implementation tool to record what was done, then mark [x] as complete.
