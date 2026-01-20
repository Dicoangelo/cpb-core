import { CPBConfig, PathSignals, LearnedRouting, RoutingDecision } from './types.js';

/**
 * Cognitive Precision Bridge - Router
 *
 * Intelligent path selection based on query characteristics.
 * Determines whether to use RLM, ACE, Hybrid, or Direct path.
 *
 * Routing Logic:
 * - Direct: Simple queries, short context, high time pressure
 * - RLM: Long context requiring compression and exploration
 * - ACE: Multi-perspective decision requiring consensus
 * - Hybrid: Complex queries needing both compression and consensus
 * - Cascade: Expert tasks requiring full pipeline verification
 */

/**
 * Extract path-determining signals from request
 */
declare function extractPathSignals(query: string, context?: string, config?: Partial<CPBConfig>): PathSignals;
/**
 * Select optimal path based on signals
 */
declare function selectPath(signals: PathSignals, config?: Partial<CPBConfig>, learnedRouting?: LearnedRouting): RoutingDecision;
/**
 * Quick check if direct path is sufficient
 */
declare function canUseDirectPath(query: string, context?: string, config?: Partial<CPBConfig>): boolean;
/**
 * Check if RLM path is needed
 */
declare function needsRLMPath(query: string, context?: string, config?: Partial<CPBConfig>): boolean;
/**
 * Check if ACE consensus would help
 */
declare function wouldBenefitFromConsensus(query: string, context?: string): boolean;
declare const _default: {
    extractPathSignals: typeof extractPathSignals;
    selectPath: typeof selectPath;
    canUseDirectPath: typeof canUseDirectPath;
    needsRLMPath: typeof needsRLMPath;
    wouldBenefitFromConsensus: typeof wouldBenefitFromConsensus;
};

export { canUseDirectPath, _default as default, extractPathSignals, needsRLMPath, selectPath, wouldBenefitFromConsensus };
