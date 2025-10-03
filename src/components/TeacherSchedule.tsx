'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from './AuthProvider';
import { 
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Users
} from 'lucide-react';

export function TeacherSchedule() {
  const { user, schedules, classrooms } = useAuth();

  // Get teacher's schedules
  const teacherSchedules = schedules.filter(schedule => schedule.teacherId === user?.id);

  // Group schedules by day
  const scheduleByDay = useMemo(() => {
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const grouped = teacherSchedules.reduce((acc, schedule) => {
      if (!acc[schedule.day]) {
        acc[schedule.day] = [];
      }
      acc[schedule.day].push(schedule);
      return acc;
    }, {} as Record<string, typeof teacherSchedules>);

    // Sort schedules within each day by start time
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    // Return ordered by day of week
    const orderedSchedule: Record<string, typeof teacherSchedules> = {};
    dayOrder.forEach(day => {
      if (grouped[day]) {
        orderedSchedule[day] = grouped[day];
      }
    });

    return orderedSchedule;
  }, [teacherSchedules]);

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const totalClasses = teacherSchedules.length;
    const uniqueSubjects = [...new Set(teacherSchedules.map(s => s.subject))].length;
    const uniqueClassrooms = [...new Set(teacherSchedules.map(s => s.classroomId))].length;
    
    // Calculate total teaching hours per week
    const totalMinutes = teacherSchedules.reduce((total, schedule) => {
      const start = new Date(`2000-01-01T${schedule.startTime}`);
      const end = new Date(`2000-01-01T${schedule.endTime}`);
      return total + (end.getTime() - start.getTime()) / (1000 * 60);
    }, 0);
    
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

    return {
      totalClasses,
      uniqueSubjects,
      uniqueClassrooms,
      totalHours
    };
  }, [teacherSchedules]);

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const isCurrentDay = (day: string) => {
    return day === getCurrentDay();
  };

  const isCurrentTime = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const currentTime = new Date(`2000-01-01T${now.toTimeString().split(' ')[0]}`);
    
    return currentTime >= start && currentTime <= end;
  };

  return (
    <div className="space-y-6">
      {/* Weekly Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold text-primary">{weeklyStats.totalClasses}</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Subjects</p>
                <p className="text-2xl font-bold text-primary">{weeklyStats.uniqueSubjects}</p>
              </div>
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Classrooms</p>
                <p className="text-2xl font-bold text-primary">{weeklyStats.uniqueClassrooms}</p>
              </div>
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weekly Hours</p>
                <p className="text-2xl font-bold text-primary">{weeklyStats.totalHours}h</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Schedule
          </CardTitle>
          <CardDescription>
            Your teaching schedule for the week. Current day is highlighted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(scheduleByDay).length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Schedule Assigned</h3>
              <p>Your teaching schedule has not been set up yet.</p>
              <p className="text-sm mt-2">Contact administration for schedule assignment.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(scheduleByDay).map(([day, daySchedules]) => (
                <div key={day} className={`border rounded-lg p-4 ${
                  isCurrentDay(day) ? 'border-primary bg-primary/5' : ''
                }`}>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold">{day}</h3>
                    {isCurrentDay(day) && (
                      <Badge variant="default" className="text-xs">
                        TODAY
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {daySchedules.map((schedule) => {
                      const classroom = classrooms.find(c => c.id === schedule.classroomId);
                      const isActive = isCurrentDay(day) && isCurrentTime(schedule.startTime, schedule.endTime);
                      
                      return (
                        <div key={schedule.id} className={`border rounded-lg p-4 ${
                          isActive ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''
                        }`}>
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-lg">{schedule.subject}</h4>
                                {isActive && (
                                  <Badge variant="default" className="bg-green-600 text-white">
                                    ACTIVE NOW
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{classroom?.name}</span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  <span>{classroom?.capacity} capacity</span>
                                </div>
                              </div>
                              
                              <p className="text-sm text-muted-foreground">
                                {classroom?.location}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <Badge variant="outline">
                                {schedule.day}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Subject Summary
          </CardTitle>
          <CardDescription>
            Overview of subjects you're teaching
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teacherSchedules.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No subjects assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {[...new Set(teacherSchedules.map(s => s.subject))].map((subject) => {
                const subjectSchedules = teacherSchedules.filter(s => s.subject === subject);
                const totalHours = subjectSchedules.reduce((total, schedule) => {
                  const start = new Date(`2000-01-01T${schedule.startTime}`);
                  const end = new Date(`2000-01-01T${schedule.endTime}`);
                  return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                }, 0);
                
                const classroomsList = [...new Set(subjectSchedules.map(s => {
                  const classroom = classrooms.find(c => c.id === s.classroomId);
                  return classroom?.name;
                }))].filter(Boolean);

                const daysList = [...new Set(subjectSchedules.map(s => s.day))];

                return (
                  <div key={subject} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg">{subject}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{subjectSchedules.length} sessions/week</span>
                          <span>{Math.round(totalHours * 10) / 10} hours/week</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Days:</span>
                          {daysList.map((day) => (
                            <Badge key={day} variant="outline" className="text-xs">
                              {day.substring(0, 3)}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Rooms:</span>
                          {classroomsList.map((room) => (
                            <Badge key={room} variant="secondary" className="text-xs">
                              {room}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}