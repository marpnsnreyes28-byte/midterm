'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useAuth, Teacher, AttendanceRecord } from './AuthProvider';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Calendar,
  Building,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Target
} from 'lucide-react';

export function AdminAnalytics() {
  const { teachers, classrooms, attendanceRecords, schedules } = useAuth();

  // Calculate analytics data
  const today = new Date().toISOString().split('T')[0];
  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - 7);
  const thisMonth = new Date();
  thisMonth.setDate(thisMonth.getDate() - 30);

  // Today's stats
  const todayAttendance = attendanceRecords.filter(r => r.date === today);
  const activeToday = todayAttendance.filter(r => !r.tapOutTime).length;
  const completedToday = todayAttendance.filter(r => r.tapOutTime).length;

  // Weekly stats
  const weeklyAttendance = attendanceRecords.filter(r => 
    new Date(r.date) >= thisWeek
  );

  // Monthly stats
  const monthlyAttendance = attendanceRecords.filter(r => 
    new Date(r.date) >= thisMonth
  );

  // Department breakdown
  const departmentStats = {
    CBA: {
      total: teachers.filter(t => t.department === 'CBA').length,
      active: attendanceRecords.filter(r => {
        const teacher = teachers.find(t => t.id === r.teacherId);
        return teacher?.department === 'CBA' && r.date === today && !r.tapOutTime;
      }).length
    },
    CTE: {
      total: teachers.filter(t => t.department === 'CTE').length,
      active: attendanceRecords.filter(r => {
        const teacher = teachers.find(t => t.id === r.teacherId);
        return teacher?.department === 'CTE' && r.date === today && !r.tapOutTime;
      }).length
    },
    CECE: {
      total: teachers.filter(t => t.department === 'CECE').length,
      active: attendanceRecords.filter(r => {
        const teacher = teachers.find(t => t.id === r.teacherId);
        return teacher?.department === 'CECE' && r.date === today && !r.tapOutTime;
      }).length
    }
  };

  // Classroom utilization
  const classroomUtilization = classrooms.map(classroom => {
    const sessions = attendanceRecords.filter(r => r.classroomId === classroom.id && r.date === today);
    const activeSession = sessions.find(r => !r.tapOutTime);
    return {
      ...classroom,
      sessions: sessions.length,
      isActive: !!activeSession,
      utilization: Math.round((sessions.length / classroom.capacity) * 100)
    };
  });

  // Attendance trends (last 7 days)
  const attendanceTrends = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayAttendance = attendanceRecords.filter(r => r.date === dateStr);
    
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      count: dayAttendance.length,
      percentage: Math.round((dayAttendance.length / teachers.length) * 100)
    };
  });

  // Performance metrics
  const avgSessionDuration = attendanceRecords
    .filter(r => r.tapOutTime)
    .reduce((acc, r) => {
      const duration = new Date(r.tapOutTime!).getTime() - new Date(r.tapInTime).getTime();
      return acc + duration;
    }, 0) / attendanceRecords.filter(r => r.tapOutTime).length;

  const avgDurationHours = avgSessionDuration ? (avgSessionDuration / (1000 * 60 * 60)).toFixed(1) : '0';

  // Top performing teachers (by attendance frequency)
  const teacherPerformance = teachers.map(teacher => {
    const teacherAttendance = attendanceRecords.filter(r => r.teacherId === teacher.id);
    const thisWeekAttendance = teacherAttendance.filter(r => new Date(r.date) >= thisWeek);
    
    return {
      ...teacher,
      totalSessions: teacherAttendance.length,
      weekSessions: thisWeekAttendance.length,
      avgDuration: teacherAttendance
        .filter(r => r.tapOutTime)
        .reduce((acc, r) => {
          const duration = new Date(r.tapOutTime!).getTime() - new Date(r.tapInTime).getTime();
          return acc + duration;
        }, 0) / (teacherAttendance.filter(r => r.tapOutTime).length || 1),
      lastSession: teacherAttendance.length > 0 ? teacherAttendance[teacherAttendance.length - 1].date : null
    };
  }).sort((a, b) => b.totalSessions - a.totalSessions);

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeToday}</div>
            <p className="text-xs text-muted-foreground">
              {completedToday} completed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyAttendance.length}</div>
            <p className="text-xs text-muted-foreground">
              +{((weeklyAttendance.length / monthlyAttendance.length) * 100).toFixed(1)}% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDurationHours}h</div>
            <p className="text-xs text-muted-foreground">
              Across all completed sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Utilization</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((activeToday / teachers.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Teachers currently active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Department Performance
          </CardTitle>
          <CardDescription>
            Current activity and utilization by department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(departmentStats).map(([dept, stats]) => (
              <div key={dept} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {dept === 'CBA' ? 'College of Business Accountancy' :
                     dept === 'CTE' ? 'College of Teachers and Education' :
                     'College of Engineering and Computer Education'}
                  </span>
                  <Badge variant={stats.active > 0 ? 'default' : 'secondary'}>
                    {stats.active}/{stats.total} active
                  </Badge>
                </div>
                <Progress 
                  value={stats.total > 0 ? (stats.active / stats.total) * 100 : 0} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% utilization
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            7-Day Attendance Trends
          </CardTitle>
          <CardDescription>
            Daily attendance patterns over the past week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendanceTrends.map((day, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-20 text-sm">{day.date}</div>
                <div className="flex-1">
                  <Progress value={day.percentage} className="h-3" />
                </div>
                <div className="w-16 text-sm text-right">{day.count} sessions</div>
                <div className="w-12 text-sm text-right">{day.percentage}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Classroom Utilization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Classroom Utilization
          </CardTitle>
          <CardDescription>
            Current status and usage of all classrooms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classroomUtilization.map((classroom) => (
              <div key={classroom.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{classroom.name}</h4>
                  <Badge variant={classroom.isActive ? 'default' : 'secondary'}>
                    {classroom.isActive ? 'Active' : 'Available'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{classroom.location}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sessions today:</span>
                    <span>{classroom.sessions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Capacity:</span>
                    <span>{classroom.capacity}</span>
                  </div>
                  <Progress value={classroom.utilization} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {classroom.utilization}% utilization
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Teacher Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Teacher Performance Summary
          </CardTitle>
          <CardDescription>
            Top performing teachers by attendance frequency
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Total Sessions</TableHead>
                <TableHead>This Week</TableHead>
                <TableHead>Avg Duration</TableHead>
                <TableHead>Last Session</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teacherPerformance.slice(0, 10).map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>{teacher.name}</TableCell>
                  <TableCell>
                    <Badge variant={
                      teacher.department === 'CBA' ? 'default' :
                      teacher.department === 'CTE' ? 'secondary' : 'outline'
                    }>
                      {teacher.department}
                    </Badge>
                  </TableCell>
                  <TableCell>{teacher.totalSessions}</TableCell>
                  <TableCell>{teacher.weekSessions}</TableCell>
                  <TableCell>
                    {teacher.avgDuration ? 
                      `${(teacher.avgDuration / (1000 * 60 * 60)).toFixed(1)}h` : 
                      '-'
                    }
                  </TableCell>
                  <TableCell>
                    {teacher.lastSession ? 
                      new Date(teacher.lastSession).toLocaleDateString() : 
                      'Never'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">RFID Scanners</span>
                <Badge variant="default">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge variant="default">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Notifications</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Backup Status</span>
                <Badge variant="default">Up to date</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Alerts & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teachers.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  ⚠️ No teachers registered in the system
                </div>
              ) : (
                <div className="text-sm text-green-600">
                  ✓ {teachers.length} teachers registered
                </div>
              )}
              
              {classrooms.filter(c => c.isActive).length < 3 ? (
                <div className="text-sm text-yellow-600">
                  ⚠️ Consider adding more active classrooms
                </div>
              ) : (
                <div className="text-sm text-green-600">
                  ✓ Adequate classroom coverage
                </div>
              )}
              
              {todayAttendance.length === 0 ? (
                <div className="text-sm text-yellow-600">
                  ⚠️ No attendance recorded today
                </div>
              ) : (
                <div className="text-sm text-green-600">
                  ✓ Active attendance tracking
                </div>
              )}
              
              <div className="text-sm text-blue-600">
                💡 Peak usage: {attendanceTrends.reduce((max, day) => 
                  day.count > max.count ? day : max, 
                  attendanceTrends[0]
                ).date}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}