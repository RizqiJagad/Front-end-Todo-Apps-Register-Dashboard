"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiClient } from '@/lib/authApi';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from 'next/link';
import { AxiosError } from 'axios'; 

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiClient.post('/login', formData);
      const { token, user } = response.data.content;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setToken(token);
      setUser(user);

      toast.success("Login berhasil!");

      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/todo');
      }

    } catch (error) { 
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Email atau password salah.");
      } else {
        toast.error("Terjadi kesalahan yang tidak terduga.");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-[400px] shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        <CardDescription>Just sign in if you have an account in here. Enjoy our Website</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Your Email / Username</Label>
            <Input id="email" type="email" placeholder="soeraj@squareteam.com" value={formData.email} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Enter Password</Label>
            <Input id="password" type="password" value={formData.password} onChange={handleChange} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember-me" />
              <Label htmlFor="remember-me">Remember Me</Label>
            </div>
            <Link href="/forgot-password" className="text-blue-500 hover:underline">
              Forgot Password
            </Link>
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Login'}
          </Button>
          <div className="text-center text-sm mt-4">
            <Link href="/register" className="text-blue-500 hover:underline">
              Already have an account? Sign Up
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}