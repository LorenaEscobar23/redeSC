import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronUp, ChevronDown, Edit2 } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card, CardBody } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { useDemandas } from '../context/DemandasContext';
import type { Demanda, StatusDemanda, TipoServico } from '../types';
import { STATUS_LABELS, TIPO_SERVICO_LABELS, CASAS } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type SortKey = 'id' | 'nome' | 'casa' | 'status' | 'dataCriacao';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

export function DemandasListPage() {
  const { demandas, loading, fetchDemandas, filterDemandasByUser } = useDemandas();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [initialized, setInitialized] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusDemanda | ''>('');
  const [filterCasa, setFilterCasa] = useState('');
  const [filterTipo, setFilterTipo] = useState<TipoServico | ''>('');
  const [sortKey, setSortKey] = useState<SortKey>('dataCriacao');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchDemandas().then(() => setInitialized(true));
  }, [fetchDemandas]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  // Primeiro filtro: aplicar restrições de acesso baseado no perfil do usuário
  const demandasVisiveis = filterDemandasByUser(demandas, user);

  const filtered = demandasVisiveis
    .filter((d) => {
      const q = search.toLowerCase();
      const matchSearch = !q || d.id.toLowerCase().includes(q) || d.solicitante.nome.toLowerCase().includes(q) || d.solicitante.casa.toLowerCase().includes(q);
      const matchStatus = !filterStatus || d.status === filterStatus;
      const matchCasa = !filterCasa || d.solicitante.casa === filterCasa;
      const matchTipo = !filterTipo || d.servico.tipo === filterTipo;
      return matchSearch && matchStatus && matchCasa && matchTipo;
    })
    .sort((a, b) => {
      let av = '', bv = '';
      if (sortKey === 'id') { av = a.id; bv = b.id; }
      else if (sortKey === 'nome') { av = a.solicitante.nome; bv = b.solicitante.nome; }
      else if (sortKey === 'casa') { av = a.solicitante.casa; bv = b.solicitante.casa; }
      else if (sortKey === 'status') { av = a.status; bv = b.status; }
      else { av = a.dataCriacao; bv = b.dataCriacao; }
      const cmp = av.localeCompare(bv);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span className="opacity-30 inline-block ml-1"><ChevronUp size={12} /></span>;
    return sortDir === 'asc' ? <ChevronUp size={12} className="inline-block ml-1" /> : <ChevronDown size={12} className="inline-block ml-1" />;
  }

  if (!initialized && loading) return <MainLayout><PageSpinner /></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demandas</h1>
          <p className="text-gray-500 mt-1">{filtered.length} demanda{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}</p>
        </div>

        <Card>
          <CardBody>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por ID, solicitante, casa..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value as StatusDemanda | ''); setPage(1); }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Todos os status</option>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select
                  value={filterCasa}
                  onChange={(e) => { setFilterCasa(e.target.value); setPage(1); }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Todas as casas</option>
                  {CASAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={filterTipo}
                  onChange={(e) => { setFilterTipo(e.target.value as TipoServico | ''); setPage(1); }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Todos os serviços</option>
                  {Object.entries(TIPO_SERVICO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 font-medium cursor-pointer" onClick={() => handleSort('id')}>
                    ID <SortIcon k="id" />
                  </th>
                  <th className="px-4 py-3 font-medium cursor-pointer" onClick={() => handleSort('nome')}>
                    Solicitante <SortIcon k="nome" />
                  </th>
                  <th className="px-4 py-3 font-medium cursor-pointer hidden md:table-cell" onClick={() => handleSort('casa')}>
                    Casa <SortIcon k="casa" />
                  </th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Serviço</th>
                  <th className="px-4 py-3 font-medium cursor-pointer" onClick={() => handleSort('status')}>
                    Status <SortIcon k="status" />
                  </th>
                  <th className="px-4 py-3 font-medium cursor-pointer hidden sm:table-cell" onClick={() => handleSort('dataCriacao')}>
                    Data <SortIcon k="dataCriacao" />
                  </th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      <Filter size={32} className="mx-auto mb-2 opacity-40" />
                      <p>Nenhuma demanda encontrada</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((d) => (
                    <tr
                      key={d.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-blue-600 font-medium cursor-pointer" onClick={() => navigate(`/demandas/${d.id}`)}>{d.id}</td>
                      <td className="px-4 py-3 text-gray-900 cursor-pointer" onClick={() => navigate(`/demandas/${d.id}`)}>{d.solicitante.nome}</td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell cursor-pointer" onClick={() => navigate(`/demandas/${d.id}`)}>{d.solicitante.casa}</td>
                      <td className="px-4 py-3 text-gray-600 hidden lg:table-cell cursor-pointer" onClick={() => navigate(`/demandas/${d.id}`)}>{TIPO_SERVICO_LABELS[d.servico.tipo]}</td>
                      <td className="px-4 py-3 cursor-pointer" onClick={() => navigate(`/demandas/${d.id}`)}><StatusBadge status={d.status as StatusDemanda} /></td>
                      <td className="px-4 py-3 text-gray-500 hidden sm:table-cell text-xs cursor-pointer" onClick={() => navigate(`/demandas/${d.id}`)}>
                        {format(new Date(d.dataCriacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </td>
                      <td className="px-4 py-3">
                        {d.status === 'COMPLEMENTACAO_SOLICITADA' && user?.name === d.solicitante.nome && (
                          <Button
                            size="sm"
                            icon={<Edit2 size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/complementacao/${d.id}`);
                            }}
                          >
                            Editar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Página {page} de {totalPages}</p>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
