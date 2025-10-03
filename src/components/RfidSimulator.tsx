'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useAuth } from './AuthProvider';
import { Radio, CheckCircle, XCircle, Clock, Users, Wifi, WifiOff, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

export function RfidSimulator() {
  const { teachers, classrooms, tapIn, tapOut, attendanceRecords } = useAuth();
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [rfidInput, setRfidInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [scanAnimation, setScanAnimation] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Simulate network connectivity
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly go offline for realism (very rare)
      if (Math.random() < 0.002) {
        setIsOnline(false);
        toast.error('RFID Terminal offline - Connection lost');
        setTimeout(() => {
          setIsOnline(true);
          toast.success('RFID Terminal back online');
        }, 3000 + Math.random() * 2000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Simulate scanning animation
  const triggerScanAnimation = () => {
    setScanAnimation(true);
    setTimeout(() => setScanAnimation(false), 2000);
  };

  // Simulate RFID scan beep sound
  const playBeep = (success: boolean = true) => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = success ? 800 : 400;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const handleTapIn = async () => {
    if (!isOnline) {
      toast.error('RFID Terminal offline - Cannot process scan');
      playBeep(false);
      return;
    }

    if (!rfidInput || !selectedClassroom) {
      toast.error('Please select a classroom and enter RFID ID');
      playBeep(false);
      return;
    }

    setIsScanning(true);
    triggerScanAnimation();
    setLastScanTime(new Date());

    // Simulate realistic scanning delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

    try {
      const success = await tapIn(rfidInput, selectedClassroom);
      if (success) {
        const teacher = teachers.find(t => t.rfid_id === rfidInput);
        toast.success(`✓ ${teacher?.name} tapped in successfully`);
        playBeep(true);
        setRfidInput('');
        
        // Auto-focus back to input
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      } else {
        toast.error('❌ Tap in failed - Invalid RFID or already tapped in');
        playBeep(false);
      }
    } catch (error) {
      toast.error('❌ Error processing tap in');
      playBeep(false);
    } finally {
      setIsScanning(false);
    }
  };

  const handleTapOut = async () => {
    if (!isOnline) {
      toast.error('RFID Terminal offline - Cannot process scan');
      playBeep(false);
      return;
    }

    if (!rfidInput) {
      toast.error('Please enter RFID ID');
      playBeep(false);
      return;
    }

    setIsScanning(true);
    triggerScanAnimation();
    setLastScanTime(new Date());

    // Simulate realistic scanning delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

    try {
      const success = await tapOut(rfidInput);
      if (success) {
        const teacher = teachers.find(t => t.rfid_id === rfidInput);
        toast.success(`✓ ${teacher?.name} tapped out successfully`);
        playBeep(true);
        setRfidInput('');
        
        // Auto-focus back to input
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      } else {
        toast.error('❌ Tap out failed - No active session found');
        playBeep(false);
      }
    } catch (error) {
      toast.error('❌ Error processing tap out');
      playBeep(false);
    } finally {
      setIsScanning(false);
    }
  };

  const quickSelectRfid = (rfidId: string) => {
    setRfidInput(rfidId);
    // Auto-focus input after selection
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Handle Enter key for quick actions
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        handleTapOut();
      } else if (selectedClassroom) {
        handleTapIn();
      }
    }
  };

  const todayAttendance = attendanceRecords.filter(
    r => r.date === new Date().toISOString().split('T')[0]
  );

  const activeTeachers = todayAttendance.filter(r => !(r.tapOutTime ?? r.tap_out_time));

  return (
    <div className="space-y-6">
      <Card className={`transition-all duration-300 ${scanAnimation ? 'ring-2 ring-primary/50 shadow-lg' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className={`h-5 w-5 transition-colors duration-300 ${
                isScanning ? 'text-green-500 animate-pulse' : 
                isOnline ? 'text-primary' : 'text-red-500'
              }`} />
              RFID Terminal Simulator
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="h-8 w-8 p-0"
              >
                <Volume2 className={`h-4 w-4 ${soundEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
              </Button>
              <div className="flex items-center gap-1">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-xs font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>
          </CardTitle>
          <CardDescription>
            Simulate RFID card scanning for testing attendance tracking
            {lastScanTime && (
              <span className="block text-xs mt-1">
                Last scan: {lastScanTime.toLocaleTimeString()}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Classroom Selection */}
          <div>
            <Label htmlFor="classroom-select">Select Classroom</Label>
            <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
              <SelectTrigger id="classroom-select">
                <SelectValue placeholder="Choose classroom for tap in" />
              </SelectTrigger>
              <SelectContent>
                {classrooms.filter(c => c.isActive).map((classroom) => (
                  <SelectItem key={classroom.id} value={classroom.id}>
                    {classroom.name} - {classroom.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* RFID Input */}
          <div>
            <Label htmlFor="rfid-input" className="flex items-center justify-between">
              <span>RFID Scanner</span>
              <span className="text-xs text-muted-foreground">
                Enter ↵ = Tap In | Shift+Enter ↵ = Tap Out
              </span>
            </Label>
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    ref={inputRef}
                    id="rfid-input"
                    value={rfidInput}
                    onChange={(e) => setRfidInput(e.target.value.toUpperCase())}
                    onKeyPress={handleKeyPress}
                    placeholder="Scan RFID card or enter manually..."
                    className={`font-mono pr-10 transition-all duration-300 ${
                      isScanning ? 'border-green-500 shadow-md' : ''
                    } ${!isOnline ? 'bg-red-50 border-red-300' : ''}`}
                    disabled={isScanning || !isOnline}
                  />
                  {isScanning && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <Button 
                  onClick={handleTapIn} 
                  disabled={!rfidInput || !selectedClassroom || isScanning || !isOnline}
                  className="min-w-[80px]"
                >
                  {isScanning ? <Clock className="h-4 w-4 animate-spin" /> : 'Tap In'}
                </Button>
                <Button 
                  onClick={handleTapOut} 
                  disabled={!rfidInput || isScanning || !isOnline} 
                  variant="outline"
                  className="min-w-[80px]"
                >
                  {isScanning ? <Clock className="h-4 w-4 animate-spin" /> : 'Tap Out'}
                </Button>
              </div>
              
              {/* Scanning indicator overlay */}
              {isScanning && (
                <div className="absolute inset-0 bg-green-500/10 rounded-md flex items-center justify-center pointer-events-none">
                  <div className="text-green-600 text-sm font-medium animate-pulse">
                    🏷️ Scanning RFID...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Select Teachers */}
          <div>
            <Label className="flex items-center justify-between">
              <span>Quick Select Teacher RFID</span>
              <span className="text-xs text-muted-foreground">
                {teachers.filter(t => (t.isActive ?? t.is_active)).length} active teachers
              </span>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2 max-h-40 overflow-y-auto">
              {teachers.filter(t => (t.isActive ?? t.is_active)).map((teacher) => {
                const isActive = activeTeachers.some(a => (a.teacherId ?? a.teacher_id) === teacher.id);
                return (
                  <Button
                    key={teacher.id}
                    variant="outline"
                    size="sm"
                    onClick={() => quickSelectRfid((teacher as any).rfid_id)}
                    className={`justify-start transition-all duration-200 hover:scale-105 ${
                      isActive ? 'border-green-500 bg-green-50' : ''
                    }`}
                    disabled={isScanning || !isOnline}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className={`w-2 h-2 rounded-full transition-colors ${
                        isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                      }`} />
                      <span className="truncate">{teacher.name}</span>
                      <Badge 
                        variant={isActive ? "default" : "secondary"} 
                        className="ml-auto text-xs"
                      >
                        {teacher.department}
                      </Badge>
                    </div>
                  </Button>
                );
              })}
            </div>
            
            {/* Quick actions legend */}
            <div className="mt-3 p-2 bg-muted/50 rounded-md text-xs text-muted-foreground">
              💡 <strong>Quick Tips:</strong> Click teacher name to auto-fill RFID • Green dot = currently active • Use keyboard shortcuts for faster scanning
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Live Status - Today
          </CardTitle>
          <CardDescription>
            Real-time attendance tracking for {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Active Teachers */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-green-600">Active Now ({activeTeachers.length})</h4>
              {activeTeachers.length > 0 ? (
                activeTeachers.map((record) => {
                  const teacher = teachers.find(t => t.id === (record.teacherId ?? record.teacher_id));
                  const classroom = classrooms.find(c => c.id === (record.classroomId ?? record.classroom_id));
                  const duration = Math.round((Date.now() - new Date((record.tapInTime ?? record.tap_in_time) as any).getTime()) / (1000 * 60));
                  
                  return (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium text-green-900">{teacher?.name}</p>
                        <p className="text-sm text-green-600">
                          {classroom?.name} • {duration} min ago
                        </p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">No active sessions</p>
              )}
            </div>

            {/* Completed Sessions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-blue-600">
                Completed Today ({todayAttendance.filter(r => (r.tapOutTime ?? r.tap_out_time)).length})
              </h4>
              {todayAttendance.filter(r => (r.tapOutTime ?? r.tap_out_time)).slice(0, 5).map((record) => {
                const teacher = teachers.find(t => t.id === (record.teacherId ?? record.teacher_id));
                const classroom = classrooms.find(c => c.id === (record.classroomId ?? record.classroom_id));
                const duration = Math.round(
                  (new Date((record.tapOutTime ?? record.tap_out_time) as any).getTime() - new Date((record.tapInTime ?? record.tap_in_time) as any).getTime()) / (1000 * 60)
                );
                
                return (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="font-medium text-blue-900">{teacher?.name}</p>
                      <p className="text-sm text-blue-600">
                        {classroom?.name} • {duration} min
                      </p>
                    </div>
                    <XCircle className="h-5 w-5 text-blue-600" />
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}