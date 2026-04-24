/**
 * Intent Parser - Roteador de intenção do usuário para agentes especializados
 * 
 * Este módulo analisa a entrada do usuário e determina qual agente deve ser
 * executado baseado em matching de palavras-chave e padrões.
 * 
 * @example
 * const result = parseIntent("cria um modal de login");
 * // result: { agent: "frontend", score: 0.85, confidence: "high" }
 * 
 * @example CLI usage
 * node intent-parser.js "seu texto aqui"
 */

const agentsConfig = require('../agents/agents.json');

/**
 * Cache para regex compiladas - evita recompilar a cada chamada
 * @type {Map<string, RegExp>}
 */
const regexCache = new Map();

/**
 * Configuração de logging
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

let currentLogLevel = LOG_LEVELS.WARN;

/**
 * Logger configurável
 * @param {string} level - Nível do log
 * @param {string} message - Mensagem
 */
function log(level, message) {
  if (level <= currentLogLevel) {
    const prefix = {
      [LOG_LEVELS.ERROR]: '❌',
      [LOG_LEVELS.WARN]: '⚠️',
      [LOG_LEVELS.INFO]: 'ℹ️',
      [LOG_LEVELS.DEBUG]: '🔍'
    }[level];
    console.log(`${prefix} [IntentParser] ${message}`);
  }
}

/**
 * Define o nível de logging
 * @param {string|number} level - Nível desejado
 */
function setLogLevel(level) {
  if (typeof level === 'string') {
    currentLogLevel = LOG_LEVELS[level.toUpperCase()] ?? LOG_LEVELS.WARN;
  } else {
    currentLogLevel = level;
  }
}

/**
 * Normaliza texto para análise
 * @param {string} text - Texto de entrada
 * @returns {string[]} Array de tokens limpos
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1);
}

/**
 * Obtém ou cria regex do cache
 * @param {string} pattern - Pattern regex
 * @returns {RegExp}
 */
function getCachedRegex(pattern) {
  if (!regexCache.has(pattern)) {
    regexCache.set(pattern, new RegExp(pattern, 'gi'));
    log(LOG_LEVELS.DEBUG, `Compiled regex: ${pattern}`);
  }
  return regexCache.get(pattern);
}

/**
 * Limpa o cache de regex
 */
function clearRegexCache() {
  regexCache.clear();
  log(LOG_LEVELS.INFO, 'Regex cache cleared');
}

/**
 * Calcula score de matching entre input e agente
 * @param {string[]} tokens - Tokens do input
 * @param {object} agent - Configuração do agente
 * @returns {object} Score e contagem de matches
 */
function calculateAgentScore(tokens, agent) {
  const triggers = agent.triggers;
  let score = 0;
  let matchCount = 0;

  // Match por keywords (peso 0.15 por match)
  for (const token of tokens) {
    if (triggers.keywords.includes(token)) {
      matchCount++;
      score += 0.15;
      log(LOG_LEVELS.DEBUG, `Keyword match: "${token}" in agent ${agent.id}`);
    }
  }

  // Match por patterns (peso 0.25 por match)
  if (triggers.patterns) {
    const fullText = tokens.join(' ');
    for (const pattern of triggers.patterns) {
      const regex = getCachedRegex(pattern);
      if (regex.test(fullText)) {
        matchCount++;
        score += 0.25;
        log(LOG_LEVELS.DEBUG, `Pattern match: "${pattern}" in agent ${agent.id}`);
      }
    }
  }

  // Normalizar score (máximo 1.0)
  return {
    score: Math.min(score, 1.0),
    matchCount
  };
}

/**
 * Gera mensagem de fallback amigável
 * @param {string[]} tokens - Tokens detectados
 * @param {object[]} candidates - Candidatos próximos
 * @returns {object} Mensagem e sugestões
 */
