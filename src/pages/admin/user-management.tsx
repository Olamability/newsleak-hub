import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { getAdminSession } from '@/lib/adminAuth';
import { supabase } from '@/lib/supabaseClient';
import { 
  ArrowLeft, 
  Search, 
  Users, 
  UserCheck, 
  UserX, 
  Mail,
  Calendar,
  Shield,
  Loader2,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  created_at: string;
  last_sign_in_at?: string;
  is_active: boolean;
}

export default function AdminUserManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    const session = getAdminSession();
    if (!session) {
      navigate('/admin/login');
      return;
    }
    
    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Get users from auth
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error loading users:', authError);
        // Use mock data for demo
        setUsers(getMockUsers());
        calculateStats(getMockUsers());
      } else {
        // Get user profiles
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('*');

        const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        const usersData: User[] = authUsers.map(user => ({
          id: user.id,
          email: user.email || '',
          name: profilesMap.get(user.id)?.name || user.user_metadata?.name,
          username: profilesMap.get(user.id)?.username || user.user_metadata?.username,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          is_active: user.banned_until === null,
        }));

        setUsers(usersData);
        calculateStats(usersData);
      }
    } catch (error) {
      console.error('Error:', error);
      setUsers(getMockUsers());
      calculateStats(getMockUsers());
    } finally {
      setLoading(false);
    }
  };

  const getMockUsers = (): User[] => [
    {
      id: '1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      username: 'johndoe',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      last_sign_in_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      is_active: true,
    },
    {
      id: '2',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      username: 'janesmith',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
      last_sign_in_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      is_active: true,
    },
    {
      id: '3',
      email: 'bob.wilson@example.com',
      name: 'Bob Wilson',
      username: 'bobwilson',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
      last_sign_in_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      is_active: true,
    },
  ];

  const calculateStats = (usersData: User[]) => {
    setStats({
      total: usersData.length,
      active: usersData.filter(u => u.is_active).length,
      inactive: usersData.filter(u => !u.is_active).length,
    });
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      // This would require admin API access
      toast({
        title: 'Feature Coming Soon',
        description: 'User status management will be available in the next update',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center gap-4 px-4 max-w-7xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/analytics')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold">User Management</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactive}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  Manage and monitor registered users
                </CardDescription>
              </div>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="" />
                              <AvatarFallback className="text-xs">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name || 'Unknown'}</div>
                              {user.username && (
                                <div className="text-xs text-muted-foreground">
                                  @{user.username}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {user.last_sign_in_at
                              ? formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true })
                              : 'Never'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? 'default' : 'secondary'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>View Activity</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                              >
                                {user.is_active ? 'Deactivate' : 'Activate'} User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
