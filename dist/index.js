"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  CognitivePrecisionBridge: () => CognitivePrecisionBridge,
  DEFAULT_CPB_CONFIG: () => DEFAULT_CPB_CONFIG,
  STANDARD_CPB_CONFIG: () => STANDARD_CPB_CONFIG,
  canUseDirectPath: () => canUseDirectPath,
  cpbExecute: () => cpbExecute,
  createCPB: () => createCPB,
  default: () => orchestrator_default,
  extractPathSignals: () => extractPathSignals,
  needsRLMPath: () => needsRLMPath,
  selectPath: () => selectPath,
  wouldBenefitFromConsensus: () => wouldBenefitFromConsensus
});
module.exports = __toCommonJS(index_exports);

// src/types.ts
var DEFAULT_CPB_CONFIG = {
  autoRoute: true,
  defaultPath: "cascade",
  // ELITE: Full pipeline by default
  contextThreshold: 1e5,
  // ELITE: Handle larger contexts (~25k tokens)
  complexityThreshold: 0.35,
  // ELITE: Lower threshold → more consensus
  dqThreshold: 0.75,
  // ELITE: Higher quality bar
  fastPathMs: 8e3,
  // ELITE: More time for quality
  standardPathMs: 45e3,
  // ELITE: Extended for deep reasoning
  hybridPathMs: 9e4,
  // ELITE: Full pipeline allowance
  enableVerification: true,
  enableLearning: true,
  retryOnLowDQ: true,
  rlmConfig: {
    maxIterations: 25,
    // ELITE: Deeper decomposition
    rootModel: "deep",
    // ELITE: Opus for root synthesis
    subModel: "balanced"
    // ELITE: Sonnet for sub-tasks
  },
  aceConfig: {
    maxRounds: 18,
    // ELITE: More consensus rounds
    agentCount: 5,
    // ELITE: 5-agent ensemble
    enableAuction: true,
    enableHopGrouping: true
  }
};
var STANDARD_CPB_CONFIG = {
  autoRoute: true,
  defaultPath: "hybrid",
  contextThreshold: 5e4,
  complexityThreshold: 0.5,
  dqThreshold: 0.6,
  fastPathMs: 5e3,
  standardPathMs: 3e4,
  hybridPathMs: 6e4,
  enableVerification: true,
  enableLearning: true,
  retryOnLowDQ: true,
  rlmConfig: { maxIterations: 15, rootModel: "fast", subModel: "fast" },
  aceConfig: { maxRounds: 12, agentCount: 3, enableAuction: true, enableHopGrouping: true }
};

