import { Bell, Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onMenuToggle: () => void;
}

const roleLabels: Record<string, string> = {
  SOLICITANTE: 'Solicitante',
  LEONARDO: 'Corporativo',
  DIRETOR: 'Diretor',
  MARCOS: 'Gerente',
  VIANA: 'Gerente',
  KLEBER: 'Gerente',
  ENGENHARIA: 'Engenharia',
  ASSISTENCIA: 'Assistência',
  TI: 'TI',
  GESTAO_PESSOAS: 'Gestão de Pessoas',
  SEGURANCA: 'Segurança',
  SESMT: 'SESMT',
  OUTROS: 'Outros',
};

export function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-6 gap-4 z-30 sticky top-0 shadow-sm">
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors duration-200 lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-200">
          <span className="text-white text-xs font-bold">LC</span>
        </div>
        <span className="font-semibold text-gray-900 hidden sm:block">Lecom Facilities</span>
      </div>

      <div className="flex-1" />

      <button 
        className="p-2.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all duration-200 relative" 
        aria-label="Notificações"
      >
        <Bell size={20} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      </button>

      <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
          <User size={16} className="text-blue-600" />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{user ? roleLabels[user.role] || '' : ''}</p>
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all duration-200 ml-2"
          aria-label="Sair"
          title="Sair"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
