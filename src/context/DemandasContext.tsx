import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Demanda, User } from '../types';
import * as service from '../services/demandaService';

interface DemandasContextValue {
  demandas: Demanda[];
  loading: boolean;
  fetchDemandas: (user?: User | null) => Promise<void>;
  getDemanda: (id: string) => Promise<Demanda>;
  refreshDemanda: (id: string) => Promise<void>;
  filterDemandasByUser: (demandas: Demanda[], user: User | null) => Demanda[];
}

const DemandasContext = createContext<DemandasContextValue | null>(null);

// Função para filtrar demandas baseado no perfil do usuário
function filterDemandasByUser(demandas: Demanda[], user: User | null): Demanda[] {
  if (!user) return [];

  // Adriana (LEONARDO) vê todas as demandas
  if (user.role === 'LEONARDO') {
    return demandas;
  }

  // Gladys (SOLICITANTE) vê apenas suas próprias demandas
  if (user.role === 'SOLICITANTE') {
    return demandas.filter((d) => d.solicitante.nome === user.name);
  }

  // Marcus (MARCOS) - Primeira aprovação
  if (user.role === 'MARCOS') {
    return demandas.filter((d) => {
      // Visualiza demandas que têm aprovação para Marcus na ordem 1
      return (d.aprovacoesGestores ?? []).some((a) => a.gestor === 'MARCOS' && a.ordem === 1);
    });
  }

  // Jerry (VIANA) - Segunda aprovação
  if (user.role === 'VIANA') {
    return demandas.filter((d) => {
      // Visualiza demandas que têm aprovação para Viana na ordem 2
      return (d.aprovacoesGestores ?? []).some((a) => a.gestor === 'VIANA' && a.ordem === 2);
    });
  }

  // Rogerio (KLEBER) - Terceira aprovação
  if (user.role === 'KLEBER') {
    return demandas.filter((d) => {
      // Visualiza demandas que têm aprovação para Kleber na ordem 3
      return (d.aprovacoesGestores ?? []).some((a) => a.gestor === 'KLEBER' && a.ordem === 3);
    });
  }

  // Áreas técnicas: visualizam demandas que foram acionadas para elas
  // MAS: não veem demandas em aprovação (APROVACAO_PENDENTE)
  if (['ENGENHARIA', 'ASSISTENCIA', 'TI', 'GESTAO_PESSOAS', 'SEGURANCA', 'SESMT', 'OUTROS'].includes(user.role)) {
    return demandas.filter((d) => {
      // Não visualiza demandas em aprovação
      if (d.status === 'APROVACAO_PENDENTE') return false;
      // Visualiza demandas que foram acionadas para essa área técnica
      return (d.acionamentosTecnicos ?? []).some((a) => a.areasTecnicas.includes(user.role as any));
    });
  }

  // Por padrão, não vê nada
  return [];
}

export function DemandasProvider({ children }: { children: ReactNode }) {
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDemandas = useCallback(async (user?: User | null) => {
    setLoading(true);
    try {
      const data = await service.listarDemandas();
      setDemandas(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const getDemanda = useCallback(async (id: string): Promise<Demanda> => {
    return service.buscarDemanda(id);
  }, []);

  const refreshDemanda = useCallback(async (id: string) => {
    const updated = await service.buscarDemanda(id);
    setDemandas((prev) =>
      prev.map((d) => (d.id === id ? updated : d))
    );
  }, []);

  return (
    <DemandasContext.Provider value={{ demandas, loading, fetchDemandas, getDemanda, refreshDemanda, filterDemandasByUser }}>
      {children}
    </DemandasContext.Provider>
  );
}

export function useDemandas() {
  const ctx = useContext(DemandasContext);
  if (!ctx) throw new Error('useDemandas must be used within DemandasProvider');
  return ctx;
}
