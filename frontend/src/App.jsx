import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Purchases } from './pages/Purchases';
import { Transfers } from './pages/Transfers';
import { Assignments } from './pages/Assignments';
import { AuditLogs } from './pages/AuditLogs';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="min-h-screen flex flex-col bg-[#080d1a]">
              <Navbar />
              <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/purchases" element={<Purchases />} />
                    <Route path="/transfers" element={<Transfers />} />
                    <Route path="/assignments" element={<Assignments />} />
                    <Route path="/audit-logs" element={<AuditLogs />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
