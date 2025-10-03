'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { useAuth } from './AuthProvider';
import { 
  Download,
  FileText,
  PieChart,
  BarChart3,
  Calendar as CalendarIcon,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Filter,
  RefreshCw,
  Mail,
  Printer,
  Share2
} from 'lucide-react';
// Simple date utilities (replaces date-fns)
const formatDate = (date: Date, formatStr: string) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  if (formatStr === 'MMM dd, yyyy') {
    return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}, ${date.getFullYear()}`;
  } else if (formatStr === 'MMM dd') {
    return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}`;
  } else if (formatStr === 'yyyy-MM-dd') {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }
  return date.toLocaleDateString();
};

const getStartOfWeek = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Monday = 1
  return new Date(result.setDate(diff));
};

const getEndOfWeek = (date: Date) => {
  const startOfWeek = getStartOfWeek(date);
  const result = new Date(startOfWeek);
  result.setDate(result.getDate() + 6);
  return result;
};

const getStartOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const getEndOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

const isWithinDateInterval = (date: Date, { start, end }: { start: Date; end: Date }) => {
  return date >= start && date <= end;
};

const getDifferenceInMinutes = (laterDate: Date, earlierDate: Date) => {
  return Math.floor((laterDate.getTime() - earlierDate.getTime()) / (1000 * 60));
};
import { toast } from 'sonner';

interface ReportData {
  totalTeachers: number;
  activeTeachers: number;
  totalAttendanceRecords: number;
  averageAttendanceRate: number;
  punctualityRate: number;
  departmentStats: Record<string, {
    totalTeachers: number;
    attendanceRate: number;
    punctualityRate: number;
  }>;
  dailyStats: Record<string, {
    present: number;
    absent: number;
    late: number;
  }>;
  teacherStats: Record<string, {
    name: string;
    department: string;
    attendanceRate: number;
    punctualityRate: number;
    totalHours: number;
  }>;
}

