'use client';

import React, { useState } from 'react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from './ui/sidebar';
import { Header } from './Header';
import { useRouter } from './Router';
import { 
  LayoutDashboard,
  Users, 
  Building, 
  Calendar,
  Clock,
  Bell,
  BarChart3,
  Settings,
  Radio,
  UserCheck,
  TrendingUp,
  PieChart,
  Activity
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
}

export function AdminLayout({ children, activeView }: AdminLayoutProps) {
  const { navigate } = useRouter();
  
  const menuItems = [
    {
      title: "Overview",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "reports", label: "Reports", icon: TrendingUp },
      ]
    },
    {
      title: "Management",
      items: [
        { id: "teachers", label: "Teachers", icon: Users },
        { id: "classrooms", label: "Classrooms", icon: Building },
        { id: "schedules", label: "Schedules", icon: Calendar },
      ]
    },
    {
      title: "Monitoring",
      items: [
        { id: "attendance", label: "Live Attendance", icon: Clock },
        { id: "terminal", label: "RFID Terminal", icon: Radio },
        { id: "notifications", label: "Notifications", icon: Bell },
      ]
    },
    {
      title: "System",
      items: [
        { id: "settings", label: "Settings", icon: Settings },
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <SidebarProvider>
        <div className="flex w-full">
          <Sidebar className="border-r">
            <SidebarContent>
              <div className="p-6">
                <h2 className="text-lg font-semibold">Admin Panel</h2>
                <p className="text-sm text-muted-foreground">NDKC RFID System</p>
              </div>
              
              {menuItems.map((section) => (
                <SidebarGroup key={section.title}>
                  <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {section.items.map((item) => (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            onClick={() => navigate(item.id)}
                            isActive={activeView === item.id}
                            className="w-full justify-start"
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>
          </Sidebar>
          
          <div className="flex-1 flex flex-col">
            <div className="border-b p-4 flex items-center">
              <SidebarTrigger />
              <h1 className="ml-4 text-xl font-semibold capitalize">
                {menuItems.flatMap(section => section.items).find(item => item.id === activeView)?.label || 'Dashboard'}
              </h1>
            </div>
            
            <main className="flex-1 p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}