import { Check, Clock, X } from 'lucide-react';
import type { StatusDemanda } from '../../types';

interface Step {
  label: string;
  sublabel: string;
}

const STEPS: Step[] = [
  { label: 'Solicitação', sublabel: 'Solicitante' },
  { label: 'Análise', sublabel: 'Leonardo' },
  { label: 'Validação', sublabel: 'Diretor' },
  { label: 'Aprovação', sublabel: 'Gerentes' },
  { label: 'Suprimentos', sublabel: 'Chamado' },
];

function getStepIndex(status: StatusDemanda): number {
  const map: Record<StatusDemanda, number> = {
    ABERTA: 0,
    EM_ANALISE: 1,
    COMPLEMENTACAO_SOLICITADA: 1,
    AGUARDANDO_AREA_TECNICA: 1,
    ESCOPO_VALIDADO: 2,
    APROVACAO_PENDENTE: 3,
    APROVADA: 3,
    REJEITADA: -1,
    CHAMADO_SUPRIMENTOS: 4,
  };
  return map[status] ?? 0;
}

function getCompletedUpTo(status: StatusDemanda): number {
  const map: Record<StatusDemanda, number> = {
    ABERTA: -1,
    EM_ANALISE: 0,
    COMPLEMENTACAO_SOLICITADA: 0,
    AGUARDANDO_AREA_TECNICA: 0,
    ESCOPO_VALIDADO: 1,
    APROVACAO_PENDENTE: 2,
    APROVADA: 3,
    REJEITADA: -2,
    CHAMADO_SUPRIMENTOS: 4,
  };
  return map[status] ?? -1;
}

interface StepIndicatorProps {
  status: StatusDemanda;
}

export function StepIndicator({ status }: StepIndicatorProps) {
  const activeIndex = getStepIndex(status);
  const completedUpTo = getCompletedUpTo(status);
  const isRejected = status === 'REJEITADA';

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-start min-w-max mx-auto px-4 pb-2">
        {STEPS.map((step, idx) => {
          const isCompleted = completedUpTo >= idx;
          const isActive = activeIndex === idx;
          const isPending = !isCompleted && !isActive;

          return (
            <div key={idx} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    isCompleted
                      ? 'bg-blue-600 text-white'
                      : isActive && !isRejected
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-600'
                      : isRejected && isActive
                      ? 'bg-red-100 text-red-700 border-2 border-red-500'
                      : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={16} />
                  ) : isRejected && isActive ? (
                    <X size={16} />
                  ) : isActive ? (
                    <Clock size={16} />
                  ) : (
                    idx + 1
                  )}
                </div>
                <div className="text-center">
                  <p className={`text-xs font-semibold ${isCompleted || isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-400">{step.sublabel}</p>
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`h-0.5 w-16 mb-6 mx-1 transition-colors ${completedUpTo > idx ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
