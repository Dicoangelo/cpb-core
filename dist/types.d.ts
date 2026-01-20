/**
 * Cognitive Precision Bridge (CPB) - Types
 *
 * Unifies LLM orchestration into a single precision-aware pipeline.
 *
 * The CPB pattern: COMPRESS → PRE-COMPUTE → PARALLEL EXPLORE → ACCUMULATE → RECONSTRUCT → VERIFY
 *
 * Based on:
 * - arXiv:2512.24601 (RLM) - Context externalization
 * - arXiv:2511.15755 (DQ) - Quality measurement
 * - arXiv:2508.17536 (Voting vs Debate) - Consensus strategies
 */
/**
 * Available execution paths through the CPB
 */
type CPBPath = 'direct' | 'rlm' | 'ace' | 'hybrid' | 'cascade';
/**
 * Characteristics that determine optimal path
 */
interface PathSignals {
    contextLength: number;
    queryComplexity: number;
    requiresConsensus: boolean;
    requiresReasoning: boolean;
    hasGroundTruth: boolean;
    timeBudgetMs: number;
    qualityTarget: number;
}
/**
 * Abstract provider interface - implement for your LLM provider
 */
interface CPBProvider {
    name: string;
    generate(prompt: string, options?: GenerateOptions): Promise<string>;
    generateWithVision?(prompt: string, images: ImageInput[], options?: GenerateOptions): Promise<string>;
    isConfigured(): boolean;
}
interface GenerateOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
}
/**
 * CPB orchestrator configuration
 */
interface CPBConfig {
    providers: {
        fast?: CPBProvider;
        balanced?: CPBProvider;
        deep?: CPBProvider;
    };
    autoRoute: boolean;
    defaultPath: CPBPath;
    contextThreshold: number;
    complexityThreshold: number;
    dqThreshold: number;
    fastPathMs: number;
    standardPathMs: number;
    hybridPathMs: number;
    enableVerification: boolean;
    enableLearning: boolean;
    retryOnLowDQ: boolean;
    rlmConfig: {
        maxIterations: number;
        rootModel: string;
        subModel: string;
    };
    aceConfig: {
        maxRounds: number;
        agentCount: number;
        enableAuction: boolean;
        enableHopGrouping: boolean;
    };
}
/**
 * Default CPB configuration - ELITE TIER
 * Optimized for maximum reasoning quality with Opus-first routing
 */
declare const DEFAULT_CPB_CONFIG: Omit<CPBConfig, 'providers'>;
/**
 * Standard tier configuration (for cost-conscious usage)
 */
declare const STANDARD_CPB_CONFIG: Omit<CPBConfig, 'providers'>;
/**
 * CPB execution phase
 */
type CPBPhase = 'idle' | 'analyzing' | 'compressing' | 'exploring' | 'converging' | 'verifying' | 'reconstructing' | 'complete' | 'error';
/**
 * DQ (Decisional Quality) Score
 */
interface DQScore {
    overall: number;
    validity: number;
    specificity: number;
    correctness: number;
    breakdown?: {
        reasoning?: string;
        gaps?: string[];
        strengths?: string[];
    };
}
/**
 * RLM (Recursive Language Model) Status
 */
interface RLMStatus {
    phase: 'decomposing' | 'processing' | 'synthesizing';
    currentIteration: number;
    totalIterations: number;
    nodesProcessed: number;
    compressionRatio: number;
}
/**
 * RLM Result
 */
interface RLMResult {
    output: string;
    compressionRatio: number;
    iterations: number;
    tokensProcessed: number;
    executionTimeMs: number;
}
/**
 * ACE (Adaptive Consensus Engine) Result
 */
interface ACEResult {
    consensus: string;
    confidence: number;
    agreementLevel: number;
    rounds: number;
    agentVotes: Record<string, number>;
    dissent?: string[];
}
/**
 * Real-time status updates
 */
interface CPBStatus {
    phase: CPBPhase;
    path: CPBPath;
    progress: number;
    currentEngine: 'rlm' | 'ace' | 'dq' | null;
    engineStatus?: RLMStatus | {
        phase: string;
        votes: Record<string, number>;
        currentGap: number;
    };
    elapsedMs: number;
    estimatedRemainingMs: number;
    message?: string;
}
/**
 * Final CPB result
 */
interface CPBResult {
    output: string;
    confidence: number;
    path: CPBPath;
    executionTimeMs: number;
    tokensUsed: number;
    dqScore: DQScore;
    verified: boolean;
    retryCount: number;
    rlmResult?: RLMResult;
    aceResult?: ACEResult;
    pathSignals: PathSignals;
    pathReasoning: string;
    patternStored: boolean;
}
/**
 * Path selection decision with reasoning
 */
interface RoutingDecision {
    path: CPBPath;
    signals: PathSignals;
    reasoning: string;
    confidence: number;
    alternatives: {
        path: CPBPath;
        score: number;
        tradeoff: string;
    }[];
}
/**
 * Multimodal content types
 */
interface ImageInput {
    base64: string;
    mediaType: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp';
    description?: string;
}
interface MultimodalContent {
    text?: string;
    images?: ImageInput[];
    audio?: {
        base64: string;
        mimeType: string;
    };
}
/**
 * Model tier selection
 */
type ModelTier = 'fast' | 'balanced' | 'deep' | 'auto';
/**
 * Input request to CPB
 */
interface CPBRequest {
    query: string;
    context?: string;
    multimodal?: MultimodalContent;
    forcePath?: CPBPath;
    forceTier?: ModelTier;
    timeBudgetMs?: number;
    qualityTarget?: number;
    agent?: {
        id: string;
        name: string;
        expertise?: string[];
    };
}
/**
 * Historical execution pattern
 */
interface CPBPattern {
    id: string;
    queryHash: string;
    timestamp: number;
    contextLength: number;
    queryComplexity: number;
    path: CPBPath;
    executionTimeMs: number;
    tokensUsed: number;
    dqScore: number;
    verified: boolean;
    success: boolean;
    retries: number;
}
/**
 * Learned routing preferences
 */
interface LearnedRouting {
    domain: string;
    preferredPath: CPBPath;
    avgDQ: number;
    avgTime: number;
    sampleCount: number;
    confidence: number;
}
type CPBStatusCallback = (status: CPBStatus) => void;

export { type ACEResult, type CPBConfig, type CPBPath, type CPBPattern, type CPBPhase, type CPBProvider, type CPBRequest, type CPBResult, type CPBStatus, type CPBStatusCallback, DEFAULT_CPB_CONFIG, type DQScore, type GenerateOptions, type ImageInput, type LearnedRouting, type ModelTier, type MultimodalContent, type PathSignals, type RLMResult, type RLMStatus, type RoutingDecision, STANDARD_CPB_CONFIG };
