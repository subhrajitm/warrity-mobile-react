import { LoginForm } from '@/components/auth/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Warrity',
  description: 'Log in to your Warrity account.',
};

export default function LoginPage() {
  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Pattern Background */}
      <div className="absolute inset-0 bg-background opacity-90 z-0"></div>
      <div className="absolute inset-0 z-0">
        {/* Animated background pattern similar to the provided SVG */}
        <div className="curved-line-container">
          <svg className="curved-line-svg w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* <path id="curvePath" d="M 0 50 Q 50 0 100 50" /> */}
              <path id="diagonalPath" d="M -20 120 L 120 -20" />
            </defs>
            
            {/* Curved lines with progressive animation */}
            <g className="curved-lines-group">
              {Array.from({ length: 8 }).map((_, i) => (
                <use 
                  key={`curve-${i}`} 
                  xlinkHref="#curvePath" 
                  className="animated-path" 
                  transform={`translate(0,${i * 2})`} 
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </g>
            
            {/* Diagonal lines with progressive animation */}
            <g className="diagonal-lines-group">
              {Array.from({ length: 8 }).map((_, i) => (
                <use 
                  key={`diagonal-${i}`} 
                  xlinkHref="#diagonalPath" 
                  className="animated-path" 
                  transform={`translate(${i * 2},0)`} 
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </g>
          </svg>
        </div>
        
        {/* Additional diagonal lines */}
        <div className="diagonal-lines">
          {Array.from({ length: 12 }).map((_, i) => (
            <div 
              key={i} 
              className="diagonal-line" 
              style={{ 
                top: `${5 + i * 8}%`, 
                transform: `rotate(${45}deg)`,
                opacity: 0.05 + (i * 0.01)
              }}
            />
          ))}
        </div>
        
        {/* Gradient overlays for vignette effect */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent to-background opacity-70"></div>
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-background to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent"></div>
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-background to-transparent"></div>
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-background to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="z-10 p-4 sm:p-8 flex flex-col items-start w-full max-w-5xl mx-auto">
        <div className="mb-6 sm:mb-10 relative self-start max-w-2xl flex">
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
