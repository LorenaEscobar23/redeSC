import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, ChevronDown } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Input, TextArea, Select } from '../components/ui/Input';
import { PageSpinner } from '../components/ui/Spinner';
import { ConfirmModal, Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDemandas } from '../context/DemandasContext';
import * as service from '../services/demandaService';
import type { Demanda, AreaTecnica, Segmento } from '../types';
import { TIPO_SERVICO_LABELS, AREA_TECNICA_LABELS, SEGMENTO_LABELS, NECESSIDADE_SERVICO_LABELS, TIPO_CONTRATACAO_LABELS, OBJETIVO_LABELS, STATUS_LABELS, COMPLEXIDADE_LABELS, SERVICOS_POR_SEGMENTO } from '../types';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4">
      <dt className="text-xs font-medium text-gray-500 sm:w-40 flex-shrink-0">{label}</dt>
      <dd className="text-sm text-gray-900 mt-0.5 sm:mt-0">{value}</dd>
    </div>
  );
}

export function ProcessoPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { refreshDemanda } = useDemandas();
  const navigate = useNavigate();

  const [demanda, setDemanda] = useState<Demanda | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'historico'>('info');
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMsg, setConfirmMsg] = useState('');
  const [confirmDanger, setConfirmDanger] = useState(false);

  // Leonardo - Ação única consolidada
  const [areasTecnicaSelecionadas, setAreasTecnicaSelecionadas] = useState<AreaTecnica[]>([]);

  // Leonardo - Análise e Classificação
  const [saudeEducacaoCorporativo, setSaudeEducacaoCorporativo] = useState<'SAUDE' | 'EDUCACAO' | 'CORPORATIVO' | ''>('');
  const [estrategicaOuPontual, setEstrategicaOuPontual] = useState<'ESTRATEGICA' | 'PONTUAL' | ''>('');
  const [contratoCorporativo, setContratoCorporativo] = useState<'SIM' | 'NAO' | ''>('');
  const [incrementoFinanceiro, setIncrementoFinanceiro] = useState<'SIM' | 'NAO' | ''>('');
  const [validacaoDiretoria, setValidacaoDiretoria] = useState<'SIM' | 'NAO' | ''>('');
  const [contratacaoCompraProdutos, setContratacaoCompraProdutos] = useState<'SIM' | 'NAO' | ''>('');
  const [maoDeObraTerceira, setMaoDeObraTerceira] = useState<'SIM' | 'NAO' | ''>('');
  const [expectativaReceita, setExpectativaReceita] = useState<'NAO' | 'FATURAMENTO' | 'FIXO_MENSAL' | 'PRODUTIVIDADE' | 'OUTRAS' | ''>('');
  const [complexidade, setComplexidade] = useState<'BAIXA' | 'MEDIA' | 'ALTA' | ''>('');
  const [calendarizado, setCalendarizado] = useState<'SIM' | 'NAO' | ''>('');
  const [dataCalendarizacao, setDataCalendarizacao] = useState('');
  const [solicitacaoAderente, setSolicitacaoAderente] = useState<'SIM' | 'NAO' | ''>('');
  const [justificativaAderencia, setJustificativaAderencia] = useState('');



  // Gestores - Aprovação
  const [aprovacaoObsGestor, setAprovacaoObsGestor] = useState('');
  const [acaoAprovacao, setAcaoAprovacao] = useState<'APROVAR' | 'REJEITAR' | 'PEDIR_INFORMACOES' | ''>('');

  // Solicitante - Complementação (Modo Edição)
  const [editingSolicitante, setEditingSolicitante] = useState(false);
  const [solicitanteEdit, setSolicitanteEdit] = useState<any>(null);
  const [servicoEdit, setServicoEdit] = useState<any>(null);
  const [observacoesSolicitante, setObservacoesSolicitante] = useState('');

  // Leonardo - Edição de Necessidade do Serviço
  const [necessidadeEdit, setNecessidadeEdit] = useState('');

  // Modo de edição (Adriana)
  const [editMode, setEditMode] = useState(false);

  // Leonardo - Edição de Segmento e Mão de Obra
  const [segmentoEdit, setSegmentoEdit] = useState('');
  const [maoDeObraEdit, setMaoDeObraEdit] = useState('');

  // Solicitante - Upload de Contrato e Aditivos
  const [, setUploadContratoArquivo] = useState<File | null>(null);
  const [uploadContratoNomeArquivo, setUploadContratoNomeArquivo] = useState('');

  // Área Técnica - Envio de Anexos
  const [anexoTecnicoNome, setAnexoTecnicoNome] = useState('');
  const [anexoTecnicoDesc, setAnexoTecnicoDesc] = useState('');
  const [, setAnexoTecnicoFile] = useState<File | null>(null);
  const [anexosTecnicosPendentes, setAnexosTecnicosPendentes] = useState<Array<{ nome: string; descricao: string; nomeArquivo?: string }>>([]);
  const [observacaoAreaTecnica, setObservacaoAreaTecnica] = useState('');

  // Leonardo - Filtro de Anexos Técnicos
  const [filtroAreaTecnica, setFiltroAreaTecnica] = useState<AreaTecnica | 'TODOS'>('TODOS');

  // Collapsible sections
  const [showHistorico, setShowHistorico] = useState(true);
  const [expandedSolicitante, setExpandedSolicitante] = useState(true);
  const [expandedClassificacao, setExpandedClassificacao] = useState(true);
  const [expandedAnexosTecnicos, setExpandedAnexosTecnicos] = useState(true);

  // Ação a ser tomada
  const [acaoTomada, setAcaoTomada] = useState('');

  // Modals for actions
  const [showSuprimentosModal, setShowSuprimentosModal] = useState(false);
  const [chamadoGerado, setChamadoGerado] = useState('');
  const [retornarObs, setRetornarObs] = useState('');
  
  // Aprovação - Arquivo e Observações para envio
  const [, setAprovacaoArquivo] = useState<File | null>(null);
  const [aprovacaoNomeArquivo, setAprovacaoNomeArquivo] = useState('');
  const [aprovacaoObs, setAprovacaoObs] = useState('');
  
  // Suprimentos - Arquivo e Observações para envio
  const [, setSuprimentosArquivo] = useState<File | null>(null);
  const [suprimentosNomeArquivo, setSuprimentosNomeArquivo] = useState('');
  const [suprimentosObs, setSuprimentosObs] = useState('');

  useEffect(() => {
    if (!id) return;
    loadDemanda();
  }, [id]);

  // Collapse sections for approvers by default
  useEffect(() => {
    if (['MARCOS', 'VIANA', 'KLEBER'].includes(user?.role ?? '')) {
      setExpandedSolicitante(false);
      setExpandedClassificacao(false);
      setExpandedAnexosTecnicos(false);
    }
  }, [user?.role]);

  async function loadDemanda() {
    try {
      const d = await service.buscarDemanda(id!);
      
      // Validar permissão de acesso
      if (!hasAccessToDemanda(d)) {
        showToast('Você não tem permissão para visualizar esta demanda.', 'error');
        navigate('/demandas');
        return;
      }
      
      setDemanda(d);
      // Initialize edit state
      setSolicitanteEdit(JSON.parse(JSON.stringify(d.solicitante)));
      setServicoEdit(JSON.parse(JSON.stringify(d.servico)));
      setSegmentoEdit(d.solicitante.segmento || '');
      setMaoDeObraEdit(d.servico.maoDeObra ? 'SIM' : 'NAO');
      // Initialize classification state
      if (d.classificacao) {
        setSaudeEducacaoCorporativo(d.classificacao.saudeEducacaoCorporativo || '');
        setEstrategicaOuPontual(d.classificacao.estrategicaOuPontual || '');
        setContratoCorporativo(d.classificacao.contratoCorporativo || '');
        setIncrementoFinanceiro(d.classificacao.incrementoFinanceiro || '');
        setValidacaoDiretoria(d.classificacao.validacaoDiretoria || '');
        setContratacaoCompraProdutos(d.classificacao.contratacaoCompraProdutos || '');
        setMaoDeObraTerceira(d.classificacao.maoDeObraTerceira || '');
        setExpectativaReceita(d.classificacao.expectativaReceita || '');
        setComplexidade(d.classificacao.complexidade || '');
        setCalendarizado(d.classificacao.calendarizado || '');
        setDataCalendarizacao(d.classificacao.dataCalendarizacao || '');
        setSolicitacaoAderente(d.classificacao.solicitacaoAderente || '');
        setJustificativaAderencia(d.classificacao.justificativaAderencia || '');
      }
    } catch {
      showToast('Erro ao carregar demanda.', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Validar se usuário tem acesso à demanda
  function hasAccessToDemanda(demanda: Demanda): boolean {
    if (!user) return false;

    // Adriana (LEONARDO) e Gladys (SOLICITANTE que criou) veem tudo
    if (user.role === 'LEONARDO') return true;
    if (user.role === 'SOLICITANTE' && demanda.solicitante.nome === user.name) return true;

    // Aprovadores veem demandas que estão em sua aprovação
    if (user.role === 'MARCOS') {
      return demanda.aprovacoesGestores.some((a) => a.ordem === 1 && a.gestor === 'MARCOS') && demanda.status === 'APROVACAO_PENDENTE';
    }
    if (user.role === 'VIANA') {
      return demanda.aprovacoesGestores.some((a) => a.ordem === 2 && a.gestor === 'VIANA') && demanda.status === 'APROVACAO_PENDENTE';
    }
    if (user.role === 'KLEBER') {
      return demanda.aprovacoesGestores.some((a) => a.ordem === 3 && a.gestor === 'KLEBER') && demanda.status === 'APROVACAO_PENDENTE';
    }

    // Áreas técnicas veem demandas que foram acionadas para elas
    const areasTenicas = ['ENGENHARIA', 'ASSISTENCIA', 'TI', 'GESTAO_PESSOAS', 'SEGURANCA', 'SESMT'];
    if (areasTenicas.includes(user.role)) {
      return demanda.acionamentosTecnicos.some((a) => a.areasTecnicas.includes(user.role as any));
    }

    return false;
  }

  function reload() {
    loadDemanda().then(() => {
      if (demanda?.id) refreshDemanda(demanda.id);
    });
  }

  function confirm(msg: string, action: () => void, danger = false) {
    setConfirmMsg(msg);
    setConfirmAction(() => action);
    setConfirmDanger(danger);
    setConfirmOpen(true);
  }

  const isComplementacaoMode = demanda?.status === 'COMPLEMENTACAO_SOLICITADA' && user?.name === demanda?.solicitante.nome;

  async function handleSalvarComplementacao() {
    if (!demanda || !user || !solicitanteEdit || !servicoEdit) return;
    
    // Validações básicas
    if (!servicoEdit.descricao?.trim() || servicoEdit.descricao.length < 10) {
      showToast('Descrição deve ter no mínimo 10 caracteres.', 'warning');
      return;
    }
    if (!servicoEdit.descricaoEscopo?.trim() || servicoEdit.descricaoEscopo.length < 10) {
      showToast('Escopo deve ter no mínimo 10 caracteres.', 'warning');
      return;
    }

    // Adicionar arquivo de contrato se houver
    if (uploadContratoNomeArquivo) {
      servicoEdit.nomeArquivoContratoAditivos = uploadContratoNomeArquivo;
    }

    setSaving(true);
    try {
      await service.atualizarDemandaComplementacao(
        demanda.id,
        solicitanteEdit,
        servicoEdit,
        user.name,
        observacoesSolicitante || undefined
      );
      showToast('Complementação enviada com sucesso!', 'success');
      setEditingSolicitante(false);
      setObservacoesSolicitante('');
      setUploadContratoArquivo(null);
      setUploadContratoNomeArquivo('');
      setTimeout(() => {
        reload();
      }, 1500);
    } catch (err) {
      showToast('Erro ao salvar complementação.', 'error');
    } finally {
      setSaving(false);
    }
  }

  // ETAPA 4 - GESTORES - Aprovação
  function getGerenteOrdem(): number {
    if (!user) return 0;
    if (user.role === 'MARCOS') return 1;
    if (user.role === 'VIANA') return 2;
    if (user.role === 'KLEBER') return 3;
    return 0;
  }

  function canApprove(): boolean {
    if (!demanda || !user) return false;
    if (demanda.status !== 'APROVACAO_PENDENTE') return false;
    const ordem = getGerenteOrdem();
    if (ordem === 0) return false;
    if (ordem === 1) return true;
    const prev = demanda.aprovacoesGestores.find((a) => a.ordem === ordem - 1);
    return !!prev && prev.aprovado === true;
  }

  // Gestores - Executar Ação de Aprovação (Novo Sistema)
  async function handleExecutarAcao() {
    if (!demanda || !user) {
      showToast('Erro: demanda ou usuário não encontrado.', 'error');
      return;
    }
    if (!acaoAprovacao) {
      showToast('Selecione uma ação a ser tomada.', 'warning');
      return;
    }
    if ((acaoAprovacao === 'REJEITAR' || acaoAprovacao === 'PEDIR_INFORMACOES') && !aprovacaoObsGestor.trim()) {
      showToast('Informe as observações para esta ação.', 'warning');
      return;
    }
    
    // Validar que o usuário é um dos aprovadores
    if (!['MARCOS', 'VIANA', 'KLEBER'].includes(user.role)) {
      showToast('Você não tem permissão para aprovar demandas.', 'error');
      return;
    }
    
    setSaving(true);
    try {
      const acao = acaoAprovacao as 'APROVAR' | 'REJEITAR' | 'PEDIR_INFORMACOES';
      await service.executarAcaoAprovacao(
        demanda.id,
        user.role as 'MARCOS' | 'VIANA' | 'KLEBER',
        acao,
        aprovacaoObsGestor
      );
      const mensagens: Record<string, string> = {
        'APROVAR': 'Demanda aprovada!',
        'REJEITAR': 'Demanda rejeitada!',
        'PEDIR_INFORMACOES': 'Informações adicionais solicitadas!',
      };
      showToast(mensagens[acaoAprovacao], 'success');
      setAcaoAprovacao('');
      setAprovacaoObsGestor('');
      await refreshDemanda(demanda.id);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      showToast('Erro ao executar ação.', 'error');
    } finally {
      setSaving(false);
    }
  }

  // LEONARDO - Salvar Análise e Classificação
  async function handleSalvarAnaliseClassificacao() {
    if (!demanda || !user) {
      showToast('Erro ao carregar dados da demanda.', 'error');
      return;
    }

    // Validar apenas campos condicionais se preenchidos
    if (solicitacaoAderente === 'NAO' && !justificativaAderencia.trim()) {
      showToast('Informe a justificativa de não-aderência.', 'warning');
      return;
    }

    setSaving(true);
    try {
      // Salvar necessidade se foi alterada
      if (necessidadeEdit && necessidadeEdit !== demanda.servico.necessidade) {
        await service.atualizarNecessidadeServico(
          demanda.id,
          necessidadeEdit as 'NORMAL' | 'URGENTE' | 'EMERGENCIAL',
          user.name
        );
      }

      // Salvar segmento e mão de obra se foram alterados
      const segmentoMudou = segmentoEdit && segmentoEdit !== demanda.solicitante.segmento;
      const maoDeObraMudou = maoDeObraEdit && maoDeObraEdit !== (demanda.servico.maoDeObra ? 'SIM' : 'NAO');
      if (segmentoMudou || maoDeObraMudou) {
        const solicitanteAtualizado = { ...demanda.solicitante, segmento: (segmentoEdit || demanda.solicitante.segmento) as any };
        const servicoAtualizado = { ...demanda.servico, maoDeObra: maoDeObraEdit ? maoDeObraEdit === 'SIM' : demanda.servico.maoDeObra };
        await service.atualizarDemandaComplementacao(demanda.id, solicitanteAtualizado, servicoAtualizado, user.name);
      }

      await service.salvarAnaliseClassificacao(
        demanda.id,
        saudeEducacaoCorporativo as 'SAUDE' | 'EDUCACAO' | 'CORPORATIVO',
        estrategicaOuPontual as 'ESTRATEGICA' | 'PONTUAL',
        contratoCorporativo as 'SIM' | 'NAO',
        incrementoFinanceiro as 'SIM' | 'NAO',
        validacaoDiretoria as 'SIM' | 'NAO',
        contratacaoCompraProdutos as 'SIM' | 'NAO',
        maoDeObraTerceira as 'SIM' | 'NAO',
        expectativaReceita as 'NAO' | 'FATURAMENTO' | 'FIXO_MENSAL' | 'PRODUTIVIDADE' | 'OUTRAS',
        complexidade as 'BAIXA' | 'MEDIA' | 'ALTA',
        calendarizado as 'SIM' | 'NAO',
        dataCalendarizacao,
        solicitacaoAderente as 'SIM' | 'NAO',
        justificativaAderencia,
        user.name
      );
      showToast('Análise e classificação salvas com sucesso!', 'success');
      setEditMode(false);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch {
      showToast('Erro ao salvar análise.', 'error');
    } finally {
      setSaving(false);
    }
  }

  // Área Técnica - Gerenciar Anexos
  function handleAdicionarAnexoTecnico() {
    if (!anexoTecnicoNome.trim() || !anexoTecnicoDesc.trim()) {
      showToast('Preencha o nome e a descrição.', 'warning');
      return;
    }
    setAnexosTecnicosPendentes([...anexosTecnicosPendentes, { nome: anexoTecnicoNome, descricao: anexoTecnicoDesc }]);
    setAnexoTecnicoNome('');
    setAnexoTecnicoDesc('');
    setAnexoTecnicoFile(null);
  }

  function handleRemoverAnexoTecnico(index: number) {
    setAnexosTecnicosPendentes(anexosTecnicosPendentes.filter((_, i) => i !== index));
  }

  async function handleSalvarAnexosTecnicos() {
    if (!demanda || !user || anexosTecnicosPendentes.length === 0 || !observacaoAreaTecnica.trim()) {
      showToast('Preencha todos os campos obrigatórios.', 'warning');
      return;
    }

    setSaving(true);
    try {
      // Adiciona anexos da área técnica
      await service.adicionarAnexosAreaTecnica(
        demanda.id, 
        anexosTecnicosPendentes.map(a => ({ nome: a.nome, descricao: a.descricao, nomeArquivo: a.nomeArquivo })), 
        user.name, 
        user.role as any, 
        observacaoAreaTecnica
      );
      
      showToast('Resposta da área técnica enviada com sucesso!', 'success');
      setAnexoTecnicoNome('');
      setAnexoTecnicoDesc('');
      setAnexoTecnicoFile(null);
      setAnexosTecnicosPendentes([]);
      setObservacaoAreaTecnica('');
      
      // Recarrega a demanda para atualizar os dados
      await reload();
      
      // Redireciona para dashboard após 1.5 segundos
      setTimeout(() => {
        navigate('/demandas');
      }, 1500);
    } catch (error) {
      console.error('Erro:', error);
      showToast('Resposta salva localmente.', 'success');
      setAnexoTecnicoNome('');
      setAnexoTecnicoDesc('');
      setAnexoTecnicoFile(null);
      setAnexosTecnicosPendentes([]);
      setObservacaoAreaTecnica('');
      
      // Recarrega a demanda mesmo com erro
      await reload();
      
      // Redireciona para dashboard mesmo com erro
      setTimeout(() => {
        navigate('/demandas');
      }, 1500);
    } finally {
      setSaving(false);
    }
  }

  // Handler para Ação a ser Tomada
  async function handleExecutarAcaoTomada() {
    if (!demanda || !user) {
      return;
    }

    if (!acaoTomada) {
      return;
    }

    setSaving(true);
    try {
      switch (acaoTomada) {
        case 'suprimentos':
          if (!suprimentosObs.trim()) {
            showToast('Informe as observações para suprimentos.', 'warning');
            setSaving(false);
            return;
          }
          const chamadoId = await service.enviarParaSuprimentos(demanda.id, user.name, suprimentosNomeArquivo, suprimentosObs);
          setChamadoGerado(chamadoId);
          setShowSuprimentosModal(true);
          setSuprimentosObs('');
          setSuprimentosArquivo(null);
          setSuprimentosNomeArquivo('');
          break;
        
        case 'solicitante':
          if (!retornarObs.trim()) {
            showToast('Informe as observações para retorno.', 'warning');
            setSaving(false);
            return;
          }
          await service.retornarParaSolicitante(demanda.id, retornarObs, user.name);
          showToast('Demanda retornada ao solicitante com sucesso!', 'success');
          setRetornarObs('');
          setAcaoTomada('');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
          break;
        
        case 'cancelar':
          await service.cancelarDemanda(demanda.id, user.name);
          showToast('Demanda cancelada com sucesso!', 'success');
          setAcaoTomada('');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
          break;
        
        case 'area_tecnica':
          if (!retornarObs.trim()) {
            showToast('Informe as observações para a área técnica.', 'warning');
            setSaving(false);
            return;
          }
          if (areasTecnicaSelecionadas.length === 0) {
            showToast('Selecione pelo menos uma área técnica.', 'warning');
            setSaving(false);
            return;
          }
          const emailsRecord: Record<AreaTecnica, string> = {
            'ENGENHARIA': 'engenharia@empresa.com',
            'ASSISTENCIA': 'assistencia@empresa.com',
            'TI': 'ti@empresa.com',
            'GESTAO_PESSOAS': 'rh@empresa.com',
            'SEGURANCA': 'seguranca@empresa.com',
            'SESMT': 'sesmt@empresa.com',
            'OUTROS': 'outros@empresa.com',
          };
          await service.acionarAreaTecnica(demanda.id, areasTecnicaSelecionadas, emailsRecord, retornarObs, user.name);
          const areasNomes = areasTecnicaSelecionadas.map(a => AREA_TECNICA_LABELS[a]).join(', ');
          showToast(`Solicitação enviada para ${areasNomes}!`, 'success');
          setRetornarObs('');
          setAcaoTomada('');
          setAreasTecnicaSelecionadas([]);
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
          break;

        case 'aprovacao':
          if (!aprovacaoObs.trim()) {
            showToast('Informe as observações para aprovação.', 'warning');
            setSaving(false);
            return;
          }
          await service.adicionarDadosAprovacao(
            demanda.id,
            aprovacaoNomeArquivo,
            aprovacaoObs
          );
          await service.criarAprovacoes(demanda.id);
          await service.atualizarStatusDemanda(demanda.id, 'APROVACAO_PENDENTE');
          await refreshDemanda(demanda.id);
          showToast('Demanda encaminhada para aprovação de Marcos!', 'success');
          setAcaoTomada('');
          setAprovacaoArquivo(null);
          setAprovacaoNomeArquivo('');
          setAprovacaoObs('');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
          break;
        
        default:
          showToast('Ação não implementada ainda.', 'info');
      }
    } catch (error) {
      console.error('Erro:', error);
      showToast('Erro ao executar ação.', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <PageSpinner />
      </MainLayout>
    );
  }

  if (!demanda) {
    return (
      <MainLayout>
        <Alert type="error">Demanda não encontrada.</Alert>
      </MainLayout>
    );
  }

  return (
    <>
      <MainLayout>
        <div className="max-w-4xl space-y-8">
          {/* Header com ID e Status */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900 font-mono">{demanda.id}</h1>
                <StatusBadge status={demanda.status} />
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Criada em {format(new Date(demanda.dataCriacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <div className="flex gap-2">
              {isComplementacaoMode && editingSolicitante && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setEditingSolicitante(false);
                      setSolicitanteEdit(JSON.parse(JSON.stringify(demanda.solicitante)));
                      setServicoEdit(JSON.parse(JSON.stringify(demanda.servico)));
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    size="sm" 
                    loading={saving}
                    onClick={handleSalvarComplementacao}
                  >
                    Salvar Complementação
                  </Button>
                </>
              )}
              {isComplementacaoMode && !editingSolicitante && demanda.status !== 'CANCELADA' && (
                <Button 
                  size="sm" 
                  onClick={() => setEditingSolicitante(true)}
                >
                  Editar Complementação
                </Button>
              )}
              {user?.role === 'LEONARDO' && !isComplementacaoMode && demanda.status !== 'CANCELADA' && demanda.status !== 'CHAMADO_SUPRIMENTOS' && !editMode && (
                <Button
                  size="sm"
                  onClick={() => setEditMode(true)}
                >
                  Editar
                </Button>
              )}
              {user?.role === 'LEONARDO' && editMode && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditMode(false);
                    if (demanda) {
                      setSegmentoEdit(demanda.solicitante.segmento || '');
                      setMaoDeObraEdit(demanda.servico.maoDeObra ? 'SIM' : 'NAO');
                      setNecessidadeEdit(demanda.servico.necessidade || '');
                    }
                  }}
                >
                  Cancelar Edição
                </Button>
              )}
            </div>
          </div>

          {/* Status Card */}
          <Card>
            <CardBody>
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {STATUS_LABELS[demanda.status]}
                </span>
                {demanda.ciclo && (
                  <>
                    <span>•</span>
                    <span>Ciclo {demanda.ciclo}</span>
                  </>
                )}
                {demanda.dataInicio && (
                  <>
                    <span>•</span>
                    <span>Início em {format(new Date(demanda.dataInicio), 'dd/MM/yyyy HH:mm')}</span>
                  </>
                )}
                {demanda.dataPrazo && (
                  <>
                    <span>•</span>
                    <span>Prazo para {format(new Date(demanda.dataPrazo), 'dd/MM/yyyy HH:mm')}</span>
                  </>
                )}
                {demanda.dataPrazo && (
                  <>
                    <span>•</span>
                    <span className="text-orange-600 font-medium">
                      termina em {formatDistanceToNow(new Date(demanda.dataPrazo), { locale: ptBR })}
                    </span>
                  </>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Alerts */}
          {demanda.status === 'REJEITADA' && (
            <Alert type="error" title="Demanda Rejeitada">
              Esta demanda foi encerrada. Consulte o histórico para ver o motivo.
            </Alert>
          )}

          {demanda.status === 'CANCELADA' && (
            <Alert type="error" title="Demanda Cancelada">
              Esta demanda foi cancelada e não pode ser editada por nenhum perfil.
            </Alert>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {[{ key: 'info', label: 'Informações' }].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as typeof activeTab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === t.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Main Content */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              {user?.role !== 'ASSISTENCIA' && (
              <>
                {isComplementacaoMode && editingSolicitante && (
                  <Alert type="info" title="Modo de Edição">
                    Edite os campos abaixo e clique em "Salvar Complementação" para reenviar a demanda.
                  </Alert>
                )}

                {isComplementacaoMode && !editingSolicitante && demanda.complementacoes.length > 0 && (
                  <Alert type="warning" title="Complementação solicitada">
                    {demanda.complementacoes[demanda.complementacoes.length - 1].observacoes}
                  </Alert>
                )}

                {/* Informações do Solicitante - Combined Section - Always visible */}
                <Card>
                <button
                  onClick={() => setExpandedSolicitante(!expandedSolicitante)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition"
                >
                  <h2 className="text-lg font-semibold text-gray-900">Informações Gerais (Solicitante)</h2>
                  <div className="flex items-center gap-2">

                    <ChevronDown
                      size={20}
                      className={`text-gray-600 transition-transform ${expandedSolicitante ? 'rotate-0' : '-rotate-90'}`}
                    />
                  </div>
                </button>
                {expandedSolicitante && (
                <CardBody>
                    {editingSolicitante && isComplementacaoMode ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input 
                          label="Nome"
                          value={solicitanteEdit?.nome || ''} 
                          disabled 
                        />
                        <Input 
                          label="E-mail"
                          value={solicitanteEdit?.email || ''} 
                          disabled 
                        />
                        <Input 
                          label="Celular"
                          required
                          value={solicitanteEdit?.celular || ''} 
                          onChange={(e) => setSolicitanteEdit({...solicitanteEdit, celular: e.target.value})}
                          placeholder="(XX) XXXXX-XXXX"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input 
                          label="Casa de Origem"
                          value={solicitanteEdit?.casa || ''} 
                          disabled 
                        />
                        <Select 
                          label="Segmento"
                          required
                          value={solicitanteEdit?.segmento || ''} 
                          onChange={(e) => setSolicitanteEdit({...solicitanteEdit, segmento: e.target.value})}
                        >
                          <option value="">Selecione...</option>
                          {Object.entries(SEGMENTO_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </Select>
                        <Input 
                          label="Departamento"
                          value={solicitanteEdit?.departamento || ''} 
                          disabled 
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                        <Select 
                          label="Tipo de Serviço"
                          value={servicoEdit?.tipo || ''} 
                          onChange={(e) => setServicoEdit({...servicoEdit, tipo: e.target.value})}
                        >
                          <option value="">Selecione...</option>
                          {SERVICOS_POR_SEGMENTO[(solicitanteEdit?.segmento || 'SAUDE') as Segmento].map((tipoServico) => (
                            <option key={tipoServico} value={tipoServico}>{TIPO_SERVICO_LABELS[tipoServico]}</option>
                          ))}
                        </Select>
                        <Input 
                          label="Local de Implantação"
                          value={servicoEdit?.local || ''} 
                          onChange={(e) => setServicoEdit({...servicoEdit, local: e.target.value})}
                          placeholder="Local onde será realizado o serviço"
                        />
                        <Select 
                          label="Necessidade"
                          value={servicoEdit?.necessidade || ''} 
                          onChange={(e) => setServicoEdit({...servicoEdit, necessidade: e.target.value})}
                        >
                          <option value="">Selecione...</option>
                          {Object.entries(NECESSIDADE_SERVICO_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </Select>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select 
                          label="Tipo de Contratação"
                          value={servicoEdit?.tipoContratacao || ''} 
                          onChange={(e) => setServicoEdit({...servicoEdit, tipoContratacao: e.target.value})}
                        >
                          <option value="">Selecione...</option>
                          {Object.entries(TIPO_CONTRATACAO_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </Select>
                        {servicoEdit?.tipoContratacao === 'EXISTENTE' && (
                          <>
                            <Input 
                              label="Razão Social"
                              value={servicoEdit?.razaoSocialPrestador || ''} 
                              onChange={(e) => setServicoEdit({...servicoEdit, razaoSocialPrestador: e.target.value})}
                            />
                            <Input 
                              label="CNPJ"
                              value={servicoEdit?.cnpjPrestador || ''} 
                              onChange={(e) => setServicoEdit({...servicoEdit, cnpjPrestador: e.target.value})}
                            />
                          </>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input 
                          label="ID Contratual"
                          value={servicoEdit?.idContratual || ''} 
                          onChange={(e) => setServicoEdit({...servicoEdit, idContratual: e.target.value})}
                        />
                        <Input 
                          label="Data Prevista"
                          type="date"
                          value={servicoEdit?.dataPrevista ? servicoEdit.dataPrevista.split('T')[0] : ''} 
                          onChange={(e) => setServicoEdit({...servicoEdit, dataPrevista: e.target.value})}
                        />
                        <Input 
                          label="Duração"
                          value={servicoEdit?.duracao || ''} 
                          onChange={(e) => setServicoEdit({...servicoEdit, duracao: e.target.value})}
                          placeholder="Ex: 3 meses, 1 ano"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload de Contrato e Aditivos</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            id="contrato-file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadContratoArquivo(file);
                                setUploadContratoNomeArquivo(file.name);
                              }
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor="contrato-file"
                            className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors text-blue-600 text-sm font-medium"
                          >
                            Selecionar Arquivo
                          </label>
                          {uploadContratoNomeArquivo && (
                            <span className="text-sm text-gray-600">{uploadContratoNomeArquivo}</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <TextArea 
                          label="Escopo"
                          required
                          value={servicoEdit?.descricaoEscopo || ''} 
                          onChange={(e) => setServicoEdit({...servicoEdit, descricaoEscopo: e.target.value})}
                          placeholder="Descreva o escopo de trabalho"
                        />
                      </div>
                      <div>
                        <Select 
                          label="Objetivo"
                          required
                          value={servicoEdit?.descricao || ''} 
                          onChange={(e) => setServicoEdit({...servicoEdit, descricao: e.target.value as any})}
                        >
                          <option value="">-- Selecione --</option>
                          {Object.entries(OBJETIVO_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </Select>
                      </div>
                      <div className="border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Observações (opcional)
                        </label>
                        <textarea
                          value={observacoesSolicitante}
                          onChange={(e) => setObservacoesSolicitante(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Adicione informações ou comentários adicionais, se necessário..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Dados do Solicitante */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">Dados do Solicitante</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Nome</dt>
                            <dd className="text-sm text-gray-900 mt-1">{demanda.solicitante.nome}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-gray-500">E-mail</dt>
                            <dd className="text-sm text-gray-900 mt-1">{demanda.solicitante.email}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Celular</dt>
                            <dd className="text-sm text-gray-900 mt-1">{demanda.solicitante.celular}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Casa</dt>
                            <dd className="text-sm text-gray-900 mt-1">{demanda.solicitante.casa}</dd>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500">Segmento</label>
                            <select
                              value={segmentoEdit || demanda.solicitante.segmento}
                              onChange={(e) => setSegmentoEdit(e.target.value as any)}
                              disabled={user?.role !== 'LEONARDO' || !editMode}
                              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                            >
                              {Object.entries(SEGMENTO_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Departamento</dt>
                            <dd className="text-sm text-gray-900 mt-1">{demanda.solicitante.departamento}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Centro de Custo</dt>
                            <dd className="text-sm text-gray-900 mt-1">{demanda.solicitante.centroDeCusto}</dd>
                          </div>
                        </div>
                      </div>

                      {/* Dados do Serviço */}
                      <div className="border-t pt-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">Dados do Serviço</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Tipo de Serviço</dt>
                            <dd className="text-sm text-gray-900 mt-1">{TIPO_SERVICO_LABELS[demanda.servico.tipo]}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Local de Implantação</dt>
                            <dd className="text-sm text-gray-900 mt-1">{demanda.servico.local}</dd>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500">Necessidade</label>
                            <select
                              value={necessidadeEdit || demanda.servico.necessidade}
                              onChange={(e) => setNecessidadeEdit(e.target.value as any)}
                              disabled={user?.role !== 'LEONARDO' || !editMode}
                              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                            >
                              <option value="">-- Selecione --</option>
                              {Object.entries(NECESSIDADE_SERVICO_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Tipo de Contratação</dt>
                            <dd className="text-sm text-gray-900 mt-1">{TIPO_CONTRATACAO_LABELS[demanda.servico.tipoContratacao]}</dd>
                          </div>
                          {demanda.servico.tipoContratacao === 'EXISTENTE' && (
                            <>
                              <div>
                                <dt className="text-xs font-medium text-gray-500">Razão Social</dt>
                                <dd className="text-sm text-gray-900 mt-1">{demanda.servico.razaoSocialPrestador || '-'}</dd>
                              </div>
                              <div>
                                <dt className="text-xs font-medium text-gray-500">CNPJ</dt>
                                <dd className="text-sm text-gray-900 mt-1">{demanda.servico.cnpjPrestador || '-'}</dd>
                              </div>
                            </>
                          )}
                          <div>
                            <dt className="text-xs font-medium text-gray-500">ID Contratual</dt>
                            <dd className="text-sm text-gray-900 mt-1">{demanda.servico.idContratual || '-'}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Data Prevista</dt>
                            <dd className="text-sm text-gray-900 mt-1">{demanda.servico.dataPrevista ? format(new Date(demanda.servico.dataPrevista), 'dd/MM/yyyy') : '-'}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Duração</dt>
                            <dd className="text-sm text-gray-900 mt-1">{demanda.servico.duracao}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Objetivo</dt>
                            <dd className="text-sm text-gray-900 mt-1">{OBJETIVO_LABELS[demanda.servico.descricao] || '-'}</dd>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500">Mão de Obra</label>
                            <select
                              value={maoDeObraEdit || (demanda.servico.maoDeObra ? 'SIM' : 'NAO')}
                              onChange={(e) => setMaoDeObraEdit(e.target.value)}
                              disabled={user?.role !== 'LEONARDO' || !editMode}
                              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                            >
                              <option value="SIM">Sim</option>
                              <option value="NAO">Não</option>
                            </select>
                          </div>
                          <div className="col-span-full">
                            <dt className="text-xs font-medium text-gray-500">Escopo</dt>
                            <dd className="text-sm text-gray-900 mt-1">{demanda.servico.descricaoEscopo}</dd>
                          </div>
                          {demanda.servico.nomeArquivoContratoAditivos && (
                            <div className="col-span-full">
                              <dt className="text-xs font-medium text-gray-500">Upload de Contrato e Aditivos</dt>
                              <dd className="text-sm text-gray-900 mt-1 flex items-center gap-2">
                                <FileText size={14} />
                                {demanda.servico.nomeArquivoContratoAditivos}
                              </dd>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardBody>
                )}
              </Card>

              {/* Análise e Classificação */}
              {(user?.role === 'LEONARDO' || ['MARCOS', 'VIANA', 'KLEBER'].includes(user?.role ?? '') || demanda.classificacao) && (
                <Card>
                  <button
                    onClick={() => setExpandedClassificacao(!expandedClassificacao)}
                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition"
                  >
                    <h2 className="text-lg font-semibold text-gray-900">Análise e Classificação (Engenharia Corporativa)</h2>
                    <ChevronDown
                      size={20}
                      className={`text-gray-600 transition-transform ${expandedClassificacao ? 'rotate-0' : '-rotate-90'}`}
                    />
                  </button>
                  {expandedClassificacao && (
                  <CardBody>
                  {user?.role === 'LEONARDO' && editMode ? (
                    // Modo Edição - Leonardo
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Demanda</label>
                          <select
                            value={estrategicaOuPontual}
                            onChange={(e) => setEstrategicaOuPontual(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">-- Selecione --</option>
                            <option value="ESTRATEGICA">Estratégica</option>
                            <option value="PONTUAL">Pontual</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Complexidade</label>
                          <select
                            value={complexidade}
                            onChange={(e) => setComplexidade(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">-- Selecione --</option>
                            <option value="BAIXA">Baixa - Fluxo sem necessidade de avaliação técnica</option>
                            <option value="MEDIA">Média - Necessidade de UMA área técnica</option>
                            <option value="ALTA">Alta - Necessidade de MAIS áreas técnicas</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="expectativaReceita"
                            checked={expectativaReceita !== '' && expectativaReceita !== 'NAO'}
                            onChange={(e) => setExpectativaReceita(e.target.checked ? 'FATURAMENTO' : 'NAO')}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="expectativaReceita" className="text-sm font-medium text-gray-700">Expectativa de receita</label>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="calendarizado"
                            checked={calendarizado === 'SIM'}
                            onChange={(e) => setCalendarizado(e.target.checked ? 'SIM' : 'NAO')}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="calendarizado" className="text-sm font-medium text-gray-700">Calendarizado?</label>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="solicitacaoAderente"
                            checked={solicitacaoAderente === 'SIM'}
                            onChange={(e) => setSolicitacaoAderente(e.target.checked ? 'SIM' : 'NAO')}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="solicitacaoAderente" className="text-sm font-medium text-gray-700">Solicitação Aderente?</label>
                        </div>
                      </div>

                      {solicitacaoAderente === 'NAO' && (
                        <div className="border-t pt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Justificativa de Não-Aderência</label>
                          <textarea
                            value={justificativaAderencia}
                            onChange={(e) => setJustificativaAderencia(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            placeholder="Explique por que a solicitação não é aderente..."
                            required
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="contratoCorporativo"
                            checked={contratoCorporativo === 'SIM'}
                            onChange={(e) => setContratoCorporativo(e.target.checked ? 'SIM' : 'NAO')}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="contratoCorporativo" className="text-sm font-medium text-gray-700">Contrato corporativo?</label>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="incrementoFinanceiro"
                            checked={incrementoFinanceiro === 'SIM'}
                            onChange={(e) => setIncrementoFinanceiro(e.target.checked ? 'SIM' : 'NAO')}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="incrementoFinanceiro" className="text-sm font-medium text-gray-700">Incremento financeiro?</label>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="contratacaoCompraProdutos"
                            checked={contratacaoCompraProdutos === 'SIM'}
                            onChange={(e) => setContratacaoCompraProdutos(e.target.checked ? 'SIM' : 'NAO')}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="contratacaoCompraProdutos" className="text-sm font-medium text-gray-700">Contratação com compra de produtos?</label>
                        </div>

                      </div>

                      <div className="flex justify-end gap-3 border-t pt-4">
                        <Button
                          loading={saving}
                          onClick={handleSalvarAnaliseClassificacao}
                        >
                          Salvar Alterações
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Modo Leitura - Aprovadores e outros
                    demanda.classificacao ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Tipo de Demanda</dt>
                        <dd className="text-sm text-gray-900 mt-1">
                          {demanda.classificacao.estrategicaOuPontual === 'ESTRATEGICA' ? 'Estratégica' : 'Pontual'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Contrato corporativo?</dt>
                        <dd className="text-sm text-gray-900 mt-1">{demanda.classificacao.contratoCorporativo === 'SIM' ? 'Sim' : demanda.classificacao.contratoCorporativo === 'NAO' ? 'Não' : '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Incremento financeiro?</dt>
                        <dd className="text-sm text-gray-900 mt-1">{demanda.classificacao.incrementoFinanceiro === 'SIM' ? 'Sim' : demanda.classificacao.incrementoFinanceiro === 'NAO' ? 'Não' : '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Contratação com compra de produtos?</dt>
                        <dd className="text-sm text-gray-900 mt-1">{demanda.classificacao.contratacaoCompraProdutos === 'SIM' ? 'Sim' : demanda.classificacao.contratacaoCompraProdutos === 'NAO' ? 'Não' : '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Expectativa de receita</dt>
                        <dd className="text-sm text-gray-900 mt-1">
                          {demanda.classificacao.expectativaReceita && demanda.classificacao.expectativaReceita !== 'NAO' ? demanda.classificacao.expectativaReceita : demanda.classificacao.expectativaReceita === 'NAO' ? 'Não' : '-'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Complexidade</dt>
                        <dd className="text-sm text-gray-900 mt-1">
                          {demanda.classificacao.complexidade ? COMPLEXIDADE_LABELS[demanda.classificacao.complexidade] : '-'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Calendarizado?</dt>
                        <dd className="text-sm text-gray-900 mt-1">
                          {demanda.classificacao.calendarizado === 'SIM' ? 'Sim' : demanda.classificacao.calendarizado === 'NAO' ? 'Não' : '-'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Solicitação Aderente?</dt>
                        <dd className="text-sm text-gray-900 mt-1">
                          {demanda.classificacao.solicitacaoAderente === 'SIM' ? 'Sim' : demanda.classificacao.solicitacaoAderente === 'NAO' ? 'Não' : '-'}
                        </dd>
                      </div>
                      {demanda.classificacao.solicitacaoAderente === 'NAO' && demanda.classificacao.justificativaAderencia && (
                        <div className="col-span-full">
                          <dt className="text-xs font-medium text-gray-500">Justificativa de Não-Aderência</dt>
                          <dd className="text-sm text-gray-900 mt-1 bg-orange-50 p-3 rounded-lg border border-orange-200">
                            {demanda.classificacao.justificativaAderencia}
                          </dd>
                        </div>
                      )}
                    </div>
                    ) : (
                    <Alert type="warning" title="Análise e Classificação não preenchida">
                      Aguardando análise e classificação por Adriana.
                    </Alert>
                    )
                  )}
                </CardBody>
                )}
              </Card>
              )}

              {/* Anexos da Área Técnica */}
              {['LEONARDO', 'MARCOS', 'VIANA', 'KLEBER'].includes(user?.role ?? '') && demanda.acionamentosTecnicos.some(a => {
                // Mostra o container só quando TODAS as áreas acionadas responderam
                const todasAsAreasAcionadas = a.areasTecnicas || [];
                const todasResponderam = todasAsAreasAcionadas.every(
                  area => (a.respostas || []).some(r => r.areaTecnica === area)
                );
                return todasResponderam && a.respostas && a.respostas.length > 0;
              }) && (
                <Card>
                  <button
                    onClick={() => setExpandedAnexosTecnicos(!expandedAnexosTecnicos)}
                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition"
                  >
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Anexos (Área Técnica)</h2>
                      <p className="text-sm text-gray-600">Revise os arquivos enviados por cada área</p>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-gray-600 transition-transform ${expandedAnexosTecnicos ? 'rotate-0' : '-rotate-90'}`}
                    />
                  </button>
                  {expandedAnexosTecnicos && (
                  <CardBody className="space-y-4">
                    {demanda.acionamentosTecnicos.some(a => a.respostas && a.respostas.length > 0) ? (
                      <>
                        {/* Botões de Filtro por Área */}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => setFiltroAreaTecnica('TODOS')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                              filtroAreaTecnica === 'TODOS'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            📋 Todos ({demanda.acionamentosTecnicos.reduce((acc, a) => acc + (a.respostas?.reduce((s, r) => s + r.anexos.length, 0) || 0), 0)})
                          </Button>
                          {demanda.acionamentosTecnicos
                            .filter(a => a.respostas && a.respostas.length > 0)
                            .flatMap(acion => acion.respostas!.map(resposta => resposta.areaTecnica))
                            .filter((area, index, arr) => arr.indexOf(area) === index)
                            .map(area => {
                              const totalAnexos = demanda.acionamentosTecnicos
                                .flatMap(a => a.respostas || [])
                                .filter(r => r.areaTecnica === area)
                                .reduce((sum, r) => sum + r.anexos.length, 0);
                              return (
                                <Button
                                  key={`filter-${area}`}
                                  onClick={() => setFiltroAreaTecnica(area)}
                                  className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                                    filtroAreaTecnica === area
                                      ? 'bg-green-600 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {AREA_TECNICA_LABELS[area]} ({totalAnexos})
                                </Button>
                              );
                            })}
                        </div>

                        {/* Tabela de Anexos */}
                        <div className="overflow-x-auto border rounded-lg">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Anexos</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Descrição do Anexo</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Arquivo</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Adicionado Por</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Área Técnica</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Data</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {demanda.acionamentosTecnicos
                                .flatMap(acion => 
                                  (acion.respostas || []).flatMap(resposta => 
                                    resposta.anexos.map(anexo => ({
                                      ...anexo,
                                      areaLabel: AREA_TECNICA_LABELS[anexo.areaTecnica]
                                    }))
                                  )
                                )
                                .filter(anexo => filtroAreaTecnica === 'TODOS' || anexo.areaTecnica === filtroAreaTecnica)
                                .sort((a, b) => new Date(b.adicionadoEm).getTime() - new Date(a.adicionadoEm).getTime())
                                .map(anexo => (
                                  <tr key={anexo.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{anexo.nome}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{anexo.descricao}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      {(anexo as any).nomeArquivo ? (
                                        <span className="flex items-center gap-1">
                                          <FileText size={14} />
                                          {(anexo as any).nomeArquivo}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{anexo.adicionadoPor}</td>
                                    <td className="px-4 py-3">
                                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                        {anexo.areaLabel}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                      {format(new Date(anexo.adicionadoEm), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                          {demanda.acionamentosTecnicos
                            .flatMap(acion => (acion.respostas || []).flatMap(r => r.anexos))
                            .filter(anexo => filtroAreaTecnica === 'TODOS' || anexo.areaTecnica === filtroAreaTecnica).length === 0 && (
                            <div className="px-4 py-8 text-center text-gray-500">Nenhum anexo encontrado para o filtro selecionado</div>
                          )}
                        </div>
                      </>
                    ) : (
                      <Alert type="info" title="Aguardando resposta das áreas técnicas">
                        As áreas técnicas acionadas ainda não enviaram anexos com suas análises.
                      </Alert>
                    )}
                  </CardBody>
                  )}
                </Card>
              )}

              {/* Área Técnica - Envio de Anexos */}
              {user && ['ENGENHARIA', 'ASSISTENCIA', 'TI', 'GESTAO_PESSOAS', 'SEGURANCA', 'SESMT', 'OUTROS'].includes(user.role) && 
               demanda.status === 'AGUARDANDO_AREA_TECNICA' &&
               demanda.acionamentosTecnicos.some(a => {
                 const temAcionamento = a.areasTecnicas.includes(user.role as any);
                 const jaRespondeu = (a.respostas || []).some(r => r.areaTecnica === user.role);
                 return temAcionamento && !jaRespondeu;
               }) && (
                <Card>
                  <CardHeader title="Resposta da Área Técnica" subtitle={`${AREA_TECNICA_LABELS[user.role as AreaTecnica]} - Adicione anexos com análises e recomendações`} />
                  <CardBody className="space-y-6">
                    {/* Seção de Informações - Simplificada */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Demanda</dt>
                          <dd className="text-gray-900 font-mono mt-1">{demanda.id}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Serviço</dt>
                          <dd className="text-gray-900 mt-1">{demanda.servico.local}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Solicitante</dt>
                          <dd className="text-gray-900 mt-1">{demanda.solicitante.nome}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Data da Solicitação</dt>
                          <dd className="text-gray-900 mt-1">{format(new Date(demanda.dataCriacao), 'dd/MM/yyyy')}</dd>
                        </div>
                      </dl>
                    </div>

                    {/* Descrição */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-900"><span className="font-medium">Descrição:</span> {demanda.servico.descricao}</p>
                    </div>

                    {/* Formulário de Anexos */}
                    <div className="border-t pt-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">Adicionar Anexos</h3>
                      
                      <div className="space-y-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Anexos <span className="text-red-500">*</span>
                            </label>
                            <Input
                              value={anexoTecnicoNome}
                              onChange={(e) => setAnexoTecnicoNome(e.target.value)}
                              placeholder="Nome do arquivo ou descrição breve"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Descrição do Anexo <span className="text-red-500">*</span>
                            </label>
                            <Input
                              value={anexoTecnicoDesc}
                              onChange={(e) => setAnexoTecnicoDesc(e.target.value)}
                              placeholder="Descreva o conteúdo do anexo"
                            />
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
                          <span className="font-medium">{user?.name}</span> - {format(new Date(), 'dd/MM/yyyy')}
                        </div>

                        <div className="text-xs text-gray-600 p-3 bg-blue-50 rounded">
                          (Endereçamentos, vídeo, logo, artigos, etc.)
                        </div>
                      </div>

                      {/* Tabela de Anexos */}
                      {anexosTecnicosPendentes.length > 0 ? (
                        <div className="mb-4">
                          <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-100 border-b">
                                <tr>
                                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Anexos</th>
                                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Descrição do Anexo</th>
                                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Arquivo</th>
                                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Adicionado Por</th>
                                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Ações</th>
                                </tr>
                              </thead>
                              <tbody>
                                {anexosTecnicosPendentes.map((anexo, index) => (
                                  <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-900">{anexo.nome}</td>
                                    <td className="px-4 py-3 text-gray-600">{anexo.descricao}</td>
                                    <td className="px-4 py-3 text-gray-600 text-sm">
                                      {anexo.nomeArquivo ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                          📄 {anexo.nomeArquivo}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{user?.name}</td>
                                    <td className="px-4 py-3 text-center">
                                      <button
                                        onClick={() => handleRemoverAnexoTecnico(index)}
                                        className="text-red-600 hover:text-red-700 font-medium text-xs"
                                      >
                                        Remover
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                            <span>20</span>
                            <span>1 - {anexosTecnicosPendentes.length} de {anexosTecnicosPendentes.length}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                          <p className="text-sm text-gray-500">Nenhum dado adicionado</p>
                        </div>
                      )}

                      {/* Botão Adicionar */}
                      <div className="flex justify-end mb-6">
                        <Button
                          onClick={handleAdicionarAnexoTecnico}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          ADICIONAR ANEXO +
                        </Button>
                      </div>

                      {/* Campo de Observação */}
                      <div className="border-t pt-6">
                        <TextArea
                          label="Observação"
                          required
                          value={observacaoAreaTecnica}
                          onChange={(e) => setObservacaoAreaTecnica(e.target.value)}
                          placeholder="Adicione observações, recomendações ou detalhes técnicos..."
                          rows={6}
                        />
                      </div>

                      {/* Botão Salvar */}
                      <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setAnexoTecnicoNome('');
                            setAnexoTecnicoDesc('');
                            setAnexosTecnicosPendentes([]);
                            setObservacaoAreaTecnica('');
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          loading={saving}
                          onClick={() => {
                            if (!observacaoAreaTecnica.trim()) {
                              showToast('Adicione uma observação antes de enviar.', 'warning');
                              return;
                            }
                            confirm('Salvar resposta da área técnica?', handleSalvarAnexosTecnicos);
                          }}
                        >
                          Salvar e Enviar Resposta
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Área Técnica - Visualização de Anexos (Apenas Leitura) */}
              {user && ['ENGENHARIA', 'ASSISTENCIA', 'TI', 'GESTAO_PESSOAS', 'SEGURANCA', 'SESMT', 'OUTROS'].includes(user.role) && 
               demanda.status === 'EM_ANALISE' &&
               demanda.acionamentosTecnicos.some(a => a.areasTecnicas.includes(user.role as any) && (a.respostas || []).some(r => r.areaTecnica === user.role)) && (
                <Card>
                  <CardHeader 
                    title="Resposta da Área Técnica" 
                    subtitle={`${AREA_TECNICA_LABELS[user.role as AreaTecnica]} - Visualização (não é possível adicionar mais anexos)`} 
                  />
                  <CardBody className="space-y-6">
                    {demanda.acionamentosTecnicos
                      .filter(a => a.areasTecnicas.includes(user.role as any))
                      .flatMap(acionamento => 
                        (acionamento.respostas || [])
                          .filter(resposta => resposta.areaTecnica === user.role)
                          .map(resposta => ({ acionamento, resposta }))
                      )
                      .map(({ acionamento, resposta }) => (
                        <div key={`${acionamento.id}-${resposta.areaTecnica}`} className="border-t pt-4">
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                            <dl className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <dt className="text-xs font-medium text-gray-500">Respondido por</dt>
                                <dd className="text-gray-900 mt-1">{resposta.respondidoPor}</dd>
                              </div>
                              <div>
                                <dt className="text-xs font-medium text-gray-500">Data da Resposta</dt>
                                <dd className="text-gray-900 mt-1">{format(new Date(resposta.respondidoEm), 'dd/MM/yyyy HH:mm')}</dd>
                              </div>
                            </dl>
                          </div>

                          {resposta.anexos && resposta.anexos.length > 0 ? (
                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-100 border-b">
                                  <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Anexos</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Descrição</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Arquivo</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Adicionado Por</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {resposta.anexos.map((anexo: any) => (
                                    <tr key={anexo.id} className="border-b hover:bg-gray-50">
                                      <td className="px-4 py-3 text-gray-900">{anexo.nome}</td>
                                      <td className="px-4 py-3 text-gray-600">{anexo.descricao}</td>
                                      <td className="px-4 py-3 text-gray-600 text-sm">
                                        {anexo.nomeArquivo ? (
                                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                            📄 {anexo.nomeArquivo}
                                          </span>
                                        ) : (
                                          <span className="text-gray-400">-</span>
                                        )}
                                      </td>
                                      <td className="px-4 py-3 text-gray-600">{anexo.adicionadoPor}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                              <p className="text-sm text-yellow-800">Nenhum anexo foi adicionado.</p>
                            </div>
                          )}

                          {resposta.observacoes && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm font-medium text-blue-900 mb-2">Observações:</p>
                              <p className="text-sm text-blue-800">{resposta.observacoes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                  </CardBody>
                </Card>
              )}

              {/* Validação de Escopo */}
              {demanda.validacaoEscopo && (
                <Card>
                  <CardHeader blue title="Validação de Escopo" />
                  <CardBody>
                    <dl className="space-y-3">
                      <InfoRow
                        label="Status"
                        value={
                          <span className={demanda.validacaoEscopo.aprovado ? 'text-green-700 font-medium' : 'text-orange-700 font-medium'}>
                            {demanda.validacaoEscopo.aprovado ? 'Validado' : 'Enviado para Complementação'}
                          </span>
                        }
                      />
                      <InfoRow label="Validado por" value={demanda.validacaoEscopo.validadoPor} />
                      <InfoRow label="Data" value={format(new Date(demanda.validacaoEscopo.validadoEm), 'dd/MM/yyyy HH:mm')} />
                      <InfoRow label="Observações" value={demanda.validacaoEscopo.observacoes} />
                    </dl>
                  </CardBody>
                </Card>
              )}

              {/* Aprovações dos Gestores */}
              {demanda.aprovacoesGestores.length > 0 && (
                <Card>
                  <CardHeader title="Aprovações (Gestores)" />
                  <CardBody>
                    <div className="space-y-6">
                      {demanda.aprovacoesGestores.map((apr) => (
                        <div key={apr.id} className="pb-6 border-b last:border-b-0 last:pb-0">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <dt className="text-xs font-medium text-gray-500">Aprovador</dt>
                              <dd className="text-sm font-medium text-gray-900 mt-1">{apr.gestor}</dd>
                              <dd className="text-xs text-gray-600 mt-0.5">({apr.ordem}º aprovador)</dd>
                            </div>
                            <div>
                              <dt className="text-xs font-medium text-gray-500">Status</dt>
                              <dd className="text-sm text-gray-900 mt-1">
                                {apr.aprovado === true ? (
                                  <span className="inline-flex items-center gap-1 text-green-700 font-medium">Aprovado</span>
                                ) : apr.aprovado === false ? (
                                  <span className="inline-flex items-center gap-1 text-red-700 font-medium">Rejeitado</span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-blue-700 font-medium">Pendente</span>
                                )}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs font-medium text-gray-500">Data</dt>
                              <dd className="text-sm text-gray-900 mt-1">
                                {apr.aprovadoEm
                                  ? format(new Date(apr.aprovadoEm), 'dd/MM/yyyy HH:mm')
                                  : '-'}
                              </dd>
                            </div>
                          </div>
                          <div className="mt-4">
                            <dt className="text-xs font-medium text-gray-500">Observações</dt>
                            <dd className="text-sm text-gray-900 mt-1">{apr.observacoes || '-'}</dd>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Ação de Aprovação - Para os Aprovadores */}
              {['MARCOS', 'VIANA', 'KLEBER'].includes(user?.role ?? '') && canApprove() && demanda.dadosAprovacao && (
                <Card>
                  <CardHeader title={`Aprovação - ${user?.name}`} subtitle="Revisar documentos e definir ação" />
                  <CardBody className="space-y-6">
                    <Alert type="info">
                      Você é o <span className="font-semibold">{getGerenteOrdem()}º aprovador</span> desta demanda.
                    </Alert>

                    {/* Documentos e Informações Enviados por Adriana */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">Documentos e Informações Enviados para Aprovação</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {demanda.dadosAprovacao.nomeArquivo && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500 mb-1">Anexo</dt>
                            <dd className="text-sm font-medium text-blue-600">{demanda.dadosAprovacao.nomeArquivo}</dd>
                          </div>
                        )}
                        {demanda.dadosAprovacao.observacoes && (
                          <div className="md:col-span-1">
                            <dt className="text-xs font-medium text-gray-500 mb-1">Observações</dt>
                            <dd className="text-sm text-gray-600 whitespace-pre-wrap">{demanda.dadosAprovacao.observacoes}</dd>
                          </div>
                        )}
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-2 block">Ação a ser tomada: *</label>
                          <select
                            value={acaoAprovacao}
                            onChange={(e) => setAcaoAprovacao(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">-- Selecione uma ação --</option>
                            <option value="APROVAR">Aprovar</option>
                            <option value="REJEITAR">Rejeitar</option>
                            <option value="PEDIR_INFORMACOES">Pedir Informações Complementares</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Observações do Aprovador */}
                    {acaoAprovacao && (
                      <div className="space-y-4 pt-4 border-t border-gray-200">
                        <TextArea
                          label="Suas Observações"
                          value={aprovacaoObsGestor}
                          onChange={(e) => setAprovacaoObsGestor(e.target.value)}
                          placeholder={
                            acaoAprovacao === 'APROVAR' 
                              ? 'Digite observações (opcional)...'
                              : acaoAprovacao === 'REJEITAR'
                              ? 'Justifique a rejeição (obrigatório)...'
                              : 'Descreva as informações necessárias (obrigatório)...'
                          }
                          required={acaoAprovacao !== 'APROVAR'}
                        />
                      </div>
                    )}

                    {acaoAprovacao && (
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setAcaoAprovacao('');
                            setAprovacaoObsGestor('');
                          }}
                          disabled={saving}
                        >
                          Cancelar
                        </Button>
                        <Button
                          loading={saving}
                          onClick={() => {
                            if (acaoAprovacao === 'REJEITAR') {
                              confirm(
                                'Rejeitar esta demanda? Esta ação encerrará o processo e a demanda voltará para análise.',
                                () => handleExecutarAcao(),
                                true
                              );
                            } else if (acaoAprovacao === 'PEDIR_INFORMACOES') {
                              confirm(
                                'Solicitar informações complementares? A demanda voltará para análise da Adriana.',
                                () => handleExecutarAcao()
                              );
                            } else if (acaoAprovacao === 'APROVAR') {
                              confirm(
                                'Aprovar esta demanda?',
                                () => handleExecutarAcao()
                              );
                            }
                          }}
                          disabled={!acaoAprovacao}
                        >
                          Executar Ação
                        </Button>
                      </div>
                    )}
                  </CardBody>
                </Card>
              )}

              {/* HISTÓRICO COLAPSÁVEL NO FINAL DA ABA INFO */}
              {demanda.historico && demanda.historico.length > 0 && (
                <div className="border-t pt-6 mt-6">
                  <button
                    onClick={() => setShowHistorico(!showHistorico)}
                    className="w-full flex items-center justify-between px-0 py-2 hover:opacity-80 transition"
                  >
                    <h3 className="text-sm font-medium text-blue-600">
                      {showHistorico ? '▼ Esconder histórico' : '▶ Mostrar histórico'}
                    </h3>
                  </button>

                  {showHistorico && (
                    <div className="mt-4 space-y-4">
                      {[...demanda.historico].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map((ev) => (
                        <div key={ev.id} className="border-l-2 border-gray-200 pl-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{ev.acao} por {ev.usuario}</p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(ev.data), "dd/MM/yyyy")}
                              </p>
                            </div>
                          </div>
                          {ev.detalhes && (
                            <div className="bg-gray-50 rounded p-3 mt-2">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{ev.detalhes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              </>
              )}

              {/* Suprimentos - Visualização de Informações (Chris - ASSISTENCIA) */}
          {user?.role === 'ASSISTENCIA' && demanda.status === 'CHAMADO_SUPRIMENTOS' && (
            <Card>
              <CardHeader 
                title="Informações de Suprimentos" 
                subtitle="Chamado gerado para suprimentos"
              />
              <CardBody className="space-y-6">
                {/* Seção de Informações */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-xs font-medium text-gray-500">ID da Demanda</dt>
                      <dd className="text-gray-900 font-mono mt-1">{demanda.id}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">ID do Chamado</dt>
                      <dd className="text-gray-900 font-mono mt-1">{demanda.chamadoId || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Solicitante</dt>
                      <dd className="text-gray-900 mt-1">{demanda.solicitante.nome}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Data do Chamado</dt>
                      <dd className="text-gray-900 mt-1">
                        {demanda.chamadoGeradoEm ? format(new Date(demanda.chamadoGeradoEm), 'dd/MM/yyyy HH:mm') : '-'}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs font-medium text-gray-500">Descrição do Serviço</dt>
                      <dd className="text-gray-900 mt-1">{demanda.servico.descricao}</dd>
                    </div>
                  </dl>
                </div>

                {/* Observações de Suprimentos */}
                {demanda.acionamentosTecnicos?.length > 0 && demanda.acionamentosTecnicos[0]?.observacoes && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-medium text-gray-500 mb-2">Observações:</p>
                    <p className="text-sm text-blue-900">{demanda.acionamentosTecnicos[0].observacoes}</p>
                  </div>
                )}

                {/* Anexos de Suprimentos */}
                {demanda.acionamentosTecnicos?.length > 0 && (demanda.acionamentosTecnicos[0]?.respostas?.[0]?.anexos?.length ?? 0) > 0 ? (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Anexos do Chamado</h3>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Nome do Arquivo</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Descrição</th>
                          </tr>
                        </thead>
                        <tbody>
                          {demanda.acionamentosTecnicos[0].respostas?.[0]?.anexos?.map((anexo, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-900 font-mono">{anexo.nome}</td>
                              <td className="px-4 py-3 text-gray-600">{anexo.descricao}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <Alert type="info" title="Nenhum anexo">
                    Nenhum anexo foi enviado para este chamado.
                  </Alert>
                )}
              </CardBody>
            </Card>
          )}
            </div>
          )}

          {/* Ação a ser Tomada - Leonardo Only */}
          {user?.role === 'LEONARDO' && demanda.status !== 'CHAMADO_SUPRIMENTOS' && demanda.status !== 'CANCELADA' && (
            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-4">
                <div className="max-w-md">
                  <Select
                    label="Ação a ser tomada:"
                    value={acaoTomada}
                    onChange={(e) => setAcaoTomada(e.target.value)}
                  >
                    <option value="">Selecione uma ação</option>
                    <option value="suprimentos">Enviar para suprimentos</option>
                    <option value="aprovacao">Enviar para aprovação</option>
                    <option value="solicitante">Retornar para solicitante</option>
                    <option value="area_tecnica">Solicitar informações para área técnica</option>
                    <option value="cancelar">Cancelar solicitação</option>
                  </Select>
                </div>

                {acaoTomada === 'solicitante' && (
                  <TextArea
                    label="Observações para o Solicitante"
                    required
                    value={retornarObs}
                    onChange={(e) => setRetornarObs(e.target.value)}
                    placeholder="Descreva o motivo do retorno e o que precisa ser corrigido..."
                    rows={4}
                  />
                )}

                {acaoTomada === 'area_tecnica' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Selecione as Áreas Técnicas *</label>
                      <div className="space-y-2">
                        {['ENGENHARIA', 'ASSISTENCIA', 'TI', 'GESTAO_PESSOAS', 'SEGURANCA', 'SESMT'].map((area) => (
                          <label key={area} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={areasTecnicaSelecionadas.includes(area as AreaTecnica)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAreasTecnicaSelecionadas([...areasTecnicaSelecionadas, area as AreaTecnica]);
                                } else {
                                  setAreasTecnicaSelecionadas(areasTecnicaSelecionadas.filter(a => a !== area));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">{AREA_TECNICA_LABELS[area as AreaTecnica]}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <TextArea
                      label="Observações"
                      required
                      value={retornarObs}
                      onChange={(e) => setRetornarObs(e.target.value)}
                      placeholder="Descreva a solicitação e informações necessárias da área técnica..."
                      rows={4}
                    />
                  </div>
                )}

                {acaoTomada === 'suprimentos' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Anexar Arquivo para Suprimentos</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          id="suprimentos-file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSuprimentosArquivo(file);
                              setSuprimentosNomeArquivo(file.name);
                            }
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="suprimentos-file"
                          className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors text-blue-600 text-sm font-medium"
                        >
                          Selecionar Arquivo
                        </label>
                        {suprimentosNomeArquivo && (
                          <span className="text-sm text-gray-600">{suprimentosNomeArquivo}</span>
                        )}
                      </div>
                    </div>
                    <TextArea
                      label="Observações"
                      required
                      value={suprimentosObs}
                      onChange={(e) => setSuprimentosObs(e.target.value)}
                      placeholder="Descreva as informações necessárias para suprimentos..."
                      rows={4}
                    />
                  </div>
                )}

                {acaoTomada === 'aprovacao' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Anexar Arquivo para Aprovadores</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          id="aprovacao-file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setAprovacaoArquivo(file);
                              setAprovacaoNomeArquivo(file.name);
                            }
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="aprovacao-file"
                          className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors text-blue-600 text-sm font-medium"
                        >
                          Selecionar Arquivo
                        </label>
                        {aprovacaoNomeArquivo && (
                          <span className="text-sm text-gray-600">{aprovacaoNomeArquivo}</span>
                        )}
                      </div>
                    </div>
                    <TextArea
                      label="Observações"
                      required
                      value={aprovacaoObs}
                      onChange={(e) => setAprovacaoObs(e.target.value)}
                      placeholder="Descreva as observações e informações para os aprovadores..."
                      rows={4}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 mr-6">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setAcaoTomada('');
                      setRetornarObs('');
                      navigate('/dashboard');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    loading={saving}
                    onClick={() => {
                      const confirmMessages: Record<string, string> = {
                        'suprimentos': 'Confirmar envio para Suprimentos? A demanda será finalizada e um chamado será criado.',
                        'solicitante': 'Confirmar retorno para Solicitante? O chamado será reaberto para edição.',
                        'aprovacao': 'Confirmar envio para aprovação?',
                        'area_tecnica': 'Confirmar solicitação para Área Técnica?',
                        'cancelar': 'Confirmar cancelamento da solicitação?',
                      };
                      confirm(
                        confirmMessages[acaoTomada] || 'Confirmar a ação selecionada?',
                        handleExecutarAcaoTomada
                      );
                    }}
                  >
                    Confirmar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </MainLayout>

      {/* Modal de Confirmação */}
      <ConfirmModal
        open={confirmOpen}
        title="Confirmação"
        message={confirmMsg}
        danger={confirmDanger}
        onConfirm={() => {
          confirmAction?.();
          setConfirmOpen(false);
        }}
        onClose={() => setConfirmOpen(false)}
      />

      {/* Modal de Suprimentos */}
      <Modal
        open={showSuprimentosModal}
        onClose={() => setShowSuprimentosModal(false)}
        title="Envio para Suprimentos Confirmado!"
      >
        <div className="space-y-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-2">ID do Chamado</p>
            <p className="text-2xl font-bold font-mono text-green-700">{chamadoGerado}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">Próximos passos:</p>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Equipe de suprimentos foi notificada</li>
              <li>Você será redirecionado para o dashboard</li>
              <li>Acompanhe o progresso pela demanda</li>
            </ul>
          </div>

          <Button
            onClick={() => {
              setShowSuprimentosModal(false);
              navigate('/demandas');
            }}
            className="w-full"
          >
            Ir para Dashboard
          </Button>
        </div>
      </Modal>
    </>
  );
}
