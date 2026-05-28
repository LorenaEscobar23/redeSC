import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, TrendingUp, Clock, CheckCircle2, List, ClipboardCheck, ShieldCheck, ThumbsUp } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { useDemandas } from '../context/DemandasContext';
import type { StatusDemanda } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </CardBody>
    </Card>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { demandas, loading, fetchDemandas, filterDemandasByUser } = useDemandas();
  const navigate = useNavigate();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetchDemandas().then(() => setInitialized(true));
  }, [fetchDemandas]);

  // Filtrar demandas visíveis para o usuário
  const visibleDemandas = filterDemandasByUser(demandas, user);

  const stats = {
    total: visibleDemandas.length,
    abertas: visibleDemandas.filter((d) => d.status === 'ABERTA').length,
    aprovadas: visibleDemandas.filter((d) => d.status === 'APROVADA' || d.status === 'CHAMADO_SUPRIMENTOS').length,
    rejeitadas: visibleDemandas.filter((d) => d.status === 'REJEITADA').length,
    emAndamento: visibleDemandas.filter((d) => !['REJEITADA', 'CHAMADO_SUPRIMENTOS', 'ABERTA'].includes(d.status)).length,
  };

  const pendingForMe = visibleDemandas.filter((d) => {
    if (!user) return false;
    if (user.role === 'LEONARDO') return d.status === 'ABERTA' || d.status === 'COMPLEMENTACAO_SOLICITADA';
    if (user.role === 'MARCOS') return d.status === 'APROVACAO_PENDENTE' && (d.aprovacoesGestores ?? []).some((a) => a.gestor === 'MARCOS' && a.aprovado === null);
    if (user.role === 'VIANA') return d.status === 'APROVACAO_PENDENTE' && (d.aprovacoesGestores ?? []).some((a) => a.gestor === 'VIANA' && a.aprovado === null);
    if (user.role === 'KLEBER') return d.status === 'APROVACAO_PENDENTE' && (d.aprovacoesGestores ?? []).some((a) => a.gestor === 'KLEBER' && a.aprovado === null);
    return false;
  });

  const recentDemandas = [...visibleDemandas].sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()).slice(0, 5);

  if (!initialized && loading) return <MainLayout><PageSpinner /></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bem-vindo, {user?.name?.split(' ')[0]}</h1>
            <p className="text-gray-500 mt-1">Aqui está um resumo das demandas do sistema.</p>
          </div>
          {user?.role === 'SOLICITANTE' && (
            <Button icon={<PlusCircle size={16} />} onClick={() => navigate('/nova-solicitacao')}>
              Nova Solicitação
            </Button>
          )}
          {user?.role === 'LEONARDO' && (
            <Button icon={<ClipboardCheck size={16} />} onClick={() => navigate('/analise')}>
              Analisar Demandas
            </Button>
          )}
          {user?.role === 'DIRETOR' && (
            <Button icon={<ShieldCheck size={16} />} onClick={() => navigate('/validacao')}>
              Validar Demandas
            </Button>
          )}
          {['MARCOS', 'VIANA', 'KLEBER'].includes(user?.role ?? '') && (
            <Button icon={<ThumbsUp size={16} />} onClick={() => navigate('/aprovacao')}>
              Aprovar Demandas
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total de Demandas" value={stats.total} icon={<List size={20} className="text-blue-600" />} color="bg-blue-50" />
          <StatCard label="Abertas" value={stats.abertas} icon={<Clock size={20} className="text-yellow-600" />} color="bg-yellow-50" />
          <StatCard label="Em Andamento" value={stats.emAndamento} icon={<TrendingUp size={20} className="text-cyan-600" />} color="bg-cyan-50" />
          <StatCard label="Aprovadas" value={stats.aprovadas} icon={<CheckCircle2 size={20} className="text-green-600" />} color="bg-green-50" />
        </div>

        {pendingForMe.length > 0 && (
          <Card>
            <CardBody>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <h2 className="text-base font-semibold text-gray-900">Demandas Pendentes para Você</h2>
                <span className="ml-auto bg-orange-100 text-orange-800 text-xs font-medium px-2 py-0.5 rounded-full">{pendingForMe.length}</span>
              </div>
              <div className="space-y-2">
                {pendingForMe.slice(0, 4).map((d) => (
                  <div
                    key={d.id}
                    onClick={() => navigate(`/demandas/${d.id}`)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{d.id}</p>
                      <p className="text-xs text-gray-500 truncate">{d.solicitante.nome} &middot; {d.solicitante.casa}</p>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Demandas Recentes</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/demandas')}>Ver todas</Button>
            </div>
            {recentDemandas.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <List size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">Nenhuma demanda encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                      <th className="pb-2 pr-4 font-medium">ID</th>
                      <th className="pb-2 pr-4 font-medium">Solicitante</th>
                      <th className="pb-2 pr-4 font-medium hidden md:table-cell">Casa</th>
                      <th className="pb-2 pr-4 font-medium hidden lg:table-cell">Serviço</th>
                      <th className="pb-2 pr-4 font-medium">Status</th>
                      <th className="pb-2 font-medium hidden sm:table-cell">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentDemandas.map((d) => (
                      <tr
                        key={d.id}
                        onClick={() => navigate(`/demandas/${d.id}`)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 pr-4 font-mono text-xs text-blue-600 font-medium">{d.id}</td>
                        <td className="py-3 pr-4 text-gray-900">{d.solicitante.nome}</td>
                        <td className="py-3 pr-4 text-gray-600 hidden md:table-cell">{d.solicitante.casa}</td>
                        <td className="py-3 pr-4 text-gray-600 hidden lg:table-cell">{d.servico.tipo}</td>
                        <td className="py-3 pr-4"><StatusBadge status={d.status as StatusDemanda} /></td>
                        <td className="py-3 text-gray-500 hidden sm:table-cell text-xs">
                          {format(new Date(d.dataCriacao), 'dd/MM/yyyy', { locale: ptBR })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  );
}
