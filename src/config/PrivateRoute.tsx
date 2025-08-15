
// routes/PrivateRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// import { useAuthStore } from '../store/auth'; // tu store

const PrivateRoute: React.FC = () => {
//   const isAuthenticate = useAuthStore((state) => state.isAuthenticate);
  const isAuthenticate = true
  return isAuthenticate ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