function generateFallbackMessage(tokens, candidates) {
  const suggestions = [];
  
  const agentKeywords = {
    frontend: ['componente', 'pagina', 'estilo', 'modal', 'formulario', 'botao', 'react', 'next'],
    backend: ['api', 'rota', 'service', 'controller', 'autenticacao', 'fastify'],
    database: ['schema', 'migration', 'banco', 'tabela', 'prisma'],
    testing: ['teste', 'coverage', 'vitest', 'spec', 'mock'],
    review: ['revisar', 'refatorar', 'corrigir', 'bug', 'quality'],
    explore: ['analisar', 'estrutura', 'entender', 'mapa', 'arquitetura'],
    security: ['seguranca', 'vulnerabilidade', 'auth', 'token', 'audit']
  };

  for (const [agentId, keywords] of Object.entries(agentKeywords)) {
    const matches = tokens.filter(t => keywords.includes(t));
    if (matches.length > 0) {
      suggestions.push({
        agent: agentId,
        matchedKeyword: matches[0],
        suggestion: `Você quis dizer "${agentId}"? Use: "${matches[0]}"`
      });
    }
  }

  // Se não há sugestões claras, oferece lista completa
  if (suggestions.length === 0) {
    return {
      message: `Não consegui identificar o agente adequado para sua solicitação.`,
      help: `Dica: seja mais específico. Exemplos:`,
      examples: [
        '"cria um modal" → Frontend',
        '"cria uma API" → Backend',
        '"cria uma migration" → Database',
        '"escreve testes" → Testing',
        '"revisar código" → Review',
        '"como funciona" → Explore',
        '"audita segurança" → Security'
      ],
      candidates: candidates.slice(0, 3).map(c => ({
        agent: c.agentId,
        score: c.score
      })),
      suggestions: []
    };
  }

  return {
    message: `Não consegui identificar exatamente o que você precisa.`,
    help: `Baseado nas palavras detectadas:`,
    suggestions: suggestions.slice(0, 3),
    candidates: candidates.slice(0, 3).map(c => ({
      agent: c.agentId,
      score: c.score
    }))
  };
}

/**
 * Analisa o input e determina o agente mais adequado
 * @param {string} input - Texto do usuário
 * @param {object} options - Opções adicionais
 * @param {boolean} options.verbose - Ativa logging detalhado
 * @returns {object} Resultado do parsing
 */
function parseIntent(input, options = {}) {
  const { verbose = false } = options;
  
  if (verbose) setLogLevel(LOG_LEVELS.DEBUG);
  
  if (!input || typeof input !== 'string') {
    return {
      agent: null,
      score: 0,
      confidence: 'none',
      candidates: [],
      error: 'Input inválido: forneça uma string não vazia'
    };
  }

  const cleanInput = input.trim();
  log(LOG_LEVELS.INFO, `Parsing input: "${cleanInput}"`);

  const tokens = tokenize(cleanInput);
  const threshold = agentsConfig.orchestrator.threshold || 0.4;
  
  log(LOG_LEVELS.DEBUG, `Tokens: [${tokens.join(', ')}]`);
  
  const scores = [];

  // Calcular score para cada agente
  for (const [agentId, agent] of Object.entries(agentsConfig.agents)) {
    const { score, matchCount } = calculateAgentScore(tokens, agent);
    
    if (score > 0) {
      const confidence = score >= 0.6 ? 'high' : score >= threshold ? 'medium' : 'low';
      scores.push({
        agentId,
        agent,
        score,
        matchCount,
        confidence
      });
      log(LOG_LEVELS.INFO, `Agent ${agentId}: score=${score.toFixed(2)}, confidence=${confidence}, matches=${matchCount}`);
    }
  }

  // Ordenar por score (maior primeiro)
  scores.sort((a, b) => b.score - a.score);

  // Resultado principal
  const primary = scores[0];

  // Se não há matches acima do threshold
  if (!primary || primary.score < threshold) {
    const fallback = generateFallbackMessage(tokens, scores);
    return {
      agent: null,
      score: 0,
      confidence: 'none',
      candidates: scores.slice(0, 5),
      needsUserConfirmation: true,
      ...fallback
    };
  }

  // Se há múltiplos candidatos com scores próximos
  const scoreGap = scores.length > 1 ? scores[0].score - scores[1].score : 1;
  const multipleCandidates = scores.length > 1 && scoreGap < 0.2 && scores[1].score >= threshold;

  if (multipleCandidates) {
    log(LOG_LEVELS.WARN, `Multiple candidates detected: ${scores[0].agentId} vs ${scores[1].agentId}`);
    return {
      agent: primary.agentId,
      score: primary.score,
      confidence: primary.confidence,
      candidates: scores.slice(0, 3),
      needsUserConfirmation: true,
      clarification: `Detevei múltiplos agentes possíveis para "${cleanInput}":`,
      options: scores.slice(0, 3).map(c => ({
        agent: c.agentId,
        name: c.agent.name,
        score: c.score
      }))
    };
  }

  log(LOG_LEVELS.INFO, `Selected agent: ${primary.agentId} (score: ${primary.score.toFixed(2)})`);

  return {
    agent: primary.agentId,
    agentName: primary.agent.name,
    agentDescription: primary.agent.description,
    score: primary.score,
    confidence: primary.confidence,
    candidates: scores.slice(0, 3).map(c => ({
      agent: c.agentId,
      score: c.score,
      confidence: c.confidence
    })),
    needsUserConfirmation: false,
    routing: {
      subagentType: primary.agent.subagentType,
      paths: primary.agent.paths,
      tools: primary.agent.tools,
      prompt: getPromptPath(primary.agentId),
      skills: primary.agent.skills || []
    }
  };
}

