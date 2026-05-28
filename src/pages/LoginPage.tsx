import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

const profiles: { role: UserRole; name: string; description: string; color: string }[] = [
  { role: 'SOLICITANTE', name: 'Gladys', description: 'Criar e acompanhar solicitações', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
  { role: 'LEONARDO', name: 'Adriana', description: 'Analisar e definir escopo', color: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100' },
  { role: 'MARCOS', name: 'Marcus', description: 'Aprovação (1º Gerente)', color: 'bg-green-50 border-green-200 hover:bg-green-100' },
  { role: 'VIANA', name: 'Jerry', description: 'Aprovação (2º Gerente)', color: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100' },
  { role: 'KLEBER', name: 'Rogerio', description: 'Aprovação (3º Gerente)', color: 'bg-teal-50 border-teal-200 hover:bg-teal-100' },
  { role: 'ENGENHARIA', name: 'Antônio Engenheiro Clinico', description: 'Análise técnica de projetos', color: 'bg-orange-50 border-orange-200 hover:bg-orange-100' },
  { role: 'ASSISTENCIA', name: 'Chris', description: 'Suprimentos', color: 'bg-rose-50 border-rose-200 hover:bg-rose-100' },
  { role: 'TI', name: 'Daniel', description: 'Integração e análise de sistemas', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
  { role: 'GESTAO_PESSOAS', name: 'Angela', description: 'Análise de PEC', color: 'bg-pink-50 border-pink-200 hover:bg-pink-100' },
  { role: 'SEGURANCA', name: 'Elcio - Equipe Segurança', description: 'Validação de segurança', color: 'bg-red-50 border-red-200 hover:bg-red-100' },
  { role: 'SESMT', name: 'Equipe SESMT', description: 'Segurança e saúde no trabalho', color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<UserRole | null>(null);

  function handleEnter() {
    if (!selected) return;
    login(selected);
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Lecom Facilities</h1>
          <p className="text-blue-200 mt-2">Sistema de Solicitação de Serviços</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <p className="text-blue-100 text-sm font-medium mb-4 text-center">Selecione seu perfil de acesso</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profiles.map((p) => (
              <button
                key={p.role}
                onClick={() => setSelected(p.role)}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                  selected === p.role
                    ? 'border-white bg-white/20 shadow-lg'
                    : 'border-transparent bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{p.name}</p>
                  <p className="text-blue-200 text-xs mt-0.5">{p.description}</p>
                </div>
                {selected === p.role && (
                  <ChevronRight size={16} className="text-white ml-auto mt-0.5" />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleEnter}
            disabled={!selected}
            className="w-full mt-6 py-3 bg-white text-blue-900 font-semibold rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Acessar Sistema
            <ChevronRight size={18} />
          </button>
        </div>

        <p className="text-blue-300 text-xs text-center mt-6">
          Ambiente de demonstração - Selecione qualquer perfil para continuar
        </p>
      </div>
    </div>
  );
}
