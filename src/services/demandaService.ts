import type { 
  Demanda, 
  Solicitante, 
  ServicoSolicitado, 
  StatusDemanda, 
  EventoHistorico, 
  Complementacao,
  AcionamentoTecnico,
  ValidacaoEscopo,
  AprovacaoGestor,
  Classificacao,
  AreaTecnica,
  DadosAprovacao
} from '../types';
import { AREA_TECNICA_LABELS } from '../types';
import { format } from 'date-fns';

const STORAGE_KEY = 'demandas';
const HISTORICO_KEY = 'historico_eventos';
const COMPLEMENTACOES_KEY = 'complementacoes';
const ACIONAMENTOS_TECNICOS_KEY = 'acionamentos_tecnicos';
const VALIDACOES_ESCOPO_KEY = 'validacoes_escopo';
const APROVACOES_GESTORES_KEY = 'aprovacoes_gestores';
const CLASSIFICACOES_KEY = 'classificacoes';
const DADOS_APROVACAO_KEY = 'dados_aprovacao';

function generateId(prefix: string): string {
  return `${prefix}-${format(new Date(), 'yyyyMMddHHmmss')}`;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getDemandas(): Record<string, any> {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveDemandas(demandas: Record<string, any>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demandas));
}

function getHistorico(): Record<string, EventoHistorico[]> {
  const stored = localStorage.getItem(HISTORICO_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveHistorico(historico: Record<string, EventoHistorico[]>): void {
  localStorage.setItem(HISTORICO_KEY, JSON.stringify(historico));
}

function getComplementacoes(): Record<string, Complementacao[]> {
  const stored = localStorage.getItem(COMPLEMENTACOES_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveComplementacoes(complementacoes: Record<string, Complementacao[]>): void {
  localStorage.setItem(COMPLEMENTACOES_KEY, JSON.stringify(complementacoes));
}

function getAcionamentosTecnicos(): Record<string, AcionamentoTecnico[]> {
  const stored = localStorage.getItem(ACIONAMENTOS_TECNICOS_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveAcionamentosTecnicos(acionamentos: Record<string, AcionamentoTecnico[]>): void {
  localStorage.setItem(ACIONAMENTOS_TECNICOS_KEY, JSON.stringify(acionamentos));
}

function getValidacoesEscopo(): Record<string, ValidacaoEscopo> {
  const stored = localStorage.getItem(VALIDACOES_ESCOPO_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveValidacoesEscopo(validacoes: Record<string, ValidacaoEscopo>): void {
  localStorage.setItem(VALIDACOES_ESCOPO_KEY, JSON.stringify(validacoes));
}

function getAprovacoesGestores(): Record<string, AprovacaoGestor[]> {
  const stored = localStorage.getItem(APROVACOES_GESTORES_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveAprovacoesGestores(aprovacoes: Record<string, AprovacaoGestor[]>): void {
  localStorage.setItem(APROVACOES_GESTORES_KEY, JSON.stringify(aprovacoes));
}

function getClassificacoes(): Record<string, Classificacao> {
  const stored = localStorage.getItem(CLASSIFICACOES_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveClassificacoes(classificacoes: Record<string, Classificacao>): void {
  localStorage.setItem(CLASSIFICACOES_KEY, JSON.stringify(classificacoes));
}

function getDadosAprovacao(): Record<string, DadosAprovacao> {
  const stored = localStorage.getItem(DADOS_APROVACAO_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveDadosAprovacao(dados: Record<string, DadosAprovacao>): void {
  localStorage.setItem(DADOS_APROVACAO_KEY, JSON.stringify(dados));
}

function buildDemanda(data: Record<string, any>): Demanda {
  const historicoData = getHistorico();
  const complementacoesData = getComplementacoes();
  const acionamentosTecnicosData = getAcionamentosTecnicos();
  const validacoesEscopoData = getValidacoesEscopo();
  const aprovacoesGestoresData = getAprovacoesGestores();
  const classificacoesData = getClassificacoes();
  const dadosAprovacaoData = getDadosAprovacao();

  return {
    id: data.id,
    dataCriacao: data.dataCriacao,
    status: data.status,
    chamadoId: data.chamadoId,
    chamadoGeradoEm: data.chamadoGeradoEm,
    solicitante: data.solicitante,
    servico: data.servico,
    classificacao: classificacoesData[data.id],
    historico: historicoData[data.id] || [],
    complementacoes: complementacoesData[data.id] || [],
    acionamentosTecnicos: acionamentosTecnicosData[data.id] || [],
    validacaoEscopo: validacoesEscopoData[data.id],
    aprovacoesGestores: data.aprovacoesGestores || aprovacoesGestoresData[data.id] || [],
    dadosAprovacao: dadosAprovacaoData[data.id],
  };
}

export async function criarDemanda(
  solicitante: Solicitante,
  servico: ServicoSolicitado,
  nomeUsuario: string
): Promise<Demanda> {
  const id = generateId('DM');
  const now = new Date();
  const prazo = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000); // 6 dias a partir de agora

  const demandas = getDemandas();
  demandas[id] = {
    id,
    dataCriacao: now.toISOString(),
    status: 'ABERTA' as StatusDemanda,
    chamadoId: undefined,
    chamadoGeradoEm: undefined,
    ciclo: 1,
    dataInicio: now.toISOString(),
    dataPrazo: prazo.toISOString(),
    solicitante,
    servico,
  };
  saveDemandas(demandas);

  const historico = getHistorico();
  if (!historico[id]) historico[id] = [];
  historico[id].push({
    id: generateUUID(),
    data: new Date().toISOString(),
    usuario: nomeUsuario,
    acao: 'Demanda criada',
    detalhes: `Serviço: ${servico.tipo}`,
  });
  saveHistorico(historico);

  return buildDemanda(demandas[id]);
}

export async function listarDemandas(): Promise<Demanda[]> {
  const demandas = getDemandas();
  return Object.values(demandas)
    .map(buildDemanda)
    .sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime());
}

export async function buscarDemanda(id: string): Promise<Demanda> {
  const demandas = getDemandas();
  if (!demandas[id]) throw new Error('Demanda não encontrada');
  return buildDemanda(demandas[id]);
}

export async function registrarAnalise(
  demandaId: string,
  _necessitaComplementacao: boolean,
  observacoes: string,
  _acoesInternas: string,
  analisadoPor: string
): Promise<void> {
  const demandas = getDemandas();
  if (!demandas[demandaId]) throw new Error('Demanda não encontrada');

  demandas[demandaId].status = 'EM_ANALISE' as StatusDemanda;
  saveDemandas(demandas);

  const historico = getHistorico();
  if (!historico[demandaId]) historico[demandaId] = [];
  historico[demandaId].push({
    id: generateUUID(),
    data: new Date().toISOString(),
    usuario: analisadoPor,
    acao: 'Demanda recebida em Engenharia Corporativa',
    detalhes: observacoes || undefined,
  });
  saveHistorico(historico);
}

export async function solicitarComplementacao(
  demandaId: string,
  observacoes: string,
  solicitadaPor: string
): Promise<void> {
  const demandas = getDemandas();
  if (!demandas[demandaId]) throw new Error('Demanda não encontrada');

  demandas[demandaId].status = 'COMPLEMENTACAO_SOLICITADA' as StatusDemanda;
  saveDemandas(demandas);

  const complementacoes = getComplementacoes();
  if (!complementacoes[demandaId]) complementacoes[demandaId] = [];
  complementacoes[demandaId].push({
    id: generateUUID(),
    solicitadaPor,
    solicitadoEm: new Date().toISOString(),
    observacoes,
  });
  saveComplementacoes(complementacoes);

  const historico = getHistorico();
  if (!historico[demandaId]) historico[demandaId] = [];
  historico[demandaId].push({
    id: generateUUID(),
    data: new Date().toISOString(),
    usuario: solicitadaPor,
    acao: 'Complementação solicitada ao solicitante',
    detalhes: observacoes,
  });
  saveHistorico(historico);
}

export async function acionarAreaTecnica(
  demandaId: string,
  areasTecnicas: AreaTecnica[],
  emailsDestinatarios: Record<AreaTecnica, string>,
  observacoes: string,
  acionadoPor: string
): Promise<void> {
  const demandas = getDemandas();
  if (!demandas[demandaId]) throw new Error('Demanda não encontrada');

  demandas[demandaId].status = 'AGUARDANDO_AREA_TECNICA' as StatusDemanda;
  saveDemandas(demandas);

  const acionamentos = getAcionamentosTecnicos();
  if (!acionamentos[demandaId]) acionamentos[demandaId] = [];
  acionamentos[demandaId].push({
    id: generateUUID(),
    areasTecnicas,
    emailsDestinatarios,
    observacoes,
    acionadoEm: new Date().toISOString(),
    acionadoPor,
  });
  saveAcionamentosTecnicos(acionamentos);

  const historico = getHistorico();
  if (!historico[demandaId]) historico[demandaId] = [];
  historico[demandaId].push({
    id: generateUUID(),
    data: new Date().toISOString(),
    usuario: acionadoPor,
    acao: `Acionadas áreas técnicas: ${areasTecnicas.join(', ')}`,
    detalhes: `${observacoes}`,
  });
  saveHistorico(historico);
}

export async function validarEscopo(
  demandaId: string,
  aprovado: boolean,
  observacoes: string,
  validadoPor: string
): Promise<void> {
  const demandas = getDemandas();
  if (!demandas[demandaId]) throw new Error('Demanda não encontrada');

  const novoStatus: StatusDemanda = aprovado ? 'APROVACAO_PENDENTE' : 'COMPLEMENTACAO_SOLICITADA';
  demandas[demandaId].status = novoStatus;
  saveDemandas(demandas);

  const validacoes = getValidacoesEscopo();
  validacoes[demandaId] = {
    id: generateUUID(),
    aprovado,
    observacoes,
    validadoEm: new Date().toISOString(),
    validadoPor,
  };
  saveValidacoesEscopo(validacoes);

  const historico = getHistorico();
  if (!historico[demandaId]) historico[demandaId] = [];
  historico[demandaId].push({
    id: generateUUID(),
    data: new Date().toISOString(),
    usuario: validadoPor,
    acao: aprovado ? 'Escopo validado por Engenharia Corporativa' : 'Escopo enviado para complementação',
    detalhes: observacoes || undefined,
  });
  saveHistorico(historico);
}

export async function aprovarDemanda(
  demandaId: string,
  nomeGestor: 'MARCOS' | 'VIANA' | 'KLEBER',
  ordem: number,
  aprovado: boolean,
  observacoes: string
): Promise<void> {
  const demandas = getDemandas();
  if (!demandas[demandaId]) throw new Error('Demanda não encontrada');

  const aprovacoes = getAprovacoesGestores();
  if (!aprovacoes[demandaId]) aprovacoes[demandaId] = [];

  const existente = aprovacoes[demandaId].find((a) => a.ordem === ordem);
  if (existente) {
    existente.aprovado = aprovado;
    existente.observacoes = observacoes;
    existente.aprovadoEm = new Date().toISOString();
  } else {
    aprovacoes[demandaId].push({
      id: generateUUID(),
      gestor: nomeGestor,
      ordem,
      aprovado,
      observacoes,
      aprovadoEm: new Date().toISOString(),
    });
  }
  saveAprovacoesGestores(aprovacoes);

  if (!aprovado) {
    demandas[demandaId].status = 'REJEITADA' as StatusDemanda;
    saveDemandas(demandas);
  } else if (ordem === 3) {
    // Gera chamado automaticamente quando todos os 3 gestores aprovam
    demandas[demandaId].status = 'APROVADA' as StatusDemanda;
    const chamadoId = generateId('CHD');
    demandas[demandaId].chamadoId = chamadoId;
    demandas[demandaId].chamadoGeradoEm = new Date().toISOString();
    demandas[demandaId].status = 'CHAMADO_SUPRIMENTOS' as StatusDemanda;
    saveDemandas(demandas);

    const historico = getHistorico();
    if (!historico[demandaId]) historico[demandaId] = [];
    historico[demandaId].push({
      id: generateUUID(),
      data: new Date().toISOString(),
      usuario: 'Sistema',
      acao: 'Chamado gerado automaticamente em Suprimentos',
      detalhes: `ID do chamado: ${chamadoId}`,
    });
    saveHistorico(historico);
    return;
  }

  const historico = getHistorico();
  if (!historico[demandaId]) historico[demandaId] = [];
  historico[demandaId].push({
    id: generateUUID(),
    data: new Date().toISOString(),
    usuario: nomeGestor,
    acao: aprovado ? `Aprovado por ${nomeGestor}` : `Rejeitado por ${nomeGestor}`,
    detalhes: observacoes || undefined,
  });
  saveHistorico(historico);
}

export async function gerarChamadoSuprimentos(demandaId: string): Promise<string> {
  const demandas = getDemandas();
  if (!demandas[demandaId]) throw new Error('Demanda não encontrada');

  const chamadoId = generateId('CHD');

  demandas[demandaId].status = 'CHAMADO_SUPRIMENTOS' as StatusDemanda;
  demandas[demandaId].chamadoId = chamadoId;
  demandas[demandaId].chamadoGeradoEm = new Date().toISOString();
  saveDemandas(demandas);

  const historico = getHistorico();
  if (!historico[demandaId]) historico[demandaId] = [];
  historico[demandaId].push({
    id: generateUUID(),
    data: new Date().toISOString(),
    usuario: 'Sistema',
    acao: 'Chamado gerado automaticamente em Suprimentos',
    detalhes: `ID do chamado: ${chamadoId}`,
  });
  saveHistorico(historico);

  return chamadoId;
}

export async function encaminharParaDiretor(
  demandaId: string,
  observacoes: string,
  encaminhadoPor: string
): Promise<void> {
  const demandas = getDemandas();
  if (!demandas[demandaId]) throw new Error('Demanda não encontrada');

  demandas[demandaId].status = 'ESCOPO_VALIDADO' as StatusDemanda;
  saveDemandas(demandas);

  const historico = getHistorico();
  if (!historico[demandaId]) historico[demandaId] = [];
  historico[demandaId].push({
    id: generateUUID(),
    data: new Date().toISOString(),
    usuario: encaminhadoPor,
    acao: 'Encaminhado para aprovação do Diretor da Casa',
    detalhes: observacoes || undefined,
  });
  saveHistorico(historico);
}

export async function encaminharParaGerencia(
  demandaId: string,
  observacoes: string,
  encaminhadoPor: string
): Promise<void> {
  const demandas = getDemandas();
  if (!demandas[demandaId]) throw new Error('Demanda não encontrada');

  demandas[demandaId].status = 'APROVACAO_PENDENTE' as StatusDemanda;
  saveDemandas(demandas);

  const historico = getHistorico();
  if (!historico[demandaId]) historico[demandaId] = [];
  historico[demandaId].push({
    id: generateUUID(),
    data: new Date().toISOString(),
    usuario: encaminhadoPor,
    acao: 'Encaminhado para aprovação pela Gerência Corporativa',
    detalhes: observacoes || undefined,
  });
  saveHistorico(historico);
}

export async function encaminharParaGerenciaCasa(
  demandaId: string,
  encaminhadoPor: string
): Promise<void> {
  const demandas = getDemandas();
  if (!demandas[demandaId]) throw new Error('Demanda não encontrada');

  demandas[demandaId].status = 'APROVACAO_PENDENTE' as StatusDemanda;
  
  // Inicializar aprovacoesGestores se não existir
  if (!demandas[demandaId].aprovacoesGestores) {
    demandas[demandaId].aprovacoesGestores = [];
  }
  
  // Adicionar aprovação para MARCOS (1º aprovador)
  demandas[demandaId].aprovacoesGestores.push({
    id: generateUUID(),
    gestor: 'MARCOS',
    ordem: 1,
    aprovado: null,
  });

  saveDemandas(demandas);

  const historico = getHistorico();
  if (!historico[demandaId]) historico[demandaId] = [];
  historico[demandaId].push({
    id: generateUUID(),
    data: new Date().toISOString(),
    usuario: encaminhadoPor,
    acao: 'Encaminhado para aprovação do Gerente da Casa',
    detalhes: undefined,
  });
  saveHistorico(historico);
}

export async function encaminharParaGerenciaCorporativa(
  demandaId: string,
  encaminhadoPor: string
): Promise<void> {
  const demandas = getDemandas();
  if (!demandas[demandaId]) throw new Error('Demanda não encontrada');

  demandas[demandaId].status = 'APROVACAO_PENDENTE' as StatusDemanda;
  
  // Inicializar aprovacoesGestores se não existir
  if (!demandas[demandaId].aprovacoesGestores) {
    demandas[demandaId].aprovacoesGestores = [];
  }
  
  // Adicionar aprovação para VIANA (2º aprovador)
  demandas[demandaId].aprovacoesGestores.push({
    id: generateUUID(),
    gestor: 'VIANA',
    ordem: 2,
    aprovado: null,
  });

  saveDemandas(demandas);

  const historico = getHistorico();
  if (!historico[demandaId]) historico[demandaId] = [];
  historico[demandaId].push({
    id: generateUUID(),
    data: new Date().toISOString(),
    usuario: encaminhadoPor,
    acao: 'Encaminhado para aprovação da Gerência Corporativa',
    detalhes: undefined,
  });
  saveHistorico(historico);
}

export async function aprovarComGerente(
  demandaId: string,
  gestor: 'MARCOS' | 'VIANA' | 'KLEBER',
  aprovado: boolean,
  observacoes: string
): Promise<void> {
  const demandas = getDemandas();
  if (!demandas[demandaId]) throw new Error('Demanda não encontrada');

  // Atualizar o registro de aprovação
  const demandaData = demandas[demandaId];
  const aprovacaoIndex = demandaData.aprovacoesGestores.findIndex(
    (a: AprovacaoGestor) => a.gestor === gestor
  );

  if (aprovacaoIndex !== -1) {
    const aprovacaoAtual = demandaData.aprovacoesGestores[aprovacaoIndex];
    aprovacaoAtual.aprovado = aprovado;
    aprovacaoAtual.observacoes = observacoes || undefined;
    aprovacaoAtual.aprovadoEm = new Date().toISOString();

    // Se reprovou, volta para EM_ANALISE (para Adriana reanalisar)
    if (!aprovado) {
      demandaData.status = 'EM_ANALISE' as StatusDemanda;
    } else {
      // Se aprovou e é a última ordem (3 - KLEBER), status fica APROVADA
      if (aprovacaoAtual.ordem === 3) {
        demandaData.status = 'APROVADA' as StatusDemanda;
      }
      // Se aprovou e não é a última, continua em APROVACAO_PENDENTE para o próximo
    }
  }

  saveDemandas(demandas);

  const historico = getHistorico();
  if (!historico[demandaId]) historico[demandaId] = [];
  historico[demandaId].push({
    id: generateUUID(),
    data: new Date().toISOString(),
    usuario: gestor,
    acao: aprovado ? `Aprovado por ${gestor}` : `Rejeitado por ${gestor}`,
    detalhes: observacoes || undefined,
  });
  saveHistorico(historico);
}

export async function executarAcaoAprovacao(
  demandaId: string,
  gerenteRole: 'MARCOS' | 'VIANA' | 'KLEBER',
  acao: 'APROVAR' | 'REJEITAR' | 'PEDIR_INFORMACOES',
  observacoes: string
): Promise<void> {
  const demandas = getDemandas();
  if (!demandas[demandaId]) throw new Error('Demanda não encontrada');

  const demandaData = demandas[demandaId];
  
  // Garantir que aprovacoesGestores está inicializado
  if (!demandaData.aprovacoesGestores) {
    demandaData.aprovacoesGestores = [];
  }
  
  // Encontrar a ordem do gestor
  let ordemGestor = 0;
  if (gerenteRole === 'MARCOS') ordemGestor = 1;
  else if (gerenteRole === 'VIANA') ordemGestor = 2;
  else if (gerenteRole === 'KLEBER') ordemGestor = 3;

  // Determinar o valor de aprovado baseado na ação
  let aprovadoValue: boolean | null = null;
  if (acao === 'APROVAR') aprovadoValue = true;
  else if (acao === 'REJEITAR') aprovadoValue = false;
  // Se PEDIR_INFORMACOES, permanece null

  // Atualizar ou criar o registro de aprovação
  let aprovacao = demandaData.aprovacoesGestores.find((a: AprovacaoGestor) => a.gestor === gerenteRole);
  if (!aprovacao) {
    aprovacao = {
      id: generateUUID(),
      gestor: gerenteRole,
      ordem: ordemGestor,
      acao,
      aprovado: aprovadoValue,
      observacoes: observacoes || undefined,
      aprovadoEm: new Date().toISOString(),
    };
    demandaData.aprovacoesGestores.push(aprovacao);
  } else {
    aprovacao.acao = acao;
    aprovacao.aprovado = aprovadoValue;
    aprovacao.observacoes = observacoes || undefined;
    aprovacao.aprovadoEm = new Date().toISOString();
  }

  // Processar a ação
  if (acao === 'REJEITAR') {
    // Se rejeitado: volta para EM_ANALISE (Leonardo reanalisará)
    demandaData.status = 'EM_ANALISE' as StatusDemanda;
  } else if (acao === 'PEDIR_INFORMACOES') {
    // Se pedir informações: volta para EM_ANALISE (Leonardo fornecerá mais informações)
    demandaData.status = 'EM_ANALISE' as StatusDemanda;
  } else if (acao === 'APROVAR') {
    // Se aprovado: verifica se é o terceiro aprovador
    if (ordemGestor === 3) {
      // O 3º aprovador aprovou, demanda volta para Leonardo (EM_ANALISE)
      demandaData.status = 'EM_ANALISE' as StatusDemanda;
    } else {
      // Se não é o terceiro (1º ou 2º), a demanda permanece em APROVACAO_PENDENTE para o próximo aprovador
      demandaData.status = 'APROVACAO_PENDENTE' as StatusDemanda;
    }
  }

  saveDemandas(demandas);

  // Registrar no histórico
  const historico = getHistorico();
  if (!historico[demandaId]) historico[demandaId] = [];
  
  let acaoDescricao = '';
  if (acao === 'APROVAR') acaoDescricao = `Aprovado por ${gerenteRole}`;
  else if (acao === 'REJEITAR') acaoDescricao = `Rejeitado por ${gerenteRole}`;
  else if (acao === 'PEDIR_INFORMACOES') acaoDescricao = `Informações adicionais solicitadas por ${gerenteRole}`;

  historico[demandaId].push({
    id: generateUUID(),
    data: new Date().toISOString(),
    usuario: gerenteRole,
    acao: acaoDescricao,
    detalhes: observacoes || undefined,
  });
  saveHistorico(historico);
}


export async function atualizarDemandaComplementacao(
  demandaId: string,
  solicitante: Solicitante,
  servico: ServicoSolicitado,
  atualizadoPor: string,
  observacoesSolicitante?: string
): Promise<void> {
  const demandas = getDemandas();
  if (!demandas[demandaId]) throw new Error('Demanda não encontrada');

  demandas[demandaId].solicitante = solicitante;
  demandas[demandaId].servico = servico;
  demandas[demandaId].status = 'EM_ANALISE' as StatusDemanda;
  saveDemandas(demandas);

  // Salvar observação do solicitante na última complementação
  if (observacoesSolicitante) {
    const complementacoes = getComplementacoes();
    const lista = complementacoes[demandaId];
    if (lista && lista.length > 0) {
      const ultima = lista[lista.length - 1];
      ultima.respondidoEm = new Date().toISOString();
      ultima.respondidoPor = atualizadoPor;
      ultima.observacoesSolicitante = observacoesSolicitante;
      saveComplementacoes(complementacoes);
    }
  }

  const historico = getHistorico();
  if (!historico[demandaId]) historico[demandaId] = [];
  historico[demandaId].push({
    id: generateUUID(),
    data: new Date().toISOString(),
    usuario: atualizadoPor,
    acao: 'Complementação recebida e demanda retomada em análise',
    detalhes: observacoesSolicitante
      ? `Observação do solicitante: ${observacoesSolicitante}`
      : 'Demanda atualizada com informações complementares',
  });
  saveHistorico(historico);
}

export async function salvarAnaliseClassificacao(
  demandaId: string,
  saudeEducacaoCorporativo: 'SAUDE' | 'EDUCACAO' | 'CORPORATIVO',
  estrategicaOuPontual: 'ESTRATEGICA' | 'PONTUAL',
  contratoCorporativo: 'SIM' | 'NAO',
  incrementoFinanceiro: 'SIM' | 'NAO',
  validacaoDiretoria: 'SIM' | 'NAO',
  contratacaoCompraProdutos: 'SIM' | 'NAO',
  maoDeObraTerceira: 'SIM' | 'NAO',
  expectativaReceita: 'NAO' | 'FATURAMENTO' | 'FIXO_MENSAL' | 'PRODUTIVIDADE' | 'OUTRAS',
  complexidade: 'BAIXA' | 'MEDIA' | 'ALTA',
  calendarizado: 'SIM' | 'NAO',
  dataCalendarizacao: string,
  solicitacaoAderente: 'SIM' | 'NAO',
  justificativaAderencia: string,
  classificadoPor: string
): Promise<void> {
  const demandas = getDemandas();
  if (!demandas[demandaId]) throw new Error('Demanda não encontrada');

  const classificacoes = getClassificacoes();
  classificacoes[demandaId] = {
    id: generateUUID(),
    saudeEducacaoCorporativo: saudeEducacaoCorporativo as any,
    estrategicaOuPontual: estrategicaOuPontual as any,
    contratoCorporativo: contratoCorporativo as any,
    incrementoFinanceiro: incrementoFinanceiro as any,
    validacaoDiretoria: validacaoDiretoria as any,
    contratacaoCompraProdutos: contratacaoCompraProdutos as any,
    maoDeObraTerceira: maoDeObraTerceira as any,
    expectativaReceita: expectativaReceita as any,
    complexidade: complexidade as any,
    calendarizado: calendarizado as any,
    dataCalendarizacao: calendarizado === 'NAO' ? dataCalendarizacao : undefined,
    solicitacaoAderente: solicitacaoAderente as any,
    justificativaAderencia: solicitacaoAderente === 'NAO' ? justificativaAderencia : undefined,
    classificadoPor,
    classificadoEm: new Date().toISOString(),
  };
  saveClassificacoes(classificacoes);

  const historico = getHistorico();
  if (!historico[demandaId]) historico[demandaId] = [];
  historico[demandaId].push({
    id: generateUUID(),
    data: new Date().toISOString(),
    usuario: classificadoPor,
    acao: 'Análise e classificação realizada',
    detalhes: `Classificada como: ${saudeEducacaoCorporativo} - ${estrategicaOuPontual}`,
  });
  saveHistorico(historico);
}

export async function atualizarNecessidadeServico(
  demandaId: string,
  necessidade: 'NORMAL' | 'URGENTE' | 'EMERGENCIAL',
  atualizadoPor: string
): Promise<void> {
  const demandas = getDemandas();
  if (!demandas[demandaId]) throw new Error('Demanda não encontrada');

  demandas[demandaId].servico.necessidade = necessidade;
  saveDemandas(demandas);

  const historico = getHistorico();
  if (!historico[demandaId]) historico[demandaId] = [];
  historico[demandaId].push({
    id: generateUUID(),
    data: new Date().toISOString(),
    usuario: atualizadoPor,
    acao: 'Necessidade do serviço alterada',
    detalhes: `Necessidade atualizada para: ${necessidade}`,
  });
  saveHistorico(historico);
}

export async function adicionarAnexosAreaTecnica(
  demandaId: string,
  anexos: Array<{ nome: string; descricao: string }>,
  adicionadoPor: string,
  areaTecnica: AreaTecnica,
  observacao: string
): Promise<void> {
  // Carrega acionamentos técnicos do storage correto
  const acionamentos = getAcionamentosTecnicos();
  if (!acionamentos[demandaId]) acionamentos[demandaId] = [];

  // Encontra o acionamento para essa área técnica
  let acionamento = acionamentos[demandaId].find(
    (a: any) => a.areasTecnicas && a.areasTecnicas.includes(areaTecnica)
  );
  
  // Se não encontrar, cria um novo
  if (!acionamento) {
    const novoAcionamento: AcionamentoTecnico = {
      id: generateUUID(),
      areasTecnicas: [areaTecnica],
      emailsDestinatarios: {} as Record<AreaTecnica, string>,
      observacoes: '',
      acionadoEm: new Date().toISOString(),
      acionadoPor: 'SISTEMA',
      respostas: [],
    };
    acionamentos[demandaId].push(novoAcionamento);
    acionamento = novoAcionamento;
  }

  // Criar anexos com a estrutura esperada
  const anexosCriados = anexos.map(anexo => ({
    id: generateUUID(),
    nome: anexo.nome,
    descricao: anexo.descricao,
    nomeArquivo: (anexo as any).nomeArquivo,
    adicionadoPor,
    adicionadoEm: new Date().toISOString(),
    areaTecnica,
  }));

  // Garantir que o array de respostas existe
  if (!acionamento.respostas) {
    acionamento.respostas = [];
  }

  // Remover resposta anterior dessa área se existir (para permitir edição)
  acionamento.respostas = acionamento.respostas.filter(r => r.areaTecnica !== areaTecnica);

  // Adicionar a nova resposta da área técnica
  acionamento.respostas.push({
    areaTecnica,
    respondidoEm: new Date().toISOString(),
    respondidoPor: adicionadoPor,
    anexos: anexosCriados,
    observacoes: observacao,
  });

  // Salva no storage correto
  saveAcionamentosTecnicos(acionamentos);

  // Adicionar ao histórico
  const historico = getHistorico();
  if (!historico[demandaId]) historico[demandaId] = [];
  historico[demandaId].push({
    id: generateUUID(),
    data: new Date().toISOString(),
    usuario: adicionadoPor,
    acao: 'Resposta enviada pela área técnica',
    detalhes: `${anexosCriados.length} anexo(s) adicionado(s) por ${AREA_TECNICA_LABELS[areaTecnica]}`,
  });
  saveHistorico(historico);

  // Verificar se TODAS as áreas técnicas acionadas responderam
  // Usa o próprio acionamento que foi atualizado, não o último da lista
  const todasAsAreasAcionadas = acionamento.areasTecnicas || [];
  const todasResponderam = todasAsAreasAcionadas.every(
    (area: AreaTecnica) => (acionamento.respostas || []).some((r: any) => r.areaTecnica === area)
  );

  if (todasResponderam) {
    const demandas = getDemandas();
    demandas[demandaId].status = 'EM_ANALISE' as StatusDemanda;
    saveDemandas(demandas);

    // Adicionar ao histórico que voltou para análise
    historico[demandaId].push({
      id: generateUUID(),
      data: new Date().toISOString(),
      usuario: 'Sistema',
      acao: 'Todas as áreas técnicas responderam - demanda retornada para análise',
      detalhes: `Áreas respondidas: ${todasAsAreasAcionadas.map((a: AreaTecnica) => AREA_TECNICA_LABELS[a]).join(', ')}`,
    });
    saveHistorico(historico);
  }
}

export async function criarAprovacoes(demandaId: string): Promise<void> {
  const demandas = getDemandas();
  if (!demandas[demandaId]) throw new Error('Demanda não encontrada');

  // Inicializar aprovacoesGestores se não existir
  if (!demandas[demandaId].aprovacoesGestores) {
    demandas[demandaId].aprovacoesGestores = [];
  }

  // Limpar aprovações anteriores
  demandas[demandaId].aprovacoesGestores = [];

  // Criar as 3 aprovações: MARCOS (1), VIANA (2), KLEBER (3)
  demandas[demandaId].aprovacoesGestores.push(
    {
      id: generateUUID(),
      gestor: 'MARCOS',
      ordem: 1,
      aprovado: null,
    },
    {
      id: generateUUID(),
      gestor: 'VIANA',
      ordem: 2,
      aprovado: null,
    },
    {
      id: generateUUID(),
      gestor: 'KLEBER',
      ordem: 3,
      aprovado: null,
    }
  );

  saveDemandas(demandas);
}

export async function atualizarStatusDemanda(
  demandaId: string,
  novoStatus: StatusDemanda
): Promise<void> {
  const demandas = getDemandas();
  if (!demandas[demandaId]) throw new Error('Demanda não encontrada');
  
  demandas[demandaId].status = novoStatus;
  saveDemandas(demandas);
  
  // Adicionar ao histórico
  const historico = getHistorico();
  if (!historico[demandaId]) historico[demandaId] = [];
  historico[demandaId].push({
    id: generateUUID(),
    data: new Date().toISOString(),
    usuario: 'SISTEMA',
    acao: 'Status atualizado',
    detalhes: `Status alterado para ${novoStatus}`,
  });
  saveHistorico(historico);
}

export async function adicionarDadosAprovacao(
  demandaId: string,
  nomeArquivo: string,
  observacoes: string
): Promise<void> {
  const demandas = getDemandas();
  if (!demandas[demandaId]) throw new Error('Demanda não encontrada');

  const dadosAprovacao = getDadosAprovacao();
  dadosAprovacao[demandaId] = {
    nomeArquivo: nomeArquivo || undefined,
    observacoes,
    adicionadoEm: new Date().toISOString(),
  };
  saveDadosAprovacao(dadosAprovacao);
}

export async function enviarParaSuprimentos(
  demandaId: string,
  encaminhadoPor: string,
  nomeArquivo?: string,
  observacoes?: string
): Promise<string> {
  const demandas = getDemandas();
  if (!demandas[demandaId]) throw new Error('Demanda não encontrada');

  // Generate a new ticket ID for supplies
  const chamadoId = generateId('CHD');
  
  demandas[demandaId].status = 'CHAMADO_SUPRIMENTOS' as StatusDemanda;
  demandas[demandaId].chamadoId = chamadoId;
  demandas[demandaId].chamadoGeradoEm = new Date().toISOString();
  saveDemandas(demandas);

  // Create a technical area notification for ASSISTENCIA (Suprimentos)
  const acionamentos = getAcionamentosTecnicos();
  if (!acionamentos[demandaId]) acionamentos[demandaId] = [];
  acionamentos[demandaId].push({
    id: generateUUID(),
    areasTecnicas: ['ASSISTENCIA'],
    emailsDestinatarios: {
      'ASSISTENCIA': 'assistencia@empresa.com',
      'ENGENHARIA': 'engenharia@empresa.com',
      'TI': 'ti@empresa.com',
      'GESTAO_PESSOAS': 'gestao.pessoas@empresa.com',
      'PEC': 'pec@empresa.com',
      'SEGURANCA': 'seguranca@empresa.com',
      'SESMT': 'sesmt@empresa.com',
      'OUTROS': 'outros@empresa.com',
    },
    observacoes: observacoes || `Demanda finalizada e chamado criado em Suprimentos. ID: ${chamadoId}`,
    acionadoEm: new Date().toISOString(),
    acionadoPor: encaminhadoPor,
    respostas: nomeArquivo ? [{
      areaTecnica: 'ASSISTENCIA' as AreaTecnica,
      respondidoEm: new Date().toISOString(),
      respondidoPor: encaminhadoPor,
      anexos: [{
        id: generateUUID(),
        nome: nomeArquivo,
        descricao: 'Informações de suprimentos',
        adicionadoPor: encaminhadoPor,
        adicionadoEm: new Date().toISOString(),
        areaTecnica: 'ASSISTENCIA' as AreaTecnica,
      }],
      observacoes: observacoes || '',
    }] : undefined,
  });
  saveAcionamentosTecnicos(acionamentos);

  // Add to history
  const historico = getHistorico();
  if (!historico[demandaId]) historico[demandaId] = [];
  historico[demandaId].push({
    id: generateUUID(),
    data: new Date().toISOString(),
    usuario: encaminhadoPor,
    acao: 'Demanda finalizada e chamado criado em Suprimentos',
    detalhes: `ID do chamado: ${chamadoId}${nomeArquivo ? ` | Arquivo: ${nomeArquivo}` : ''}`,
  });
  saveHistorico(historico);

  return chamadoId;
}

export async function retornarParaSolicitante(
  demandaId: string,
  observacoes: string,
  retornadoPor: string
): Promise<void> {
  const demandas = getDemandas();
  if (!demandas[demandaId]) throw new Error('Demanda não encontrada');

  demandas[demandaId].status = 'COMPLEMENTACAO_SOLICITADA' as StatusDemanda;
  saveDemandas(demandas);

  // Add to complementacoes
  const complementacoes = getComplementacoes();
  if (!complementacoes[demandaId]) complementacoes[demandaId] = [];
  complementacoes[demandaId].push({
    id: generateUUID(),
    solicitadaPor: retornadoPor,
    solicitadoEm: new Date().toISOString(),
    observacoes,
  });
  saveComplementacoes(complementacoes);

  // Add to history
  const historico = getHistorico();
  if (!historico[demandaId]) historico[demandaId] = [];
  historico[demandaId].push({
    id: generateUUID(),
    data: new Date().toISOString(),
    usuario: retornadoPor,
    acao: 'Demanda retornada ao solicitante para complementação',
    detalhes: observacoes,
  });
  saveHistorico(historico);
}

export async function cancelarDemanda(
  demandaId: string,
  canceladaPor: string
): Promise<void> {
  const demandas = getDemandas();
  if (!demandas[demandaId]) throw new Error('Demanda não encontrada');

  demandas[demandaId].status = 'CANCELADA' as StatusDemanda;
  saveDemandas(demandas);

  // Add to history
  const historico = getHistorico();
  if (!historico[demandaId]) historico[demandaId] = [];
  historico[demandaId].push({
    id: generateUUID(),
    data: new Date().toISOString(),
    usuario: canceladaPor,
    acao: 'Demanda cancelada',
    detalhes: 'A solicitação foi cancelada e não pode ser editada por nenhum perfil.',
  });
  saveHistorico(historico);
}

