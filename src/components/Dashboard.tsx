'use client';

import React, { lazy, Suspense } from 'react';
import { useAuth } from './AuthProvider';

// Lazy load dashboards for better performance
const AdminDashboard = lazy(() => import('./AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const TeacherDashboard = lazy(() => import('./TeacherDashboard').then(m => ({ default: m.TeacherDashboard })));

// Loading component
function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-lg font-medium text-muted-foreground">
            Please log in to access the dashboard
          </h2>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<DashboardLoading />}>
      {user.role === 'admin' ? <AdminDashboard /> : <TeacherDashboard />}
    </Suspense>
  );
}