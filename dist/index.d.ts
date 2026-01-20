import { CPBConfig, CPBRequest, CPBStatusCallback, CPBResult } from './types.js';
export { ACEResult, CPBPath, CPBPattern, CPBPhase, CPBProvider, CPBStatus, DEFAULT_CPB_CONFIG, DQScore, GenerateOptions, ImageInput, LearnedRouting, ModelTier, MultimodalContent, PathSignals, RLMResult, RLMStatus, RoutingDecision, STANDARD_CPB_CONFIG } from './types.js';
export { canUseDirectPath, extractPathSignals, needsRLMPath, selectPath, wouldBenefitFromConsensus } from './router.js';

/**
 * Cognitive Precision Bridge - Orchestrator
 *
 * Main coordinator that routes queries through optimal paths
 * and manages the precision-aware execution pipeline.
 *
 * The CPB pattern: COMPRESS → PRE-COMPUTE → PARALLEL EXPLORE → ACCUMULATE → RECONSTRUCT → VERIFY
 */

declare class CognitivePrecisionBridge {
    private config;
    private providers;
    private startTime;
    constructor(config: Partial<CPBConfig> & {
        providers: CPBConfig['providers'];
    });
    /**
     * Main execution entry point
     */
    execute(request: CPBRequest, onStatusUpdate?: CPBStatusCallback): Promise<CPBResult>;
    /**
     * Direct path - simple LLM call
     */
    private executeDirect;
    /**
     * RLM path - Recursive Language Model for long context
     */
    private executeRLM;
    /**
     * ACE path - Adaptive Consensus Engine
     */
    private executeACE;
    /**
     * Hybrid path - RLM + ACE combined
     */
    private executeHybrid;
    /**
     * Cascade path - full pipeline with verification
     */
    private executeCascade;
    private getProvider;
    /**
     * Calculate agreement level between agent perspectives
     * Uses simple keyword overlap as a heuristic
     */
    private calculateAgreement;
    private generateWithProvider;
    private chunkContext;
    private verifyResult;
    private buildResult;
}
/**
 * Create a CPB instance with providers
 */
declare function createCPB(providers: CPBConfig['providers'], config?: Partial<Omit<CPBConfig, 'providers'>>): CognitivePrecisionBridge;
/**
 * Quick execute with minimal configuration
 */
declare function cpbExecute(providers: CPBConfig['providers'], query: string, context?: string, onStatus?: CPBStatusCallback): Promise<CPBResult>;

export { CPBConfig, CPBRequest, CPBResult, CPBStatusCallback, CognitivePrecisionBridge, cpbExecute, createCPB, CognitivePrecisionBridge as default };
