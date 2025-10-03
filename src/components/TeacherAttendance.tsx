'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useAuth } from './AuthProvider';
import { 
  Clock, 
  Calendar,
  Filter,
  Download,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export function TeacherAttendance() {
  const { user, classrooms, attendanceRecords } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedClassroom, setSelectedClassroom] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Get teacher's attendance records
  const teacherAttendance = attendanceRecords.filter(
    record => (record.teacherId ?? record.teacher_id) === user?.id
  ).sort((a, b) => new Date((b.tapInTime ?? b.tap_in_time) as any).getTime() - new Date((a.tapInTime ?? a.tap_in_time) as any).getTime());

  // Filter records based on search and filters
  const filteredRecords = useMemo(() => {
    return teacherAttendance.filter(record => {
      const classroom = classrooms.find(c => c.id === (record.classroomId ?? record.classroom_id));
      const matchesSearch = searchTerm === '' || 
        classroom?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.date.includes(searchTerm);
      
      const matchesMonth = selectedMonth === '' || selectedMonth === 'all' || 
        new Date(record.date).getMonth() === parseInt(selectedMonth);
      
      const matchesClassroom = selectedClassroom === '' || selectedClassroom === 'all' || 
        (record.classroomId ?? record.classroom_id) === selectedClassroom;

      return matchesSearch && matchesMonth && matchesClassroom;
    });
  }, [teacherAttendance, searchTerm, selectedMonth, selectedClassroom, classrooms]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const totalSessions = filteredRecords.length;
    const completedSessions = filteredRecords.filter(record => (record.tapOutTime ?? record.tap_out_time)).length;
    const activeSessions = totalSessions - completedSessions;
    
    // Calculate total hours
    const totalMinutes = filteredRecords.reduce((total, record) => {
      if (record.tapOutTime ?? record.tap_out_time) {
        const start = new Date((record.tapInTime ?? record.tap_in_time) as any);
        const end = new Date((record.tapOutTime ?? record.tap_out_time) as any);
        return total + Math.round((end.getTime() - start.getTime()) / (1000 * 60));
      }
      return total;
    }, 0);
    
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

    return {
      totalSessions,
      completedSessions,
      activeSessions,
      totalHours
    };
  }, [filteredRecords]);

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

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Classroom', 'Location', 'Tap In', 'Tap Out', 'Duration', 'Status'],
      ...filteredRecords.map(record => {
        const classroom = classrooms.find(c => c.id === (record.classroomId ?? record.classroom_id));
        return [
          new Date(record.date).toLocaleDateString(),
          classroom?.name || 'Unknown',
          classroom?.location || '',
          new Date((record.tapInTime ?? record.tap_in_time) as any).toLocaleTimeString(),
          (record.tapOutTime ?? record.tap_out_time) ? new Date((record.tapOutTime ?? record.tap_out_time) as any).toLocaleTimeString() : '-',
          (record.tapOutTime ?? record.tap_out_time) 
            ? formatDuration((record.tapInTime ?? record.tap_in_time) as any, (record.tapOutTime ?? record.tap_out_time) as any)
            : formatDuration((record.tapInTime ?? record.tap_in_time) as any),
          (record.tapOutTime ?? record.tap_out_time) ? 'Completed' : 'Active'
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${user?.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const months = [
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' }
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold text-primary">{stats.totalSessions}</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedSessions}</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.activeSessions}</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">{stats.activeSessions > 0 ? 'LIVE' : 'NONE'}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalHours}h</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search classroom or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All months</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
              <SelectTrigger>
                <SelectValue placeholder="Select classroom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classrooms</SelectItem>
                {classrooms.map((classroom) => (
                  <SelectItem key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={exportToCSV} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>
            Your classroom attendance records. RFID tap-in/tap-out is managed by administration.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Classroom</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Tap In</TableHead>
                <TableHead>Tap Out</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {filteredRecords.length === 0 ? 'No attendance records found.' : 'No records match your filters.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRecords.map((record) => {
                  const classroom = classrooms.find(c => c.id === (record.classroomId ?? record.classroom_id));
                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        {new Date(record.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {classroom?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {classroom?.location || '-'}
                      </TableCell>
                      <TableCell>
                        {new Date((record.tapInTime ?? record.tap_in_time) as any).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        {(record.tapOutTime ?? record.tap_out_time) 
                          ? new Date((record.tapOutTime ?? record.tap_out_time) as any).toLocaleTimeString()
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {(record.tapOutTime ?? record.tap_out_time) 
                          ? formatDuration((record.tapInTime ?? record.tap_in_time) as any, (record.tapOutTime ?? record.tap_out_time) as any)
                          : formatDuration((record.tapInTime ?? record.tap_in_time) as any)
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={(record.tapOutTime ?? record.tap_out_time) ? 'outline' : 'default'}>
                          {(record.tapOutTime ?? record.tap_out_time) ? 'Completed' : 'Active'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * recordsPerPage) + 1} to {Math.min(currentPage * recordsPerPage, filteredRecords.length)} of {filteredRecords.length} records
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}