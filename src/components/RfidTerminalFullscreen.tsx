'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from './AuthProvider';
import { Radio, CheckCircle, XCircle, Clock, Wifi, WifiOff, Volume2, VolumeX, Calendar, MapPin, User, Sparkles, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

// Grace period in minutes (can tap in early or late by this amount)
const GRACE_PERIOD_MINUTES = 15;

export function RfidTerminalFullscreen({ classroomId }: { classroomId: string }) {
  const { teachers, classrooms, schedules, tapIn, tapOut, attendanceRecords } = useAuth();
  const [rfidInput, setRfidInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScanResult, setLastScanResult] = useState<{
    success: boolean;
    message: string;
    teacher?: string;
    timestamp: Date;
  } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const inputRef = useRef<HTMLInputElement>(null);

  const classroom = classrooms.find(c => c.id === classroomId);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-focus input on mount and keep focused
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }
    };

    focusInput();
    const interval = setInterval(focusInput, 1000);

    // Focus on any click
    const handleClick = () => focusInput();
    document.addEventListener('click', handleClick);

    return () => {
      clearInterval(interval);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Simulate network connectivity
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.002) {
        setIsOnline(false);
        setTimeout(() => {
          setIsOnline(true);
        }, 3000 + Math.random() * 2000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Play beep sound
  const playBeep = (success: boolean = true) => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = success ? 1000 : 300;
      oscillator.type = success ? 'sine' : 'square';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (success ? 0.15 : 0.3));
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + (success ? 0.15 : 0.3));
    } catch (error) {
      console.error('Audio error:', error);
    }
  };

  // Check if current time is within schedule + grace period
  const isWithinSchedule = (teacherId: string): { valid: boolean; message: string; schedule?: any } => {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Find schedules for this teacher, classroom, and day
    const teacherSchedules = schedules.filter(
      s => s.teacher_id === teacherId && 
           s.classroom_id === classroomId &&
           s.day === dayOfWeek
    );

    if (teacherSchedules.length === 0) {
      return { 
        valid: false, 
        message: `No schedule found for ${dayOfWeek} in this classroom` 
      };
    }

    // Check if any schedule matches current time with grace period
    for (const schedule of teacherSchedules) {
      const [startHour, startMin] = schedule.start_time.split(':').map(Number);
      const [endHour, endMin] = schedule.end_time.split(':').map(Number);
      const scheduleStartMinutes = startHour * 60 + startMin;
      const scheduleEndMinutes = endHour * 60 + endMin;

      const effectiveStart = scheduleStartMinutes - GRACE_PERIOD_MINUTES;
      const effectiveEnd = scheduleEndMinutes + GRACE_PERIOD_MINUTES;

      if (currentMinutes >= effectiveStart && currentMinutes <= effectiveEnd) {
        return { 
          valid: true, 
          message: 'Schedule verified',
          schedule 
        };
      }
    }

    // If we get here, no matching schedule for current time
    const schedulesList = teacherSchedules
      .map(s => `${s.start_time}-${s.end_time} (${s.subject})`)
      .join(', ');
    
    return { 
      valid: false, 
      message: `Not within scheduled time. Today's schedules: ${schedulesList}` 
    };
  };

  // Handle RFID scan (triggered on input change for automatic reading)
  const handleRfidScan = async (scannedRfid: string) => {
    if (!isOnline) {
      playBeep(false);
      setLastScanResult({
        success: false,
        message: 'Terminal offline - Cannot process scan',
        timestamp: new Date()
      });
      return;
    }

    if (!scannedRfid || scannedRfid.length < 4) {
      return; // Wait for complete RFID
    }

    setIsScanning(true);

    // Simulate realistic scanning delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // Find teacher by RFID
      const teacher = teachers.find(t => t.rfid_id === scannedRfid && t.is_active);
      
      if (!teacher) {
        playBeep(false);
        setLastScanResult({
          success: false,
          message: 'Invalid RFID - Teacher not found',
          timestamp: new Date()
        });
        setIsScanning(false);
        return;
      }

      // Check if teacher already has an active session today
      const today = new Date().toISOString().split('T')[0];
      const activeSession = attendanceRecords.find(
        r => r.teacher_id === teacher.id && r.date === today && !r.tap_out_time
      );

      if (activeSession) {
        // TAP OUT
        const success = await tapOut(scannedRfid);
        if (success) {
          playBeep(true);
          setLastScanResult({
            success: true,
            message: 'Tapped OUT successfully',
            teacher: teacher.name,
            timestamp: new Date()
          });
        } else {
          playBeep(false);
          setLastScanResult({
            success: false,
            message: 'Tap out failed',
            teacher: teacher.name,
            timestamp: new Date()
          });
        }
      } else {
        // TAP IN - Validate schedule and classroom
        const scheduleCheck = isWithinSchedule(teacher.id);
        
        if (!scheduleCheck.valid) {
          playBeep(false);
          setLastScanResult({
            success: false,
            message: scheduleCheck.message,
            teacher: teacher.name,
            timestamp: new Date()
          });
          setIsScanning(false);
          return;
        }

        const success = await tapIn(scannedRfid, classroomId);
        if (success) {
          playBeep(true);
          setLastScanResult({
            success: true,
            message: `Tapped IN successfully - ${scheduleCheck.schedule?.subject}`,
            teacher: teacher.name,
            timestamp: new Date()
          });
        } else {
          playBeep(false);
          setLastScanResult({
            success: false,
            message: 'Tap in failed - Already tapped in elsewhere',
            teacher: teacher.name,
            timestamp: new Date()
          });
        }
      }
    } catch (error) {
      playBeep(false);
      setLastScanResult({
        success: false,
        message: 'Error processing scan',
        timestamp: new Date()
      });
    } finally {
      setIsScanning(false);
      setRfidInput('');
      
      // Refocus input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  // Auto-submit when RFID is complete (typically ends with Enter from reader)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && rfidInput) {
      handleRfidScan(rfidInput);
    }
  };

  // Get today's schedule for this classroom
  const todaySchedules = (() => {
    const dayOfWeek = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
    return schedules
      .filter(s => s.classroom_id === classroomId && s.day === dayOfWeek)
      .map(s => {
        const teacher = teachers.find(t => t.id === s.teacher_id);
        return { ...s, teacherName: teacher?.name || 'Unknown' };
      })
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  })();

  // Get active teachers in this classroom
  const activeNow = attendanceRecords
    .filter(r => 
      r.classroom_id === classroomId && 
      r.date === currentTime.toISOString().split('T')[0] &&
      !r.tap_out_time
    )
    .map(r => {
      const teacher = teachers.find(t => t.id === r.teacher_id);
      return {
        ...r,
        teacherName: teacher?.name || 'Unknown',
        duration: Math.round((currentTime.getTime() - new Date(r.tap_in_time).getTime()) / (1000 * 60))
      };
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-950 dark:via-emerald-950 dark:to-green-950 p-6 flex flex-col relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6 relative z-10"
      >
        <div className="flex items-center gap-4">
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-full p-4 shadow-xl border-2 border-primary/20"
            animate={isScanning ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: isScanning ? Infinity : 0 }}
          >
            <Radio className={`h-10 w-10 transition-colors duration-300 ${
              isScanning ? 'text-green-500 animate-pulse' : 
              isOnline ? 'text-primary' : 'text-red-500'
            }`} />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              NDKC RFID Terminal
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              {classroom?.name} - {classroom?.location}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
          >
            {soundEnabled ? (
              <Volume2 className="h-6 w-6 text-primary" />
            ) : (
              <VolumeX className="h-6 w-6 text-gray-400" />
            )}
          </motion.button>
          
          {/* Connection Status */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg border-2 ${
              isOnline 
                ? 'bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700' 
                : 'bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-700'
            }`}
          >
            <motion.div
              animate={isOnline ? { rotate: 360 } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
            </motion.div>
            <span className={`font-semibold ${
              isOnline ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
            }`}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </motion.div>

          {/* Current Time */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl px-5 py-3 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" />
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{currentTime.toLocaleTimeString()}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Scanning Area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 mb-6 relative z-10">
        {/* Scan Status Display */}
        <AnimatePresence mode="wait">
          {lastScanResult ? (
            <motion.div
              key="result"
              initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateY: 90 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-full max-w-4xl"
            >
              <Card className={`shadow-2xl border-4 transition-all duration-500 ${
                lastScanResult.success 
                  ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950' 
                  : 'border-red-500 bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-950 dark:to-orange-950'
              }`}>
                <CardContent className="p-16 text-center">
                  <div className="flex flex-col items-center gap-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      {lastScanResult.success ? (
                        <div className="relative">
                          <CheckCircle className="h-40 w-40 text-green-600 dark:text-green-400" />
                          <motion.div
                            className="absolute inset-0"
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 2, opacity: 0 }}
                            transition={{ duration: 1, repeat: 3 }}
                          >
                            <CheckCircle className="h-40 w-40 text-green-400" />
                          </motion.div>
                        </div>
                      ) : (
                        <div className="relative">
                          <XCircle className="h-40 w-40 text-red-600 dark:text-red-400" />
                          <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 0.5, repeat: 3 }}
                          >
                            <AlertTriangle className="h-12 w-12 text-red-500 absolute -top-2 -right-2" />
                          </motion.div>
                        </div>
                      )}
                    </motion.div>
                    
                    <div className="space-y-4">
                      {lastScanResult.teacher && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="flex items-center justify-center gap-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl px-8 py-4 backdrop-blur-sm"
                        >
                          <User className="h-10 w-10 text-gray-700 dark:text-gray-300" />
                          <h2 className="text-5xl font-bold text-gray-900 dark:text-white">
                            {lastScanResult.teacher}
                          </h2>
                        </motion.div>
                      )}
                      
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className={`text-4xl font-bold ${
                          lastScanResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                        }`}
                      >
                        {lastScanResult.message}
                      </motion.p>
                      
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2"
                      >
                        <Clock className="h-5 w-5" />
                        {lastScanResult.timestamp.toLocaleTimeString()}
                      </motion.p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl"
            >
              <Card className="shadow-2xl border-4 border-dashed border-primary bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-950">
                <CardContent className="p-16 text-center">
                  <div className="flex flex-col items-center gap-8">
                    <motion.div
                      animate={
                        isScanning 
                          ? { scale: [1, 1.2, 1], rotate: [0, 360] } 
                          : { y: [0, -20, 0] }
                      }
                      transition={{ 
                        duration: isScanning ? 1 : 2, 
                        repeat: Infinity,
                        ease: "easeInOut" 
                      }}
                    >
                      <div className="relative">
                        <Radio className={`h-40 w-40 text-primary ${isScanning ? 'animate-pulse' : ''}`} />
                        {!isScanning && (
                          <motion.div
                            className="absolute inset-0"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Radio className="h-40 w-40 text-primary" />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                    <div className="space-y-3">
                      <h2 className="text-5xl font-bold text-gray-900 dark:text-white">
                        {isScanning ? 'Scanning...' : 'Ready to Scan'}
                      </h2>
                      <p className="text-2xl text-gray-600 dark:text-gray-400">
                        {isScanning ? 'Processing RFID card...' : 'Please tap your RFID card'}
                      </p>
                      {!isScanning && (
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="flex items-center justify-center gap-2 text-primary mt-4"
                        >
                          <Sparkles className="h-6 w-6" />
                          <span className="text-lg">Waiting for card...</span>
                          <Sparkles className="h-6 w-6" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden Input for RFID Scanner */}
        <input
          ref={inputRef}
          type="text"
          value={rfidInput}
          onChange={(e) => setRfidInput(e.target.value.toUpperCase())}
          onKeyPress={handleKeyPress}
          className="absolute opacity-0 pointer-events-none"
          autoFocus
          disabled={!isOnline || isScanning}
        />

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950 rounded-2xl p-6 shadow-xl max-w-3xl border-2 border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 rounded-full p-3">
              <Radio className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-xl mb-3 text-gray-900 dark:text-white">How to Use</h3>
              <ul className="text-base text-gray-600 dark:text-gray-400 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Place your RFID card on the reader
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Wait for the confirmation message
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Grace period: {GRACE_PERIOD_MINUTES} minutes before/after scheduled time
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> You must scan at the correct classroom terminal
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Info Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-6 relative z-10"
      >
        {/* Today's Schedule */}
        <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Today's Schedule</h3>
            </div>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {todaySchedules.length > 0 ? (
                todaySchedules.map((schedule, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-900 rounded-lg p-3 text-sm shadow-md border border-blue-100 dark:border-blue-900"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white">{schedule.teacherName}</span>
                      <Badge variant="outline" className="text-xs">{schedule.start_time} - {schedule.end_time}</Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{schedule.subject}</p>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No classes scheduled for today</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Now */}
        <Card className="border-2 border-green-200 dark:border-green-800 shadow-xl bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-950">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 dark:bg-green-900 rounded-full p-2">
                <User className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Active Now</h3>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                <Badge variant="default" className="ml-auto text-sm">{activeNow.length}</Badge>
              </motion.div>
            </div>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {activeNow.length > 0 ? (
                activeNow.map((record, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-900 rounded-lg p-3 text-sm shadow-md border-l-4 border-green-500"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        {record.teacherName}
                      </span>
                      <Badge variant="default" className="text-xs bg-green-600">
                        {record.duration} min
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      In: {new Date(record.tap_in_time).toLocaleTimeString()}
                    </p>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No active sessions</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
