# ESPECIFICAÇÃO FUNCIONAL
## Sistema de Gestão de Demandas - Lecom Facilities

**Versão:** 1.0  
**Data:** 27 de maio de 2026  
**Ambiente:** React 18 + TypeScript + Vite  
**Base de Dados:** localStorage (simulado)

---

## 1. VISÃO GERAL DO SISTEMA

O sistema gerencia o ciclo de vida completo de demandas de serviços para instituições de saúde, educação e corporativas. O fluxo inicia com a solicitação do serviço, passa por análise técnica e aprovação gerencial, e pode resultar em chamado para suprimentos ou rejeição.

---

## 2. ATORES DO SISTEMA

| Papel | Nome | Email | Descrição | Permissões |
|-------|------|-------|-----------|-----------|
| **SOLICITANTE** | Varia por demanda | - | Pessoa que abre a demanda inicial | Criar demandas, responder complementações |
| **LEONARDO** | Adriana | adriana@empresa.com | Engenharia Corporativa | Editar demandas (segmento/mão de obra), classificar, analisar |
| **ENGENHARIA** | Antônio Eng. Clínico | antonio@empresa.com | Engenharia | Visualizar demandas, responder acionamentos técnicos |
| **ASSISTENCIA** | Chris | chris@empresa.com | Suprimentos | Gerenciar chamados suprimentos, visualizar demandas |
| **TI** | Daniel | daniel@empresa.com | TI - Integração Sistema | Visualizar demandas |
| **GESTAO_PESSOAS** | Angela | angela@empresa.com | PEC | Visualizar demandas |
| **SEGURANCA** | Elcio - Equipe Segurança | seguranca@empresa.com | Segurança | Validar demandas |
| **SESMT** | Equipe SESMT | sesmt@empresa.com | SESMT | Visualizar demandas |

---

## 3. CICLO DE VIDA DAS DEMANDAS

### 3.1 Status Disponíveis

```
ABERTA
  ↓
EM_ANALISE (Adriana - Engenharia Corporativa)
  ├─→ COMPLEMENTACAO_SOLICITADA (retorna para solicitante)
  │    ├─→ EM_ANALISE (volta após complementação)
  │    └─→ REJEITADA
  ├─→ AGUARDANDO_AREA_TECNICA (acionamento técnico)
  │    └─→ ESCOPO_VALIDADO
  ├─→ ESCOPO_VALIDADO
  ├─→ APROVACAO_PENDENTE (pendência gerencial)
  ├─→ APROVADA
  │    └─→ CHAMADO_SUPRIMENTOS (Chris)
  └─→ REJEITADA
       └─→ CANCELADA

CHAMADO_SUPRIMENTOS
  └─→ [Gestão de chamado em sistema externo]
```

---

## 4. FUNCIONALIDADES POR PAPEL

### 4.1 SOLICITANTE (Criador da Demanda)

#### Criar Nova Demanda
- **Fluxo**: Menu → Nova Solicitação
- **Dados Obrigatórios**:
  - Dados do solicitante (nome, e-mail, celular, casa, segmento, departamento, centro de custo)
  - Tipo de serviço (varia por segmento)
  - Local, necessidade (Normal/Urgente/Emergencial)
  - Tipo de contratação (Existente/Nova)
  - Razão social e CNPJ do prestador (se existente)
  - ID contratual, data prevista, duração
  - Objetivo (Aumento escopo, Redução escopo, Rescisão, etc.)
  - Mão de obra terceira (Sim/Não)
  - Descrição do escopo, observações
  - Upload de contrato/aditivos (opcional)

#### Responder Complementação
- **Trigger**: Status = COMPLEMENTACAO_SOLICITADA
- **Fluxo**: Menu → Dashboard → Demanda → Editar complementação
- **Dados**:
  - Editar solicitante (segmento, departamento, centro de custo)
  - Editar serviço (tipo, local, necessidade, etc.)
  - Campo de observações (opcional)
  - Upload de novos arquivos (contrato/aditivos)
  - Botão "Salvar Complementação"
- **Resultado**: Demanda volta para EM_ANALISE

