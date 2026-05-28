export type StatusDemanda =
  | 'ABERTA'
  | 'EM_ANALISE'
  | 'COMPLEMENTACAO_SOLICITADA'
  | 'AGUARDANDO_AREA_TECNICA'
  | 'ESCOPO_VALIDADO'
  | 'APROVACAO_PENDENTE'
  | 'APROVADA'
  | 'REJEITADA'
  | 'CHAMADO_SUPRIMENTOS'
  | 'CANCELADA';

export type AreaTecnica = 
  | 'ENGENHARIA'
  | 'ASSISTENCIA'
  | 'TI'
  | 'GESTAO_PESSOAS'
  | 'SEGURANCA'
  | 'SESMT'
  | 'OUTROS';

export type TipoServico = 
  | 'LAVANDERIA'
  | 'LIMPEZA'
  | 'CONTROLE_PRAGAS'
  | 'PORTEIRO'
  | 'VIGILANTES'
  | 'GASES_MEDICINAIS'
  | 'JARDINAGEM'
  | 'GLP'
  | 'LOCACAO_VEICULOS'
  | 'COLETA_RESIDUOS'
  | 'ESTACIONAMENTO'
  | 'LANCHONETE'
  | 'RESTAURANTE'
  | 'COZINHA_COPA'
  | 'MAQUINA_CAFE'
  | 'VENDING_MACHINE'
  | 'GUARDA_DOCUMENTOS'
  | 'UNIFORME'
  | 'SEGURO_VEICULOS'
  | 'SEGURO_PATRIMONIAL'
  | 'SEGURO_RESPONSABILIDADE_CIVIL'
  | 'SEGURO_ALUNOS'
  | 'DIAGNOSTICO_IMAGEM'
  | 'ANALISES_CLINICAS'
  | 'AGENCIA_TRANSFUSIONAL'
  | 'BANCO_SANGUE'
  | 'CAMERAS_CFTV'
  | 'OUTROS';

export type TipoDemanda = 'ESTRATEGICA' | 'PONTUAL';
export type Segmento = 'SAUDE' | 'EDUCACAO' | 'CORPORATIVO';
export type NecessidadeServico = 'NORMAL' | 'URGENTE' | 'EMERGENCIAL';
export type TipoContratacao = 'EXISTENTE' | 'NOVA';
export type ClassificacaoSaude = 'SAUDE' | 'EDUCACAO' | 'CORPORATIVO';
export type ExpectativaReceita = 'NAO' | 'FATURAMENTO' | 'FIXO_MENSAL' | 'PRODUTIVIDADE' | 'OUTRAS';
export type Complexidade = 'BAIXA' | 'MEDIA' | 'ALTA';
export type AcaoAprovacao = 'APROVAR' | 'REJEITAR' | 'PEDIR_INFORMACOES';
export type Objetivo = 
  | 'AUMENTO_ESCOPO'
  | 'REDUCAO_ESCOPO'
  | 'RESCISAO_CONTRATUAL'
  | 'PROBLEMAS_OPERACIONAIS'
  | 'REAJUSTE_REEQUILIBRIO'
  | 'CONTRATACAO_NOVO_SERVICO'
  | 'CONSULTA_INSTRUMENTOS'
  | 'OUTROS';

export interface Solicitante {
  nome: string;
  email: string;
  celular: string;
  casa: string;
  segmento: Segmento;
  departamento: string;
  centroDeCusto: string;
}