// src/router.ts
function estimateComplexity(query, context) {
  const wordCount = query.split(/\s+/).length;
  const contextLength = context?.length || 0;
  const expertPatterns = [
    /architect|design system|infrastructure/i,
    /multi-?agent|distributed|consensus/i,
    /research|investigate|analyze deeply/i,
    /prove|derive|demonstrate/i,
    /security|vulnerability|attack vector/i
  ];
  const simplePatterns = [
    /^(what is|define|who is|when|where)/i,
    /^(list|show|display|get|find)/i,
    /navigate|go to|open/i,
    /^(yes|no|true|false)/i
  ];
  const isExpert = expertPatterns.some((p) => p.test(query)) || contextLength > 5e4;
  const isSimple = simplePatterns.some((p) => p.test(query)) && wordCount < 20;
  let taskType = "medium";
  if (isExpert) taskType = "expert";
  else if (isSimple) taskType = "simple";
  return {
    taskType,
    estimatedTokens: Math.ceil((query.length + contextLength) / 4),
    requiresContext: contextLength > 1e3
  };
}
function extractPathSignals(query, context, config = {}) {
  const mergedConfig = { ...DEFAULT_CPB_CONFIG, ...config };
  const contextLength = (context?.length || 0) + query.length;
  const complexityProfile = estimateComplexity(query, context);
  const queryComplexity = mapComplexityToScore(complexityProfile.taskType, query);
  const requiresConsensus = detectConsensusNeed(query);
  const requiresReasoning = detectReasoningNeed(query);
  return {
    contextLength,
    queryComplexity,
    requiresConsensus,
    requiresReasoning,
    hasGroundTruth: false,
    timeBudgetMs: mergedConfig.standardPathMs,
    qualityTarget: mergedConfig.dqThreshold
  };
}
function mapComplexityToScore(taskType, query) {
  const baseScores = {
    simple: 0.2,
    medium: 0.5,
    expert: 0.8
  };
  let score = baseScores[taskType] || 0.5;
  const complexityIndicators = [
    { pattern: /architect|design|system/i, boost: 0.15 },
    { pattern: /compare|trade-?off|versus/i, boost: 0.12 },
    { pattern: /implement|refactor|optimize/i, boost: 0.1 },
    { pattern: /analyze|evaluate|assess/i, boost: 0.1 },
    { pattern: /why|how does|explain/i, boost: 0.08 },
    { pattern: /research|investigate|explore/i, boost: 0.1 }
  ];
  const simplicityIndicators = [
    { pattern: /^(what is|where|when|who|list)/i, reduction: 0.15 },
    { pattern: /navigate|go to|open|show/i, reduction: 0.2 },
    { pattern: /^(yes|no|true|false)/i, reduction: 0.25 },
    { pattern: /status|check|current/i, reduction: 0.1 }
  ];
  for (const { pattern, boost } of complexityIndicators) {
    if (pattern.test(query)) score += boost;
  }
  for (const { pattern, reduction } of simplicityIndicators) {
    if (pattern.test(query)) score -= reduction;
  }
  return Math.max(0, Math.min(1, score));
}
function detectConsensusNeed(query) {
  const consensusIndicators = [
    /best approach|recommended|should (i|we)/i,
    /opinion|perspective|viewpoint/i,
    /debate|discuss|consider/i,
    /trade-?off|pros? and cons?/i,
    /multiple ways|alternatives?/i,
    /controversial|uncertain|unclear/i,
    /decision|choose|select/i
  ];
  return consensusIndicators.some((pattern) => pattern.test(query));
}
function detectReasoningNeed(query) {
  const reasoningIndicators = [
    /why|how|explain|because/i,
    /analyze|evaluate|assess|critique/i,
    /proof|derive|demonstrate/i,
    /step by step|walkthrough/i,
    /root cause|underlying|fundamental/i,
    /implications?|consequences?|effects?/i,
    /pattern|trend|insight/i
  ];
  return reasoningIndicators.some((pattern) => pattern.test(query));
}
function scorePathsOnSignals(signals, config) {
  const scores = {
    direct: { score: 0.5, reasoning: "Base path for simple queries" },
    rlm: { score: 0.3, reasoning: "For long context processing" },
    ace: { score: 0.3, reasoning: "For multi-perspective consensus" },
    hybrid: { score: 0.3, reasoning: "Combined compression + consensus" },
    cascade: { score: 0.2, reasoning: "Full pipeline with verification" }
  };
  if (signals.contextLength > config.contextThreshold) {
    scores.rlm.score += 0.4;
    scores.rlm.reasoning = "Long context requires compression";
    scores.hybrid.score += 0.3;
    scores.direct.score -= 0.3;
  } else if (signals.contextLength < 5e3) {
    scores.direct.score += 0.2;
    scores.rlm.score -= 0.2;
  }
  if (signals.queryComplexity > config.complexityThreshold) {
    scores.ace.score += 0.3;
    scores.ace.reasoning = "High complexity benefits from consensus";
    scores.hybrid.score += 0.2;
    scores.cascade.score += 0.15;
    scores.direct.score -= 0.25;
  } else if (signals.queryComplexity < 0.3) {
    scores.direct.score += 0.3;
    scores.direct.reasoning = "Simple query - direct path optimal";
    scores.ace.score -= 0.2;
    scores.cascade.score -= 0.2;
  }
  if (signals.requiresConsensus) {
    scores.ace.score += 0.35;
    scores.ace.reasoning = "Query explicitly benefits from multiple perspectives";
    scores.hybrid.score += 0.2;
    scores.direct.score -= 0.2;
  }
  if (signals.requiresReasoning) {
    scores.rlm.score += 0.2;
    scores.hybrid.score += 0.15;
    scores.cascade.score += 0.1;
  }
  if (signals.timeBudgetMs < config.fastPathMs) {
    scores.direct.score += 0.4;
    scores.direct.reasoning = "Time constraint forces fast path";
    scores.cascade.score -= 0.3;
    scores.hybrid.score -= 0.2;
  } else if (signals.timeBudgetMs > config.hybridPathMs) {
    scores.cascade.score += 0.15;
    scores.cascade.reasoning = "Time budget allows full verification";
  }
  if (signals.qualityTarget > 0.8) {
    scores.cascade.score += 0.25;
    scores.cascade.reasoning = "High quality target requires full pipeline";
    scores.ace.score += 0.1;
    scores.direct.score -= 0.15;
  }
  if (signals.hasGroundTruth) {
    scores.ace.score += 0.15;
    scores.ace.reasoning += " (ground truth enables better verification)";
  }
  return scores;
}
function selectPath(signals, config = {}, learnedRouting) {
  const mergedConfig = { ...DEFAULT_CPB_CONFIG, ...config };
  const pathScores = scorePathsOnSignals(signals, mergedConfig);
  if (learnedRouting && learnedRouting.confidence > 0.7) {
    const preferredPath = learnedRouting.preferredPath;
    pathScores[preferredPath].score += 0.15 * learnedRouting.confidence;
    pathScores[preferredPath].reasoning += ` (learned preference: ${Math.round(learnedRouting.avgDQ * 100)}% avg DQ)`;
  }
  const sorted = Object.entries(pathScores).sort((a, b) => b[1].score - a[1].score).map(([path, { score, reasoning }]) => ({
    path,
    score,
    reasoning
  }));
  const selected = sorted[0];
  const alternatives = sorted.slice(1).map((alt) => ({
    path: alt.path,
    score: alt.score,
    tradeoff: alt.reasoning
  }));
  return {
    path: selected.path,
    signals,
    reasoning: selected.reasoning,
    confidence: calculateRoutingConfidence(sorted),
    alternatives
  };
}
function calculateRoutingConfidence(sortedPaths) {
  if (sortedPaths.length < 2) return 1;
  const topScore = sortedPaths[0].score;
  const runnerUpScore = sortedPaths[1].score;
  const gap = topScore - runnerUpScore;
  return Math.min(0.95, 0.5 + gap * 1.5);
}
function canUseDirectPath(query, context, config = {}) {
  const mergedConfig = { ...DEFAULT_CPB_CONFIG, ...config };
  const contextLength = (context?.length || 0) + query.length;
  if (contextLength > mergedConfig.contextThreshold) return false;
  const simplePatterns = [
    /^(what is|define|who is|when|where)/i,
    /^(list|show|display|get)/i,
    /navigate|go to|open/i
  ];
  return simplePatterns.some((p) => p.test(query));
}
function needsRLMPath(query, context, config = {}) {
  const mergedConfig = { ...DEFAULT_CPB_CONFIG, ...config };
  const contextLength = (context?.length || 0) + query.length;
  return contextLength > mergedConfig.contextThreshold;
}
function wouldBenefitFromConsensus(query, context) {
  const signals = extractPathSignals(query, context);
  return signals.requiresConsensus || signals.queryComplexity > 0.6;
}

