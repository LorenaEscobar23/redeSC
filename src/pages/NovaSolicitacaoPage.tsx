import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select, TextArea, Checkbox } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { criarDemanda } from '../services/demandaService';
import type { Solicitante, ServicoSolicitado, TipoServico, Segmento, NecessidadeServico, TipoContratacao } from '../types';
import { TIPO_SERVICO_LABELS, SEGMENTO_LABELS, NECESSIDADE_SERVICO_LABELS, TIPO_CONTRATACAO_LABELS, OBJETIVO_LABELS, SERVICOS_POR_SEGMENTO } from '../types';
import { format } from 'date-fns';

interface FormErrors {
  [key: string]: string;
}

const today = format(new Date(), 'yyyy-MM-dd');

export function NovaSolicitacaoPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [createdId, setCreatedId] = useState('');
  const [, setUploadContratoArquivo] = useState<File | null>(null);
  const [uploadContratoNomeArquivo, setUploadContratoNomeArquivo] = useState('');

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
    if (!validate()) return;
    
    // Add contract file name if selected
    const servicoData = {
      ...servico,
      nomeArquivoContratoAditivos: uploadContratoNomeArquivo || undefined
    };
    
    setLoading(true);
    try {
      const demanda = await criarDemanda(solicitante, servicoData, user?.name ?? 'Sistema');
      setCreatedId(demanda.id);
      setSuccess(true);
      showToast('Demanda criada com sucesso!', 'success');
    } catch {
      showToast('Erro ao criar demanda. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <MainLayout>
        <div className="max-w-lg mx-auto py-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Solicitação Criada!</h2>
          <p className="text-gray-500 mb-2">Sua demanda foi registrada com sucesso.</p>
          <p className="text-blue-600 font-mono font-semibold text-lg mb-6">{createdId}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/demandas')}>Ver Demandas</Button>
            <Button onClick={() => navigate(`/demandas/${createdId}`)}>Ver Detalhes</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nova Solicitação de Serviço</h1>
            <p className="text-sm text-gray-500">Preencha todos os campos para registrar sua demanda</p>
          </div>
        </div>

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
                  label="Casa de Origem"
                  disabled
                  value={solicitante.casa}
                >
                  <option value="">{solicitante.casa || 'Selecione'}</option>
                </Select>
                <Input
                  label="Departamento"
                  disabled
                  value={solicitante.departamento}
                  placeholder="RH, TI, Operações..."
                />
                <Input
                  label="Centro de Custo"
                  disabled
                  value={solicitante.centroDeCusto}
                  placeholder="12345 - RH"
                />
              </div>

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
            </CardBody>
          </Card>

          {/* SEÇÃO: DADOS DA SOLICITAÇÃO */}
          <Card>
            <CardHeader blue title="Dados da Solicitação" subtitle="Informações sobre o serviço solicitado" />
            <CardBody className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="Local do serviço"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Necessidade do Serviço *"
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
                  label="Data Prevista de Início"
                  type="date"
                  min={today}
                  value={servico.dataPrevista}
                  onChange={(e) => setServico({ ...servico, dataPrevista: e.target.value })}
                  error={errors.dataPrevista}
                />
              </div>

              {servico.tipoContratacao === 'EXISTENTE' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Razão Social do Prestador"
                      value={servico.razaoSocialPrestador || ''}
                      onChange={(e) => setServico({ ...servico, razaoSocialPrestador: e.target.value })}
                      placeholder="Nome da empresa"
                    />
                    <Input
                      label="CNPJ do Prestador"
                      value={servico.cnpjPrestador || ''}
                      onChange={(e) => setServico({ ...servico, cnpjPrestador: e.target.value })}
                      placeholder="00.000.000/0000-00"
                    />
                    <Input
                      label="ID Contratual"
                      value={servico.idContratual}
                      onChange={(e) => setServico({ ...servico, idContratual: e.target.value })}
                      placeholder="Número do contrato"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload de Contrato e Aditivos</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        id="contrato-file-nova"
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
                        htmlFor="contrato-file-nova"
                        className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors text-blue-600 text-sm font-medium"
                      >
                        Selecionar Arquivo
                      </label>
                      {uploadContratoNomeArquivo && (
                        <span className="text-sm text-gray-600">{uploadContratoNomeArquivo}</span>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Duração do Serviço"
                  value={servico.duracao}
                  onChange={(e) => setServico({ ...servico, duracao: e.target.value })}
                  error={errors.duracao}
                  placeholder="Ex: 2 dias, 1 semana"
                />
                <div className="flex items-end pb-2">
                  <Checkbox
                    label="Mão de obra alocada?"
                    checked={servico.maoDeObra}
                    onChange={(e) => setServico({ ...servico, maoDeObra: e.target.checked })}
                  />
                </div>
              </div>

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

              <TextArea
                label="Descrição do Escopo *"
                required
                value={servico.descricaoEscopo}
                onChange={(e) => setServico({ ...servico, descricaoEscopo: e.target.value })}
                error={errors.descricaoEscopo}
                placeholder="Detalhe o escopo de trabalho"
              />

              <TextArea
                label="Observações"
                value={servico.observacoes}
                onChange={(e) => setServico({ ...servico, observacoes: e.target.value })}
                placeholder="Observações adicionais"
              />
            </CardBody>
          </Card>

          {Object.keys(errors).length > 0 && (
            <Alert type="error" title="Corrija os erros antes de enviar">
              Verifique os campos marcados em vermelho.
            </Alert>
          )}

          <div className="flex gap-3 justify-end pb-8">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" loading={loading}>Criar Solicitação</Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