#### Visualizar Demanda
- Dashboard com lista de demandas do solicitante
- Detalhes completos, histórico de eventos
- Status e comentários de cada etapa

---

### 4.2 LEONARDO (Engenharia Corporativa - Adriana)

#### Editar Segmento e Mão de Obra
- **Trigger**: Status ≠ CANCELADA e Status ≠ CHAMADO_SUPRIMENTOS
- **Campos Editáveis**:
  - Segmento (Saúde, Educação, Corporativo)
  - Mão de obra terceira (Sim/Não)
- **Fluxo**: 
  1. Botão "Editar" no cabeçalho da demanda
  2. Modo de edição ativado
  3. Selects inline para Segmento e Mão de Obra
  4. Salvar junto com Análise e Classificação
  5. Modo de edição desativado

#### Classificar e Analisar Demanda
- **Trigger**: Status = EM_ANALISE
- **Campos Editáveis**:
  - Tipo de demanda (Estratégica/Pontual)
  - Complexidade (Baixa/Média/Alta)
  - Expectativa de receita (Não/Faturamento/Fixo mensal/Produtividade/Outras)
  - Calendarizado? (Sim/Não)
  - Solicitação aderente? (Sim/Não)
  - Contrato corporativo? (Sim/Não)
  - Incremento financeiro? (Sim/Não)
  - Contratação com compra de produtos? (Sim/Não)
- **Necessidade de Complementação**:
  - Botão "Pedir Complementação"
  - Campo de observações (motivo da complementação)
  - Demanda passa para COMPLEMENTACAO_SOLICITADA
  - Observações visíveis ao solicitante em alerta

#### Acionar Área Técnica
- **Trigger**: Quando necessário validar escopo
- **Fluxo**:
  1. Selecionar áreas técnicas (Engenharia, Assistência, TI, etc.)
  2. Status muda para AGUARDANDO_AREA_TECNICA
  3. Áreas técnicas recebem e-mail com acionamento
  4. Podem adicionar anexos/observações
- **Resposta Técnica**:
  - Áreas respondem via formulário
  - Respostas agregadas no histórico
  - Status muda para ESCOPO_VALIDADO

#### Aprovar ou Rejeitar
- **Aprovação**:
  - Válido quando escopo já foi validado
  - Status muda para APROVADA
  - Pode prosseguir para CHAMADO_SUPRIMENTOS
- **Rejeição**:
  - Status muda para REJEITADA
  - Motivo registrado no histórico
  - Demanda pode ser consultada por solicitante

---

### 4.3 ASSISTENCIA (Suprimentos - Chris)

#### Gerenciar Chamado Suprimentos
- **Trigger**: Status = CHAMADO_SUPRIMENTOS
- **Visualização**:
  - ID da demanda original
  - ID do chamado suprimentos
  - Dados completos da demanda (solicitante, serviço)
  - Histórico de eventos
- **Ações** (futuro):
  - Atualizar status do chamado
  - Adicionar notas e anexos
  - Encerrar ou transferir chamado

#### Visualizar Demandas
- Lista de todas as demandas (consulta)
- Filtros por status, segmento, tipo de serviço
- Dashboard informativo

---

### 4.4 ENGENHARIA, TI, GESTAO_PESSOAS, SEGURANCA, SESMT

#### Visualizar Demandas
- Acesso apenas para consulta
- Não podem editar ou alterar status

#### Responder Acionamento Técnico (ENGENHARIA)
- Quando área técnica é acionada:
  1. Recebem e-mail com link para demanda
  2. Acessam formulário de resposta técnica
  3. Adicionam observações e anexos
  4. Submete respostas
- Respostas integradas no histórico

---

## 5. FLUXO DETALHADO POR PROCESSO

### 5.1 Criar Demanda
```
Solicitante acessa "Nova Solicitação"
  ↓
Preenche dados do solicitante
  ↓
Seleciona tipo de serviço (filtrado por segmento)
  ↓
Preenche dados do serviço (local, necessidade, contratação)
  ↓
Seleciona objetivo e preenche escopo
  ↓
Upload opcional de contrato/aditivos
  ↓
Clica "Submeter Demanda"
  ↓
Demanda criada com status = ABERTA
Histórico: "Demanda aberta"
```

