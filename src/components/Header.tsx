'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from './ThemeProvider';
import { useAuth } from './AuthProvider';
// Notre Dame logo - using SVG for consistent display
const notreDameLogo = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHN0eWxlPi5sb2dvLWJnIHsgZmlsbDogdXJsKCNsb2dvR3JhZGllbnQpOyB9IC5sb2dvLXRleHQgeyBmaWxsOiB3aGl0ZTsgZm9udC1mYW1pbHk6IHNhbnMtc2VyaWY7IGZvbnQtd2VpZ2h0OiBib2xkOyB9IDwvc3R5bGU+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImxvZ29HcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMyMmM1NWUiLz4KPHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiMxNmEzNGEiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMTU4MDNkIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzAiIGNsYXNzPSJsb2dvLWJnIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjQiLz4KPHR0ZXh0IHg9IjMyIiB5PSI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImxvZ28tdGV4dCIgZm9udC1zaXplPSIyMCI+TkQ8L3RleHQ+Cjwvc3ZnPgo=';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-card shadow-md border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={notreDameLogo} 
              alt="Notre Dame of Kidapawan College Logo" 
              className="h-16 w-16 object-contain flex-shrink-0"
            />
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold text-foreground">
                Notre Dame of Kidapawan College
              </h1>
              <p className="text-sm text-muted-foreground">
                RFID Classroom Attendance System
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.role} {user.department && `• ${user.department}`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="text-xs"
                >
                  Sign Out
                </Button>
              </div>
            )}
            
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}