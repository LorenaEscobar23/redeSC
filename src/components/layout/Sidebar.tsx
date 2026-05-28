import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  List,
  ClipboardCheck,
  ShieldCheck,
  ThumbsUp,
  BarChart3,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', roles: ['SOLICITANTE', 'LEONARDO', 'DIRETOR', 'MARCOS', 'VIANA', 'KLEBER', 'ENGENHARIA', 'ASSISTENCIA', 'TI', 'GESTAO_PESSOAS', 'SEGURANCA', 'SESMT', 'OUTROS'] },
  { to: '/nova-solicitacao', icon: <PlusCircle size={20} />, label: 'Nova Solicitação', roles: ['SOLICITANTE'] },
  { to: '/demandas', icon: <List size={20} />, label: 'Minhas Demandas', roles: ['SOLICITANTE'] },
  { to: '/demandas', icon: <List size={20} />, label: 'Todas as Demandas', roles: ['LEONARDO', 'DIRETOR', 'MARCOS', 'VIANA', 'KLEBER', 'ENGENHARIA', 'ASSISTENCIA', 'TI', 'GESTAO_PESSOAS', 'SEGURANCA', 'SESMT', 'OUTROS'] },
  { to: '/analise', icon: <ClipboardCheck size={20} />, label: 'Análise', roles: ['LEONARDO'] },
  { to: '/validacao', icon: <ShieldCheck size={20} />, label: 'Validação', roles: ['DIRETOR'] },
  { to: '/aprovacao', icon: <ThumbsUp size={20} />, label: 'Aprovação', roles: ['MARCOS', 'VIANA', 'KLEBER'] },
  { to: '/relatorios', icon: <BarChart3 size={20} />, label: 'Relatórios', roles: ['SOLICITANTE', 'LEONARDO', 'DIRETOR', 'MARCOS', 'VIANA', 'KLEBER', 'ENGENHARIA', 'ASSISTENCIA', 'TI', 'GESTAO_PESSOAS', 'SEGURANCA', 'SESMT', 'OUTROS'] },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user } = useAuth();

  const visible = navItems.filter((item) => !user || item.roles.includes(user.role));

  const deduplicated = visible.filter(
    (item, idx, arr) => arr.findIndex((i) => i.to === item.to && i.label === item.label) === idx
  );

  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-200" 
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transition-all duration-300 ease-out flex flex-col lg:translate-x-0 lg:static lg:z-auto lg:shadow-sm ${
          open ? 'translate-x-0 shadow-lg' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">LC</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">Lecom</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all duration-200 lg:hidden"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin">
          <div className="space-y-1">
            {deduplicated.map((item) => (
              <NavLink
                key={`${item.to}-${item.label}`}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `nav-item group ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`
                }
              >
                <span className="flex-shrink-0 text-lg">
                  {item.icon}
                </span>
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {false && <span className="w-2 h-2 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity" />}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gradient-to-t from-gray-50 to-transparent">
          <p className="text-xs text-gray-400 text-center font-medium">Sistema Lecom v1.0</p>
        </div>
      </aside>
    </>
  );
}
