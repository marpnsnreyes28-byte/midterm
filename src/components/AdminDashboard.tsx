'use client';

import * as React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';

import { AdminLayout } from './AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useAuth } from './AuthProvider';
import { useRouter, RouterProvider } from './Router';
import {
  UserPlus,
  Search,
  Send,
  School,
  Radio,
  Edit,
  Trash2,
  Users,
  Building,
  Calendar,
  Clock,
  Bell,
  CheckCircle,
  MapPin,
  BarChart3,
  ChevronRight,
  AlertTriangle,
  Radio as RadioIcon
} from 'lucide-react';
import { toast } from 'sonner';
import type { NewTeacherInput } from './AuthProvider';
import { RfidSimulator } from './RfidSimulator';
import { AdminAnalytics } from './AdminAnalytics';
import { ReportsManagement } from './ReportsManagement';
import { ScheduleManagement } from './ScheduleManagement';
import { SettingsManagement } from './SettingsManagement';
// (previously there was a duplicated JSX fragment here accidentally inserted by a refactor)

// continue with component definitions

function AdminDashboardContent(): React.ReactElement {
  const { currentRoute } = useRouter();
  const { 
    user, 
    teachers, 
    classrooms, 
    schedules, 
    attendanceRecords, 
    notifications,
    addTeacher, 
    updateTeacher, 
    deleteTeacher,
    addClassroom,
    updateClassroom,
    deleteClassroom,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    sendNotification,
    tapIn,
    tapOut
  } = useAuth();

  // State for various forms and dialogs
  const [newTeacher, setNewTeacher] = useState<NewTeacherInput>({
    firstName: '',
    lastName: '',
    email: '',
    department: 'CBA',
    rfidId: '',
    isActive: true
  });

  const [newClassroom, setNewClassroom] = useState({
    name: '',
    capacity: 0,
    location: '',
    isActive: true
  });

  // Controlled form state for inputs
  // newTeacher (above) holds firstName, lastName, email, department, rfidId, isActive, password?
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // classroom state is already in newClassroom
  // notification state is already in newNotification

  const [newNotification, setNewNotification] = useState<{
    title: string,
    message: string,
    type: 'info' | 'warning' | 'success' | 'error',
    recipients: 'all' | 'department'
  }>({
    title: '',
    message: '',
    type: 'info',
    recipients: 'all'
  });

  const [selectedDepartment, setSelectedDepartment] = useState<'CBA' | 'CTE' | 'CECE'>('CBA');
  const [rfidInput, setRfidInput] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');

  // Temp password banner state (lifted so banner can be rendered from the parent scope)
  const [tempTeacherPassword, setTempTeacherPassword] = useState<string | null>(null);
  const [showTempTeacherPassword, setShowTempTeacherPassword] = useState(false);

  // Pause the background zoom whenever any Radix dialog content is open.
  // We use a MutationObserver to detect data-state changes on dialog content nodes,
  // and also disable the background animation while the admin dashboard is mounted.
  React.useEffect(() => {
    const update = () => {
      try {
        const anyOpen = !!document.querySelector('[data-slot="dialog-content"][data-state="open"]');
        if (anyOpen) document.body.classList.add('pause-bg-zoom');
        else document.body.classList.remove('pause-bg-zoom');
      } catch (e) {
        // ignore (server-side renders or early execution)
      }
    };

    // Disable background animation for the duration of the admin dashboard mount
    try {
      document.body.classList.add('no-bg-anim');
    } catch (e) {}

    update();
    const mo = new MutationObserver((mutations) => {
      try {
        for (const m of mutations) {
          // If attributes changed and the target is a dialog content node, inspect state
          if (m.type === 'attributes' && m.target instanceof Element) {
            const el = m.target as Element;
            if (el.matches('[data-slot="dialog-content"]')) {
              const state = el.getAttribute('data-state');
              // log when a dialog transitions to closed
              if (state === 'closed') {
                console.warn('[AdminDashboard] Dialog content closed detected on', el);
                console.trace('Trace: dialog closed');
              }
            }
          }
        }
      } catch (e) {
        // ignore
      }
      update();
    });
    // Observe subtree for child additions/removals and attribute changes (data-state toggles)
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-state'] });

    return () => {
      mo.disconnect();
      try { document.body.classList.remove('pause-bg-zoom'); } catch (e) {}
      try { document.body.classList.remove('no-bg-anim'); } catch (e) {}
    };
  }, []);

  // Helper functions
  const generateRfidId = () => {
    return `RFID-${Date.now().toString(36).toUpperCase()}`;
  };

  const generateNdkcEmail = (firstName: string, lastName: string) => {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@ndkc.edu.ph`;
  };

  // Dashboard Overview Component
  const DashboardOverview = () => {
    // Small helper for quick action buttons
    const QuickActionButton = ({ route, icon: Icon, label }: { route: string; icon: any; label: string }) => {
      const { navigate } = useRouter();
      return (
        <Button onClick={() => navigate(route)} className="justify-start">
          <Icon className="w-4 h-4 mr-2" />
          {label}
        </Button>
      );
    };
    const todayAttendance = attendanceRecords.filter(
      r => r.date === new Date().toISOString().split('T')[0]
    );

    const attendanceRate = teachers.length > 0 
      ? Math.round((todayAttendance.length / teachers.length) * 100) 
      : 0;

    const activeClassrooms = classrooms.filter(c => c.is_active).length;
    const unreadNotifications = notifications.filter(n => !n.is_read).length;

    const recentAttendance = attendanceRecords
      .slice(-10)
      .reverse()
      .map(record => {
        const teacher = teachers.find(t => t.id === record.teacher_id);
        const classroom = classrooms.find(c => c.id === record.classroom_id);
        return { ...record, teacher, classroom };
      });

    return (
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers.length}</div>
              <p className="text-xs text-muted-foreground">
                {(teachers.filter(t => t.is_active)).length} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceRate}%</div>
              <p className="text-xs text-muted-foreground">
                {todayAttendance.length} of {teachers.length} present
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Classrooms</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeClassrooms}</div>
              <p className="text-xs text-muted-foreground">
                of {classrooms.length} total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadNotifications}</div>
              <p className="text-xs text-muted-foreground">
                unread messages
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
              <CardDescription>Latest check-ins and check-outs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAttendance.slice(0, 5).map(record => (
                  <div key={record.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">{record.teacher?.name}</p>
                        <p className="text-xs text-muted-foreground">{record.classroom?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">{record.tap_in_time}</p>
                      <p className="text-xs text-muted-foreground">
                        {record.tap_out_time ? 'Completed' : 'Active'}
                      </p>
                    </div>
                  </div>
                ))}
                
                {recentAttendance.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No recent attendance records
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <QuickActionButton route="teachers" icon={UserPlus} label="Add New Teacher" />
                <QuickActionButton route="classrooms" icon={Building} label="Add Classroom" />
                <QuickActionButton route="schedules" icon={Calendar} label="Create Schedule" />
                <QuickActionButton route="reports" icon={BarChart3} label="Generate Report" />
                <QuickActionButton route="terminal" icon={Radio} label="RFID Terminal" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Department Summary</CardTitle>
            <CardDescription>Overview by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {['CBA', 'CTE', 'CECE'].map(dept => {
                const deptTeachers = teachers.filter(t => t.department === dept);
                const deptAttendance = todayAttendance.filter(record => {
                  const teacher = teachers.find(t => t.id === (record.teacher_id));
                  return teacher?.department === dept;
                });
                const rate = deptTeachers.length > 0 
                  ? Math.round((deptAttendance.length / deptTeachers.length) * 100) 
                  : 0;

                return (
                  <Card key={dept}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{dept}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-1">{rate}%</div>
                      <p className="text-xs text-muted-foreground">
                        {deptAttendance.length} of {deptTeachers.length} present
                      </p>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Teacher Management Component
  const TeachersView = ({ setTempTeacherPassword, setShowTempTeacherPassword }: { setTempTeacherPassword: React.Dispatch<React.SetStateAction<string | null>>; setShowTempTeacherPassword: React.Dispatch<React.SetStateAction<boolean>> }) => {
    React.useEffect(() => {
      console.log('[AdminDashboard] TeachersView mounted');
      return () => console.log('[AdminDashboard] TeachersView unmounted');
    }, []);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  // Localize form state to prevent parent re-renders while typing
  const [newTeacher, setNewTeacher] = useState<NewTeacherInput>({
    firstName: '',
    lastName: '',
    email: '',
    department: 'CBA',
    rfidId: '',
    isActive: true,
    password: undefined
  });
  const [passwordConfirm, setPasswordConfirm] = useState('');

    const filteredTeachers = teachers.filter(teacher => {
      const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           teacher.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment = filterDepartment === 'all' || teacher.department === filterDepartment;
      return matchesSearch && matchesDepartment;
    });


    const handleAddTeacher = async () => {
        // Read from localized controlled state
        const firstName = newTeacher.firstName;
        const lastName = newTeacher.lastName;
        const email = newTeacher.email;
        const rfid = newTeacher.rfidId;
        const password = newTeacher.password ?? undefined;
        const confirm = passwordConfirm ?? undefined;

        if (password !== undefined || confirm !== undefined) {
          if (!password || !confirm) {
            toast.error('Please enter and confirm the password');
            return;
          }
          if (password !== confirm) {
            toast.error('Passwords do not match');
            return;
          }
          if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
          }
        }

        if (!firstName || !lastName || !email || !rfid) {
          toast.error('Please fill in all required fields');
          return;
        }

        // Enforce NDKC email domain
        if (!email.toLowerCase().endsWith('@ndkc.edu.ph')) {
          toast.error('Teacher email must be an @ndkc.edu.ph address');
          return;
        }

        try {
          setIsAddingTeacher(true);
          const pw = await addTeacher({
            firstName,
            lastName,
            email,
            department: newTeacher.department,
            rfidId: rfid,
            password: password,
            isActive: newTeacher.isActive
          });

          // Reset localized form state
          setNewTeacher({ firstName: '', lastName: '', email: '', department: 'CBA', rfidId: '', isActive: true, password: undefined });
          setPasswordConfirm('');
          setIsAddDialogOpen(false);
          setTempTeacherPassword(pw ?? null);
          setShowTempTeacherPassword(!!pw);
          // try to copy to clipboard
          try { if (pw) await navigator.clipboard.writeText(pw); } catch {}
          // auto-hide after 15s
          setTimeout(() => setShowTempTeacherPassword(false), 15000);
          toast.success('Teacher added successfully! Temporary password copied to clipboard');
        } catch (err) {
          // Error is already toasted in addTeacher; keep dialog open for corrections
        } finally {
          setIsAddingTeacher(false);
        }
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Teacher Management</h1>
            <p className="text-muted-foreground">Manage teacher profiles and RFID assignments</p>
          </div>
          <Dialog open={isAddDialogOpen} modal onOpenChange={(open: boolean) => { 
            console.log('[AdminDashboard] Teachers Add dialog onOpenChange', open, 'Current state:', isAddDialogOpen);
            setIsAddDialogOpen(open); 
          }}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-2xl"
            >
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
                <DialogDescription>
                  Create a new teacher profile with NDKC email and RFID assignment
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={newTeacher.firstName}
                        onChange={(e) => {
                          console.log('firstName onChange:', e.target.value);
                          setNewTeacher({ ...newTeacher, firstName: e.target.value });
                        }}
                        placeholder="Enter first name"
                      />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={newTeacher.lastName}
                      onChange={(e) => setNewTeacher({ ...newTeacher, lastName: e.target.value })}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={newTeacher.department} onValueChange={(value: 'CBA' | 'CTE' | 'CECE') => setNewTeacher({...newTeacher, department: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CBA">CBA - College of Business Administration</SelectItem>
                      <SelectItem value="CTE">CTE - College of Teacher Education</SelectItem>
                      <SelectItem value="CECE">CECE - College of Engineering and Computer Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">NDKC Email *</Label>
                  <Input
                    id="email"
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                    placeholder="firstname.lastname@ndkc.edu.ph"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rfidId">RFID ID *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="rfidId"
                      value={newTeacher.rfidId}
                      onChange={(e) => setNewTeacher({ ...newTeacher, rfidId: e.target.value })}
                      placeholder="Enter RFID ID"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password (optional)</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newTeacher.password ?? ''}
                      onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                      placeholder="Enter password or leave blank to auto-generate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordConfirm">Confirm Password</Label>
                    <Input
                      id="passwordConfirm"
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="Confirm password"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddTeacher} disabled={isAddingTeacher}>
                  {isAddingTeacher ? 'Adding...' : 'Add Teacher'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search teachers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="CBA">CBA</SelectItem>
                  <SelectItem value="CTE">CTE</SelectItem>
                  <SelectItem value="CECE">CECE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Teachers Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeachers.map(teacher => (
            <Card key={teacher.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{teacher.name}</CardTitle>
                    <CardDescription>{teacher.email}</CardDescription>
                  </div>
                  <Badge variant={teacher.is_active ? 'default' : 'secondary'}>
                    {teacher.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <School className="w-4 h-4 text-muted-foreground" />
                    <span>{teacher.department} Department</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Radio className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono">{teacher.rfid_id as any}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteTeacher(teacher.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No teachers found matching your criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Classroom Management Component
  const ClassroomsView = React.memo(() => {
    React.useEffect(() => {
      console.log('[AdminDashboard] ClassroomsView mounted');
      return () => console.log('[AdminDashboard] ClassroomsView unmounted');
    }, []);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const handleAddClassroom = () => {
        const name = newClassroom.name;
        const capacity = Number(newClassroom.capacity) || 0;
        const location = newClassroom.location;

        if (!name || !location || capacity <= 0) {
          toast.error('Please fill in all required fields');
          return;
        }

        addClassroom({
          name,
          capacity,
          location,
          is_active: newClassroom.isActive
        });

        // Reset controlled state
        setNewClassroom({ name: '', capacity: 0, location: '', isActive: true });
        setIsAddDialogOpen(false);
        toast.success('Classroom added successfully!');
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Classroom Management</h1>
            <p className="text-muted-foreground">Manage classroom facilities and capacity</p>
          </div>
          <Dialog open={isAddDialogOpen} modal onOpenChange={(open: boolean) => { console.log('[AdminDashboard] Classrooms Add dialog onOpenChange', open); setIsAddDialogOpen(open); }}>
            <DialogTrigger asChild>
              <Button>
                <Building className="w-4 h-4 mr-2" />
                Add Classroom
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-2xl"
            >
              <DialogHeader>
                <DialogTitle>Add New Classroom</DialogTitle>
                <DialogDescription>Create a new classroom facility</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="classroomName">Classroom Name *</Label>
                  <Input
                    id="classroomName"
                    value={newClassroom.name}
                    onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
                    placeholder="e.g., Room 101, Lab A"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={String(newClassroom.capacity)}
                    onChange={(e) => setNewClassroom({ ...newClassroom, capacity: parseInt(e.target.value || '0') || 0 })}
                    placeholder="Maximum number of students"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={newClassroom.location}
                    onChange={(e) => setNewClassroom({ ...newClassroom, location: e.target.value })}
                    placeholder="Building and floor information"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddClassroom}>Add Classroom</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classrooms.map(classroom => (
            <Card key={classroom.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{classroom.name}</CardTitle>
                    <CardDescription>{classroom.location}</CardDescription>
                  </div>
                  <Badge variant={classroom.is_active ? 'default' : 'secondary'}>
                    {classroom.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>Capacity: {classroom.capacity} students</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{classroom.location}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteClassroom(classroom.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  });

  // RFID Terminal View
  const TerminalView = () => {
    const [selectedClassroomForTerminal, setSelectedClassroomForTerminal] = useState('');
    const [isOpening, setIsOpening] = useState(false);
    const [showPopupBlockedHelp, setShowPopupBlockedHelp] = useState(false);
    
    const openTerminalWindow = () => {
      if (!selectedClassroomForTerminal) {
        toast.error('Please select a classroom for the terminal');
        return;
      }
      
      setIsOpening(true);
      setShowPopupBlockedHelp(false);
      
      // Get classroom name for display
      const classroom = classrooms.find(c => c.id === selectedClassroomForTerminal);
      const classroomName = classroom ? `${classroom.name} - ${classroom.location}` : 'Terminal';
      
      // Open terminal in new window
      const width = window.screen.width;
      const height = window.screen.height;
      const terminalUrl = `/terminal?classroom=${selectedClassroomForTerminal}`;
      
      // Use a timeout to show loading state
      setTimeout(() => {
        const newWindow = window.open(
          terminalUrl,
          'RFID_Terminal',
          `width=${width},height=${height},fullscreen=yes,toolbar=no,menubar=no,location=no,status=no,resizable=yes`
        );
        
        if (newWindow) {
          // Check if window actually opened
          try {
            newWindow.focus();
            toast.success(`Terminal window opened for ${classroomName}`, {
              description: 'Click "Launch Terminal" in the new window to activate fullscreen mode'
            });
            
            // Monitor if window gets closed
            const checkClosed = setInterval(() => {
              if (newWindow.closed) {
                clearInterval(checkClosed);
                toast.info('Terminal window closed');
              }
            }, 1000);
            
            // Clear interval after 30 seconds
            setTimeout(() => clearInterval(checkClosed), 30000);
          } catch (e) {
            toast.warning('Terminal window opened but may be blocked', {
              description: 'If you don\'t see the window, check your popup blocker settings'
            });
            setShowPopupBlockedHelp(true);
          }
        } else {
          toast.error('Unable to open terminal window', {
            description: 'Please allow popups for this site or use the "Open in Current Tab" option below'
          });
          setShowPopupBlockedHelp(true);
        }
        
        setIsOpening(false);
      }, 300);
    };
    
    const openInCurrentTab = () => {
      if (!selectedClassroomForTerminal) {
        toast.error('Please select a classroom for the terminal');
        return;
      }
      
      const terminalUrl = `/terminal?classroom=${selectedClassroomForTerminal}`;
      window.location.href = terminalUrl;
    };
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">RFID Terminal</h1>
            <p className="text-muted-foreground">Manage RFID terminals and test scanning</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedClassroomForTerminal} onValueChange={setSelectedClassroomForTerminal}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select classroom for terminal" />
              </SelectTrigger>
              <SelectContent>
                {classrooms.filter(c => c.is_active).map((classroom) => (
                  <SelectItem key={classroom.id} value={classroom.id}>
                    {classroom.name} - {classroom.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={openTerminalWindow} 
              disabled={!selectedClassroomForTerminal || isOpening}
              className="min-w-[200px]"
            >
              {isOpening ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Opening...
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4 mr-2" />
                  Open Terminal Window
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Popup Blocked Help */}
        {showPopupBlockedHelp && (
          <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                    Popup Blocked?
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                    Your browser may have blocked the terminal window. Try one of these solutions:
                  </p>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={openInCurrentTab}
                      className="w-full justify-start"
                    >
                      <ChevronRight className="w-4 h-4 mr-2" />
                      Open Terminal in Current Tab
                    </Button>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      Or allow popups for this site in your browser settings and try again
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        
        {/* Info Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-green-50/50 dark:from-primary/10 dark:to-green-950/50 border-primary/20 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-primary to-green-600 rounded-full p-3 shadow-md">
                <Radio className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2 text-lg flex items-center gap-2">
                  Fullscreen Terminal Mode
                  <Badge variant="secondary" className="text-xs">Enhanced UI</Badge>
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  The RFID terminal features an enhanced interface with smooth animations and automatic scanning:
                </p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex items-start gap-2">
                    <span className="text-primary text-lg">✓</span>
                    <span className="text-sm text-muted-foreground">Automatic Hoba reader integration</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary text-lg">✓</span>
                    <span className="text-sm text-muted-foreground">Animated visual feedback</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary text-lg">✓</span>
                    <span className="text-sm text-muted-foreground">Day of week validation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary text-lg">✓</span>
                    <span className="text-sm text-muted-foreground">Real-time status updates</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary text-lg">✓</span>
                    <span className="text-sm text-muted-foreground">Classroom location enforcement</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary text-lg">✓</span>
                    <span className="text-sm text-muted-foreground">Audio + visual notifications</span>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
                  <p className="text-sm text-blue-900 dark:text-blue-100 flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span><strong>Grace Period:</strong> Teachers can tap in/out ±15 minutes from their scheduled time at the designated classroom terminal.</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Testing Simulator */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Simulator</CardTitle>
            <CardDescription>
              Use this simulator to test RFID scanning without strict validation (for testing only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RfidSimulator />
          </CardContent>
        </Card>
      </div>
    );
  };

  // Notifications View
  const NotificationsView = React.memo(() => {
    React.useEffect(() => {
      console.log('[AdminDashboard] NotificationsView mounted');
      return () => console.log('[AdminDashboard] NotificationsView unmounted');
    }, []);

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSendNotification = () => {
      const title = newNotification.title;
      const message = newNotification.message;

      if (!title || !message) {
        toast.error('Please fill in all required fields');
        return;
      }

      sendNotification({
        title,
        message,
        type: newNotification.type,
        // For compatibility, store target_role/target_teacher_id semantics later in backend
      } as any);

      setNewNotification({ title: '', message: '', type: 'info', recipients: 'all' });
      setIsDialogOpen(false);
      toast.success('Notification sent successfully!');
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Notifications</h1>
            <p className="text-muted-foreground">Send announcements and alerts to teachers</p>
          </div>
          <Dialog open={isDialogOpen} modal onOpenChange={(open: boolean) => { console.log('[AdminDashboard] Notifications dialog onOpenChange', open); setIsDialogOpen(open); }}>
            <DialogTrigger asChild>
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-2xl"
            >
              <DialogHeader>
                <DialogTitle>Send Notification</DialogTitle>
                <DialogDescription>Compose and send a notification to teachers</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                    placeholder="Notification title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                    placeholder="Notification message"
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                                        <Select value={newNotification.type as 'info'} onValueChange={(value: 'info' | 'warning' | 'success' | 'error') => setNewNotification({...newNotification, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Information</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="recipients">Recipients</Label>
                    <Select value={newNotification.recipients} onValueChange={(value: 'all' | 'department') => setNewNotification({...newNotification, recipients: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Teachers</SelectItem>
                        <SelectItem value="department">Specific Department</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {newNotification.recipients === 'department' && (
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CBA">CBA</SelectItem>
                        <SelectItem value="CTE">CTE</SelectItem>
                        <SelectItem value="CECE">CECE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSendNotification}>Send Notification</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {notifications.map(notification => (
            <Card key={notification.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{notification.title}</CardTitle>
                    <CardDescription>
                      {new Date((notification as any).created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={
                    notification.type === 'error' ? 'destructive' :
                    notification.type === 'warning' ? 'secondary' :
                    notification.type === 'success' ? 'default' : 'outline'
                  }>
                    {notification.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{notification.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  });

  // Live Attendance View
  const AttendanceView = () => {
    const todayAttendance = attendanceRecords.filter(
      r => r.date === new Date().toISOString().split('T')[0]
    );

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Live Attendance Monitoring</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Classroom</TableHead>
                  <TableHead>Tap In</TableHead>
                  <TableHead>Tap Out</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayAttendance.map((record) => {
                  const teacher = teachers.find(t => t.id === record.teacher_id);
                  const classroom = classrooms.find(c => c.id === record.classroom_id);
                  const duration = record.tap_out_time
                    ? Math.round((new Date(record.tap_out_time).getTime() - new Date(record.tap_in_time).getTime()) / (1000 * 60 * 60) * 10) / 10
                    : null;

                  return (
                    <TableRow key={record.id}>
                      <TableCell>{teacher?.name}</TableCell>
                      <TableCell>{classroom?.name}</TableCell>
                      <TableCell>{record.tap_in_time}</TableCell>
                      <TableCell>
                        {record.tap_out_time || '-'}
                      </TableCell>
                      <TableCell>{duration ? `${duration}h` : '-'}</TableCell>
                      <TableCell>
                        <Badge variant={record.tap_out_time ? 'outline' : 'default'}>
                          {record.tap_out_time ? 'Completed' : 'Active'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {todayAttendance.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No attendance records for today
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };


  // Route rendering
  const renderContent = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'reports':
        return <ReportsManagement />;
      case 'teachers':
        return <TeachersView setTempTeacherPassword={setTempTeacherPassword} setShowTempTeacherPassword={setShowTempTeacherPassword} />;
      case 'classrooms':
        return <ClassroomsView />;
      case 'schedules':
        return <ScheduleManagement />;
      case 'attendance':
        return <AttendanceView />;
      case 'terminal':
        return <TerminalView />;
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
        return <SettingsManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <AdminLayout activeView={currentRoute} onViewChange={() => {}}>
      {renderContent()}
      {showTempTeacherPassword && tempTeacherPassword && (
        <div className="fixed bottom-6 right-6 z-[9999] pointer-events-auto">
          <div className="bg-white border shadow-lg rounded p-3 flex items-center gap-3 ring-2 ring-primary">
            <div className="text-sm">Temporary password: <strong className="font-mono">{tempTeacherPassword}</strong></div>
            <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => { navigator.clipboard.writeText(tempTeacherPassword); }}>
              Copy
            </button>
            <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => setShowTempTeacherPassword(false)}>Close</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export function AdminDashboard() {
  return (
    <RouterProvider initialRoute="dashboard">
      <AdminDashboardContent />
    </RouterProvider>
  );
}