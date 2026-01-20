<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:1a1a2e,100:00d9ff&height=200&section=header&text=CPB%20Core&fontSize=50&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Cognitive%20Precision%20Bridge&descSize=20&descAlignY=55" />
</p>

<p align="center">
  <strong>Unified orchestration layer for precision-aware AI processing</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-00d9ff?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/Tier-ELITE-gold?style=for-the-badge" alt="ELITE" />
</p>

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COGNITIVE PRECISION BRIDGE (CPB)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         QUERY ANALYSIS                               │   │
│  │                                                                      │   │
│  │   Input ──→ [Complexity Signals] ──→ [Path Scoring] ──→ Decision    │   │
│  │                     │                       │                        │   │
│  │         ┌───────────┴───────────┐   ┌──────┴──────┐                 │   │
│  │         │ • Token count         │   │ Score paths │                 │   │
│  │         │ • Code indicators     │   │ Consider    │                 │   │
│  │         │ • Reasoning patterns  │   │ alternatives│                 │   │
│  │         │ • Consensus signals   │   │ Explain     │                 │   │
│  │         │ • Domain complexity   │   │ reasoning   │                 │   │
│  │         └───────────────────────┘   └─────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                       │
│                                     ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       EXECUTION PATHS                                │   │
│  │                                                                      │   │
│  │  ┌──────────┬──────────┬──────────┬──────────┬──────────┐          │   │
│  │  │  DIRECT  │   RLM    │   ACE    │  HYBRID  │ CASCADE  │          │   │
│  │  │  <0.2    │ 0.2-0.5  │ 0.5-0.7  │  >0.7+   │  >0.7    │          │   │
│  │  ├──────────┼──────────┼──────────┼──────────┼──────────┤          │   │
│  │  │ Simple   │ Context  │ Consensus│ Combined │ Full     │          │   │
│  │  │ queries  │ compress │ building │ RLM+ACE  │ pipeline │          │   │
│  │  ├──────────┼──────────┼──────────┼──────────┼──────────┤          │   │
│  │  │  ~1s     │   ~5s    │   ~5s    │  ~10s    │  ~15s    │          │   │
│  │  ├──────────┼──────────┼──────────┼──────────┼──────────┤          │   │
│  │  │  Sonnet  │  Sonnet  │  Opus    │  Opus    │  Opus    │          │   │
│  │  └──────────┴──────────┴──────────┴──────────┴──────────┘          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                       │
│                                     ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    ACE 5-AGENT ENSEMBLE                              │   │
│  │                                                                      │   │
│  │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │   │
│  │   │ 🔬       │ │ 🤔       │ │ 🔄       │ │ 🛠️       │ │ 🔭       │ │   │
│  │   │ Analyst  │ │ Skeptic  │ │Synthesizr│ │Pragmatist│ │ Visionary│ │   │
│  │   │          │ │          │ │          │ │          │ │          │ │   │
│  │   │ Evidence │ │ Risks    │ │ Patterns │ │ Feasible │ │ Strategy │ │   │
│  │   │ Logic    │ │ Failures │ │ Connect  │ │ Practical│ │ Long-term│ │   │
│  │   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ │   │
│  │        │            │            │            │            │       │   │
│  │        └────────────┴────────────┼────────────┴────────────┘       │   │
│  │                                  ▼                                  │   │
│  │                        [CONSENSUS ENGINE]                           │   │
│  │                    Agreement scoring + synthesis                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                     │                                       │
│                                     ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         DQ SCORING                                   │   │
│  │                                                                      │   │
│  │   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐             │   │
│  │   │   VALIDITY    │ │  SPECIFICITY  │ │  CORRECTNESS  │             │   │
│  │   │     40%       │ │      30%      │ │      30%      │             │   │
│  │   │               │ │               │ │               │             │   │
│  │   │ Addresses     │ │ Detailed      │ │ Factually     │             │   │
│  │   │ the query?    │ │ actionable?   │ │ grounded?     │             │   │
│  │   └───────┬───────┘ └───────┬───────┘ └───────┬───────┘             │   │
│  │           │                 │                 │                      │   │
│  │           └─────────────────┼─────────────────┘                      │   │
│  │                             ▼                                        │   │
│  │                    [OVERALL DQ SCORE]                                │   │
│  │                    0.75 threshold (ELITE)                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Features

