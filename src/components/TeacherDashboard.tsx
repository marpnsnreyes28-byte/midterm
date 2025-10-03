'use client';

import React, { useState } from 'react';
import { TeacherLayout } from './TeacherLayout';
import { RouterProvider } from './Router';
import { TeacherOverview } from './TeacherOverview';
import { TeacherProfile } from './TeacherProfile';
import { TeacherAttendance } from './TeacherAttendance';
import { TeacherSchedule } from './TeacherSchedule';
import { TeacherNotifications } from './TeacherNotifications';

export function TeacherDashboard() {
  const [activeView, setActiveView] = useState('overview');

  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return <TeacherOverview />;
      case 'attendance':
        return <TeacherAttendance />;
      case 'profile':
        return <TeacherProfile />;
      case 'schedule':
        return <TeacherSchedule />;
      case 'notifications':
        return <TeacherNotifications />;
      default:
        return <TeacherOverview />;
    }
  };

  return (
    <RouterProvider initialRoute="overview">
      <TeacherLayout activeView={activeView} onViewChange={handleViewChange}>
        {renderContent()}
      </TeacherLayout>
    </RouterProvider>
  );
}