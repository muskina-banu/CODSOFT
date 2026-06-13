import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <div className="page-center"><div className="spinner" /></div>;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}
