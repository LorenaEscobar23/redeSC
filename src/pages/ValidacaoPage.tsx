import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { useDemandas } from '../context/DemandasContext';
import { TIPO_SERVICO_LABELS } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ValidacaoPage() {
  const { demandas, loading, fetchDemandas } = useDemandas();
  const navigate = useNavigate();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetchDemandas().then(() => setInitialized(true));
  }, [fetchDemandas]);

  const pendentes = demandas.filter((d) => d.status === 'ESCOPO_DEFINIDO');

  if (!initialized && loading) return <MainLayout><PageSpinner /></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demandas para Validação</h1>
          <p className="text-gray-500 mt-1">{pendentes.length} demanda{pendentes.length !== 1 ? 's' : ''} aguardando validação do Diretor</p>
        </div>

        {pendentes.length === 0 ? (
          <Alert type="info" title="Tudo em ordem!">
            Não há demandas pendentes de validação no momento.
          </Alert>
        ) : (
          <div className="space-y-4">
            {pendentes.map((d) => (
              <Card key={d.id} hover>
                <CardBody>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <ShieldCheck size={20} className="text-teal-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-semibold text-blue-600">{d.id}</span>
                          <StatusBadge status={d.status} />
                        </div>
                        <p className="text-base font-medium text-gray-900 mt-1">{d.solicitante.nome}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span>{d.solicitante.casa}</span>
                          <span>&middot;</span>
                          <span>{TIPO_SERVICO_LABELS[d.servico.tipo]}</span>
                          <span>&middot;</span>
                          <span>R$ {d.servico.orcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        {d.analise?.observacoes && (
                          <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded p-2 line-clamp-2">
                            Análise: {d.analise.observacoes}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      icon={<ArrowRight size={14} />}
                      onClick={() => navigate(`/demandas/${d.id}`)}
                      className="flex-shrink-0"
                    >
                      Validar
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