### 5.2 Analisar e Classificar
```
LEONARDO (Adriana) acessa demanda (status = ABERTA ou EM_ANALISE)
  ↓
Clica "Editar" para ativar modo edição
  ↓
Edita segmento e mão de obra (inline)
  ↓
Acessa seção "Análise e Classificação"
  ↓
Preenche todos os campos de classificação
  ↓
Clica "Salvar Análise e Classificação"
  ↓
Status = EM_ANALISE
Histórico: "Análise e classificação realizada por Adriana"
Modo edição desativado, página recarrega
```

### 5.3 Solicitar Complementação
```
LEONARDO (Adriana) está em demanda (EM_ANALISE)
  ↓
Clica "Pedir Complementação"
  ↓
Modal abre com campo de observações
  ↓
Digita motivo/observações (obrigatório)
  ↓
Clica "Enviar"
  ↓
Status = COMPLEMENTACAO_SOLICITADA
Complementação criada: {solicitadaPor, solicitadoEm, observacoes}
Histórico: "Complementação solicitada por Adriana"
Solicitante recebe notificação
```

### 5.4 Responder Complementação
```
Solicitante acessa demanda (status = COMPLEMENTACAO_SOLICITADA)
  ↓
Vê alerta amarelo: "Motivo da complementação (observações de Adriana)"
  ↓
Clica "Editar Complementação"
  ↓
Formulário abre com modo edição
  ↓
Edita dados (solicitante, serviço) conforme necessário
  ↓
Preenche campo "Observações" (opcional - resposta do solicitante)
  ↓
Upload opcional de novos arquivos
  ↓
Clica "Salvar Complementação"
  ↓
Status = EM_ANALISE
Complementação registra: {respondidoEm, respondidoPor, observacoesSolicitante}
Histórico: "Complementação enviada pelo solicitante + observação (se houver)"
Adriana é notificada para revisar
```

### 5.5 Acionar Área Técnica
```
LEONARDO (Adriana) em demanda (EM_ANALISE)
  ↓
Clica "Acionar Área Técnica"
  ↓
Modal: seleciona múltiplas áreas (ENGENHARIA, ASSISTENCIA, TI, etc.)
  ↓
Preenche observações sobre o que validar
  ↓
Clica "Enviar Acionamento"
  ↓
Status = AGUARDANDO_AREA_TECNICA
Acionamento criado: {areasTecnicas, emailsDestinatarios, observacoes}
E-mails enviados para cada área
Histórico: "Acionamento técnico enviado"
```

### 5.6 Responder Acionamento Técnico
```
Engenharia recebe e-mail + link
  ↓
Acessa demanda com tab "Respostas Técnicas"
  ↓
Visualiza acionamento e observações
  ↓
Clica "Adicionar Resposta"
  ↓
Preenche:
  - Observações técnicas
  - Upload de anexos (desenhos, especificações)
  ↓
Clica "Enviar Resposta"
  ↓
Resposta registrada: {areaTecnica, respondidoEm, respondidoPor, anexos}
Histórico: "Resposta técnica de Engenharia recebida"
```

### 5.7 Finalizar Análise
```
LEONARDO (Adriana) após respostas técnicas
  ↓
Clica "Validar Escopo"
  ↓
Status = ESCOPO_VALIDADO
Histórico: "Escopo validado por Adriana"
  ↓
Clica "Aprovar" ou "Rejeitar"
  ├─ APROVAR:
  │   Status = APROVADA
  │   Pode gerar CHAMADO_SUPRIMENTOS
  │   Histórico: "Demanda aprovada"
  └─ REJEITAR:
      Modal de motivo
      Status = REJEITADA
      Histórico: "Demanda rejeitada por [motivo]"
```

### 5.8 Gerar Chamado Suprimentos
```
LEONARDO (Adriana) em demanda APROVADA
  ↓
Clica "Gerar Chamado Suprimentos"
  ↓
Modal: insira ID do chamado (externo)
  ↓
Clica "Gerar"
  ↓
Status = CHAMADO_SUPRIMENTOS
demanda.chamadoId armazenado
Histórico: "Chamado suprimentos gerado: [ID]"
Suprimentos recebe notificação
```

