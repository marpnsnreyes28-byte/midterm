'use client';

import React, { useState, useEffect } from 'react';
import { RfidTerminalFullscreen } from './RfidTerminalFullscreen';
import { useAuth } from './AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Maximize2, Radio, MapPin, Sparkles, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export function RfidTerminalPage() {
  const { classrooms } = useAuth();
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if already in fullscreen
  useEffect(() => {
    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', checkFullscreen);
    return () => document.removeEventListener('fullscreenchange', checkFullscreen);
  }, []);

  // Get classroom from URL if provided
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const classroomParam = params.get('classroom');
    if (classroomParam) {
      setSelectedClassroom(classroomParam);
      // Auto enter fullscreen if classroom is selected via URL
      setTimeout(() => {
        enterFullscreen();
      }, 500);
    }
  }, []);

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if ((elem as any).webkitRequestFullscreen) {
      (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).msRequestFullscreen) {
      (elem as any).msRequestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  };

  // If a classroom is selected and we're in fullscreen, show the terminal
  if (selectedClassroom && isFullscreen) {
    return <RfidTerminalFullscreen classroomId={selectedClassroom} />;
  }

  // Otherwise show the setup screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-950 dark:via-emerald-950 dark:to-green-950 p-8 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl relative z-10"
      >
        <Card className="shadow-2xl border-2 border-primary/20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="flex justify-center mb-4"
            >
              <div className="bg-gradient-to-br from-primary to-green-600 rounded-full p-4 shadow-lg">
                <Radio className="h-12 w-12 text-white" />
              </div>
            </motion.div>
            <CardTitle className="flex items-center justify-center gap-2 text-3xl">
              <span>RFID Terminal Setup</span>
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Select a classroom to activate the RFID terminal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
          {/* Classroom Selection */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <Label htmlFor="terminal-classroom" className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Classroom / Terminal Location
            </Label>
            <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
              <SelectTrigger id="terminal-classroom" className="h-12 text-base">
                <SelectValue placeholder="Choose the classroom for this terminal" />
              </SelectTrigger>
              <SelectContent>
                {classrooms.filter(c => (c.isActive ?? c.is_active)).map((classroom) => (
                  <SelectItem key={classroom.id} value={classroom.id} className="text-base">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {classroom.name} - {classroom.location}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Selected Classroom Info */}
          {selectedClassroom && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-br from-primary/10 to-green-50 dark:from-primary/20 dark:to-green-950 border-2 border-primary/30 rounded-xl p-6 shadow-lg"
            >
              <h4 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-primary" />
                Terminal Configuration
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <span className="text-muted-foreground block text-xs mb-1">Location</span>
                    <span className="font-semibold text-base">
                      {classrooms.find(c => c.id === selectedClassroom)?.name} - {classrooms.find(c => c.id === selectedClassroom)?.location}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <Radio className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <span className="text-muted-foreground block text-xs mb-1">Mode</span>
                    <span className="font-semibold text-base">Automatic Scanning</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <span className="text-muted-foreground block text-xs mb-1">Reader</span>
                    <span className="font-semibold text-base">Hoba RFID Reader</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <span className="text-muted-foreground block text-xs mb-1">Grace Period</span>
                    <span className="font-semibold text-base">±15 minutes</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Launch Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={enterFullscreen}
              disabled={!selectedClassroom}
              size="lg"
              className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Maximize2 className="h-6 w-6 mr-2" />
              Launch Terminal in Fullscreen Mode
            </Button>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl p-6 text-sm space-y-3 border border-blue-200 dark:border-blue-800"
          >
            <h4 className="font-semibold text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              Terminal Instructions
            </h4>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">1.</span>
                <span>Select the classroom where this terminal is installed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">2.</span>
                <span>Click "Launch Terminal" to enter fullscreen kiosk mode</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">3.</span>
                <span>The terminal will automatically read Hoba RFID cards</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">4.</span>
                <span>Teachers must scan at their scheduled classroom</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">5.</span>
                <span>Schedule validation includes ±15 minute grace period</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">6.</span>
                <span>Press ESC to exit fullscreen mode</span>
              </li>
            </ul>
          </motion.div>

          {/* Warning */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-2 border-yellow-300 dark:border-yellow-800 rounded-xl p-5 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  Important Notice
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  This terminal enforces strict schedule validation. Teachers can only tap in/out during their scheduled class times (with grace period) and at the correct classroom terminal.
                </p>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}
