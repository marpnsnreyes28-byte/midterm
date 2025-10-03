'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useAuth } from './AuthProvider';
import { 
  Settings,
  School,
  Bell,
  Shield,
  Database,
  Wifi,
  Clock,
  Mail,
  Smartphone,
  Monitor,
  Palette,
  Volume2,
  Download,
  Upload,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  Key,
  Users,
  Building
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemSettings {
  school: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logoUrl: string;
  };
  attendance: {
    autoLogoutMinutes: number;
    lateThresholdMinutes: number;
    allowEarlyCheckIn: boolean;
    allowLateCheckOut: boolean;
    requirePhotos: boolean;
    enableGeofencing: boolean;
    geofenceRadius: number;
  };
  notifications: {
    enableEmailNotifications: boolean;
    enableSMSNotifications: boolean;
    enablePushNotifications: boolean;
    notifyAdminOnLateArrival: boolean;
    notifyAdminOnAbsence: boolean;
    dailyReportTime: string;
    weeklyReportDay: string;
  };
  security: {
    sessionTimeoutHours: number;
    maxLoginAttempts: number;
    requirePasswordChange: boolean;
    passwordExpiryDays: number;
    enableTwoFactorAuth: boolean;
    allowMultipleSessions: boolean;
  };
  rfid: {
    readTimeout: number;
    retryAttempts: number;
    soundEnabled: boolean;
    soundVolume: number;
    feedbackDuration: number;
    enableBulkRegistration: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    showProfilePictures: boolean;
  };
  backup: {
    enableAutoBackup: boolean;
    backupFrequency: string;
    retentionDays: number;
    lastBackup: string;
  };
}

