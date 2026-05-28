import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, XCircle } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { TextArea } from '../components/ui/Input';
import { PageSpinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDemandas } from '../context/DemandasContext';
import * as service from '../services/demandaService';
import type { Demanda } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AprovacaoPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { demandas, refreshDemanda } = useDemandas();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [demandasSelecionada, setDemandaSelecionada] = useState<Demanda | null>(null);
  const [acao, setAcao] = useState<'APROVAR' | 'REJEITAR' | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (demandas.length > 0) {
      setLoading(false);
    }
  }, [demandas]);

  // Filtrar demandas que precisam de aprovação do usuário atual
  const demandasPendentes = demandas.filter((d) => {
    if (d.status !== 'APROVACAO_PENDENTE') return false;

    // Verificar se o usuário está na cadeia de aprovação
    if (user?.role === 'MARCOS') {
      return (d.aprovacoesGestores ?? []).some((a) => a.gestor === 'MARCOS' && a.aprovado === null);
    }
    if (user?.role === 'VIANA') {
      return (d.aprovacoesGestores ?? []).some((a) => a.gestor === 'VIANA' && a.aprovado === null);
    }
    if (user?.role === 'KLEBER') {
      return (d.aprovacoesGestores ?? []).some((a) => a.gestor === 'KLEBER' && a.aprovado === null);
    }
    return false;
  });

  async function handleAprovar(demanda: Demanda, aprovado: boolean) {
    if (!user || !observacoes.trim()) {
      showToast('Informe as observações.', 'warning');
      return;
    }

    setSaving(true);
    try {
      await service.aprovarComGerente(
        demanda.id,
        user.role as 'MARCOS' | 'VIANA' | 'KLEBER',
        aprovado,
        observacoes
      );

      const mensagem = aprovado
        ? 'Demanda aprovada com sucesso!'
        : 'Demanda rejeitada e retornada para análise!';
      showToast(mensagem, 'success');

      setDemandaSelecionada(null);
      setAcao(null);
      setObservacoes('');
      await refreshDemanda(demanda.id);

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      showToast('Erro ao processar aprovação.', 'error');
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

  if (!user || !['MARCOS', 'VIANA', 'KLEBER'].includes(user.role)) {
    return (
      <MainLayout>
        <Alert type="error">
          Você não tem permissão para acessar esta página.
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aprovações Pendentes</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Demandas aguardando sua aprovação
            </p>
          </div>
        </div>

        {/* Resumo */}
        <Card>
          <CardBody>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{demandasPendentes.length}</p>
                <p className="text-sm text-gray-500">Pendentes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-400">0</p>
                <p className="text-sm text-gray-500">Aprovadas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-400">0</p>
                <p className="text-sm text-gray-500">Rejeitadas</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Lista de Demandas */}
        {demandasPendentes.length === 0 ? (
          <Alert type="info">
            Nenhuma demanda aguardando sua aprovação no momento.
          </Alert>
        ) : (
          <div className="space-y-3">
            {demandasPendentes.map((demanda) => (
              <Card key={demanda.id}>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-mono font-bold text-gray-900">{demanda.id}</h3>
                        <StatusBadge status={demanda.status} />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Solicitante:</strong> {demanda.solicitante.nome}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Serviço:</strong> {demanda.servico.tipo}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Criada em:</strong>{' '}
                        {format(new Date(demanda.dataCriacao), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/processo/${demanda.id}`)}
                      >
                        Ver Detalhes
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setDemandaSelecionada(demanda);
                          setAcao('APROVAR');
                        }}
                      >
                        <CheckCircle2 size={16} className="mr-2" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setDemandaSelecionada(demanda);
                          setAcao('REJEITAR');
                        }}
                      >
                        <XCircle size={16} className="mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de Aprovação/Rejeição */}
        <Modal
          open={!!demandasSelecionada && !!acao}
          onClose={() => {
            setDemandaSelecionada(null);
            setAcao(null);
            setObservacoes('');
          }}
          title={
            acao === 'APROVAR'
              ? 'Aprovar Demanda'
              : 'Rejeitar Demanda'
          }
        >
          {demandasSelecionada && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Demanda:</strong> {demandasSelecionada.id}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Solicitante:</strong> {demandasSelecionada.solicitante.nome}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Serviço:</strong> {demandasSelecionada.servico.tipo}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {acao === 'APROVAR'
                    ? 'Observações da Aprovação'
                    : 'Motivo da Rejeição'}
                  <span className="text-red-500">*</span>
                </label>
                <TextArea
                  label={acao === 'APROVAR' ? 'Observações' : 'Motivo'}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder={
                    acao === 'APROVAR'
                      ? 'Adicione observações (opcional)...'
                      : 'Explique o motivo da rejeição...'
                  }
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDemandaSelecionada(null);
                    setAcao(null);
                    setObservacoes('');
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  loading={saving}
                  onClick={() =>
                    handleAprovar(demandasSelecionada, acao === 'APROVAR')
                  }
                  variant={acao === 'REJEITAR' ? 'secondary' : undefined}
                >
                  {acao === 'APROVAR' ? 'Aprovar' : 'Rejeitar'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
}