export interface ServicoSolicitado {
  tipo: TipoServico;
  local: string;
  necessidade: NecessidadeServico;
  tipoContratacao: TipoContratacao;
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

export interface Classificacao {
  id: string;
  saudeEducacaoCorporativo: ClassificacaoSaude;
  estrategicaOuPontual?: TipoDemanda;
  contratoCorporativo?: 'SIM' | 'NAO';
  incrementoFinanceiro?: 'SIM' | 'NAO';
  validacaoDiretoria?: 'SIM' | 'NAO';
  contratacaoCompraProdutos?: 'SIM' | 'NAO';
  maoDeObraTerceira?: 'SIM' | 'NAO';
  expectativaReceita?: ExpectativaReceita;
  complexidade?: Complexidade;
  calendarizado?: 'SIM' | 'NAO';
  dataCalendarizacao?: string;
  solicitacaoAderente?: 'SIM' | 'NAO';
  justificativaAderencia?: string;
  classificadoPor: string;
  classificadoEm: string;
}

export interface Complementacao {
  id: string;
  solicitadaPor: string;
  solicitadoEm: string;
  observacoes: string;
  respondidoEm?: string;
  respondidoPor?: string;
  observacoesSolicitante?: string;
}

export interface AnexoAreaTecnica {
  id: string;
  nome: string;
  descricao: string;
  adicionadoPor: string;
  adicionadoEm: string;
  areaTecnica: AreaTecnica;
}

export interface RespostaAreaTecnica {
  areaTecnica: AreaTecnica;
  respondidoEm: string;
  respondidoPor: string;
  anexos: AnexoAreaTecnica[];
  observacoes: string;
}

export interface AcionamentoTecnico {
  id: string;
  areasTecnicas: AreaTecnica[];
  emailsDestinatarios: Record<AreaTecnica, string>;
  observacoes: string;
  acionadoEm: string;
  acionadoPor: string;
  respostas?: RespostaAreaTecnica[];
  // Deprecated - manter para compatibilidade com dados antigos
  respondidoEm?: string;
  respondidoPor?: string;
  anexos?: AnexoAreaTecnica[];
}

export interface ValidacaoEscopo {
  id: string;
  aprovado: boolean;
  observacoes: string;
  validadoEm: string;
  validadoPor: string;
}

export interface AprovacaoGestor {
  id: string;
  gestor: 'MARCOS' | 'VIANA' | 'KLEBER';
  ordem: number;
  acao?: AcaoAprovacao;
  aprovado?: boolean | null;
  observacoes?: string;
  aprovadoEm?: string;
}

export interface EventoHistorico {
  id: string;
  data: string;
  usuario: string;
  acao: string;
  detalhes?: string;
}

export interface Analise {
  id: string;
  necessitaComplementacao: boolean;
  observacoes?: string;
  acoesInternas?: string;
  analisadoPor: string;
  analisadoEm: string;
}

export interface Validacao {
  id: string;
  aprovado: boolean;
  motivoRejeicao?: string;
  validadoPor: string;
  validadoEm: string;
}

export interface Aprovacao {
  id: string;
  gerente: string;
  ordem: number;
  aprovado: boolean | null;
  motivoRejeicao?: string;
  aprovadoEm?: string;
}

export interface DadosAprovacao {
  nomeArquivo?: string;
  observacoes: string;
  adicionadoEm: string;
}

export interface Demanda {
  id: string;
  dataCriacao: string;
  status: StatusDemanda;
  chamadoId?: string;
  chamadoGeradoEm?: string;
  ciclo?: number;
  dataInicio?: string;
  dataPrazo?: string;
  solicitante: Solicitante;
  servico: ServicoSolicitado;
  classificacao?: Classificacao;
  historico: EventoHistorico[];
  complementacoes: Complementacao[];
  acionamentosTecnicos: AcionamentoTecnico[];
  validacaoEscopo?: ValidacaoEscopo;
  aprovacoesGestores: AprovacaoGestor[];
  dadosAprovacao?: DadosAprovacao;
}

export type UserRole = 'SOLICITANTE' | 'LEONARDO' | 'DIRETOR' | 'MARCOS' | 'VIANA' | 'KLEBER' | 'ENGENHARIA' | 'ASSISTENCIA' | 'TI' | 'GESTAO_PESSOAS' | 'SEGURANCA' | 'SESMT' | 'OUTROS';

export interface User {
  id: string;
  name: string;
  email: string;
  casa: string;
  departamento: string;
  centroDeCusto: string;
  role: UserRole;
}

export const DEMO_USERS: User[] = [
  { id: '1', name: 'Gladys', email: 'gladys@empresa.com', casa: 'Unidade Hospitalar A', departamento: 'Recursos Humanos', centroDeCusto: '12345 - RH', role: 'SOLICITANTE' },
  { id: '2', name: 'Adriana', email: 'adriana@empresa.com', casa: 'Sede Principal', departamento: 'Facilities', centroDeCusto: '54321 - Facilities', role: 'LEONARDO' },
  { id: '3', name: 'Marcus', email: 'marcus@empresa.com', casa: 'Unidade Hospitalar B', departamento: 'Gerência', centroDeCusto: '11111 - Gerência', role: 'MARCOS' },
  { id: '4', name: 'Jerry', email: 'jerry@empresa.com', casa: 'Casa 1 - Centro', departamento: 'Gerência', centroDeCusto: '22222 - Gerência', role: 'VIANA' },
  { id: '5', name: 'Rogerio', email: 'rogerio@empresa.com', casa: 'Sede Principal', departamento: 'Gerência', centroDeCusto: '33333 - Gerência', role: 'KLEBER' },
  { id: '6', name: 'Antônio Engenheiro Clinico', email: 'antonio@empresa.com', casa: 'Sede Principal', departamento: 'Engenharia', centroDeCusto: '44444 - Engenharia', role: 'ENGENHARIA' },
  { id: '7', name: 'Chris', email: 'chris@empresa.com', casa: 'Sede Principal', departamento: 'Suprimentos', centroDeCusto: '45555 - Suprimentos', role: 'ASSISTENCIA' },
  { id: '8', name: 'Daniel', email: 'daniel@empresa.com', casa: 'Sede Principal', departamento: 'TI - Integração Sistema', centroDeCusto: '46666 - TI', role: 'TI' },
  { id: '9', name: 'Angela', email: 'angela@empresa.com', casa: 'Sede Principal', departamento: 'PEC', centroDeCusto: '47777 - PEC', role: 'GESTAO_PESSOAS' },
  { id: '10', name: 'Elcio - Equipe Segurança', email: 'seguranca@empresa.com', casa: 'Sede Principal', departamento: 'Segurança', centroDeCusto: '48888 - Segurança', role: 'SEGURANCA' },
  { id: '11', name: 'Equipe SESMT', email: 'sesmt@empresa.com', casa: 'Sede Principal', departamento: 'SESMT', centroDeCusto: '49999 - SESMT', role: 'SESMT' },
];

export const STATUS_LABELS: Record<StatusDemanda, string> = {
  ABERTA: 'Aberta',
  EM_ANALISE: 'Em Análise (Engenharia Corporativa)',
  COMPLEMENTACAO_SOLICITADA: 'Complementação Solicitada',
  AGUARDANDO_AREA_TECNICA: 'Aguardando Área Técnica',
  ESCOPO_VALIDADO: 'Escopo Validado',
  APROVACAO_PENDENTE: 'Aprovação Pendente',
  APROVADA: 'Aprovada',
  REJEITADA: 'Rejeitada',
  CHAMADO_SUPRIMENTOS: 'Chamado Suprimentos',
  CANCELADA: 'Cancelada',
};

export const STATUS_COLORS: Record<StatusDemanda, string> = {
  ABERTA: 'bg-blue-100 text-blue-800',
  EM_ANALISE: 'bg-yellow-100 text-yellow-800',
  COMPLEMENTACAO_SOLICITADA: 'bg-orange-100 text-orange-800',
  AGUARDANDO_AREA_TECNICA: 'bg-purple-100 text-purple-800',
  ESCOPO_VALIDADO: 'bg-cyan-100 text-cyan-800',
  APROVACAO_PENDENTE: 'bg-indigo-100 text-indigo-800',
  APROVADA: 'bg-green-100 text-green-800',
  REJEITADA: 'bg-red-100 text-red-800',
  CHAMADO_SUPRIMENTOS: 'bg-emerald-100 text-emerald-800',
  CANCELADA: 'bg-gray-100 text-gray-800',
};

export const TIPO_SERVICO_LABELS: Record<TipoServico, string> = {
  LAVANDERIA: 'Serviço de Lavanderia',
  LIMPEZA: 'Serviço de Limpeza',
  CONTROLE_PRAGAS: 'Serviço de Controle de Pragas',
  PORTEIRO: 'Serviço de Segurança (Portaria e/ou vigilância)',
  VIGILANTES: 'Serviço de Vigilantes',
  GASES_MEDICINAIS: 'Serviço de Gases Medicinais',
  JARDINAGEM: 'Serviço de Jardinagem',
  GLP: 'Serviço de GLP',
  LOCACAO_VEICULOS: 'Locação de Veículos',
  COLETA_RESIDUOS: 'Serviço de Coleta de Resíduos',
  ESTACIONAMENTO: 'Serviço de Estacionamento Privado',
  LANCHONETE: 'Serviço Comercial de Alimentação (Lanchonete e Restaurante)',
  RESTAURANTE: 'Serviço de Restaurante',
  COZINHA_COPA: 'Serviço de Cozinha e Copa (SND)',
  MAQUINA_CAFE: 'Serviço de máquina de café',
  VENDING_MACHINE: 'Locação de Vending Machine',
  GUARDA_DOCUMENTOS: 'Guarda de documentos (físico)',
  UNIFORME: 'Uniforme Profissional ou Escolar',
  SEGURO_VEICULOS: 'Seguros Veículos',
  SEGURO_PATRIMONIAL: 'Seguros Patrimonial',
  SEGURO_RESPONSABILIDADE_CIVIL: 'Seguro Responsabilidade civil',
  SEGURO_ALUNOS: 'Seguro Alunos',
  DIAGNOSTICO_IMAGEM: 'Diagnóstico por Imagem',
  ANALISES_CLINICAS: 'Análises Clínicas',
  AGENCIA_TRANSFUSIONAL: 'Agencia Transfusional',
  BANCO_SANGUE: 'Serviço de Banco de Sangue',
  CAMERAS_CFTV: 'Serviços de sistemas de Câmeras e CFTV',
  OUTROS: 'Outros',
};

export const SEGMENTO_LABELS: Record<Segmento, string> = {
  SAUDE: 'Saúde',
  EDUCACAO: 'Educação',
  CORPORATIVO: 'Corporativo',
};

export const SERVICOS_POR_SEGMENTO: Record<Segmento, TipoServico[]> = {
  SAUDE: [
    'LAVANDERIA',
    'LIMPEZA',
    'CONTROLE_PRAGAS',
    'PORTEIRO',
    'VIGILANTES',
    'CAMERAS_CFTV',
    'GASES_MEDICINAIS',
    'JARDINAGEM',
    'GLP',
    'LOCACAO_VEICULOS',
    'COLETA_RESIDUOS',
    'ESTACIONAMENTO',
    'LANCHONETE',
    'RESTAURANTE',
    'COZINHA_COPA',
    'VENDING_MACHINE',
    'GUARDA_DOCUMENTOS',
    'UNIFORME',
    'SEGURO_VEICULOS',
    'SEGURO_PATRIMONIAL',
    'SEGURO_RESPONSABILIDADE_CIVIL',
    'DIAGNOSTICO_IMAGEM',
    'ANALISES_CLINICAS',
    'AGENCIA_TRANSFUSIONAL',
    'OUTROS',
  ],
  EDUCACAO: [
    'LIMPEZA',
    'CONTROLE_PRAGAS',
    'PORTEIRO',
    'VIGILANTES',
    'CAMERAS_CFTV',
    'JARDINAGEM',
    'GLP',
    'LOCACAO_VEICULOS',
    'COLETA_RESIDUOS',
    'ESTACIONAMENTO',
    'LANCHONETE',
    'RESTAURANTE',
    'COZINHA_COPA',
    'VENDING_MACHINE',
    'GUARDA_DOCUMENTOS',
    'UNIFORME',
    'SEGURO_VEICULOS',
    'SEGURO_PATRIMONIAL',
    'SEGURO_RESPONSABILIDADE_CIVIL',
    'SEGURO_ALUNOS',
    'OUTROS',
  ],
  CORPORATIVO: [
    'LAVANDERIA',
    'LIMPEZA',
    'CONTROLE_PRAGAS',
    'PORTEIRO',
    'VIGILANTES',
    'CAMERAS_CFTV',
    'GASES_MEDICINAIS',
    'JARDINAGEM',
    'GLP',
    'LOCACAO_VEICULOS',
    'COLETA_RESIDUOS',
    'ESTACIONAMENTO',
    'LANCHONETE',
    'RESTAURANTE',
    'COZINHA_COPA',
    'VENDING_MACHINE',
    'GUARDA_DOCUMENTOS',
    'UNIFORME',
    'SEGURO_VEICULOS',
    'SEGURO_PATRIMONIAL',
    'SEGURO_RESPONSABILIDADE_CIVIL',
    'SEGURO_ALUNOS',
    'DIAGNOSTICO_IMAGEM',
    'ANALISES_CLINICAS',
    'AGENCIA_TRANSFUSIONAL',
    'BANCO_SANGUE',
    'OUTROS',
  ],
};

export const NECESSIDADE_SERVICO_LABELS: Record<NecessidadeServico, string> = {
  NORMAL: 'Normal',
  URGENTE: 'Urgente',
  EMERGENCIAL: 'Emergencial',
};

export const TIPO_CONTRATACAO_LABELS: Record<TipoContratacao, string> = {
  EXISTENTE: 'Existente',
  NOVA: 'Nova',
};

export const CLASSIFICACAO_SAUDE_LABELS: Record<ClassificacaoSaude, string> = {
  SAUDE: 'Saúde',
  EDUCACAO: 'Educação',
  CORPORATIVO: 'Corporativo',
};

export const TIPO_DEMANDA_LABELS: Record<TipoDemanda, string> = {
  ESTRATEGICA: 'Estratégica',
  PONTUAL: 'Pontual',
};

export const EXPECTATIVA_RECEITA_LABELS: Record<ExpectativaReceita, string> = {
  NAO: 'Não',
  FATURAMENTO: 'Faturamento',
  FIXO_MENSAL: 'Fixo Mensal',
  PRODUTIVIDADE: 'Produtividade',
  OUTRAS: 'Outras',
};

export const OBJETIVO_LABELS: Record<Objetivo, string> = {
  AUMENTO_ESCOPO: 'Aumento de escopo',
  REDUCAO_ESCOPO: 'Redução de escopo',
  RESCISAO_CONTRATUAL: 'Rescisão Contratual',
  PROBLEMAS_OPERACIONAIS: 'Problemas operacionais recorrente',
  REAJUSTE_REEQUILIBRIO: 'Reajuste ou Reequilibrio contratual',
  CONTRATACAO_NOVO_SERVICO: 'Contratação de Novo Serviço',
  CONSULTA_INSTRUMENTOS: 'Consulta sobre instrumentos contratuais, contratos corporativos',
  OUTROS: 'Outros',
};

export const AREA_TECNICA_LABELS: Record<AreaTecnica, string> = {
  ENGENHARIA: 'Engenharia',
  ASSISTENCIA: 'Assistência',
  TI: 'TI (Integração Sistema)',
  GESTAO_PESSOAS: 'Gestão de Pessoas',
  SEGURANCA: 'Segurança',
  SESMT: 'SESMT',
  OUTROS: 'Outros',
};

export const COMPLEXIDADE_LABELS: Record<Complexidade, string> = {
  BAIXA: 'Baixa - Fluxo sem necessidade de avaliação técnica',
  MEDIA: 'Média - Necessidade de UMA área técnica',
  ALTA: 'Alta - Necessidade de MAIS áreas técnicas',
};

export const ACAO_APROVACAO_LABELS: Record<AcaoAprovacao, string> = {
  APROVAR: 'Aprovar',
  REJEITAR: 'Rejeitar',
  PEDIR_INFORMACOES: 'Pedir Informações Complementares',
};

export const AREA_TECNICA_EMAILS: Record<Exclude<AreaTecnica, 'OUTROS'>, string> = {
  ENGENHARIA: 'engenharia@empresa.com',
  ASSISTENCIA: 'assistencia@empresa.com',
  TI: 'ti@empresa.com',
  GESTAO_PESSOAS: 'gestao.pessoas@empresa.com',
  SEGURANCA: 'seguranca@empresa.com',
  SESMT: 'sesmt@empresa.com',
};

export const CASAS = [
  'Casa 1 - Centro',
  'Casa 2 - Norte',
  'Casa 3 - Sul',
  'Casa 4 - Leste',
  'Casa 5 - Oeste',
  'Sede Principal',
  'Unidade Hospitalar A',
  'Unidade Hospitalar B',
];
