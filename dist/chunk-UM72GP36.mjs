import {
  DEFAULT_CPB_CONFIG
} from "./chunk-B54MZPSF.mjs";

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
var router_default = {
  extractPathSignals,
  selectPath,
  canUseDirectPath,
  needsRLMPath,
  wouldBenefitFromConsensus
};

export {
  extractPathSignals,
  selectPath,
  canUseDirectPath,
  needsRLMPath,
  wouldBenefitFromConsensus,
  router_default
};