export function ReportsManagement() {
  const { 
    teachers, 
    classrooms, 
    schedules, 
    attendanceRecords 
  } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const departments = ['CBA', 'CTE', 'CECE'];
  const reportTypes = [
    { id: 'summary', label: 'Summary Report', icon: FileText },
    { id: 'attendance', label: 'Attendance Report', icon: Users },
    { id: 'punctuality', label: 'Punctuality Report', icon: Clock },
    { id: 'department', label: 'Department Report', icon: BarChart3 },
    { id: 'individual', label: 'Individual Report', icon: Target }
  ];

  // Calculate date range based on selection
  const getDateRange = () => {
    const now = selectedDate;
    switch (dateRange) {
      case 'week':
        return {
          start: getStartOfWeek(now),
          end: getEndOfWeek(now)
        };
      case 'month':
        return {
          start: getStartOfMonth(now),
          end: getEndOfMonth(now)
        };
      case 'custom':
        return {
          start: now,
          end: now
        };
      default:
        return {
          start: getStartOfWeek(now),
          end: getEndOfWeek(now)
        };
    }
  };

  // Generate comprehensive report data
  const reportData: ReportData = useMemo(() => {
    const { start, end } = getDateRange();
    
    // Filter attendance records by date range
    const filteredRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      return isWithinDateInterval(recordDate, { start, end });
    });

    // Filter by department if selected
    let filteredTeachers = teachers;
    if (selectedDepartment !== 'all') {
      filteredTeachers = teachers.filter(t => t.department === selectedDepartment);
    }
    if (selectedTeacher !== 'all') {
      filteredTeachers = teachers.filter(t => t.id === selectedTeacher);
    }

    // Calculate basic stats
    const totalTeachers = filteredTeachers.length;
    const activeTeachers = filteredTeachers.filter(t => t.is_active).length;
    const totalAttendanceRecords = filteredRecords.length;

    // Calculate attendance rates
    const teacherAttendanceMap = new Map();
    filteredRecords.forEach(record => {
      const teacherId = record.teacher_id;
      if (!teacherAttendanceMap.has(teacherId)) {
        teacherAttendanceMap.set(teacherId, []);
      }
      teacherAttendanceMap.get(teacherId).push(record);
    });

    // Calculate department statistics
    const departmentStats: Record<string, any> = {};
    departments.forEach(dept => {
      const deptTeachers = filteredTeachers.filter(t => t.department === dept);
      const deptRecords = filteredRecords.filter(record => {
        const teacher = teachers.find(t => t.id === record.teacher_id);
        return teacher?.department === dept;
      });

      const deptAttendanceRate = deptTeachers.length > 0 
        ? (deptRecords.length / (deptTeachers.length * 5)) * 100 // Assuming 5 working days
        : 0;

      // Calculate punctuality (assuming late if tapped in more than 15 minutes after start time)
      const lateRecords = deptRecords.filter(record => {
        const schedule = schedules.find(s => s.teacher_id === record.teacher_id && s.classroom_id === record.classroom_id);
        if (!schedule) return false;
        
        const scheduledTime = new Date(`2000-01-01T${schedule.start_time}:00`);
        const tapInTime = new Date(`2000-01-01T${record.tap_in_time}:00`);
        const minutesDiff = getDifferenceInMinutes(tapInTime, scheduledTime);
        
        return minutesDiff > 15; // Late if more than 15 minutes
      });

      const deptPunctualityRate = deptRecords.length > 0 
        ? ((deptRecords.length - lateRecords.length) / deptRecords.length) * 100
        : 0;

      departmentStats[dept] = {
        totalTeachers: deptTeachers.length,
        attendanceRate: Math.round(deptAttendanceRate),
        punctualityRate: Math.round(deptPunctualityRate)
      };
    });

    // Calculate daily statistics
    const dailyStats: Record<string, any> = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    days.forEach(day => {
      const dayRecords = filteredRecords.filter(record => {
        const recordDate = new Date(record.date);
        const dayName = recordDate.toLocaleDateString('en-US', { weekday: 'long' });
        return dayName === day;
      });

      const expectedAttendance = filteredTeachers.length;
      const present = dayRecords.length;
      const absent = expectedAttendance - present;
      
      const lateRecords = dayRecords.filter(record => {
        const schedule = schedules.find(s => s.teacher_id === record.teacher_id);
        if (!schedule) return false;
        
        const scheduledTime = new Date(`2000-01-01T${schedule.start_time}:00`);
        const tapInTime = new Date(`2000-01-01T${record.tap_in_time}:00`);
        const minutesDiff = getDifferenceInMinutes(tapInTime, scheduledTime);
        
        return minutesDiff > 15;
      });

      dailyStats[day] = {
        present,
        absent: Math.max(0, absent),
        late: lateRecords.length
      };
    });

    // Calculate individual teacher statistics
    const teacherStats: Record<string, any> = {};
    filteredTeachers.forEach(teacher => {
      const teacherRecords = filteredRecords.filter(r => r.teacher_id === teacher.id);
      const expectedDays = 5; // Assuming 5 working days per week
      
      const attendanceRate = (teacherRecords.length / expectedDays) * 100;
      
      const lateRecords = teacherRecords.filter(record => {
        const schedule = schedules.find(s => s.teacher_id === teacher.id);
        if (!schedule) return false;
        
        const scheduledTime = new Date(`2000-01-01T${schedule.start_time}:00`);
        const tapInTime = new Date(`2000-01-01T${record.tap_in_time}:00`);
        const minutesDiff = getDifferenceInMinutes(tapInTime, scheduledTime);
        
        return minutesDiff > 15;
      });

      const punctualityRate = teacherRecords.length > 0 
        ? ((teacherRecords.length - lateRecords.length) / teacherRecords.length) * 100
        : 0;

      // Calculate total hours (simplified)
      const totalHours = teacherRecords.reduce((sum, record) => {
        if (record.tap_out_time) {
          const tapIn = new Date(`2000-01-01T${record.tap_in_time}:00`);
          const tapOut = new Date(`2000-01-01T${record.tap_out_time}:00`);
          return sum + getDifferenceInMinutes(tapOut, tapIn) / 60;
        }
        return sum;
      }, 0);

      teacherStats[teacher.id] = {
        name: teacher.name,
        department: teacher.department,
        attendanceRate: Math.round(attendanceRate),
        punctualityRate: Math.round(punctualityRate),
        totalHours: Math.round(totalHours * 10) / 10
      };
    });

    // Calculate overall rates
    const overallAttendanceRate = totalTeachers > 0 
      ? (filteredRecords.length / (totalTeachers * 5)) * 100 
      : 0;

  const overallLateRecords = filteredRecords.filter(record => {
      const schedule = schedules.find(s => s.teacher_id === record.teacher_id);
      if (!schedule) return false;
      
      const scheduledTime = new Date(`2000-01-01T${schedule.start_time}:00`);
      const tapInTime = new Date(`2000-01-01T${record.tap_in_time}:00`);
      const minutesDiff = getDifferenceInMinutes(tapInTime, scheduledTime);
      
      return minutesDiff > 15;
    });

    const overallPunctualityRate = filteredRecords.length > 0 
      ? ((filteredRecords.length - overallLateRecords.length) / filteredRecords.length) * 100
      : 0;

    return {
      totalTeachers,
      activeTeachers,
      totalAttendanceRecords,
      averageAttendanceRate: Math.round(overallAttendanceRate),
      punctualityRate: Math.round(overallPunctualityRate),
      departmentStats,
      dailyStats,
      teacherStats
    };
  }, [teachers, attendanceRecords, schedules, selectedDate, dateRange, selectedDepartment, selectedTeacher]);

  const generateReport = async (type: string, format: 'pdf' | 'csv' | 'xlsx' = 'csv') => {
    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate generation time

      const { start, end } = getDateRange();
      const filename = `${type}-report-${formatDate(start, 'yyyy-MM-dd')}-to-${formatDate(end, 'yyyy-MM-dd')}`;

      if (format === 'csv') {
        let csvContent = '';
        
        switch (type) {
          case 'summary':
            csvContent = [
              ['Notre Dame of Kidapawan College - Summary Report'],
              [`Report Period: ${formatDate(start, 'MMM dd, yyyy')} to ${formatDate(end, 'MMM dd, yyyy')}`],
              [''],
              ['Metric', 'Value'],
              ['Total Teachers', reportData.totalTeachers.toString()],
              ['Active Teachers', reportData.activeTeachers.toString()],
              ['Total Attendance Records', reportData.totalAttendanceRecords.toString()],
              ['Average Attendance Rate', `${reportData.averageAttendanceRate}%`],
              ['Punctuality Rate', `${reportData.punctualityRate}%`],
              [''],
              ['Department Statistics'],
              ['Department', 'Teachers', 'Attendance Rate', 'Punctuality Rate'],
              ...departments.map(dept => [
                dept,
                reportData.departmentStats[dept]?.totalTeachers.toString() || '0',
                `${reportData.departmentStats[dept]?.attendanceRate || 0}%`,
                `${reportData.departmentStats[dept]?.punctualityRate || 0}%`
              ])
            ].map(row => row.join(',')).join('\n');
            break;
            
          case 'attendance':
            csvContent = [
              ['Notre Dame of Kidapawan College - Attendance Report'],
              [`Report Period: ${formatDate(start, 'MMM dd, yyyy')} to ${formatDate(end, 'MMM dd, yyyy')}`],
              [''],
              ['Teacher', 'Department', 'Attendance Rate', 'Total Hours', 'Status'],
              ...Object.entries(reportData.teacherStats).map(([teacherId, stats]) => [
                stats.name,
                stats.department,
                `${stats.attendanceRate}%`,
                `${stats.totalHours}h`,
                stats.attendanceRate >= 80 ? 'Good' : stats.attendanceRate >= 60 ? 'Fair' : 'Poor'
              ])
            ].map(row => row.join(',')).join('\n');
            break;
            
          case 'punctuality':
            csvContent = [
              ['Notre Dame of Kidapawan College - Punctuality Report'],
              [`Report Period: ${formatDate(start, 'MMM dd, yyyy')} to ${formatDate(end, 'MMM dd, yyyy')}`],
              [''],
              ['Teacher', 'Department', 'Punctuality Rate', 'Status'],
              ...Object.entries(reportData.teacherStats).map(([teacherId, stats]) => [
                stats.name,
                stats.department,
                `${stats.punctualityRate}%`,
                stats.punctualityRate >= 90 ? 'Excellent' : stats.punctualityRate >= 75 ? 'Good' : 'Needs Improvement'
              ])
            ].map(row => row.join(',')).join('\n');
            break;
            
          default:
            csvContent = 'Report type not supported for CSV export';
        }

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully!`);
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const sendReportByEmail = async (type: string) => {
    toast.info('Email functionality would be implemented with backend integration');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reports Management</h1>
          <p className="text-muted-foreground">Generate comprehensive attendance and analytics reports</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => generateReport(reportType)}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
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
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teachers</SelectItem>
                  {teachers
                    .filter(t => selectedDepartment === 'all' || t.department === selectedDepartment)
                    .map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">
              {reportData.activeTeachers} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.averageAttendanceRate}%</div>
            <Progress value={reportData.averageAttendanceRate} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Punctuality Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.punctualityRate}%</div>
            <Progress value={reportData.punctualityRate} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalAttendanceRecords}</div>
            <p className="text-xs text-muted-foreground">
              This period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="daily">Daily Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
                <CardDescription>
                  Summary of attendance metrics for {formatDate(getDateRange().start, 'MMM dd')} - {formatDate(getDateRange().end, 'MMM dd, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Overall Attendance</span>
                  <span className="font-medium">{reportData.averageAttendanceRate}%</span>
                </div>
                <Progress value={reportData.averageAttendanceRate} />
                
                <div className="flex items-center justify-between">
                  <span>Punctuality Rate</span>
                  <span className="font-medium">{reportData.punctualityRate}%</span>
                </div>
                <Progress value={reportData.punctualityRate} />
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Active Teachers:</span>
                    <span>{reportData.activeTeachers}/{reportData.totalTeachers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Records:</span>
                    <span>{reportData.totalAttendanceRecords}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Generate and share reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {reportTypes.map(type => (
                  <div key={type.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => generateReport(type.id, 'csv')}
                        disabled={isGenerating}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => sendReportByEmail(type.id)}
                      >
                        <Mail className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Attendance and punctuality by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {departments.map(dept => {
                  const stats = reportData.departmentStats[dept] || { totalTeachers: 0, attendanceRate: 0, punctualityRate: 0 };
                  return (
                    <div key={dept} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{dept}</h3>
                          <p className="text-sm text-muted-foreground">{stats.totalTeachers} teachers</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={stats.attendanceRate >= 80 ? 'default' : stats.attendanceRate >= 60 ? 'secondary' : 'destructive'}>
                            {stats.attendanceRate}% Attendance
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Attendance</span>
                            <span>{stats.attendanceRate}%</span>
                          </div>
                          <Progress value={stats.attendanceRate} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Punctuality</span>
                            <span>{stats.punctualityRate}%</span>
                          </div>
                          <Progress value={stats.punctualityRate} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Teacher Performance</CardTitle>
              <CardDescription>Detailed performance metrics for each teacher</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(reportData.teacherStats).map(([teacherId, stats]) => (
                  <div key={teacherId} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{stats.name}</h3>
                        <p className="text-sm text-muted-foreground">{stats.department} Department</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">{stats.totalHours}h total</div>
                        <Badge variant={stats.attendanceRate >= 80 ? 'default' : stats.attendanceRate >= 60 ? 'secondary' : 'destructive'}>
                          {stats.attendanceRate >= 80 ? 'Good' : stats.attendanceRate >= 60 ? 'Fair' : 'Poor'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Attendance</span>
                          <span>{stats.attendanceRate}%</span>
                        </div>
                        <Progress value={stats.attendanceRate} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Punctuality</span>
                          <span>{stats.punctualityRate}%</span>
                        </div>
                        <Progress value={stats.punctualityRate} />
                      </div>
                    </div>
                  </div>
                ))}
                
                {Object.keys(reportData.teacherStats).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No teacher data available for the selected filters
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance Trends</CardTitle>
              <CardDescription>Attendance patterns throughout the week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(reportData.dailyStats).map(([day, stats]) => (
                  <div key={day} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{day}</h3>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-600">Present: {stats.present}</span>
                        <span className="text-red-600">Absent: {stats.absent}</span>
                        <span className="text-yellow-600">Late: {stats.late}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Present</div>
                        <div className="text-lg font-medium text-green-600">{stats.present}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Absent</div>
                        <div className="text-lg font-medium text-red-600">{stats.absent}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Late</div>
                        <div className="text-lg font-medium text-yellow-600">{stats.late}</div>
                      </div>
                    </div>
                    
                    <Progress 
                      value={stats.present / (stats.present + stats.absent) * 100 || 0} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}