// routes/PrivateRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

type PrivateRouteProps = {
  redirectTo?: string;
  requireRole?: string;     // opcional: "Administrador"
  requireModule?: string;   // opcional: "Usuarios", "Reportes", etc.
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  redirectTo = "/login",
  requireRole,
  requireModule,
}) => {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const hasRole = useAuthStore((s) => s.hasRole);
  const hasModule = useAuthStore((s) => s.hasModule);

  const isAuthenticated = !!user && !!token;
  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

  if (requireRole && !hasRole(requireRole)) return <Navigate to="/403" replace />;
  if (requireModule && !hasModule(requireModule)) return <Navigate to="/403" replace />;

  return <Outlet />;
};

export default PrivateRoute;