---

## 6. SERVIÇOS POR SEGMENTO

### 6.1 Saúde (26 serviços)
- Serviço de Lavanderia
- Serviço de Limpeza
- Serviço de Controle de Pragas
- Serviço de Segurança (Portaria e/ou vigilância)
- Serviço de Vigilantes
- Serviços de sistemas de Câmeras e CFTV
- Serviço de Gases Medicinais
- Serviço de Jardinagem
- Serviço de GLP
- Locação de Veículos
- Serviço de Coleta de Resíduos
- Serviço de Estacionamento Privado
- Serviço Comercial de Alimentação (Lanchonete e Restaurante)
- Serviço de Restaurante
- Serviço de Cozinha e Copa (SND)
- Locação de Vending Machine
- Guarda de documentos (físico)
- Uniforme Profissional ou Escolar
- Seguros Veículos
- Seguros Patrimonial
- Seguro Responsabilidade civil
- Diagnóstico por Imagem
- Análises Clínicas
- Agencia Transfusional
- Outros

### 6.2 Educação (21 serviços)
- Serviço de Limpeza
- Serviço de Controle de Pragas
- Serviço de Segurança (Portaria e/ou vigilância)
- Serviço de Vigilantes
- Serviços de sistemas de Câmeras e CFTV
- Serviço de Jardinagem
- Serviço de GLP
- Locação de Veículos
- Serviço de Coleta de Resíduos
- Serviço de Estacionamento Privado
- Serviço Comercial de Alimentação (Lanchonete e Restaurante)
- Serviço de Restaurante
- Serviço de Cozinha e Copa (SND)
- Locação de Vending Machine
- Guarda de documentos (físico)
- Uniforme Profissional ou Escolar
- Seguros Veículos
- Seguros Patrimonial
- Seguro Responsabilidade civil
- Seguro Alunos
- Outros

### 6.3 Corporativo (29 serviços)
**Combinação de todos os anteriores**, sem duplicação:
- Todos os serviços de Saúde + Educação
- Seguro Alunos adicionado
- Diagnóstico por Imagem
- Análises Clínicas
- Agencia Transfusional
- Serviço de Banco de Sangue

---

## 7. NÍVEIS DE NECESSIDADE

| Nível | Descrição |
|-------|-----------|
| NORMAL | Solicitação comum sem urgência |
| URGENTE | Necessário em curto prazo |
| EMERGENCIAL | Crítico, necessário imediatamente |

---

## 8. REGRAS DE NEGÓCIO

### 8.1 Edição de Demanda
- Somente LEONARDO pode editar segmento e mão de obra
- Edição bloqueada quando status = CANCELADA ou CHAMADO_SUPRIMENTOS
- Modo edição via botão "Editar" que ativa/desativa
- Alterações salvas junto com Análise e Classificação

### 8.2 Complementação
- Solicitante pode editar complementação apenas uma vez por solicitação
- Observações do solicitante são salvas no registro de complementação
- Adriana vê as observações no histórico
- Demanda retorna automaticamente para EM_ANALISE após complementação enviada

### 8.3 Histórico
- Todos os eventos registrados em ordem cronológica (mais recente para mais antigo)
- Eventos incluem: abertura, análise, complementação, acionamento técnico, aprovação/rejeição, chamado gerado
- Detalhes incluem usuário, data/hora, ação e observações

### 8.4 Acionamento Técnico
- Múltiplas áreas podem ser acionadas simultaneamente
- E-mails são enviados conforme lista de destinatários por área
- Respostas são aguardadas e agregadas
- Após todas as respostas, escopo pode ser validado

### 8.5 Aprovação
- Requer escopo já validado (após respostas técnicas)
- Apenas LEONARDO pode aprovar
- Aprovação leva a CHAMADO_SUPRIMENTOS

