import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/auth/AuthForm';
 import { Hexagon, Sparkles, Shield, TrendingUp } from 'lucide-react';
 import { ThemeToggle } from '@/components/ThemeToggle';

export default function Auth() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    if (!loading && user && role) {
      // Redirect based on role
      if (role === 'candidate') {
        navigate('/candidate', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, role, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-soft">
          <Hexagon className="h-12 w-12 text-accent" />
        </div>
      </div>
    );
  }

  return (
     <div className="min-h-screen flex">
       {/* Left Panel - Branding */}
       <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/95 to-accent relative overflow-hidden">
         {/* Background Pattern */}
         <div className="absolute inset-0 opacity-10">
           <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
           <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
 
         <div className="relative z-10 flex flex-col justify-between p-12 text-white">
           {/* Logo */}
           <div className="flex items-center gap-3">
             <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
               <Hexagon className="h-8 w-8" />
             </div>
             <span className="text-2xl font-bold">ArchetypeOS</span>
           </div>
 
           {/* Main Content */}
           <div className="space-y-8">
             <div className="space-y-4">
               <h1 className="text-4xl font-bold leading-tight">
                 Unlock Your
                 <br />
                 Learning Potential
               </h1>
               <p className="text-lg text-white/80 max-w-md">
                 Discover your unique archetype, build in-demand skills, and track your journey to mastery.
               </p>
             </div>
 
             {/* Feature List */}
             <div className="space-y-4">
               <div className="flex items-center gap-4">
                 <div className="p-2 bg-white/10 rounded-lg">
                   <Sparkles className="h-5 w-5" />
                 </div>
                 <div>
                   <p className="font-medium">Personalized Roadmaps</p>
                   <p className="text-sm text-white/60">Tailored learning paths for your archetype</p>
                 </div>
               </div>
               <div className="flex items-center gap-4">
                 <div className="p-2 bg-white/10 rounded-lg">
                   <TrendingUp className="h-5 w-5" />
                 </div>
                 <div>
                   <p className="font-medium">Progress Analytics</p>
                   <p className="text-sm text-white/60">Visual insights into your growth</p>
                 </div>
               </div>
               <div className="flex items-center gap-4">
                 <div className="p-2 bg-white/10 rounded-lg">
                   <Shield className="h-5 w-5" />
                 </div>
                 <div>
                   <p className="font-medium">Skill Certification</p>
                   <p className="text-sm text-white/60">Validate your expertise with tests</p>
                 </div>
               </div>
             </div>
           </div>
 
           {/* Footer */}
           <p className="text-sm text-white/50">
             © {new Date().getFullYear()} ArchetypeOS. All rights reserved.
           </p>
         </div>
       </div>
 
       {/* Right Panel - Auth Form */}
       <div className="flex-1 flex flex-col bg-background">
         {/* Header */}
         <header className="flex items-center justify-between p-6">
           <div className="flex items-center gap-2 lg:hidden">
             <Hexagon className="h-7 w-7 text-accent" />
             <span className="text-lg font-bold">ArchetypeOS</span>
           </div>
           <div className="lg:ml-auto">
             <ThemeToggle />
           </div>
         </header>

         {/* Main Content */}
         <main className="flex-1 flex items-center justify-center px-6 py-8">
           <div className="w-full max-w-sm space-y-8">
             <div className="text-center space-y-2">
               <h2 className="text-2xl font-bold tracking-tight">
                 {mode === 'signin' ? 'Welcome back' : 'Create your account'}
               </h2>
               <p className="text-sm text-muted-foreground">
                 {mode === 'signin' 
                   ? 'Sign in to continue your learning journey' 
                   : 'Start your personalized learning experience'}
               </p>
             </div>
 
             <AuthForm mode={mode} onModeChange={setMode} />
 
             <p className="text-xs text-center text-muted-foreground">
               By continuing, you agree to our Terms of Service and Privacy Policy.
             </p>
          </div>
         </main>

         {/* Mobile Footer */}
         <footer className="p-6 text-center text-sm text-muted-foreground lg:hidden">
           © {new Date().getFullYear()} ArchetypeOS
         </footer>
       </div>
    </div>
  );
}
