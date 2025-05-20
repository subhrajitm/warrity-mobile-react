"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Eye, EyeOff, User, Mail, Lock, ArrowUpRight, ArrowLeft, Loader2, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await register(data);
      // Redirect is handled by AuthContext
    } catch (error) {
      // Error toast is handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm bg-gradient-to-b from-gray-900 to-gray-950 text-white rounded-lg border border-gray-800 shadow-xl overflow-hidden">
      {/* Decorative top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-lime-300 via-lime-400 to-lime-300"></div>
      
      <CardHeader className="space-y-1 p-4 pb-2">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-lime-300 animate-pulse"></div>
              <p className="text-xs font-medium text-lime-300">Create Account</p>
            </div>
            <h2 className="text-xl font-bold text-white">Join Warrity</h2>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <div className="relative">
                      <FormControl>
                        <Input 
                          placeholder="Username"
                          className="bg-gray-800/80 border-gray-700 text-white placeholder:text-gray-500 rounded-md h-10 pl-9 text-sm focus-visible:ring-lime-300 focus-visible:border-lime-300/50 transition-colors" 
                          {...field} 
                        />
                      </FormControl>
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <User className="h-4 w-4" />
                      </div>
                    </div>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="Email address"
                          className="bg-gray-800/80 border-gray-700 text-white placeholder:text-gray-500 rounded-md h-10 pl-9 text-sm focus-visible:ring-lime-300 focus-visible:border-lime-300/50 transition-colors" 
                          {...field} 
                        />
                      </FormControl>
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Mail className="h-4 w-4" />
                      </div>
                    </div>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="Create password"
                          className="bg-gray-800/80 border-gray-700 text-white placeholder:text-gray-500 rounded-md h-10 pl-9 pr-9 text-sm focus-visible:ring-lime-300 focus-visible:border-lime-300/50 transition-colors"
                          {...field} 
                        />
                      </FormControl>
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-400 hover:text-lime-300 hover:bg-transparent transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                      </Button>
                    </div>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-lime-300 to-lime-400 text-black hover:from-lime-400 hover:to-lime-500 rounded-md h-10 text-sm font-medium flex items-center justify-center gap-1.5 shadow-md shadow-lime-900/20 transition-all" 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Create Account
            </Button>
          </form>
        </Form>
        
        <div className="mt-5 pt-4 border-t border-gray-800/50">
          <div className="flex justify-center items-center text-xs">
            <Link 
              href="/login"
              className="text-gray-400 hover:text-lime-300 transition-colors flex items-center gap-1.5 group"
            >
              <div className="h-4 w-4 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                <ArrowLeft className="h-3 w-3 text-gray-500 group-hover:text-lime-300 transition-colors" />
              </div>
              <span>Already have an account? <span className="text-lime-300 font-medium">Sign in</span></span>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
