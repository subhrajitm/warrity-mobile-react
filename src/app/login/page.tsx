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

      {/* Download App Section */}
      <div className="absolute bottom-6 right-6 z-10 flex-col gap-1.5 hidden md:flex">
        <div className="text-xs font-medium text-primary mb-1 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
          Download our App
        </div>
        <div className="flex gap-2">
          {/* Play Store Button */}
          <a
            href="#"
            className="group flex items-center gap-1.5 px-3 py-1.5 bg-black/20 hover:bg-black/30 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
          >
            <svg className="w-4 h-4 text-primary group-hover:animate-bounce" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.609 1.814L13.792 12 3.609 22.186c-.2.2-.3.4-.3.7v.3c0 .3.1.5.3.7l.3.3c.2.2.4.3.7.3h.3c.3 0 .5-.1.7-.3L16.208 12 5.609 1.414c-.2-.2-.4-.3-.7-.3h-.3c-.3 0-.5.1-.7.3l-.3.3c-.2.2-.3.4-.3.7v.3c0 .3.1.5.3.7z"/>
            </svg>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground group-hover:text-primary/80 transition-colors">GET IT ON</span>
              <span className="text-xs font-medium group-hover:text-primary transition-colors">Google Play</span>
            </div>
          </a>

          {/* App Store Button */}
          <a
            href="#"
            className="group flex items-center gap-1.5 px-3 py-1.5 bg-black/20 hover:bg-black/30 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
          >
            <svg className="w-4 h-4 text-primary group-hover:animate-bounce" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground group-hover:text-primary/80 transition-colors">Download on the</span>
              <span className="text-xs font-medium group-hover:text-primary transition-colors">App Store</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