- **5 Execution Paths**: Direct, RLM, ACE, Hybrid, Cascade
- **5-Agent ACE Ensemble**: Analyst, Skeptic, Synthesizer, Pragmatist, Visionary
- **Smart Routing**: Auto-selects optimal path based on query complexity
- **Provider Agnostic**: Works with any LLM (OpenAI, Anthropic, Gemini, etc.)
- **DQ Scoring**: Validity + Specificity + Correctness quality measurement
- **Multimodal Support**: Text and image inputs
- **Real-time Status**: Progress callbacks for UI integration
- **ELITE TIER**: Maximum quality configuration by default

---

## Installation

```bash
npm install @metaventionsai/cpb-core
# or
yarn add @metaventionsai/cpb-core
# or
pnpm add @metaventionsai/cpb-core
```

---

## Quick Start

```typescript
import { createCPB, type CPBProvider } from '@metaventionsai/cpb-core';

// 1. Define your LLM provider
const claudeProvider: CPBProvider = {
    name: 'claude',
    isConfigured: () => !!process.env.ANTHROPIC_API_KEY,
    generate: async (prompt, options) => {
        const response = await anthropic.messages.create({
            model: options?.model || 'claude-sonnet-4-20250514',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: options?.maxTokens || 4096
        });
        return response.content[0].text;
    }
};

// 2. Create CPB instance (ELITE TIER by default)
const cpb = createCPB({
    fast: claudeProvider,      // Sonnet for simple queries
    balanced: claudeProvider,  // Opus for RLM/ACE paths
    deep: claudeProvider       // Opus for cascade path
});

// 3. Execute with auto-routing
const result = await cpb.execute({
    query: 'Compare microservices vs monolith architecture',
    context: systemDesignDoc
});

console.log(result.output);
console.log(`Path: ${result.path}`);           // 'ace'
console.log(`DQ Score: ${result.dqScore.overall}%`);  // 78
console.log(`Confidence: ${result.confidence}`);      // 85
```

---

## ELITE TIER Configuration

Default configuration optimized for maximum quality:

| Setting | ELITE Value | Standard Value | Description |
|---------|-------------|----------------|-------------|
| Default Path | `cascade` | `direct` | Full pipeline by default |
| Context Threshold | 100,000 | 50,000 | Chars for RLM activation |
| Complexity Threshold | 0.35 | 0.5 | Lower = more consensus |
| DQ Threshold | 0.75 | 0.6 | Minimum acceptable quality |
| Fast Path Time | 8s | 5s | More time for quality |
| Standard Path Time | 45s | 30s | Extended reasoning |
| Hybrid Path Time | 90s | 60s | Full pipeline allowance |
| RLM Iterations | 25 | 10 | Deeper decomposition |
| ACE Rounds | 18 | 8 | More consensus rounds |
| ACE Agent Count | 5 | 3 | Full ensemble |

### Use Standard Tier (Cost-Conscious)

```typescript
import { createCPB, STANDARD_CPB_CONFIG } from '@metaventionsai/cpb-core';

const cpb = createCPB(providers, STANDARD_CPB_CONFIG);
```

---

## 5-Agent ACE Ensemble

The Adaptive Consensus Engine uses 5 specialized agents:

| Agent | Emoji | Role | Prompt Focus |
|-------|-------|------|--------------|
| **Analyst** | 🔬 | Evidence evaluator | Data, evidence, logical consistency |
| **Skeptic** | 🤔 | Challenge assumptions | Failure modes, risks, edge cases |
| **Synthesizer** | 🔄 | Pattern finder | Connections, frameworks, integration |
| **Pragmatist** | 🛠️ | Feasibility checker | Actionability, resources, constraints |
| **Visionary** | 🔭 | Strategic thinker | Long-term, second-order effects |

### Consensus Scoring

Agreement is calculated via keyword overlap between agent responses:

```typescript
// High agreement (>0.7): Strong consensus
// Moderate (0.4-0.7): Some divergence
// Low (<0.4): Significant disagreement - may need human review
```

---

## Execution Paths

