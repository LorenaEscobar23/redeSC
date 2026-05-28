import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, CheckCircle2, XCircle, Clock, Download } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import { useDemandas } from '../context/DemandasContext';
import type { StatusDemanda, TipoServico } from '../types';
import { STATUS_LABELS, TIPO_SERVICO_LABELS } from '../types';

const STATUS_ORDER: StatusDemanda[] = [
  'ABERTA', 'EM_ANALISE', 'COMPLEMENTACAO_SOLICITADA', 'AGUARDANDO_AREA_TECNICA',
  'ESCOPO_VALIDADO', 'APROVACAO_PENDENTE', 'APROVADA', 'REJEITADA', 'CHAMADO_SUPRIMENTOS', 'CANCELADA'
];

const STATUS_CHART_COLORS: Record<StatusDemanda, string> = {
  ABERTA: 'bg-blue-500',
  EM_ANALISE: 'bg-yellow-500',
  COMPLEMENTACAO_SOLICITADA: 'bg-orange-500',
  AGUARDANDO_AREA_TECNICA: 'bg-purple-500',
  ESCOPO_VALIDADO: 'bg-cyan-500',
  APROVACAO_PENDENTE: 'bg-indigo-500',
  APROVADA: 'bg-green-500',
  REJEITADA: 'bg-red-500',
  CHAMADO_SUPRIMENTOS: 'bg-emerald-500',
  CANCELADA: 'bg-gray-500',
};

const SERVICO_COLORS: Partial<Record<TipoServico, string>> = {
  VIGILANTES: 'bg-blue-400',
  LIMPEZA: 'bg-green-400',
  GASES_MEDICINAIS: 'bg-cyan-400',
  CONTROLE_PRAGAS: 'bg-orange-400',
  CAMERAS_CFTV: 'bg-purple-400',
  OUTROS: 'bg-gray-400',
};

function BarChartRow({ label, value, max, colorClass }: { label: string; value: number; max: number; colorClass: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-600 w-44 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-800 w-6 text-right">{value}</span>
    </div>
  );
}

