'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useAuth } from './AuthProvider';
import { 
  User, 
  Mail, 
  Building, 
  Radio,
  Calendar,
  Clock,
  Shield,
  UserCheck,
  Settings
} from 'lucide-react';

export function TeacherProfile() {
  const { user, schedules, classrooms, attendanceRecords } = useAuth();

  if (!user) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Unable to load profile information.</p>
      </div>
    );
  }

  // Get teacher's schedules
  const teacherSchedules = schedules.filter(schedule => schedule.teacherId === user.id);
  
  // Get teacher's attendance stats
  const teacherAttendance = attendanceRecords.filter(record => record.teacherId === user.id);
  const totalSessions = teacherAttendance.length;
  const completedSessions = teacherAttendance.filter(record => record.tapOutTime).length;
  
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

  // Get unique classrooms used
  const uniqueClassrooms = [...new Set(teacherAttendance.map(record => record.classroomId))];
  const classroomNames = uniqueClassrooms.map(id => 
    classrooms.find(c => c.id === id)?.name
  ).filter(Boolean);

  const departmentColors = {
    CBA: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    CTE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    CECE: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
  };

  const departmentNames = {
    CBA: 'College of Business Administration',
    CTE: 'College of Teacher Education',
    CECE: 'College of Engineering and Computer Education'
  };

  const formatScheduleTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const sortedSchedules = teacherSchedules.sort((a, b) => 
    dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
  );

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-muted-foreground font-normal">Faculty Member</p>
                </div>
              </CardTitle>
            </div>
            <Badge 
              variant="outline" 
              className={`${user.isActive ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}`}
            >
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Personal Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email Address</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <div className="flex items-center gap-2">
                      <Badge className={departmentColors[user.department!]}>
                        {user.department}
                      </Badge>
                      <span className="text-sm">{departmentNames[user.department!]}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Radio className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">RFID ID</p>
                    <p className="font-mono font-medium">{user.rfidId}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <Badge variant="secondary">{user.role}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Statistics */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Activity Statistics
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{totalSessions}</div>
                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{totalHours}h</div>
                    <p className="text-sm text-muted-foreground">Teaching Hours</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{completedSessions}</div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{classroomNames.length}</div>
                    <p className="text-sm text-muted-foreground">Classrooms Used</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Class Schedule
          </CardTitle>
          <CardDescription>Your weekly teaching schedule</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedSchedules.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No class schedule assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedSchedules.map((schedule) => {
                const classroom = classrooms.find(c => c.id === schedule.classroomId);
                return (
                  <div key={schedule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{schedule.day}</Badge>
                          <h4 className="font-semibold">{schedule.subject}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {classroom?.name} - {classroom?.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatScheduleTime(schedule.startTime)} - {formatScheduleTime(schedule.endTime)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {classroom?.capacity} capacity
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Classroom Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Classroom Access
          </CardTitle>
          <CardDescription>Classrooms you have access to</CardDescription>
        </CardHeader>
        <CardContent>
          {classroomNames.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No classroom access history yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uniqueClassrooms.map((classroomId) => {
                const classroom = classrooms.find(c => c.id === classroomId);
                const usageCount = teacherAttendance.filter(record => record.classroomId === classroomId).length;
                
                if (!classroom) return null;
                
                return (
                  <Card key={classroomId}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{classroom.name}</h4>
                          <Badge variant="secondary">{usageCount} sessions</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{classroom.location}</p>
                        <p className="text-sm text-muted-foreground">Capacity: {classroom.capacity}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Account Information
          </CardTitle>
          <CardDescription>Account security and access information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Password</h4>
                <p className="text-sm text-muted-foreground">
                  Contact administration to change your password
                </p>
              </div>
              <Button variant="outline" disabled>
                Request Change
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">RFID Card</h4>
                <p className="text-sm text-muted-foreground">
                  Contact administration for RFID card issues
                </p>
              </div>
              <Button variant="outline" disabled>
                Report Issue
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Profile Updates</h4>
                <p className="text-sm text-muted-foreground">
                  Profile information is managed by administration
                </p>
              </div>
              <Button variant="outline" disabled>
                Request Update
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}