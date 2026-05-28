import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DemandasProvider } from './context/DemandasContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { NovaSolicitacaoPage } from './pages/NovaSolicitacaoPage';
import { ComplementacaoPage } from './pages/ComplementacaoPage';
import { DemandasListPage } from './pages/DemandasListPage';
import { ProcessoPage } from './pages/ProcessoPage';
import { AnalisePage } from './pages/AnalisePage';
import { ValidacaoPage } from './pages/ValidacaoPage';
import { AprovacaoPage } from './pages/AprovacaoPage';
import { RelatoriosPage } from './pages/RelatoriosPage';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/nova-solicitacao" element={<ProtectedRoute><NovaSolicitacaoPage /></ProtectedRoute>} />
      <Route path="/complementacao/:id" element={<ProtectedRoute><ComplementacaoPage /></ProtectedRoute>} />
      <Route path="/demandas" element={<ProtectedRoute><DemandasListPage /></ProtectedRoute>} />
      <Route path="/demandas/:id" element={<ProtectedRoute><ProcessoPage /></ProtectedRoute>} />
      <Route path="/analise" element={<ProtectedRoute><AnalisePage /></ProtectedRoute>} />
      <Route path="/validacao" element={<ProtectedRoute><ValidacaoPage /></ProtectedRoute>} />
      <Route path="/aprovacao" element={<ProtectedRoute><AprovacaoPage /></ProtectedRoute>} />
      <Route path="/relatorios" element={<ProtectedRoute><RelatoriosPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <DemandasProvider>
            <AppRoutes />
          </DemandasProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
