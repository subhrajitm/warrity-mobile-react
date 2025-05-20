import { LoginForm } from '@/components/auth/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Warrity',
  description: 'Log in to your Warrity account.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Pattern Background */}
      <div className="absolute inset-0 bg-background opacity-90 z-0"></div>
      <div className="absolute inset-0 z-0">
        {/* Dot pattern */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: `radial-gradient(circle, rgba(22, 163, 74, 0.1) 1px, transparent 1px)`, 
          backgroundSize: '20px 20px' 
        }}></div>
        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-background to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="z-10 p-6 sm:p-8 flex flex-col items-start w-full max-w-5xl mx-auto">
        <div className="mb-10 relative self-start max-w-2xl flex">
          {/* Decorative element with inline styles for guaranteed visibility */}
          <div className="w-1.5 rounded-full mr-4 shadow-md" style={{ backgroundColor: 'hsl(var(--primary))' }}></div>
          
          {/* Main heading with creative left alignment */}
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight text-left">
            <div className="overflow-hidden">
              <span className="relative inline-block transform transition-transform duration-300 hover:-translate-y-1">
                <span className="relative z-10">Paperless</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-primary/20 -rotate-1"></span>
              </span>
            </div>
            <div className="mt-1">
              <span className="relative z-10">revolution for your</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary font-extrabold relative inline-block animate-pulse">digital</span>
              <span className="relative z-10">life.</span>
              <span className="inline-block w-6 h-1 bg-primary rounded-full ml-2 animate-bounce"></span>
            </div>
          </h1>
        </div>
        
        {/* Login form aligned to the left */}
        <div className="self-start w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