| Path | Complexity | Use Case | Speed | Quality | Model |
|------|------------|----------|-------|---------|-------|
| **Direct** | <0.2 | Simple queries, navigation | ~1s | Good | Sonnet |
| **RLM** | 0.2-0.5 | Long context, document analysis | ~5s | Better | Sonnet |
| **ACE** | 0.5-0.7 | Decisions, trade-offs, consensus | ~5s | High | Opus |
| **Hybrid** | >0.7 | Complex + long context | ~10s | Higher | Opus |
| **Cascade** | >0.7 | Critical decisions, research | ~15s | Highest | Opus |

### Path Selection Logic

```typescript
// Automatic routing based on:
interface PathSignals {
    contextLength: number;       // Characters in context
    queryComplexity: number;     // 0-1 complexity score
    requiresConsensus: boolean;  // Multi-perspective needed?
    requiresReasoning: boolean;  // Deep analysis needed?
    timeBudgetMs: number;        // Time constraint
    qualityTarget: number;       // DQ threshold
}
```

---

## DQ Score Breakdown

```typescript
interface DQScore {
    overall: number;      // 0-100 weighted average
    validity: number;     // 40% - Does it address the query?
    specificity: number;  // 30% - Is it detailed/actionable?
    correctness: number;  // 30% - Is it factually grounded?
}
```

### Quality Tiers

| Tier | Score | Status |
|------|-------|--------|
| Excellent | ≥0.85 | 🌟 |
| Good | ≥0.75 | ✅ |
| Acceptable | ≥0.60 | ⚠️ |
| Below Threshold | <0.60 | ❌ |

---

## Status Callbacks

```typescript
const result = await cpb.execute(request, (status) => {
    console.log(`Phase: ${status.phase}`);
    console.log(`Progress: ${status.progress}%`);
    console.log(`Path: ${status.path}`);
    console.log(`Engine: ${status.currentEngine}`);
    console.log(`Message: ${status.message}`);
});
```

### Phases

1. `analyzing` - Determining optimal path
2. `compressing` - RLM context compression
3. `exploring` - Parallel exploration
4. `converging` - ACE consensus building
5. `verifying` - DQ verification
6. `reconstructing` - Final synthesis
7. `complete` - Done

---

## Multi-Provider Setup

```typescript
import { createCPB } from '@metaventionsai/cpb-core';

const cpb = createCPB({
    fast: geminiFlashProvider,   // Fast queries → Gemini Flash
    balanced: claudeSonnet,      // Analysis → Claude Sonnet
    deep: claudeOpus             // Deep reasoning → Claude Opus
});
```

---

## Router Utilities

```typescript
import {
    extractPathSignals,
    selectPath,
    canUseDirectPath,
    needsRLMPath,
    wouldBenefitFromConsensus
} from '@metaventionsai/cpb-core';

// Analyze without executing
const signals = extractPathSignals(query, context);
const decision = selectPath(signals);

console.log(`Recommended: ${decision.path}`);
console.log(`Confidence: ${decision.confidence}`);
console.log(`Reasoning: ${decision.reasoning}`);
console.log(`Alternatives:`, decision.alternatives);

// Quick checks
if (canUseDirectPath(query)) {
    // Skip CPB, use direct LLM call
}

if (needsRLMPath(query, longContext)) {
    // Context compression required
}

if (wouldBenefitFromConsensus(query)) {
    // Multi-agent consensus recommended
}
```

---

## Force Specific Path

```typescript
const result = await cpb.execute({
    query: 'Design a new API',
    forcePath: 'ace'  // Force consensus path
});
```

---

## Research Foundation

CPB is built on research from:

| Paper | Topic | Application |
|-------|-------|-------------|
| **arXiv:2512.24601** | Recursive Language Model | Context externalization, compression |
| **arXiv:2511.15755** | DQ Scoring | Quality measurement framework |
| **arXiv:2508.17536** | Voting vs Debate | Consensus strategies |

---

## Related Packages

- **[@metaventionsai/voice-nexus](https://github.com/Dicoangelo/voice-nexus)** - Voice AI architecture
- **[ResearchGravity](https://github.com/Dicoangelo/ResearchGravity)** - Python CPB implementation

---

## License

MIT © Dicoangelo

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:1a1a2e,100:00d9ff&height=100&section=footer" />
</p>
