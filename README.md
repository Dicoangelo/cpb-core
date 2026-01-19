# Cognitive Precision Bridge (CPB)

Unified orchestration layer for precision-aware AI processing. Routes queries through optimal execution paths based on complexity analysis.

## Features

- **5 Execution Paths**: Direct, RLM, ACE, Hybrid, Cascade
- **Smart Routing**: Auto-selects optimal path based on query complexity
- **Provider Agnostic**: Works with any LLM (OpenAI, Anthropic, Gemini, etc.)
- **DQ Scoring**: Validity + Specificity + Correctness quality measurement
- **Multimodal Support**: Text and image inputs
- **Real-time Status**: Progress callbacks for UI integration

## Installation

```bash
npm install @antigravity/cpb-core
# or
yarn add @antigravity/cpb-core
# or
pnpm add @antigravity/cpb-core
```

## Quick Start

```typescript
import { createCPB, type CPBProvider } from '@antigravity/cpb-core';

// 1. Define your LLM provider
const openaiProvider: CPBProvider = {
    name: 'openai',
    isConfigured: () => !!process.env.OPENAI_API_KEY,
    generate: async (prompt, options) => {
        const response = await openai.chat.completions.create({
            model: options?.model || 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            temperature: options?.temperature || 0.7
        });
        return response.choices[0].message.content || '';
    }
};

// 2. Create CPB instance
const cpb = createCPB({
    fast: openaiProvider,      // For simple queries
    balanced: openaiProvider,  // For RLM/ACE paths
    deep: openaiProvider       // For cascade path
});

// 3. Execute with auto-routing
const result = await cpb.execute({
    query: 'Compare microservices vs monolith architecture',
    context: systemDesignDoc
});

console.log(result.output);
console.log(`Path: ${result.path}`);
console.log(`DQ Score: ${result.dqScore.overall}%`);
```

## Execution Paths

| Path | Use Case | Speed | Quality |
|------|----------|-------|---------|
| **Direct** | Simple queries, navigation | Fast (~1s) | Good |
| **RLM** | Long context, document analysis | Medium (~5s) | Better |
| **ACE** | Decisions, trade-offs, consensus | Medium (~5s) | Better |
| **Hybrid** | Complex queries + long context | Slow (~10s) | High |
| **Cascade** | Critical decisions, research | Slowest (~15s) | Highest |

## Path Selection Logic

CPB analyzes these signals to select the optimal path:

```typescript
interface PathSignals {
    contextLength: number;       // Characters in context
    queryComplexity: number;     // 0-1 complexity score
    requiresConsensus: boolean;  // Multi-perspective needed?
    requiresReasoning: boolean;  // Deep analysis needed?
    timeBudgetMs: number;        // Time constraint
    qualityTarget: number;       // DQ threshold
}
```

### Automatic Routing Rules

- **Direct**: Simple patterns (`what is`, `navigate`, `list`)
- **RLM**: Context > 50,000 characters
- **ACE**: Consensus keywords (`trade-off`, `compare`, `should we`)
- **Hybrid**: Long context + high complexity
- **Cascade**: Quality target > 0.8

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

## Force Specific Path

```typescript
const result = await cpb.execute({
    query: 'Design a new API',
    forcePath: 'ace'  // Force consensus path
});
```

## Router Utilities

```typescript
import {
    extractPathSignals,
    selectPath,
    canUseDirectPath,
    needsRLMPath,
    wouldBenefitFromConsensus
} from '@antigravity/cpb-core';

// Analyze without executing
const signals = extractPathSignals(query, context);
const decision = selectPath(signals);

console.log(`Recommended: ${decision.path}`);
console.log(`Confidence: ${decision.confidence}`);
console.log(`Reasoning: ${decision.reasoning}`);

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

## Multi-Provider Setup

```typescript
import { createCPB } from '@antigravity/cpb-core';

const cpb = createCPB({
    fast: geminiFlashProvider,   // Fast queries → Gemini Flash
    balanced: claudeSonnet,      // Analysis → Claude Sonnet
    deep: claudeOpus             // Deep reasoning → Claude Opus
});
```

## Configuration

```typescript
const cpb = createCPB(providers, {
    // Path selection
    autoRoute: true,
    defaultPath: 'hybrid',

    // Thresholds
    contextThreshold: 50000,     // Chars for RLM activation
    complexityThreshold: 0.5,    // Score for ACE activation
    dqThreshold: 0.6,            // Minimum acceptable quality

    // Time budgets
    fastPathMs: 5000,
    standardPathMs: 30000,
    hybridPathMs: 60000,

    // Quality settings
    enableVerification: true,    // Run DQ verification
    enableLearning: true,        // Store patterns
    retryOnLowDQ: true,          // Retry if quality low

    // Engine configs
    rlmConfig: {
        maxIterations: 15,
        rootModel: 'fast',
        subModel: 'fast'
    },
    aceConfig: {
        maxRounds: 12,
        agentCount: 3,
        enableAuction: true,
        enableHopGrouping: true
    }
});
```

## DQ Score Breakdown

```typescript
interface DQScore {
    overall: number;      // 0-100 weighted average
    validity: number;     // 40% - Logical soundness
    specificity: number;  // 30% - Actionability
    correctness: number;  // 30% - Accuracy
}
```

## Multimodal Support

```typescript
const result = await cpb.execute({
    query: 'Analyze this architecture diagram',
    multimodal: {
        images: [{
            base64: imageData,
            mediaType: 'image/png',
            description: 'System architecture diagram'
        }]
    }
});
```

## Research Foundation

CPB is built on research from:

- **arXiv:2512.24601** (RLM) - Recursive context externalization
- **arXiv:2511.15755** (DQ) - Decisional quality measurement
- **arXiv:2508.17536** - Voting vs Debate consensus strategies

## License

MIT © Dicoangelo