export function RelatoriosPage() {
  const { demandas, loading, fetchDemandas } = useDemandas();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetchDemandas().then(() => setInitialized(true));
  }, [fetchDemandas]);

  if (!initialized && loading) return <MainLayout><PageSpinner /></MainLayout>;

  const total = demandas.length;

  // Cálculos para novos indicadores
  const chamados = demandas.filter((d) => d.status !== 'ABERTA').length;
  const atendidos = demandas.filter((d) => ['APROVADA', 'CHAMADO_SUPRIMENTOS'].includes(d.status)).length;
  const pctAtendidos = chamados > 0 ? Math.round((atendidos / chamados) * 100) : 0;

  // % dentro do SLA
  const agora = new Date();
  const dentroDoPrazo = demandas.filter((d) => {
    if (!d.dataPrazo) return true; // sem prazo, considera dentro do SLA
    return new Date(d.dataPrazo) > agora;
  }).length;
  const pctSLA = total > 0 ? Math.round((dentroDoPrazo / total) * 100) : 0;

  // % por complexidade
  const complexidadeCounts = { BAIXA: 0, MEDIA: 0, ALTA: 0 };
  demandas.forEach((d) => {
    if (d.classificacao?.complexidade) {
      complexidadeCounts[d.classificacao.complexidade]++;
    }
  });
  const pctBaixa = total > 0 ? Math.round((complexidadeCounts.BAIXA / total) * 100) : 0;
  const pctMedia = total > 0 ? Math.round((complexidadeCounts.MEDIA / total) * 100) : 0;
  const pctAlta = total > 0 ? Math.round((complexidadeCounts.ALTA / total) * 100) : 0;

  // % por criticidade
  const criticidadeCounts = { URGENTE: 0, EMERGENCIAL: 0, NORMAL: 0 };
  demandas.forEach((d) => {
    criticidadeCounts[d.servico.necessidade]++;
  });
  const pctUrgente = total > 0 ? Math.round((criticidadeCounts.URGENTE / total) * 100) : 0;
  const pctEmergencial = total > 0 ? Math.round((criticidadeCounts.EMERGENCIAL / total) * 100) : 0;
  const pctNormal = total > 0 ? Math.round((criticidadeCounts.NORMAL / total) * 100) : 0;

  const byStatus = STATUS_ORDER.reduce<Record<string, number>>((acc, s) => {
    acc[s] = demandas.filter((d) => d.status === s).length;
    return acc;
  }, {});

  const byServico = (['VIGILANTES', 'LIMPEZA', 'GASES_MEDICINAIS', 'CONTROLE_PRAGAS', 'OUTROS'] as TipoServico[]).reduce<Record<string, number>>((acc, t) => {
    acc[t] = demandas.filter((d) => d.servico.tipo === t).length;
    return acc;
  }, {});

  const casaMap: Record<string, number> = {};
  demandas.forEach((d) => {
    casaMap[d.solicitante.casa] = (casaMap[d.solicitante.casa] ?? 0) + 1;
  });
  const byCasa = Object.entries(casaMap).sort((a, b) => b[1] - a[1]);

  const aprovadas = demandas.filter((d) => ['APROVADA', 'CHAMADO_SUPRIMENTOS'].includes(d.status)).length;
  const rejeitadas = demandas.filter((d) => d.status === 'REJEITADA').length;
  const taxaAprovacao = total > 0 ? Math.round((aprovadas / total) * 100) : 0;

  const maxStatus = Math.max(...Object.values(byStatus), 1);
  const maxServico = Math.max(...Object.values(byServico), 1);
  const maxCasa = byCasa.length > 0 ? byCasa[0][1] : 1;

  function handleExportAll() {
    const json = JSON.stringify({ exportedAt: new Date().toISOString(), totalDemandas: total, demandas }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-lecom-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <MainLayout>
      <div className="space-y-8 max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-500 mt-1">Visão consolidada de todas as demandas</p>
          </div>
          <Button icon={<Download size={16} />} variant="outline" onClick={handleExportAll}>
            Exportar Relatório JSON
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total de Demandas', value: total, icon: <BarChart3 size={20} className="text-blue-600" />, bg: 'bg-blue-50' },
            { label: 'Taxa de Aprovação', value: `${taxaAprovacao}%`, icon: <TrendingUp size={20} className="text-green-600" />, bg: 'bg-green-50' },
            { label: 'Aprovadas/Finalizadas', value: aprovadas, icon: <CheckCircle2 size={20} className="text-emerald-600" />, bg: 'bg-emerald-50' },
            { label: 'Rejeitadas', value: rejeitadas, icon: <XCircle size={20} className="text-red-600" />, bg: 'bg-red-50' },
          ].map((s) => (
            <Card key={s.label}>
              <CardBody className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 leading-tight">{s.label}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Novos Indicadores */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Indicadores Principais</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total de Chamados', value: chamados, icon: <BarChart3 size={20} className="text-purple-600" />, bg: 'bg-purple-50' },
              { label: '% Chamados Atendidos', value: `${pctAtendidos}%`, icon: <CheckCircle2 size={20} className="text-green-600" />, bg: 'bg-green-50' },
              { label: '% Dentro do SLA', value: `${pctSLA}%`, icon: <Clock size={20} className="text-cyan-600" />, bg: 'bg-cyan-50' },
            ].map((s) => (
              <Card key={s.label}>
                <CardBody className="flex flex-col items-center gap-2 text-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                    {s.icon}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 leading-tight">{s.label}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* Complexidade e Criticidade */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Demandas por Complexidade" subtitle="Distribuição percentual" />
            <CardBody className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Baixa Complexidade</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 w-32">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${pctBaixa}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">{pctBaixa}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Média Complexidade</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 w-32">
                      <div
                        className="h-2 rounded-full bg-yellow-500"
                        style={{ width: `${pctMedia}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">{pctMedia}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Alta Complexidade</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 w-32">
                      <div
                        className="h-2 rounded-full bg-red-500"
                        style={{ width: `${pctAlta}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">{pctAlta}%</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t text-xs text-gray-500">
                Total: {complexidadeCounts.BAIXA + complexidadeCounts.MEDIA + complexidadeCounts.ALTA} demandas classificadas
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Demandas por Criticidade" subtitle="Distribuição percentual" />
            <CardBody className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Normal</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 w-32">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${pctNormal}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">{pctNormal}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Urgente</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 w-32">
                      <div
                        className="h-2 rounded-full bg-orange-500"
                        style={{ width: `${pctUrgente}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">{pctUrgente}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Emergencial</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 w-32">
                      <div
                        className="h-2 rounded-full bg-red-500"
                        style={{ width: `${pctEmergencial}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">{pctEmergencial}%</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t text-xs text-gray-500">
                Total: {total} demandas
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Demandas por Status" />
            <CardBody className="space-y-3">
              {STATUS_ORDER.map((s) => (
                <BarChartRow
                  key={s}
                  label={STATUS_LABELS[s]}
                  value={byStatus[s]}
                  max={maxStatus}
                  colorClass={STATUS_CHART_COLORS[s]}
                />
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Demandas por Tipo de Serviço" />
            <CardBody className="space-y-3">
              {(['VIGILANTES', 'LIMPEZA', 'GASES_MEDICINAIS', 'CONTROLE_PRAGAS', 'OUTROS'] as TipoServico[]).map((t) => (
                <BarChartRow
                  key={t}
                  label={TIPO_SERVICO_LABELS[t]}
                  value={byServico[t]}
                  max={maxServico}
                  colorClass={SERVICO_COLORS[t] ?? 'bg-gray-400'}
                />
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Demandas por Casa" />
            <CardBody className="space-y-3">
              {byCasa.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Sem dados</p>
              ) : (
                byCasa.map(([casa, count]) => (
                  <BarChartRow
                    key={casa}
                    label={casa}
                    value={count}
                    max={maxCasa}
                    colorClass="bg-blue-400"
                  />
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Fluxo do Processo" />
            <CardBody>
              <div className="space-y-4">
                {[
                  { label: 'Etapa 1 - Solicitação', done: total, icon: <Clock size={16} className="text-blue-500" /> },
                  { label: 'Etapa 2 - Análise', done: demandas.filter((d) => ['ESCOPO_VALIDADO', 'APROVACAO_PENDENTE', 'APROVADA', 'CHAMADO_SUPRIMENTOS'].includes(d.status)).length, icon: <Clock size={16} className="text-yellow-500" /> },
                  { label: 'Etapa 3 - Validação', done: demandas.filter((d) => ['APROVACAO_PENDENTE', 'APROVADA', 'CHAMADO_SUPRIMENTOS'].includes(d.status)).length, icon: <Clock size={16} className="text-teal-500" /> },
                  { label: 'Etapa 4 - Aprovação', done: demandas.filter((d) => ['APROVADA', 'CHAMADO_SUPRIMENTOS'].includes(d.status)).length, icon: <CheckCircle2 size={16} className="text-green-500" /> },
                  { label: 'Etapa 5 - Suprimentos', done: demandas.filter((d) => d.status === 'CHAMADO_SUPRIMENTOS').length, icon: <CheckCircle2 size={16} className="text-emerald-500" /> },
                ].map((step) => (
                  <div key={step.label} className="flex items-center gap-3">
                    {step.icon}
                    <span className="text-sm text-gray-600 flex-1">{step.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{step.done}</span>
                    <span className="text-xs text-gray-400">demanda{step.done !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
