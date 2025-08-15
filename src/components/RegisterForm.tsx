"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/lib/authApi";
import { AxiosError } from "axios";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: '',
    about: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  
  const handleCountryChange = (value: string) => {
    setFormData({ ...formData, country: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Password dan konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const dataToSend = {
        fullName: fullName || formData.fullName,
        email: formData.email,
        password: formData.password,
      };

      await apiClient.post('/register', dataToSend);
      toast.success("Pendaftaran berhasil! Silakan login.");
      router.push('/login');
    } catch (error: unknown) { 
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Terjadi kesalahan saat pendaftaran.");
      } else {
        toast.error("Terjadi kesalahan yang tidak terduga.");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-[500px] shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Register</CardTitle>
        <CardDescription>Let&apos;s Sign up first for enter into Square Website. Uh She Up!</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <div className="space-y-2 flex-1">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="Soeraj" value={formData.firstName} onChange={handleChange} />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={formData.lastName} onChange={handleChange} />
            </div>
          </div>
          <div className="flex space-x-2">
            <div className="space-y-2 flex-1">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex">
                <span className="flex items-center rounded-l-md border border-r-0 border-input bg-background px-3 text-sm">
                  +62
                </span>
                <Input id="phone" type="tel" className="rounded-l-none" value={formData.phone} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="country">Your Country</Label>
              <Select onValueChange={handleCountryChange} value={formData.country}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indonesia">Indonesia</SelectItem>
                  <SelectItem value="malaysia">Malaysia</SelectItem>
                  <SelectItem value="singapore">Singapore</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Mail Address</Label>
            <div className="flex">
              <Input id="email" type="email" className="rounded-r-none" value={formData.email} onChange={handleChange} />
              <span className="flex items-center rounded-r-md border border-l-0 border-input bg-background px-3 text-sm">
                @squareteam.com
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <div className="space-y-2 flex-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={formData.password} onChange={handleChange} />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="about">Tell us about you</Label>
            <Textarea id="about" placeholder="Hello my name..." value={formData.about} onChange={handleChange} />
          </div>
          <div className="flex space-x-2 mt-6">
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button className="flex-1 bg-blue-600" type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Register'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}