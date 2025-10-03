'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from './AuthProvider';
import { 
  Bell, 
  Search,
  Filter,
  Eye,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';

export function TeacherNotifications() {
  const { user, notifications, markNotificationAsRead } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 10;

  // Get teacher's notifications
  const teacherNotifications = notifications.filter(
    notification => notification.recipientIds.includes(user?.id || '')
  );

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return teacherNotifications.filter(notification => {
      const isRead = notification.readBy.includes(user?.id || '');
      
      const matchesSearch = searchTerm === '' || 
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === '' || selectedType === 'all' || notification.type === selectedType;
      
      const matchesStatus = selectedStatus === '' || selectedStatus === 'all' || 
        (selectedStatus === 'read' && isRead) ||
        (selectedStatus === 'unread' && !isRead);

      return matchesSearch && matchesType && matchesStatus;
    }).sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }, [teacherNotifications, searchTerm, selectedType, selectedStatus, user?.id]);

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * notificationsPerPage,
    currentPage * notificationsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const total = teacherNotifications.length;
    const unread = teacherNotifications.filter(n => !n.readBy.includes(user?.id || '')).length;
    const byType = teacherNotifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      unread,
      read: total - unread,
      byType
    };
  }, [teacherNotifications, user?.id]);

  const handleMarkAsRead = (notificationId: string) => {
    if (user?.id) {
      markNotificationAsRead(notificationId);
    }
  };

  const markAllAsRead = () => {
    const unreadNotifications = filteredNotifications.filter(
      n => !n.readBy.includes(user?.id || '')
    );
    
    unreadNotifications.forEach(notification => {
      handleMarkAsRead(notification.id);
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationBadgeVariant = (type: string) => {
    switch (type) {
      case 'info':
        return 'default';
      case 'success':
        return 'default';
      case 'warning':
        return 'destructive';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
              </div>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Read</p>
                <p className="text-2xl font-bold text-green-600">{stats.read}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.byType.warning || 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </div>
            <Button
              onClick={markAllAsRead}
              disabled={stats.unread === 0}
              className="flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Mark All as Read
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Messages and announcements from administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paginatedNotifications.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                {filteredNotifications.length === 0 && teacherNotifications.length === 0
                  ? 'No Notifications'
                  : 'No Matching Notifications'
                }
              </h3>
              <p>
                {filteredNotifications.length === 0 && teacherNotifications.length === 0
                  ? 'You have no notifications at this time.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedNotifications.map((notification) => {
                const isRead = notification.readBy.includes(user?.id || '');
                return (
                  <div
                    key={notification.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      isRead ? 'bg-muted/30' : 'bg-card border-primary/20 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          {getNotificationIcon(notification.type)}
                          <h4 className={`font-semibold ${!isRead ? 'text-primary' : ''}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={getNotificationBadgeVariant(notification.type)}>
                              {notification.type}
                            </Badge>
                            {!isRead && (
                              <Badge variant="destructive" className="text-xs">
                                NEW
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground leading-relaxed">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.sentAt).toLocaleString()}
                          </p>
                          {isRead && (
                            <Badge variant="outline" className="text-xs">
                              Read
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {!isRead && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="ml-4"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * notificationsPerPage) + 1} to {Math.min(currentPage * notificationsPerPage, filteredNotifications.length)} of {filteredNotifications.length} notifications
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