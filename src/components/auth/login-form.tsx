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
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  // To match the visual "username" but retain email functionality for the backend:
  // The field name remains 'email', but placeholder will be 'username'.
  // If actual username login is desired, this schema and backend would need to change.
  email: z.string().email({ message: "Please enter a valid email." }), // Assuming it's still an email for backend
  password: z.string().min(1, { message: "Password is required." }), // Min 1 to match image simplicity
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login, loginWithGoogle, loginWithApple } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
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

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      // Error toast is handled by AuthContext
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsAppleLoading(true);
    try {
      await loginWithApple();
    } catch (error) {
      // Error toast is handled by AuthContext
    } finally {
      setIsAppleLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm bg-gradient-to-b from-gray-900 to-gray-950 text-white rounded-lg border border-gray-800 shadow-xl overflow-hidden">
      {/* Decorative top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-lime-300 via-lime-400 to-lime-300"></div>
      
      <CardHeader className="space-y-1 p-3 pb-2 sm:p-4 sm:pb-2">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-lime-300 animate-pulse"></div>
              <p className="text-xs font-medium text-lime-300">Secure Login</p>
            </div>
            <h2 className="text-xl font-bold text-white">Welcome back</h2>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1 sm:p-4 sm:pt-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-2 sm:space-y-3">
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

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full bg-gray-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-gray-900 px-2 text-gray-400">or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full bg-white hover:bg-gray-100 text-gray-900 border-gray-200 hover:border-gray-300 rounded-md h-10 text-sm font-medium flex items-center justify-center gap-2 transition-all"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full bg-black hover:bg-gray-900 text-white border-gray-800 hover:border-gray-700 rounded-md h-10 text-sm font-medium flex items-center justify-center gap-2 transition-all"
            onClick={handleAppleLogin}
            disabled={isAppleLoading}
          >
            {isAppleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.41-1.09-.47-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.41C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.89 3.51-.84 1.54.07 2.7.61 3.44 1.57-3.14 1.88-2.29 5.13.22 6.41-.65 1.29-1.51 2.58-2.25 4.05zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            )}
            Apple
          </Button>
        </div>
        
        <div className="mt-3 pt-3 sm:mt-5 sm:pt-4 border-t border-gray-800/50">
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
