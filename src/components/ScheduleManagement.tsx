'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useAuth } from './AuthProvider';
import type { Schedule } from '../lib/database.types';
import { 
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Edit,
  Trash2,
  Users,
  MapPin,
  BookOpen,
  Filter,
  Download,
  Upload,
  Copy,
  Search,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
// Simple date utilities (replaces date-fns)
const formatDate = (date: Date, formatStr: string) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  if (formatStr === 'MMM dd, yyyy') {
    return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}, ${date.getFullYear()}`;
  }
  return date.toLocaleDateString();
};

const addDaysToDate = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getStartOfWeek = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Monday = 1
  return new Date(result.setDate(diff));
};

const getEndOfWeek = (date: Date) => {
  const startOfWeek = getStartOfWeek(date);
  return addDaysToDate(startOfWeek, 6);
};
import { toast } from 'sonner';

interface ScheduleManagementProps {}

export function ScheduleManagement({}: ScheduleManagementProps) {
  const { 
    teachers, 
    classrooms, 
    schedules, 
    addSchedule, 
    updateSchedule, 
    deleteSchedule 
  } = useAuth();

  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterTeacher, setFilterTeacher] = useState<string>('all');
  const [filterClassroom, setFilterClassroom] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [newSchedule, setNewSchedule] = useState({
    teacher_id: '',
    classroom_id: '',
    day: '',
    start_time: '',
    end_time: '',
    subject: '',
    description: '',
    isRecurring: true,
    semester: 'First Semester',
    academicYear: '2024-2025'
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 7; // Start from 7 AM
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const departments = ['CBA', 'CTE', 'CECE'];
  const semesters = ['First Semester', 'Second Semester', 'Summer'];
  const academicYears = ['2024-2025', '2025-2026', '2026-2027'];

  // Filter schedules based on current filters
  const filteredSchedules = schedules.filter(schedule => {
    const teacher = teachers.find(t => t.id === schedule.teacher_id);
    const classroom = classrooms.find(c => c.id === schedule.classroom_id);
    
    if (filterDepartment !== 'all' && teacher?.department !== filterDepartment) return false;
    if (filterTeacher !== 'all' && schedule.teacher_id !== filterTeacher) return false;
    if (filterClassroom !== 'all' && schedule.classroom_id !== filterClassroom) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        schedule.subject.toLowerCase().includes(query) ||
        teacher?.name.toLowerCase().includes(query) ||
        classroom?.name.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Get schedules for current week view
  const getWeekDates = () => {
    const start = getStartOfWeek(selectedDate);
    const dates: Date[] = [];
    for (let i = 0; i < 6; i++) { // Monday to Saturday
      dates.push(addDaysToDate(start, i));
    }
    return dates;
  };

  const getSchedulesForDay = (day: string) => {
    return filteredSchedules.filter(schedule => schedule.day === day);
  };

  const handleAddSchedule = () => {
    if (!newSchedule.teacher_id || !newSchedule.classroom_id || !newSchedule.day || 
        !newSchedule.start_time || !newSchedule.end_time || !newSchedule.subject) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check for conflicts
    const conflicts = schedules.filter(schedule => 
      schedule.day === newSchedule.day &&
      schedule.classroom_id === newSchedule.classroom_id &&
      ((newSchedule.start_time >= schedule.start_time && newSchedule.start_time < schedule.end_time) ||
       (newSchedule.end_time > schedule.start_time && newSchedule.end_time <= schedule.end_time) ||
       (newSchedule.start_time <= schedule.start_time && newSchedule.end_time >= schedule.end_time))
    );

    if (conflicts.length > 0) {
      toast.error('Schedule conflict detected! This classroom is already booked during that time.');
      return;
    }

    addSchedule({
      teacher_id: newSchedule.teacher_id,
      classroom_id: newSchedule.classroom_id,
      day: newSchedule.day as any,
      start_time: newSchedule.start_time,
      end_time: newSchedule.end_time,
      subject: newSchedule.subject,
      is_active: true
    } as any);

    setNewSchedule({
      teacher_id: '',
      classroom_id: '',
      day: '',
      start_time: '',
      end_time: '',
      subject: '',
      description: '',
      isRecurring: true,
      semester: 'First Semester',
      academicYear: '2024-2025'
    });
    setIsAddDialogOpen(false);
    toast.success('Schedule added successfully!');
  };

  const handleEditSchedule = () => {
    if (!editingSchedule) return;

    updateSchedule(editingSchedule.id, {
      ...editingSchedule,
      updatedAt: new Date().toISOString()
    });

    setEditingSchedule(null);
    setIsEditDialogOpen(false);
    toast.success('Schedule updated successfully!');
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    deleteSchedule(scheduleId);
    toast.success('Schedule deleted successfully!');
  };

  const handleDuplicateSchedule = (schedule: Schedule) => {
    const duplicatedSchedule = {
      ...schedule,
      subject: `${schedule.subject} (Copy)`,
      id: undefined // Will be generated
    } as Partial<Schedule & { id?: string }>;

    setNewSchedule({
      teacher_id: duplicatedSchedule.teacher_id || '',
      classroom_id: duplicatedSchedule.classroom_id || '',
      day: duplicatedSchedule.day || '',
      start_time: duplicatedSchedule.start_time || '',
      end_time: duplicatedSchedule.end_time || '',
      subject: duplicatedSchedule.subject || '',
      description: '',
      isRecurring: true,
      semester: 'First Semester',
      academicYear: '2024-2025'
    });
    setIsAddDialogOpen(true);
  };

  const exportSchedules = () => {
    const csvContent = [
      ['Teacher', 'Subject', 'Classroom', 'Day', 'Start Time', 'End Time', 'Department', 'Semester', 'Academic Year'],
      ...filteredSchedules.map(schedule => {
        const teacher = teachers.find(t => t.id === schedule.teacher_id);
        const classroom = classrooms.find(c => c.id === schedule.classroom_id);
        return [
          teacher?.name || 'Unknown',
          schedule.subject,
          classroom?.name || 'Unknown',
          schedule.day,
          (schedule as any).start_time || '',
          (schedule as any).end_time || '',
          teacher?.department || 'Unknown',
          (schedule as any).semester || 'N/A',
          (schedule as any).academicYear || 'N/A'
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedules-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Schedules exported successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Schedule Management</h1>
          <p className="text-muted-foreground">Manage class schedules and timetables</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportSchedules}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} modal={true} onOpenChange={(open: boolean) => setIsAddDialogOpen(open)}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent 
              forceMount
              className="max-w-2xl"
            >
              <DialogHeader>
                <DialogTitle>Add New Schedule</DialogTitle>
                <DialogDescription>
                  Create a new class schedule entry
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher">Teacher *</Label>
                    <Select value={newSchedule.teacher_id} onValueChange={(value: string) => setNewSchedule({...newSchedule, teacher_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map(teacher => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name} ({teacher.department})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="classroom">Classroom *</Label>
                    <Select value={newSchedule.classroom_id} onValueChange={(value: string) => setNewSchedule({...newSchedule, classroom_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select classroom" />
                    </SelectTrigger>
                    <SelectContent>
                      {classrooms.map(classroom => (
                        <SelectItem key={classroom.id} value={classroom.id}>
                          {classroom.name} - {classroom.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={newSchedule.subject}
                    onChange={(e) => setNewSchedule({...newSchedule, subject: e.target.value})}
                    placeholder="Enter subject name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="day">Day *</Label>
                  <Select value={newSchedule.day} onValueChange={(value: string) => setNewSchedule({...newSchedule, day: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Select value={newSchedule.start_time} onValueChange={(value: string) => setNewSchedule({...newSchedule, start_time: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Select value={newSchedule.end_time} onValueChange={(value: string) => setNewSchedule({...newSchedule, end_time: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select value={newSchedule.semester} onValueChange={(value: string) => setNewSchedule({...newSchedule, semester: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map(semester => (
                        <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Select value={newSchedule.academicYear} onValueChange={(value: string) => setNewSchedule({...newSchedule, academicYear: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newSchedule.description}
                    onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
                    placeholder="Optional description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddSchedule}>Add Schedule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search schedules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Teacher</Label>
              <Select value={filterTeacher} onValueChange={setFilterTeacher}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teachers</SelectItem>
                  {teachers.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Classroom</Label>
              <Select value={filterClassroom} onValueChange={setFilterClassroom}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classrooms</SelectItem>
                  {classrooms.map(classroom => (
                    <SelectItem key={classroom.id} value={classroom.id}>{classroom.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>View Mode</Label>
              <Select value={viewMode} onValueChange={(value: 'week' | 'month') => setViewMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week View</SelectItem>
                  <SelectItem value="month">Month View</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="conflicts">Conflict Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          {viewMode === 'week' ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Week of {formatDate(getStartOfWeek(selectedDate), 'MMM dd, yyyy')}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setSelectedDate(addDaysToDate(selectedDate, -7))}>
                      Previous Week
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
                      Today
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedDate(addDaysToDate(selectedDate, 7))}>
                      Next Week
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  <div className="p-2 font-medium">Time</div>
                  {days.map(day => (
                    <div key={day} className="p-2 font-medium text-center border-b">
                      {day}
                    </div>
                  ))}
                  
                  {timeSlots.map(time => (
                    <React.Fragment key={time}>
                      <div className="p-2 text-sm border-r text-muted-foreground">{time}</div>
                      {days.map(day => {
                        const daySchedules = getSchedulesForDay(day).filter(
                          schedule => (schedule as any).start_time === time
                        );
                        
                        return (
                          <div key={`${day}-${time}`} className="p-1 border border-border min-h-[60px]">
                            {daySchedules.map(schedule => {
        const teacher = teachers.find(t => t.id === schedule.teacher_id);
        const classroom = classrooms.find(c => c.id === schedule.classroom_id);
                              
                              return (
                                <div
                                  key={schedule.id}
                                  className="bg-primary/10 border border-primary/20 rounded p-1 mb-1 text-xs hover:bg-primary/20 cursor-pointer transition-colors"
                                  onClick={() => {
                                    setEditingSchedule(schedule);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <div className="font-medium truncate">{schedule.subject}</div>
                                  <div className="text-muted-foreground truncate">{teacher?.name}</div>
                                  <div className="text-muted-foreground truncate">{classroom?.name}</div>
                                <div className="text-muted-foreground">{(schedule as any).start_time}-{(schedule as any).end_time}</div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Month View - {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  Month view coming soon...
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Schedules ({filteredSchedules.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Classroom</TableHead>
                      <TableHead>Day & Time</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchedules.map(schedule => {
                        const teacher = teachers.find(t => t.id === schedule.teacher_id);
                        const classroom = classrooms.find(c => c.id === schedule.classroom_id);
                      
                      return (
                        <TableRow key={schedule.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{schedule.subject}</div>
                                { (schedule as any).description && (
                                <div className="text-sm text-muted-foreground">{(schedule as any).description}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div>{teacher?.name || 'Unknown'}</div>
                                <Badge variant="outline" className="text-xs">
                                  {teacher?.department}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div>{classroom?.name || 'Unknown'}</div>
                                <div className="text-sm text-muted-foreground">{classroom?.location}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div>{schedule.day}</div>
                                <div className="text-sm text-muted-foreground">
                                    {(schedule as any).start_time} - {(schedule as any).end_time}
                                  </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{teacher?.department}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{(schedule as any).semester || 'N/A'}</div>
                              <div className="text-muted-foreground">{(schedule as any).academicYear || 'N/A'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingSchedule(schedule);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDuplicateSchedule(schedule)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSchedule(schedule.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                {filteredSchedules.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No schedules found matching your criteria
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                Schedule Conflict Analysis
              </CardTitle>
              <CardDescription>
                Review potential scheduling conflicts and overlaps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Conflict analysis feature coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
  <Dialog open={isEditDialogOpen} modal={true} onOpenChange={(open: boolean) => setIsEditDialogOpen(open)}>
        <DialogContent 
          forceMount
          className="max-w-2xl"
        >
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>Update the schedule details</DialogDescription>
          </DialogHeader>
          {editingSchedule && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teacher</Label>
                <Select 
                  value={editingSchedule.teacher_id} 
                  onValueChange={(value: string) => setEditingSchedule({...editingSchedule, teacher_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(teacher => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Classroom</Label>
                <Select 
                  value={editingSchedule.classroom_id} 
                  onValueChange={(value: string) => setEditingSchedule({...editingSchedule, classroom_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {classrooms.map(classroom => (
                      <SelectItem key={classroom.id} value={classroom.id}>
                        {classroom.name} - {classroom.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={editingSchedule.subject}
                  onChange={(e) => setEditingSchedule({...editingSchedule, subject: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Day</Label>
                <Select 
                  value={editingSchedule.day} 
                  onValueChange={(value: string) => setEditingSchedule({...editingSchedule, day: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Select 
                  value={editingSchedule.start_time} 
                  onValueChange={(value: string) => setEditingSchedule({...editingSchedule, start_time: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>End Time</Label>
                <Select 
                  value={editingSchedule.end_time} 
                  onValueChange={(value: string) => setEditingSchedule({...editingSchedule, end_time: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Description</Label>
                <Input
                  value={editingSchedule.description || ''}
                  onChange={(e) => setEditingSchedule({...editingSchedule, description: e.target.value})}
                  placeholder="Optional description"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSchedule}>Update Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}