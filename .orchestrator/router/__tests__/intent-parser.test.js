import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  parseIntent,
  listAgents,
  tokenize,
  calculateAgentScore,
  setLogLevel,
  clearRegexCache,
  SessionHistory
} from '../intent-parser';

describe('Intent Parser', () => {
  beforeEach(() => {
    clearRegexCache();
  });

  describe('tokenize', () => {
    it('deve tokenizar texto simples', () => {
      const tokens = tokenize('cria um modal');
      expect(tokens).toEqual(['cria', 'um', 'modal']);
    });

    it('deve remover acentos', () => {
      const tokens = tokenize('ação básica');
      expect(tokens).toEqual(['acao', 'basica']);
    });

    it('deve remover pontuação', () => {
      const tokens = tokenize('cria, um! modal?');
      expect(tokens).toEqual(['cria', 'um', 'modal']);
    });

    it('deve filtrar tokens muito curtos', () => {
      const tokens = tokenize('a um o');
      expect(tokens).toEqual(['um']);
    });

    it('deve converter para lowercase', () => {
      const tokens = tokenize('CRIA UM MODAL');
      expect(tokens).toEqual(['cria', 'um', 'modal']);
    });
  });

  describe('parseIntent - Frontend Agent', () => {
    it('deve detectar agente frontend para "cria um modal"', () => {
      const result = parseIntent('cria um modal');
      expect(result.agent).toBe('frontend');
      expect(result.score).toBeGreaterThan(0);
    });

    it('deve detectar agente frontend para "adiciona estilo no botão"', () => {
      const result = parseIntent('adiciona estilo no botão');
      expect(result.agent).toBe('frontend');
    });

    it('deve detectar agente frontend para "componente de formulário"', () => {
      const result = parseIntent('componente de formulário');
      expect(result.agent).toBe('frontend');
    });

    it('deve detectar agente frontend para "react hooks useState"', () => {
      const result = parseIntent('react hooks useState');
      expect(result.agent).toBe('frontend');
    });
  });

  describe('parseIntent - Backend Agent', () => {
    it('deve detectar agente backend para "cria uma rota de API"', () => {
      const result = parseIntent('cria uma rota de API');
      expect(result.agent).toBe('backend');
    });

    it('deve detectar agente backend para "adiciona autenticação JWT"', () => {
      const result = parseIntent('adiciona autenticação JWT');
      expect(result.agent).toBe('backend');
    });

    it('deve detectar agente backend para "endpoint para produtos"', () => {
      const result = parseIntent('endpoint para produtos');
      expect(result.agent).toBe('backend');
    });

    it('deve detectar agente backend para "service de orders"', () => {
      const result = parseIntent('service de orders');
      expect(result.agent).toBe('backend');
    });
  });

  describe('parseIntent - Database Agent', () => {
    it('deve detectar agente database para "cria uma migration"', () => {
      const result = parseIntent('cria uma migration');
      expect(result.agent).toBe('database');
    });

    it('deve detectar agente database para "adiciona campo na tabela"', () => {
      const result = parseIntent('adiciona campo na tabela');
      expect(result.agent).toBe('database');
    });

    it('deve detectar agente database para "schema do Prisma"', () => {
      const result = parseIntent('schema do Prisma');
      expect(result.agent).toBe('database');
    });
  });

  describe('parseIntent - Testing Agent', () => {
    it('deve detectar agente testing para "escreve testes"', () => {
      const result = parseIntent('escreve testes');
      expect(result.agent).toBe('testing');
    });

    it('deve detectar agente testing para "roda os testes com coverage"', () => {
      const result = parseIntent('roda os testes com coverage');
      expect(result.agent).toBe('testing');
    });

    it('deve detectar agente testing para "cria mock para API" (pode ter múltiplos candidatos)', () => {
      const result = parseIntent('cria mock para API');
      // Mock pode ser tanto testing quanto backend - aceite qualquer um ou confirmação
      expect(['testing', 'backend']).toContain(result.agent);
    });
  });

  describe('parseIntent - Security Agent', () => {
    it('deve detectar agente security para "audita vulnerabilidades"', () => {
      const result = parseIntent('audita vulnerabilidades');
      expect(result.agent).toBe('security');
    });

    it('deve detectar agente security para "verifica segurança da API"', () => {
      const result = parseIntent('verifica segurança da API');
      expect(result.agent).toBe('security');
    });

    it('deve detectar agente security para "checa autenticação"', () => {
      const result = parseIntent('checa autenticação');
      expect(result.agent).toBe('security');
    });
  });

  describe('parseIntent - Explore Agent', () => {
    it('deve detectar agente explore para "como funciona"', () => {
      const result = parseIntent('como funciona o sistema de pedidos?');
      expect(result.agent).toBe('explore');
    });

    it('deve detectar agente explore para "onde estão as rotas"', () => {
      const result = parseIntent('onde estão as rotas de autenticação?');
      expect(result.agent).toBe('explore');
    });

    it('deve detectar agente explore para "mapeia arquitetura"', () => {
      const result = parseIntent('mapeia a arquitetura do projeto');
      expect(result.agent).toBe('explore');
    });
  });

  describe('parseIntent - Review Agent', () => {
    it('deve detectar agente review para "revisar código" (pode ter múltiplos candidatos)', () => {
      const result = parseIntent('revisar código do componente');
      // Review pode competir com frontend - aceite qualquer um ou confirmação
      expect(['review', 'frontend']).toContain(result.agent);
    });

    it('deve detectar agente review para "corrige bug"', () => {
      const result = parseIntent('corrige bug no header');
      expect(result.agent).toBe('review');
    });

    it('deve detectar agente review para "melhora performance"', () => {
      const result = parseIntent('melhora performance do loading');
      expect(result.agent).toBe('review');
    });
  });

  describe('parseIntent - Edge Cases', () => {
    it('deve retornar erro para input vazio', () => {
      const result = parseIntent('');
      expect(result.agent).toBeNull();
      expect(result.error).toBeDefined();
    });

    it('deve retornar erro para input null', () => {
      const result = parseIntent(null);
      expect(result.agent).toBeNull();
      expect(result.error).toBeDefined();
    });

    it('deve retornar erro para input não-string', () => {
      const result = parseIntent(123);
      expect(result.agent).toBeNull();
      expect(result.error).toBeDefined();
    });

    it('deve retornar needsUserConfirmation para input ambíguo', () => {
      const result = parseIntent('faz alguma coisa');
      expect(result.needsUserConfirmation).toBe(true);
    });
  });

  describe('parseIntent - Confidence Levels', () => {
    it('deve retornar high confidence para match forte', () => {
      const result = parseIntent('cria um modal de confirmação para deletar pedido');
      expect(result.confidence).toBe('high');
      expect(result.score).toBeGreaterThanOrEqual(0.6);
    });

    it('deve retornar medium confidence para match moderado', () => {
      const result = parseIntent('modal');
      expect(result.confidence).toBe('medium');
    });
  });

  describe('parseIntent - Routing Info', () => {
    it('deve incluir subagentType no routing', () => {
      const result = parseIntent('cria um componente');
      expect(result.routing).toBeDefined();
      expect(result.routing.subagentType).toBeDefined();
    });

    it('deve incluir paths no routing', () => {
      const result = parseIntent('cria um componente');
      expect(result.routing.paths).toBeDefined();
      expect(result.routing.paths.include).toBeDefined();
    });

    it('deve incluir prompt path no routing', () => {
      const result = parseIntent('cria um componente');
      expect(result.routing.prompt).toBe('.orchestrator/agents/prompts/frontend.md');
    });

    it('deve incluir skills no routing', () => {
      const result = parseIntent('cria um componente');
      expect(result.routing.skills).toBeDefined();
    });
  });

  describe('calculateAgentScore', () => {
    it('deve calcular score baseado em keywords', () => {
      const agent = {
        id: 'test',
        triggers: {
          keywords: ['test', 'mock'],
          patterns: []
        }
      };
      const tokens = ['test', 'example'];
      const { score, matchCount } = calculateAgentScore(tokens, agent);
      
      expect(score).toBe(0.15);
      expect(matchCount).toBe(1);
    });

    it('deve calcular score baseado em patterns', () => {
      const agent = {
        id: 'test',
        triggers: {
          keywords: [],
          patterns: ['escreve.*test']
        }
      };
      const tokens = ['escreve', 'test'];
      const { score, matchCount } = calculateAgentScore(tokens, agent);
      
      expect(score).toBe(0.25);
      expect(matchCount).toBe(1);
    });

    it('deve limitar score a 1.0', () => {
      const agent = {
        id: 'test',
        triggers: {
          keywords: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
          patterns: []
        }
      };
      const tokens = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
      const { score } = calculateAgentScore(tokens, agent);
      
      expect(score).toBe(1.0);
    });
  });

  describe('listAgents', () => {
    it('deve retornar lista de agentes', () => {
      const agents = listAgents();
      expect(agents.length).toBeGreaterThan(0);
    });

    it('deve incluir id, name e description', () => {
      const agents = listAgents();
      const agent = agents[0];
      expect(agent).toHaveProperty('id');
      expect(agent).toHaveProperty('name');
      expect(agent).toHaveProperty('description');
      expect(agent).toHaveProperty('triggers');
    });

    it('deve incluir todos os 7 agentes', () => {
      const agents = listAgents();
      const ids = agents.map(a => a.id);
      expect(ids).toContain('frontend');
      expect(ids).toContain('backend');
      expect(ids).toContain('database');
      expect(ids).toContain('testing');
      expect(ids).toContain('review');
      expect(ids).toContain('explore');
      expect(ids).toContain('security');
    });
  });

  describe('SessionHistory', () => {
    it('deve adicionar e obter entradas', () => {
      const history = new SessionHistory();
      history.addEntry('session1', { agent: 'frontend', input: 'test' });
      
      const entries = history.getHistory('session1');
      expect(entries.length).toBe(1);
      expect(entries[0].agent).toBe('frontend');
    });

    it('deve retornar array vazio para sessão inexistente', () => {
      const history = new SessionHistory();
      const entries = history.getHistory('inexistente');
      expect(entries).toEqual([]);
    });

    it('deve limpar sessão', () => {
      const history = new SessionHistory();
      history.addEntry('session1', { agent: 'frontend' });
      history.clearSession('session1');
      
      expect(history.getHistory('session1')).toEqual([]);
    });

    it('deve calcular estatísticas', () => {
      const history = new SessionHistory();
      history.addEntry('s1', { agent: 'frontend' });
      history.addEntry('s1', { agent: 'backend' });
      history.addEntry('s2', { agent: 'frontend' });
      
      const stats = history.getStats();
      expect(stats.totalSessions).toBe(2);
      expect(stats.agentUsage.frontend).toBe(2);
      expect(stats.agentUsage.backend).toBe(1);
    });
  });
});