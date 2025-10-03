'use client';

import React from 'react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from './ui/sidebar';
import { Header } from './Header';
import { 
  LayoutDashboard,
  Clock,
  Bell,
  User,
  Calendar
} from 'lucide-react';

interface TeacherLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
}

export function TeacherLayout({ children, activeView, onViewChange }: TeacherLayoutProps) {
  
  const menuItems = [
    {
      title: "Overview",
      items: [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "attendance", label: "My Attendance", icon: Clock },
      ]
    },
    {
      title: "Personal",
      items: [
        { id: "profile", label: "My Profile", icon: User },
        { id: "schedule", label: "My Schedule", icon: Calendar },
        { id: "notifications", label: "Notifications", icon: Bell },
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
                <h2 className="text-lg font-semibold">Teacher Portal</h2>
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
                            onClick={() => onViewChange(item.id)}
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
                {menuItems.flatMap(section => section.items).find(item => item.id === activeView)?.label || 'Overview'}
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