### 8.6 Rejeição
- Pode acontecer em qualquer momento durante EM_ANALISE ou COMPLEMENTACAO_SOLICITADA
- Requer motivo registrado
- Demanda pode ser consultada mas não editada

### 8.7 Cancelamento
- Demanda em REJEITADA pode ser movida para CANCELADA
- Usuários não podem mais editar ou interagir
- Consulta apenas para histórico

---

## 9. ESTRUTURA DE DADOS

### 9.1 Demanda
```typescript
interface Demanda {
  id: string;                              // UUID
  solicitante: Solicitante;               // Dados do solicitante
  servico: ServicoSolicitado;             // Dados do serviço
  classificacao?: Classificacao;           // Análise e classificação
  status: StatusDemanda;                  // Status atual
  historico: HistoricoEvento[];           // Timeline de eventos
  complementacoes: Complementacao[];      // Solicitações de complementação
  acionamentosTecnicos: AcionamentoTecnico[]; // Acionamentos para áreas
  chamadoId?: string;                     // ID do chamado suprimentos
  criadaEm: string;                       // ISO timestamp
  atualizadaEm: string;                   // ISO timestamp
}
```

### 9.2 Solicitante
```typescript
interface Solicitante {
  nome: string;
  email: string;
  celular: string;
  casa: string;
  segmento: Segmento;                     // SAUDE | EDUCACAO | CORPORATIVO
  departamento: string;
  centroDeCusto: string;
}
```

### 9.3 ServicoSolicitado
```typescript
interface ServicoSolicitado {
  tipo: TipoServico;                      // Tipo de serviço
  local: string;
  necessidade: NecessidadeServico;        // NORMAL | URGENTE | EMERGENCIAL
  tipoContratacao: TipoContratacao;       // EXISTENTE | NOVA
  razaoSocialPrestador?: string;
  cnpjPrestador?: string;
  idContratual: string;
  dataPrevista: string;
  duracao: string;
  descricao: Objetivo;
  maoDeObra: boolean;
  descricaoEscopo: string;
  observacoes: string;
  nomeArquivoContratoAditivos?: string;
}
```

### 9.4 Classificacao
```typescript
interface Classificacao {
  id: string;
  estrategicaOuPontual?: TipoDemanda;     // ESTRATEGICA | PONTUAL
  complexidade?: Complexidade;             // BAIXA | MEDIA | ALTA
  expectativaReceita?: ExpectativaReceita; // NAO | FATURAMENTO | FIXO_MENSAL | PRODUTIVIDADE | OUTRAS
  calendarizado?: string;                  // SIM | NAO
  solicitacaoAderente?: string;            // SIM | NAO
  contratoCorporativo?: string;            // SIM | NAO
  incrementoFinanceiro?: string;           // SIM | NAO
  contratacaoCompraProdutos?: string;      // SIM | NAO
  classificadoPor: string;                 // Nome do usuário
  classificadoEm: string;                  // ISO timestamp
}
```

### 9.5 Complementacao
```typescript
interface Complementacao {
  id: string;
  solicitadaPor: string;                  // Adriana (LEONARDO)
  solicitadoEm: string;                   // ISO timestamp
  observacoes: string;                    // Motivo da complementação
  respondidoEm?: string;                  // ISO timestamp (resposta)
  respondidoPor?: string;                 // Nome do solicitante
  observacoesSolicitante?: string;        // Respostas/observações do solicitante
}
```

### 9.6 AcionamentoTecnico
```typescript
interface AcionamentoTecnico {
  id: string;
  areasTecnicas: AreaTecnica[];           // Áreas acionadas
  emailsDestinatarios: Record<AreaTecnica, string>; // Mapa área → email
  observacoes: string;                    // O que validar
  acionadoEm: string;                     // ISO timestamp
  acionadoPor: string;                    // Nome (Adriana)
  respostas?: RespostaAreaTecnica[];      // Respostas agregadas
}
```

### 9.7 RespostaAreaTecnica
```typescript
interface RespostaAreaTecnica {
  areaTecnica: AreaTecnica;
  respondidoEm: string;                   // ISO timestamp
  respondidoPor: string;                  // Nome do responsável
  anexos: AnexoAreaTecnica[];             // Arquivos anexados
  observacoes: string;                    // Resposta técnica
}
```