export function SettingsManagement() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('school');
  const [isSaving, setSaving] = useState(false);
  const [isBackingUp, setBackingUp] = useState(false);
  const [isRestoring, setRestoring] = useState(false);
  
  const [settings, setSettings] = useState<SystemSettings>({
    school: {
      name: 'Notre Dame of Kidapawan College',
      address: 'Datu Ingkal Street, Kidapawan City, Cotabato',
      phone: '+63 (64) 288-1234',
      email: 'info@ndkc.edu.ph',
      website: 'https://ndkc.edu.ph',
      logoUrl: ''
    },
    attendance: {
      autoLogoutMinutes: 480, // 8 hours
      lateThresholdMinutes: 15,
      allowEarlyCheckIn: true,
      allowLateCheckOut: true,
      requirePhotos: false,
      enableGeofencing: false,
      geofenceRadius: 100 // meters
    },
    notifications: {
      enableEmailNotifications: true,
      enableSMSNotifications: false,
      enablePushNotifications: true,
      notifyAdminOnLateArrival: true,
      notifyAdminOnAbsence: true,
      dailyReportTime: '17:00',
      weeklyReportDay: 'Friday'
    },
    security: {
      sessionTimeoutHours: 24,
      maxLoginAttempts: 5,
      requirePasswordChange: false,
      passwordExpiryDays: 90,
      enableTwoFactorAuth: false,
      allowMultipleSessions: true
    },
    rfid: {
      readTimeout: 5000, // milliseconds
      retryAttempts: 3,
      soundEnabled: true,
      soundVolume: 50,
      feedbackDuration: 2000,
      enableBulkRegistration: true
    },
    display: {
      theme: 'auto',
      language: 'en',
      timezone: 'Asia/Manila',
      dateFormat: 'MM/dd/yyyy',
      timeFormat: '12h',
      showProfilePictures: true
    },
    backup: {
      enableAutoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      lastBackup: new Date().toISOString()
    }
  });

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fil', name: 'Filipino' },
    { code: 'ceb', name: 'Cebuano' }
  ];

  const timezones = [
    'Asia/Manila',
    'Asia/Singapore',
    'UTC'
  ];

  const dateFormats = [
    'MM/dd/yyyy',
    'dd/MM/yyyy',
    'yyyy-MM-dd'
  ];

  const updateSettings = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Simulate saving to backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save to localStorage for now
      localStorage.setItem('ndkc-settings', JSON.stringify(settings));
      
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ndkc-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Settings exported successfully!');
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings(importedSettings);
        toast.success('Settings imported successfully!');
      } catch (error) {
        toast.error('Invalid settings file');
      }
    };
    reader.readAsText(file);
  };

  const createBackup = async () => {
    setBackingUp(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const backupData = {
        settings,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ndkc-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      updateSettings('backup', 'lastBackup', new Date().toISOString());
      toast.success('Backup created successfully!');
    } catch (error) {
      toast.error('Failed to create backup');
    } finally {
      setBackingUp(false);
    }
  };

  const resetToDefaults = () => {
    toast.info('Reset to defaults functionality would require confirmation dialog');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">System Settings</h1>
          <p className="text-muted-foreground">Configure system preferences and behavior</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportSettings}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <label>
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              className="hidden"
            />
            <Button variant="outline" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </span>
            </Button>
          </label>
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="school">School</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="rfid">RFID</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="school" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="w-5 h-5" />
                School Information
              </CardTitle>
              <CardDescription>
                Basic information about your institution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input
                    id="schoolName"
                    value={settings.school.name}
                    onChange={(e) => updateSettings('school', 'name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="schoolEmail">Email Address</Label>
                  <Input
                    id="schoolEmail"
                    type="email"
                    value={settings.school.email}
                    onChange={(e) => updateSettings('school', 'email', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="schoolPhone">Phone Number</Label>
                  <Input
                    id="schoolPhone"
                    value={settings.school.phone}
                    onChange={(e) => updateSettings('school', 'phone', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="schoolWebsite">Website</Label>
                  <Input
                    id="schoolWebsite"
                    type="url"
                    value={settings.school.website}
                    onChange={(e) => updateSettings('school', 'website', e.target.value)}
                  />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="schoolAddress">Address</Label>
                  <Textarea
                    id="schoolAddress"
                    value={settings.school.address}
                    onChange={(e) => updateSettings('school', 'address', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Attendance Rules
              </CardTitle>
              <CardDescription>
                Configure attendance tracking behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lateThreshold">Late Threshold (minutes)</Label>
                  <Input
                    id="lateThreshold"
                    type="number"
                    value={settings.attendance.lateThresholdMinutes}
                    onChange={(e) => updateSettings('attendance', 'lateThresholdMinutes', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="autoLogout">Auto Logout (minutes)</Label>
                  <Input
                    id="autoLogout"
                    type="number"
                    value={settings.attendance.autoLogoutMinutes}
                    onChange={(e) => updateSettings('attendance', 'autoLogoutMinutes', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Early Check-in</Label>
                    <p className="text-sm text-muted-foreground">Teachers can check in before scheduled time</p>
                  </div>
                  <Switch
                    checked={settings.attendance.allowEarlyCheckIn}
                    onCheckedChange={(checked) => updateSettings('attendance', 'allowEarlyCheckIn', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Late Check-out</Label>
                    <p className="text-sm text-muted-foreground">Teachers can check out after scheduled time</p>
                  </div>
                  <Switch
                    checked={settings.attendance.allowLateCheckOut}
                    onCheckedChange={(checked) => updateSettings('attendance', 'allowLateCheckOut', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Photos</Label>
                    <p className="text-sm text-muted-foreground">Capture photos during check-in/out</p>
                  </div>
                  <Switch
                    checked={settings.attendance.requirePhotos}
                    onCheckedChange={(checked) => updateSettings('attendance', 'requirePhotos', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Geofencing</Label>
                    <p className="text-sm text-muted-foreground">Restrict attendance to school premises</p>
                  </div>
                  <Switch
                    checked={settings.attendance.enableGeofencing}
                    onCheckedChange={(checked) => updateSettings('attendance', 'enableGeofencing', checked)}
                  />
                </div>
                
                {settings.attendance.enableGeofencing && (
                  <div className="ml-4 space-y-2">
                    <Label htmlFor="geofenceRadius">Geofence Radius (meters)</Label>
                    <Input
                      id="geofenceRadius"
                      type="number"
                      value={settings.attendance.geofenceRadius}
                      onChange={(e) => updateSettings('attendance', 'geofenceRadius', parseInt(e.target.value))}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how and when notifications are sent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifications.enableEmailNotifications}
                    onCheckedChange={(checked) => updateSettings('notifications', 'enableEmailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifications.enableSMSNotifications}
                    onCheckedChange={(checked) => updateSettings('notifications', 'enableSMSNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send browser notifications</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifications.enablePushNotifications}
                    onCheckedChange={(checked) => updateSettings('notifications', 'enablePushNotifications', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-medium">Admin Notifications</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Late Arrival Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notify when teachers arrive late</p>
                  </div>
                  <Switch
                    checked={settings.notifications.notifyAdminOnLateArrival}
                    onCheckedChange={(checked) => updateSettings('notifications', 'notifyAdminOnLateArrival', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Absence Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notify when teachers are absent</p>
                  </div>
                  <Switch
                    checked={settings.notifications.notifyAdminOnAbsence}
                    onCheckedChange={(checked) => updateSettings('notifications', 'notifyAdminOnAbsence', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dailyReportTime">Daily Report Time</Label>
                  <Input
                    id="dailyReportTime"
                    type="time"
                    value={settings.notifications.dailyReportTime}
                    onChange={(e) => updateSettings('notifications', 'dailyReportTime', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weeklyReportDay">Weekly Report Day</Label>
                  <Select
                    value={settings.notifications.weeklyReportDay}
                    onValueChange={(value) => updateSettings('notifications', 'weeklyReportDay', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure authentication and security policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeoutHours}
                    onChange={(e) => updateSettings('security', 'sessionTimeoutHours', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSettings('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={settings.security.passwordExpiryDays}
                    onChange={(e) => updateSettings('security', 'passwordExpiryDays', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Password Change</Label>
                    <p className="text-sm text-muted-foreground">Force users to change passwords periodically</p>
                  </div>
                  <Switch
                    checked={settings.security.requirePasswordChange}
                    onCheckedChange={(checked) => updateSettings('security', 'requirePasswordChange', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Enable 2FA for additional security</p>
                  </div>
                  <Switch
                    checked={settings.security.enableTwoFactorAuth}
                    onCheckedChange={(checked) => updateSettings('security', 'enableTwoFactorAuth', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Multiple Sessions</Label>
                    <p className="text-sm text-muted-foreground">Users can be logged in on multiple devices</p>
                  </div>
                  <Switch
                    checked={settings.security.allowMultipleSessions}
                    onCheckedChange={(checked) => updateSettings('security', 'allowMultipleSessions', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rfid" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                RFID Configuration
              </CardTitle>
              <CardDescription>
                Configure RFID reader behavior and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="readTimeout">Read Timeout (ms)</Label>
                  <Input
                    id="readTimeout"
                    type="number"
                    value={settings.rfid.readTimeout}
                    onChange={(e) => updateSettings('rfid', 'readTimeout', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="retryAttempts">Retry Attempts</Label>
                  <Input
                    id="retryAttempts"
                    type="number"
                    value={settings.rfid.retryAttempts}
                    onChange={(e) => updateSettings('rfid', 'retryAttempts', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="feedbackDuration">Feedback Duration (ms)</Label>
                  <Input
                    id="feedbackDuration"
                    type="number"
                    value={settings.rfid.feedbackDuration}
                    onChange={(e) => updateSettings('rfid', 'feedbackDuration', parseInt(e.target.value))}
                  />
                </div>
                
                {settings.rfid.soundEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="soundVolume">Sound Volume (%)</Label>
                    <Input
                      id="soundVolume"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.rfid.soundVolume}
                      onChange={(e) => updateSettings('rfid', 'soundVolume', parseInt(e.target.value))}
                    />
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <div>
                      <Label>Sound Feedback</Label>
                      <p className="text-sm text-muted-foreground">Play sounds for successful/failed reads</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.rfid.soundEnabled}
                    onCheckedChange={(checked) => updateSettings('rfid', 'soundEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bulk Registration</Label>
                    <p className="text-sm text-muted-foreground">Allow registering multiple RFID cards at once</p>
                  </div>
                  <Switch
                    checked={settings.rfid.enableBulkRegistration}
                    onCheckedChange={(checked) => updateSettings('rfid', 'enableBulkRegistration', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Display & Localization
              </CardTitle>
              <CardDescription>
                Configure appearance and regional settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={settings.display.theme}
                    onValueChange={(value: 'light' | 'dark' | 'auto') => updateSettings('display', 'theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings.display.language}
                    onValueChange={(value) => updateSettings('display', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.display.timezone}
                    onValueChange={(value) => updateSettings('display', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map(tz => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={settings.display.dateFormat}
                    onValueChange={(value) => updateSettings('display', 'dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dateFormats.map(format => (
                        <SelectItem key={format} value={format}>{format}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Select
                    value={settings.display.timeFormat}
                    onValueChange={(value: '12h' | '24h') => updateSettings('display', 'timeFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                      <SelectItem value="24h">24-hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Profile Pictures</Label>
                    <p className="text-sm text-muted-foreground">Display user profile pictures in interface</p>
                  </div>
                  <Switch
                    checked={settings.display.showProfilePictures}
                    onCheckedChange={(checked) => updateSettings('display', 'showProfilePictures', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Backup & Recovery
              </CardTitle>
              <CardDescription>
                Manage system backups and data recovery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  Last backup: {new Date(settings.backup.lastBackup).toLocaleString()}
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select
                    value={settings.backup.backupFrequency}
                    onValueChange={(value) => updateSettings('backup', 'backupFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="retentionDays">Retention Period (days)</Label>
                  <Input
                    id="retentionDays"
                    type="number"
                    value={settings.backup.retentionDays}
                    onChange={(e) => updateSettings('backup', 'retentionDays', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Backup</Label>
                  <p className="text-sm text-muted-foreground">Automatically create backups based on schedule</p>
                </div>
                <Switch
                  checked={settings.backup.enableAutoBackup}
                  onCheckedChange={(checked) => updateSettings('backup', 'enableAutoBackup', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-medium">Manual Actions</h3>
                
                <div className="flex flex-wrap gap-2">
                  <Button onClick={createBackup} disabled={isBackingUp}>
                    {isBackingUp ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Create Backup
                  </Button>
                  
                  <label>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importSettings}
                      className="hidden"
                    />
                    <Button variant="outline" asChild disabled={isRestoring}>
                      <span>
                        {isRestoring ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        Restore Backup
                      </span>
                    </Button>
                  </label>
                  
                  <Button variant="outline" onClick={resetToDefaults}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}