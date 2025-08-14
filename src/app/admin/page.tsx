"use client";

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApiClient } from '@/lib/authApi';
import { useAuthStore } from '@/store/auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Search, Home } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Todo {
  id: string;
  item: string;
  isDone: boolean;
  userId: string;
  user: {
    fullName: string;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [page, setPage] = useState(1);
  const [rows] = useState(10); 
  const [filterStatus, setFilterStatus] = useState<'all' | 'done' | 'undone'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && user && user.role !== 'ADMIN') {
      toast.error('Akses ditolak. Anda bukan admin.');
      router.push('/todo');
    }
  }, [user, router, isClient]);
  
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['adminTodos', page, filterStatus, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('rows', rows.toString());

      if (filterStatus !== 'all') {
        params.append('filters', JSON.stringify({ isDone: filterStatus === 'done' }));
      }
      if (searchTerm) {
        params.append('search', JSON.stringify({ item: searchTerm }));
      }
      
      const { data } = await authApiClient.get('/todos', { params }); 
      return data.content;
    },
    enabled: isClient && user?.role === 'ADMIN',
  });

  const todos: Todo[] = data?.entries || [];
  const totalPages = Math.ceil(data?.total / rows) || 1;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading || !isClient) return <div className="p-4">Loading...</div>;
  if (isError) return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 p-4 bg-white border-r">
        <h1 className="text-2xl font-bold mb-8">Nodewave</h1>
        <nav className="space-y-2">
          <Link href="/todo" passHref>
            <Button variant="ghost" className="w-full justify-start space-x-2">
              <Home className="h-4 w-4" />
              <span>To do</span>
            </Button>
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">To do</h2>
          <div className="flex items-center space-x-4">
            <span className="font-medium text-lg">{user?.fullName || 'Pengguna'}</span>
            <Button onClick={handleLogout}>Logout</Button>
          </div>
        </header>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Input 
              placeholder="Search" 
              className="w-64" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button><Search className="h-4 w-4" /></Button>
          </div>
          <div className="flex items-center space-x-2">
            <span>Filter by Status</span>
            <Select onValueChange={(value: 'all' | 'done' | 'undone') => setFilterStatus(value)} value={filterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="done">Success</SelectItem>
                <SelectItem value="undone">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>To do</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todos.map((todo) => (
                <TableRow key={todo.id}>
                  <TableCell>{todo.user?.fullName || 'N/A'}</TableCell>
                  <TableCell>{todo.item}</TableCell>
                  <TableCell>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        todo.isDone ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {todo.isDone ? 'Success' : 'Pending'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end items-center space-x-2 mt-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} 
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}