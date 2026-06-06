import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, isAdmin } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-ink-400 text-sm tracking-wide uppercase">Loading…</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}