### 9.8 HistoricoEvento
```typescript
interface HistoricoEvento {
  id: string;
  data: string;                           // ISO timestamp
  usuario: string;                        // Nome do usuário
  acao: string;                           // Ex: "Demanda aberta", "Análise realizada"
  detalhes?: string;                      // Informações adicionais
}
```

---

## 10. FLUXO DE NAVEGAÇÃO

### 10.1 Páginas Principais
- **LoginPage**: Seleção de papéis para teste
- **DashboardPage**: Lista de demandas do usuário
- **NovaSolicitacaoPage**: Criar nova demanda (solicitante)
- **ProcessoPage**: Detalhe completo da demanda (todos os papéis)
- **ComplementacaoPage**: Responder complementação (solicitante)
- **RelatoriosPage**: Dashboards e gráficos (futuro)

### 10.2 Estados Visuais
- Status colorido com badge
- Tabs para organizar informações (Info, Respostas Técnicas)
- Modo edição com botão toggle
- Alertas com contexto (info/warning/error)
- Modal para ações críticas (complementação, rejeição)

---

## 11. AUTENTICAÇÃO E AUTORIZAÇÃO

### 11.1 Controle de Acesso
- Login simulado com 8 papéis diferentes
- Cada página verifica `user?.role`
- Elementos/funcionalidades ocultadas ou desabilitadas conforme permissão
- localStorage para persistir sessão

### 11.2 Permissões por Papel

| Funcionalidade | LEONARDO | ENGENHARIA | ASSISTENCIA | Outros |
|---|---|---|---|---|
| Criar demanda | - | - | - | Sim |
| Editar demanda | Sim* | - | - | - |
| Classificar | Sim | - | - | - |
| Acionar técnica | Sim | - | - | - |
| Responder acionamento | - | Sim | - | - |
| Aprovar/Rejeitar | Sim | - | - | - |
| Gerar chamado | Sim | - | - | - |
| Gerenciar chamado | - | - | Sim | - |
| Visualizar | Sim | Sim | Sim | Sim |

*Bloqueado para CHAMADO_SUPRIMENTOS

---

## 12. VALIDAÇÕES

### 12.1 Campos Obrigatórios
- Solicitante: nome, e-mail, celular, casa, segmento, departamento, centro de custo
- Serviço: tipo, local, necessidade, tipo contratação, data prevista, duração, objetivo, escopo
- Classificação: tipo demanda, complexidade, expectativa receita, calendarizado, aderência, corporativo, incremento, compra produtos

### 12.2 Máscaras e Formatos
- E-mail: validação básica de formato
- Celular: numérico
- Data: DD/MM/YYYY
- CNPJ: 14 dígitos (optional)
- Arquivo: upload de contrato/aditivos (opcional)

### 12.3 Regras de Negócio
- Não pode submeter demanda sem preencher todos os obrigatórios
- Não pode editar após CANCELADA
- Não pode rejeitar sem motivo
- Não pode aprovar sem escopo validado

---

## 13. INTEGRAÇÕES FUTURAS

- [ ] API externa para gestão de chamados suprimentos
- [ ] Envio de e-mails reais (em vez de console logs)
- [ ] Banco de dados SQL (Supabase)
- [ ] Relatórios com exportação em PDF/Excel
- [ ] Filtros e busca avançada no dashboard
- [ ] Notificações em tempo real (WebSocket)
- [ ] Assinatura digital de demandas
- [ ] Versionamento de mudanças

---

## 14. CRONOGRAMA SUGERIDO

| Fase | Funcionalidades | Duração |
|------|---|---|
| MVP | Login, criar demanda, classificar, complementação | 2 semanas |
| Fase 2 | Acionamento técnico, aprovação/rejeição | 1 semana |
| Fase 3 | Chamado suprimentos, integração externa | 1 semana |
| Fase 4 | Relatórios, melhorias UI/UX | 1 semana |
| Produção | Deploy, testes, treinamento | 1 semana |

---

**FIM DO DOCUMENTO**
