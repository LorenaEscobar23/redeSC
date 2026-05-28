import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select, TextArea, Checkbox } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { PageSpinner } from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDemandas } from '../context/DemandasContext';
import * as service from '../services/demandaService';
import type { Demanda, Solicitante, ServicoSolicitado, TipoServico, Segmento, NecessidadeServico, TipoContratacao } from '../types';
import { TIPO_SERVICO_LABELS, SEGMENTO_LABELS, NECESSIDADE_SERVICO_LABELS, TIPO_CONTRATACAO_LABELS, OBJETIVO_LABELS, CASAS, SERVICOS_POR_SEGMENTO } from '../types';
import { format } from 'date-fns';

interface FormErrors {
  [key: string]: string;
}

const today = format(new Date(), 'yyyy-MM-dd');

export function ComplementacaoPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { refreshDemanda } = useDemandas();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [demanda, setDemanda] = useState<Demanda | null>(null);

  const [solicitante, setSolicitante] = useState<Solicitante>({
    nome: user?.name ?? '',
    email: user?.email ?? '',
    celular: '',
    casa: user?.casa ?? '',
    segmento: 'SAUDE',
    departamento: user?.departamento ?? '',
    centroDeCusto: user?.centroDeCusto ?? '',
  });

  const [servico, setServico] = useState<ServicoSolicitado>({
    tipo: 'OUTROS',
    local: '',
    necessidade: 'NORMAL',
    tipoContratacao: 'NOVA',
    razaoSocialPrestador: '',
    cnpjPrestador: '',
    idContratual: '',
    dataPrevista: '',
    duracao: '',
    descricao: 'OUTROS',
    maoDeObra: false,
    descricaoEscopo: '',
    observacoes: '',
  });

  useEffect(() => {
    if (!id) return;
    loadDemanda();
  }, [id]);

  async function loadDemanda() {
    try {
      const d = await service.buscarDemanda(id!);
      
      // Validar permissão de acesso (Solicita complementação só para solicitante ou Adriana)
      if (user?.role !== 'LEONARDO' && (user?.role !== 'SOLICITANTE' || d.solicitante.nome !== user?.name)) {
        showToast('Você não tem permissão para visualizar esta demanda.', 'error');
        navigate('/demandas');
        return;
      }
      
      setDemanda(d);
      setSolicitante(d.solicitante);
      setServico(d.servico);
    } catch {
      showToast('Erro ao carregar demanda.', 'error');
      navigate('/demandas');
    } finally {
      setLoading(false);
    }
  }

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!solicitante.segmento) errs.segmento = 'Segmento obrigatório';
    if (!servico.descricao.trim()) errs.descricao = 'Descrição obrigatória';
    else if (servico.descricao.trim().length < 10) errs.descricao = 'Mínimo 10 caracteres';
    if (servico.dataPrevista && servico.dataPrevista < today) errs.dataPrevista = 'Data não pode ser no passado';
    if (!servico.descricaoEscopo.trim()) errs.descricaoEscopo = 'Descrição do Escopo obrigatória';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !demanda || !user) return;
    setSaving(true);
    try {
      await service.atualizarDemandaComplementacao(demanda.id, solicitante, servico, user.name);
      setSuccess(true);
      showToast('Complementação enviada com sucesso!', 'success');
      refreshDemanda(demanda.id);
      setTimeout(() => navigate(`/demandas/${demanda.id}`), 2000);
    } catch {
      showToast('Erro ao enviar complementação. Tente novamente.', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageSpinner />;

  if (success) {
    return (
      <MainLayout>
        <div className="max-w-lg mx-auto py-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complementação Enviada!</h2>
          <p className="text-gray-500 mb-2">Sua resposta foi registrada com sucesso.</p>
          <p className="text-blue-600 font-mono font-semibold text-lg mb-6">{demanda?.id}</p>
          <p className="text-sm text-gray-500">Redirecionando...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Complementação de Solicitação</h1>
            <p className="text-sm text-gray-500">Atualize os dados solicitados e reenvie a demanda</p>
          </div>
        </div>

        <Alert type="info">
          <strong>Atenção:</strong> Leonardo solicitou complementação para esta demanda. Por favor, atualize os campos necessários e reenvie.
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SEÇÃO: DADOS DO SOLICITANTE */}
          <Card>
            <CardHeader blue title="Dados do Solicitante" subtitle="Informações de quem está fazendo a solicitação" />
            <CardBody className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Nome Completo"
                  disabled
                  value={solicitante.nome}
                  placeholder="Seu nome completo"
                />
                <Input
                  label="E-mail"
                  type="email"
                  disabled
                  value={solicitante.email}
                  placeholder="seu@email.com"
                />
                <Input
                  label="Celular"
                  value={solicitante.celular}
                  onChange={(e) => setSolicitante({ ...solicitante, celular: e.target.value })}
                  error={errors.celular}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Segmento *"
                  required
                  value={solicitante.segmento}
                  onChange={(e) => setSolicitante({ ...solicitante, segmento: e.target.value as Segmento })}
                  error={errors.segmento}
                >
                  {Object.entries(SEGMENTO_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </Select>
                <Select
                  label="Casa / Unidade *"
                  required
                  value={solicitante.casa}
                  onChange={(e) => setSolicitante({ ...solicitante, casa: e.target.value })}
                >
                  {CASAS.map((casa) => (
                    <option key={casa} value={casa}>{casa}</option>
                  ))}
                </Select>
                <Input
                  label="Centro de Custo"
                  disabled
                  value={solicitante.centroDeCusto}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Departamento"
                  disabled
                  value={solicitante.departamento}
                />
              </div>
            </CardBody>
          </Card>

          {/* SEÇÃO: DADOS DA SOLICITAÇÃO */}
          <Card>
            <CardHeader blue title="Dados da Solicitação" subtitle="Informações sobre o serviço solicitado" />
            <CardBody className="space-y-6">
              <Select
                label="Tipo de Serviço *"
                required
                value={servico.tipo}
                onChange={(e) => setServico({ ...servico, tipo: e.target.value as TipoServico })}
              >
                <option value="">Selecione um serviço</option>
                {SERVICOS_POR_SEGMENTO[solicitante.segmento].map((tipoServico) => (
                  <option key={tipoServico} value={tipoServico}>{TIPO_SERVICO_LABELS[tipoServico]}</option>
                ))}
              </Select>

              <Input
                label="Local de Implantação"
                value={servico.local}
                onChange={(e) => setServico({ ...servico, local: e.target.value })}
                error={errors.local}
                placeholder="Qual local será executado o serviço"
              />

              <Select
                label="Objetivo *"
                required
                value={servico.descricao}
                onChange={(e) => setServico({ ...servico, descricao: e.target.value as any })}
                error={errors.descricao}
              >
                <option value="">-- Selecione --</option>
                {Object.entries(OBJETIVO_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Necessidade *"
                  required
                  value={servico.necessidade}
                  onChange={(e) => setServico({ ...servico, necessidade: e.target.value as NecessidadeServico })}
                >
                  {Object.entries(NECESSIDADE_SERVICO_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </Select>

                <Select
                  label="Tipo de Contratação *"
                  required
                  value={servico.tipoContratacao}
                  onChange={(e) => setServico({ ...servico, tipoContratacao: e.target.value as TipoContratacao })}
                >
                  {Object.entries(TIPO_CONTRATACAO_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </Select>

                <Input
                  label="Data Prevista"
                  type="date"
                  value={servico.dataPrevista}
                  onChange={(e) => setServico({ ...servico, dataPrevista: e.target.value })}
                  error={errors.dataPrevista}
                />
              </div>

              <Input
                label="Duração Estimada"
                value={servico.duracao}
                onChange={(e) => setServico({ ...servico, duracao: e.target.value })}
                error={errors.duracao}
                placeholder="Ex: 2 semanas, 1 mês, 3 dias"
              />

              {servico.tipoContratacao === 'EXISTENTE' && (
                <>
                  <Input
                    label="Razão Social do Prestador"
                    value={servico.razaoSocialPrestador}
                    onChange={(e) => setServico({ ...servico, razaoSocialPrestador: e.target.value })}
                    placeholder="Nome da empresa contratada"
                  />
                  <Input
                    label="CNPJ do Prestador"
                    value={servico.cnpjPrestador}
                    onChange={(e) => setServico({ ...servico, cnpjPrestador: e.target.value })}
                    placeholder="XX.XXX.XXX/0001-XX"
                  />
                </>
              )}

              <Input
                label="ID Contratual / Contrato"
                value={servico.idContratual}
                onChange={(e) => setServico({ ...servico, idContratual: e.target.value })}
                placeholder="Número do contrato ou ID"
              />

              <TextArea
                label="Descrição do Escopo *"
                required
                value={servico.descricaoEscopo}
                onChange={(e) => setServico({ ...servico, descricaoEscopo: e.target.value })}
                error={errors.descricaoEscopo}
                placeholder="Detalhe o escopo do trabalho a ser realizado"
              />

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Mão de Obra</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={servico.maoDeObra}
                    onChange={(e) => setServico({ ...servico, maoDeObra: e.target.checked })}
                    label="Será necessária mão de obra terceirizada para este serviço?"
                  />
                </label>
              </div>

              <TextArea
                label="Observações Adicionais"
                value={servico.observacoes}
                onChange={(e) => setServico({ ...servico, observacoes: e.target.value })}
                placeholder="Informações adicionais sobre a solicitação"
              />
            </CardBody>
          </Card>

          {/* BOTÕES DE AÇÃO */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              loading={saving}
              type="submit"
              disabled={saving}
            >
              Enviar Complementação
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
