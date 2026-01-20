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

export {
  DEFAULT_CPB_CONFIG,
  STANDARD_CPB_CONFIG
};