/**
 * Retorna o caminho do prompt especializado
 * @param {string} agentId 
 * @returns {string}
 */
function getPromptPath(agentId) {
  return `.orchestrator/agents/prompts/${agentId}.md`;
}

/**
 * Lista todos os agentes disponíveis
 * @returns {object[]}
 */
function listAgents() {
  return Object.entries(agentsConfig.agents).map(([id, agent]) => ({
    id,
    name: agent.name,
    description: agent.description,
    triggers: agent.triggers.keywords.slice(0, 8),
    patternsCount: agent.triggers.patterns?.length || 0
  }));
}

/**
 * Histórico de sessions em memória
 */
class SessionHistory {
  constructor() {
    this.sessions = {};
  }

  /**
   * Adiciona entrada ao histórico
   * @param {string} sessionId 
   * @param {object} entry 
   */
  addEntry(sessionId, entry) {
    if (!this.sessions[sessionId]) {
      this.sessions[sessionId] = [];
    }
    this.sessions[sessionId].push({
      timestamp: new Date().toISOString(),
      ...entry
    });
  }

  /**
   * Obtém histórico de uma sessão
   * @param {string} sessionId 
   * @returns {object[]}
   */
  getHistory(sessionId) {
    return this.sessions[sessionId] || [];
  }

  /**
   * Limpa histórico de uma sessão
   * @param {string} sessionId 
   */
  clearSession(sessionId) {
    delete this.sessions[sessionId];
  }

  /**
   * Retorna estatísticas de uso
   * @returns {object}
   */
  getStats() {
    const stats = {
      totalSessions: Object.keys(this.sessions).length,
      agentUsage: {}
    };

    for (const sessionEntries of Object.values(this.sessions)) {
      for (const entry of sessionEntries) {
        if (entry.agent) {
          stats.agentUsage[entry.agent] = (stats.agentUsage[entry.agent] || 0) + 1;
        }
      }
    }

    return stats;
  }
}

// Instância global para compartilhamento
const globalHistory = new SessionHistory();

module.exports = {
  parseIntent,
  listAgents,
  getPromptPath,
  SessionHistory,
  globalHistory,
  calculateAgentScore,
  tokenize,
  setLogLevel,
  clearRegexCache,
  LOG_LEVELS
};

// Para uso via CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const verbose = args.includes('--verbose') || args.includes('-v');
  const list = args.includes('--list') || args.includes('-l');
  const input = args.filter(a => !a.startsWith('--') && !a.startsWith('-')).join(' ');

  if (list) {
    console.log('📋 Agentes Disponíveis:\n');
    listAgents().forEach(agent => {
      console.log(`┌─ ${agent.id}`);
      console.log(`│  Nome: ${agent.name}`);
      console.log(`│  Descrição: ${agent.description}`);
      console.log(`│  Triggers: ${agent.triggers.join(', ')}`);
      console.log(`│  Patterns: ${agent.patternsCount}`);
      console.log(`└────────────────────────────────────────`);
    });
    process.exit(0);
  }

  if (!input) {
    console.log('🤖 Intent Parser - Roteador de Agentes\n');
    console.log('Uso:');
    console.log('  node intent-parser.js "sua mensagem aqui"');
    console.log('  node intent-parser.js --list          # Lista agentes');
    console.log('  node intent-parser.js --verbose "msg"  # Modo debug\n');
    console.log('Exemplos:');
    console.log('  node intent-parser.js "cria um modal"');
    console.log('  node intent-parser.js "escreve testes"');
    console.log('  node intent-parser.js "audita segurança"\n');
    process.exit(0);
  }

  const result = parseIntent(input, { verbose });
  console.log(JSON.stringify(result, null, 2));
}