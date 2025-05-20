
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card'; // Removed CardDescription, CardFooter, CardTitle
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Eye, EyeOff, ArrowUpRight, ArrowRightCircle, Loader2, Mail, Lock, LogIn } from 'lucide-react';

const loginSchema = z.object({
  // To match the visual "username" but retain email functionality for the backend:
  // The field name remains 'email', but placeholder will be 'username'.
  // If actual username login is desired, this schema and backend would need to change.
  email: z.string().email({ message: "Please enter a valid email." }), // Assuming it's still an email for backend
  password: z.string().min(1, { message: "Password is required." }), // Min 1 to match image simplicity
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "", // Field is 'email'
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      // The auth context expects an 'email' field in the credentials object.
      await login({ email: data.email, password: data.password });
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
              <p className="text-xs font-medium text-lime-300">Secure Login</p>
            </div>
            <h2 className="text-xl font-bold text-white">Welcome back</h2>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="Email"
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
                          placeholder="Password"
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
                <LogIn className="h-4 w-4" />
              )}
              Sign in
            </Button>
          </form>
        </Form>
        
        <div className="mt-5 pt-4 border-t border-gray-800/50">
          <div className="flex justify-between items-center text-xs">
            <Link 
              href="/forgot-password"
              className="text-gray-400 hover:text-lime-300 transition-colors flex items-center gap-1 group"
            >
              <div className="h-4 w-4 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                <ArrowRightCircle className="h-2.5 w-2.5 text-gray-500 group-hover:text-lime-300 transition-colors" />
              </div>
              <span>Forgot password?</span>
            </Link>
            
            <Link 
              href="/register"
              className="text-lime-300 hover:text-lime-400 transition-colors flex items-center gap-1 group"
            >
              <span>Create account</span>
              <div className="h-4 w-4 rounded-full bg-lime-300/20 flex items-center justify-center group-hover:bg-lime-300/30 transition-colors">
                <ArrowUpRight className="h-2.5 w-2.5 text-lime-300 group-hover:text-lime-400 transition-colors" />
              </div>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
