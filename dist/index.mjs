import {
  canUseDirectPath,
  extractPathSignals,
  needsRLMPath,
  selectPath,
  wouldBenefitFromConsensus
} from "./chunk-UM72GP36.mjs";
import {
  DEFAULT_CPB_CONFIG,
  STANDARD_CPB_CONFIG
} from "./chunk-B54MZPSF.mjs";

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
export {
  CognitivePrecisionBridge,
  DEFAULT_CPB_CONFIG,
  STANDARD_CPB_CONFIG,
  canUseDirectPath,
  cpbExecute,
  createCPB,
  orchestrator_default as default,
  extractPathSignals,
  needsRLMPath,
  selectPath,
  wouldBenefitFromConsensus
};