// src/orchestrator.ts
var CognitivePrecisionBridge = class {
  constructor(config) {
    this.startTime = 0;
    this.config = { ...DEFAULT_CPB_CONFIG, ...config, providers: config.providers };
    this.providers = config.providers;
  }
  /**
   * Main execution entry point
   */
  async execute(request, onStatusUpdate) {
    this.startTime = Date.now();
    const updateStatus = (status) => {
      if (onStatusUpdate) {
        onStatusUpdate({
          phase: "analyzing",
          path: "direct",
          progress: 0,
          currentEngine: null,
          elapsedMs: Date.now() - this.startTime,
          estimatedRemainingMs: 0,
          ...status
        });
      }
    };
    try {
      updateStatus({
        phase: "analyzing",
        progress: 5,
        message: "Analyzing query complexity..."
      });
      const signals = extractPathSignals(request.query, request.context, this.config);
      const routing = selectPath(signals, this.config);
      const selectedPath = request.forcePath || routing.path;
      updateStatus({
        phase: "analyzing",
        path: selectedPath,
        progress: 10,
        message: `Selected path: ${selectedPath} (${Math.round(routing.confidence * 100)}% confidence)`
      });
      let result;
      switch (selectedPath) {
        case "direct":
          result = await this.executeDirect(request, signals, routing, updateStatus);
          break;
        case "rlm":
          result = await this.executeRLM(request, signals, routing, updateStatus);
          break;
        case "ace":
          result = await this.executeACE(request, signals, routing, updateStatus);
          break;
        case "hybrid":
          result = await this.executeHybrid(request, signals, routing, updateStatus);
          break;
        case "cascade":
          result = await this.executeCascade(request, signals, routing, updateStatus);
          break;
        default:
          result = await this.executeDirect(request, signals, routing, updateStatus);
      }
      if (this.config.enableVerification && !result.verified) {
        updateStatus({
          phase: "verifying",
          path: selectedPath,
          progress: 90,
          currentEngine: "dq",
          message: "Running DQ verification..."
        });
        result = await this.verifyResult(result, request);
      }
      updateStatus({
        phase: "complete",
        path: selectedPath,
        progress: 100,
        message: `Complete. DQ Score: ${result.dqScore.overall}%`
      });
      return result;
    } catch (error) {
      updateStatus({
        phase: "error",
        progress: 0,
        message: error instanceof Error ? error.message : "Unknown error"
      });
      throw error;
    }
  }
  // ============================================================================
  // PATH EXECUTORS
  // ============================================================================
  /**
   * Direct path - simple LLM call
   */
  async executeDirect(request, signals, routing, updateStatus) {
    updateStatus({
      phase: "exploring",
      path: "direct",
      progress: 30,
      message: "Executing direct query..."
    });
    const provider = this.getProvider("fast");
    const output = await this.generateWithProvider(provider, request);
    return this.buildResult(output, "direct", signals, routing, {
      tokensUsed: Math.ceil(output.length / 4)
    });
  }
  /**
   * RLM path - Recursive Language Model for long context
   */
  async executeRLM(request, signals, routing, updateStatus) {
    updateStatus({
      phase: "compressing",
      path: "rlm",
      progress: 20,
      currentEngine: "rlm",
      message: "Compressing context with RLM..."
    });
    const provider = this.getProvider("balanced");
    const chunks = this.chunkContext(request.context || "", 4e3);
    const summaries = [];
    for (let i = 0; i < chunks.length; i++) {
      updateStatus({
        phase: "compressing",
        progress: 20 + Math.round(i / chunks.length * 40),
        engineStatus: {
          phase: "processing",
          currentIteration: i + 1,
          totalIterations: chunks.length,
          nodesProcessed: i + 1,
          compressionRatio: i > 0 ? chunks.length / (i + 1) : 1
        },
        message: `Processing chunk ${i + 1}/${chunks.length}...`
      });
      const summary = await provider.generate(
        `Summarize the key points from this context:

${chunks[i]}

Provide a concise summary focusing on information relevant to: ${request.query}`,
        { temperature: 0.3 }
      );
      summaries.push(summary);
    }
    updateStatus({
      phase: "reconstructing",
      progress: 70,
      message: "Synthesizing compressed context..."
    });
    const compressedContext = summaries.join("\n\n---\n\n");
    const output = await provider.generate(
      `Based on this compressed context:

${compressedContext}

Answer the following query:
${request.query}`,
      { temperature: 0.5 }
    );
    const rlmResult = {
      output,
      compressionRatio: (request.context?.length || 0) / compressedContext.length,
      iterations: chunks.length,
      tokensProcessed: Math.ceil((request.context?.length || 0) / 4),
      executionTimeMs: Date.now() - this.startTime
    };
    return this.buildResult(output, "rlm", signals, routing, {
      rlmResult,
      tokensUsed: rlmResult.tokensProcessed
    });
  }
  /**
   * ACE path - Adaptive Consensus Engine
   */
  async executeACE(request, signals, routing, updateStatus) {
    updateStatus({
      phase: "exploring",
      path: "ace",
      progress: 20,
      currentEngine: "ace",
      message: "Gathering multi-agent perspectives..."
    });
    const provider = this.getProvider("balanced");
    const agentCount = this.config.aceConfig.agentCount;
    const perspectives = [];
    const agentVotes = {};
    const agentPersonas = [
      { name: "Analyst", prompt: "You are a rigorous analyst. Examine this objectively, focusing on data, evidence, and logical consistency. Identify patterns and draw measured conclusions:" },
      { name: "Skeptic", prompt: "You are a critical skeptic. Challenge every assumption, identify potential failure modes, edge cases, and risks. Play devil's advocate:" },
      { name: "Synthesizer", prompt: "You are a systems thinker. Find deep connections, identify emergent patterns, and propose unified frameworks that integrate multiple perspectives:" },
      { name: "Pragmatist", prompt: "You are a practical implementer. Focus on actionability, resource constraints, timelines, and real-world feasibility. What actually works?:" },
      { name: "Visionary", prompt: "You are a strategic visionary. Think long-term, consider second-order effects, identify opportunities others miss, and propose innovative directions:" }
    ];
    for (let i = 0; i < Math.min(agentCount, agentPersonas.length); i++) {
      const agent = agentPersonas[i];
      updateStatus({
        phase: "exploring",
        progress: 20 + Math.round(i / agentCount * 40),
        engineStatus: {
          phase: "gathering",
          votes: agentVotes,
          currentGap: 0
        },
        message: `Agent ${agent.name} analyzing...`
      });
      const perspective = await provider.generate(
        `${agent.prompt}

Context: ${request.context || "None provided"}

Query: ${request.query}`,
        { temperature: 0.7 }
      );
      perspectives.push(`[${agent.name}]: ${perspective}`);
      agentVotes[agent.name] = 1;
    }
    updateStatus({
      phase: "converging",
      progress: 65,
      message: "Building consensus from perspectives..."
    });
    const deepProvider = this.getProvider("deep");
    const consensus = await deepProvider.generate(
      `You are an expert consensus builder synthesizing insights from a diverse panel of experts.

## Expert Perspectives:
${perspectives.join("\n\n")}

## Your Task:
Synthesize a comprehensive, authoritative answer to: ${request.query}

Structure your response:
1. **Core Consensus**: What all experts agree on
2. **Key Insights**: Unique valuable contributions from each perspective
3. **Resolved Tensions**: How conflicting views can be reconciled
4. **Final Synthesis**: The integrated, definitive answer
5. **Confidence Assessment**: How certain is this conclusion?

Be thorough, precise, and intellectually rigorous.`,
      { temperature: 0.3 }
    );
    const agreementLevel = this.calculateAgreement(perspectives);
    const aceResult = {
      consensus,
      confidence: Math.min(0.95, 0.7 + agreementLevel * 0.25),
      agreementLevel,
      rounds: 1,
      agentVotes
    };
    return this.buildResult(consensus, "ace", signals, routing, {
      aceResult,
      tokensUsed: Math.ceil((perspectives.join("").length + consensus.length) / 4)
    });
  }
  /**
   * Hybrid path - RLM + ACE combined
   */
  async executeHybrid(request, signals, routing, updateStatus) {
    updateStatus({
      phase: "compressing",
      path: "hybrid",
      progress: 10,
      currentEngine: "rlm",
      message: "Starting hybrid: RLM compression..."
    });
    const rlmResult = await this.executeRLM(
      request,
      signals,
      routing,
      (s) => updateStatus({ ...s, progress: Math.min(s.progress || 0, 50), path: "hybrid" })
    );
    updateStatus({
      phase: "converging",
      progress: 55,
      currentEngine: "ace",
      message: "Hybrid: Running ACE consensus..."
    });
    const aceRequest = {
      ...request,
      context: rlmResult.rlmResult?.output || rlmResult.output
    };
    const aceResult = await this.executeACE(
      aceRequest,
      signals,
      routing,
      (s) => updateStatus({ ...s, progress: 55 + Math.round((s.progress || 0) * 0.4), path: "hybrid" })
    );
    return {
      ...aceResult,
      path: "hybrid",
      rlmResult: rlmResult.rlmResult,
      tokensUsed: rlmResult.tokensUsed + aceResult.tokensUsed
    };
  }
  /**
   * Cascade path - full pipeline with verification
   */
  async executeCascade(request, signals, routing, updateStatus) {
    updateStatus({
      phase: "analyzing",
      path: "cascade",
      progress: 5,
      message: "Starting cascade: full pipeline..."
    });
    const provider = this.getProvider("deep");
    updateStatus({
      phase: "exploring",
      progress: 15,
      message: "Cascade: Deep analysis..."
    });
    const analysis = await provider.generate(
      `Perform a deep analysis of this query and context.

Context: ${request.context || "None"}

Query: ${request.query}

Provide:
1. Key considerations
2. Potential approaches
3. Trade-offs
4. Recommended approach with reasoning`,
      { temperature: 0.5 }
    );
    updateStatus({
      phase: "reconstructing",
      progress: 50,
      message: "Cascade: Generating solution..."
    });
    const solution = await provider.generate(
      `Based on this analysis:

${analysis}

Provide a comprehensive answer to: ${request.query}

Be thorough, precise, and include relevant details.`,
      { temperature: 0.4 }
    );
    updateStatus({
      phase: "verifying",
      progress: 75,
      currentEngine: "dq",
      message: "Cascade: Self-verification..."
    });
    const verification = await provider.generate(
      `Review this answer for accuracy, completeness, and quality:

Original Query: ${request.query}

Answer: ${solution}

Provide:
1. Accuracy assessment (0-100)
2. Completeness assessment (0-100)
3. Any corrections or additions needed
4. Final improved answer if needed`,
      { temperature: 0.3 }
    );
    const output = verification.includes("Final improved answer") ? verification.split("Final improved answer")[1].trim() : solution;
    return this.buildResult(output, "cascade", signals, routing, {
      verified: true,
      tokensUsed: Math.ceil((analysis.length + solution.length + verification.length) / 4)
    });
  }
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  getProvider(tier) {
    const provider = this.providers[tier] || this.providers.balanced || this.providers.fast;
    if (!provider) {
      throw new Error(`No provider configured for tier: ${tier}`);
    }
    return provider;
  }
  /**
   * Calculate agreement level between agent perspectives
   * Uses simple keyword overlap as a heuristic
   */
  calculateAgreement(perspectives) {
    if (perspectives.length < 2) return 1;
    const termSets = perspectives.map((p) => {
      const words = p.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter((w) => w.length > 4);
      return new Set(words);
    });
    let totalOverlap = 0;
    let comparisons = 0;
    for (let i = 0; i < termSets.length; i++) {
      for (let j = i + 1; j < termSets.length; j++) {
        const intersection = [...termSets[i]].filter((t) => termSets[j].has(t));
        const union = /* @__PURE__ */ new Set([...termSets[i], ...termSets[j]]);
        totalOverlap += intersection.length / union.size;
        comparisons++;
      }
    }
    return comparisons > 0 ? totalOverlap / comparisons : 0.5;
  }
  async generateWithProvider(provider, request) {
    const prompt = request.context ? `Context:
${request.context}

Query: ${request.query}` : request.query;
    if (request.multimodal?.images?.length && provider.generateWithVision) {
      return provider.generateWithVision(prompt, request.multimodal.images);
    }
    return provider.generate(prompt);
  }
  chunkContext(context, chunkSize) {
    const chunks = [];
    for (let i = 0; i < context.length; i += chunkSize) {
      chunks.push(context.slice(i, i + chunkSize));
    }
    return chunks.length > 0 ? chunks : [""];
  }
  async verifyResult(result, request) {
    const provider = this.getProvider("balanced");
    const verification = await provider.generate(
      `Evaluate this response for quality:

Query: ${request.query}
Response: ${result.output}

Rate from 0-100:
1. Validity (logical soundness)
2. Specificity (actionability)
3. Correctness (accuracy)

Format: VALIDITY:XX SPECIFICITY:XX CORRECTNESS:XX`,
      { temperature: 0.2 }
    );
    const validityMatch = verification.match(/VALIDITY:\s*(\d+)/i);
    const specificityMatch = verification.match(/SPECIFICITY:\s*(\d+)/i);
    const correctnessMatch = verification.match(/CORRECTNESS:\s*(\d+)/i);
    const validity = validityMatch ? parseInt(validityMatch[1]) : 70;
    const specificity = specificityMatch ? parseInt(specificityMatch[1]) : 60;
    const correctness = correctnessMatch ? parseInt(correctnessMatch[1]) : 70;
    const overall = Math.round(validity * 0.4 + specificity * 0.3 + correctness * 0.3);
    return {
      ...result,
      verified: true,
      dqScore: {
        overall,
        validity,
        specificity,
        correctness
      }
    };
  }
  buildResult(output, path, signals, routing, extras = {}) {
    return {
      output,
      confidence: Math.round(routing.confidence * 100),
      path,
      executionTimeMs: Date.now() - this.startTime,
      tokensUsed: extras.tokensUsed || Math.ceil(output.length / 4),
      dqScore: extras.dqScore || {
        overall: 70,
        validity: 70,
        specificity: 70,
        correctness: 70
      },
      verified: extras.verified || false,
      retryCount: 0,
      rlmResult: extras.rlmResult,
      aceResult: extras.aceResult,
      pathSignals: signals,
      pathReasoning: routing.reasoning,
      patternStored: false
    };
  }
};
function createCPB(providers, config) {
  return new CognitivePrecisionBridge({ ...config, providers });
}
async function cpbExecute(providers, query, context, onStatus) {
  const cpb = createCPB(providers);
  return cpb.execute({ query, context }, onStatus);
}
var orchestrator_default = CognitivePrecisionBridge;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CognitivePrecisionBridge,
  DEFAULT_CPB_CONFIG,
  STANDARD_CPB_CONFIG,
  canUseDirectPath,
  cpbExecute,
  createCPB,
  extractPathSignals,
  needsRLMPath,
  selectPath,
  wouldBenefitFromConsensus
});
