#Fluxo de Sincronização do Estoque CD

##Visão Geral

Este documento descreve o fluxo para buscar o arquivo do Excel com o estoque do Centro de Distribuição (CD) a partir da rede compartilhada e sincronizar com o banco de dados.

##Caminho de Rede

- Path: `\\192.168.0.247\onedrive\Consolidado`
- Autenticação: Não requerida

##Fluxo de Execução

###1. Calcular Semana Atual do Mês

```typescript
function getSemanaAtual(): number {
  const hoje = new Date();
  const dia = hoje.getDate();
  return Math.ceil(dia / 7); // 1-5
}
```

Exemplo:
- 01-07 = Semana 1
- 08-14 = Semana 2
- 15-21 = Semana 3 (atual: 17/04/2026)
- 22-28 = Semana 4
- 29-31 = Semana 5

###2. Listar Arquivos na Rede

Pasta: `\\192.168.0.247\onedrive\Consolidado`

Padrões de busca (em ordem):
1. `Centralizador {semana} Sem *Abril*.xlsm`
2. `Centralizador {semana} Sem *Abr*.xlsm`
3. `Centralizador {semana} Sem **.xlsm`
4. `Centralizador*.xlsm` (fallback - usar mais recente)

Exemplo para semana 3 (17/04/2026):
- `Centralizador 3 Sem Abril*.xlsm`
- `Centralizador 3 Sem Abr*.xlsm`
- `Centralizador 3 Sem *.xlsm`

###3. Selecionar Arquivo

Critérios de seleção (em ordem):
1. Filtrar arquivos que correspondem ao padrão
2. Ordenar por data de modificação (mais recente primeiro)
3. Selecionar o primeiro

###4. Copiar para api/data/

Arquivo de destino: `api/data/Centralizador.xlsm`

Operação:
- Se arquivo já existe, deletar primeiro
- Copiar arquivo da rede para destino
- Substituir arquivo existente

###5. Executar Sincronização

A sincronização existente lê o arquivo de `api/data/Centralizador.xlsm`,
busca a worksheet "Estoque CD" e atualiza o campo `stockCD` na tabela de produtos.

##Variáveis de Ambiente

```env
# Path raiz onde ficam os arquivos no servidor de rede
CD_NETWORK_PATH=\\192.168.0.247\onedrive\Consolidado
```

##API Endpoints

| Método | Path | Descrição |
|-------|------|----------|
| POST | /cd-stock/sync | Sincroniza usando arquivo existente |
| POST | /cd-stock/sync-and-copy | Copia da rede + sincroniza |

##Nomenclatura do Arquivo

O arquivo do Excel segue o padrão:
```
Centralizador [Semana] Sem [Mês] [Ano].xlsm
```

Exemplos de nomes válidos:
- `Centralizador 1 Sem Janeiro 2026.xlsm`
- `Centralizador 2 Sem Fev 2026.xlsm`
- `Centralizador 3 Sem Abril 2026.xlsm`
- `Centralizador 4 Sem Mai.xlsm`
- `Centralizador 5 Sem Agosto 2026.xlsm`

Meses aceitos (inteiro ou abreviado):
- Janeiro / Jan
- Fevereiro / Fev
- Março / Mar
- Abril / Abr
- Maio / Mai
- Junho / Jun
- Julho / Jul
- Agosto / Ago
- Setembro / Set
- Outubro / Out
- Novembro / Nov
- Dezembro / Dez

##Dependências

- Node.js (fs, path)
- Biblioteca: xlsx (para ler Excel)
- Acesso à rede compartilhada

##Logs

O sistema deve registrar:
- Arquivo encontrado na rede (nome)
- Data de modificação do arquivo
- Arquivo copiado com sucesso
- Quantidade de produtos sincronizados
- Produtos não encontrados

##Erros Comuns

| Erro | Causa | Solução |
|------|------|--------|
| Arquivo não encontrado | Path inalcançável | Verificar conexão de rede |
| Nenhum arquivo com padrão | Arquivo ainda não criado | Aguardar criação do arquivo |
| Permissão negada | Arquivo em uso | Verificar se arquivo está aberto |
| Worksheet não encontrada | Formato inválido | Verificar se arquivo Excel é válido |

##Agendamento Sugerido

Executar o sync diariamente às 6:00 (ou conforme necessidade):

```bash
# Crontab exemplo (Linux)
0 6 * * * curl -X POST http://localhost:3333/cd-stock/sync-and-copy
```