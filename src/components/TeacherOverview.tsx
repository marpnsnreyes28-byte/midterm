'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useAuth, AttendanceRecord } from './AuthProvider';
import { 
  Clock, 
  CheckCircle, 
  Calendar,
  TrendingUp,
  Award,
  Activity,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Chart colors using Notre Dame theme colors
const COLORS = ['#22c55e', '#fbbf24', '#3b82f6', '#ef4444', '#8b5cf6'];

export function TeacherOverview() {
  const { 
    user, 
    classrooms, 
    attendanceRecords, 
    notifications 
  } = useAuth();

  // Get teacher's attendance records
  const teacherAttendance = attendanceRecords.filter(
    record => record.teacherId === user?.id
  ).sort((a, b) => new Date(b.tapInTime).getTime() - new Date(a.tapInTime).getTime());

  // Get today's active session
  const today = new Date().toISOString().split('T')[0];
  const todayActiveSession = teacherAttendance.find(
    record => record.date === today && !record.tapOutTime
  );

  // Get teacher's notifications
  const teacherNotifications = notifications.filter(
    notification => notification.recipientIds.includes(user?.id || '')
  );

  const unreadNotifications = teacherNotifications.filter(
    notification => !notification.readBy.includes(user?.id || '')
  );

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSessions = teacherAttendance.length;
    const completedSessions = teacherAttendance.filter(record => record.tapOutTime).length;
    const activeSessions = totalSessions - completedSessions;
    
    // Calculate total teaching hours
    const totalMinutes = teacherAttendance.reduce((total, record) => {
      if (record.tapOutTime) {
        const start = new Date(record.tapInTime);
        const end = new Date(record.tapOutTime);
        return total + Math.round((end.getTime() - start.getTime()) / (1000 * 60));
      }
      return total;
    }, 0);
    
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
    const avgSessionMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    // Get this week's data
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const thisWeekSessions = teacherAttendance.filter(record => 
      new Date(record.date) >= thisWeekStart
    ).length;

    // Get this month's data
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);
    
    const thisMonthSessions = teacherAttendance.filter(record => 
      new Date(record.date) >= thisMonthStart
    ).length;

    return {
      totalSessions,
      completedSessions,
      activeSessions,
      totalHours,
      avgSessionMinutes,
      thisWeekSessions,
      thisMonthSessions,
      completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0
    };
  }, [teacherAttendance]);

  // Chart data for weekly attendance
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
    
    return days.map((day, index) => {
      const date = new Date(thisWeek);
      date.setDate(date.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];
      
      const sessionsCount = teacherAttendance.filter(record => 
        record.date === dateStr
      ).length;
      
      return {
        day,
        sessions: sessionsCount,
        date: dateStr
      };
    });
  }, [teacherAttendance]);

  // Classroom usage data
  const classroomData = useMemo(() => {
    const classroomUsage = teacherAttendance.reduce((acc, record) => {
      const classroom = classrooms.find(c => c.id === record.classroomId);
      const name = classroom?.name || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(classroomUsage).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / stats.totalSessions) * 100)
    }));
  }, [teacherAttendance, classrooms, stats.totalSessions]);

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    
    if (duration < 60) {
      return `${duration}m`;
    } else {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Welcome back, {user?.name}!</h2>
        <p className="text-muted-foreground">
          {user?.department} • RFID: {user?.rfidId}
        </p>
      </div>

      {/* Current Session Status */}
      {todayActiveSession && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="w-5 h-5" />
              Active Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Classroom</p>
                <p className="font-medium">
                  {classrooms.find(c => c.id === todayActiveSession.classroomId)?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tapped In</p>
                <p className="font-medium">
                  {new Date(todayActiveSession.tapInTime).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">
                  {formatDuration(todayActiveSession.tapInTime)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.thisWeekSessions} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teaching Hours</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalHours}h</div>
            <p className="text-xs text-muted-foreground">
              Avg {Math.round(stats.avgSessionMinutes / 60 * 10) / 10}h per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.completionRate}%</div>
            <Progress value={stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{unreadNotifications.length}</div>
            <p className="text-xs text-muted-foreground">
              {teacherNotifications.length} total messages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Attendance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Weekly Attendance
            </CardTitle>
            <CardDescription>Your attendance pattern for this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label, payload) => {
                    const data = payload?.[0]?.payload;
                    return `${label} (${data?.date})`;
                  }}
                  formatter={(value: any) => [value, 'Sessions']}
                />
                <Bar dataKey="sessions" fill="var(--color-primary)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Classroom Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Classroom Usage
            </CardTitle>
            <CardDescription>Distribution of your classroom sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {classroomData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={classroomData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {classroomData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [value, 'Sessions']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {classroomData.map((room, index) => (
                    <div key={room.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{room.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{room.value}</span>
                        <Badge variant="outline" className="text-xs">
                          {room.percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No classroom usage data yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          {teacherAttendance.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No attendance records found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teacherAttendance.slice(0, 5).map((record) => {
                const classroom = classrooms.find(c => c.id === record.classroomId);
                return (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{classroom?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(record.date).toLocaleDateString()} • 
                        {new Date(record.tapInTime).toLocaleTimeString()}
                        {record.tapOutTime && ` - ${new Date(record.tapOutTime).toLocaleTimeString()}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={record.tapOutTime ? 'outline' : 'default'}>
                        {record.tapOutTime ? 'Completed' : 'Active'}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {record.tapOutTime 
                          ? formatDuration(record.tapInTime, record.tapOutTime)
                          : formatDuration(record.tapInTime)
                        }
                      </p>
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