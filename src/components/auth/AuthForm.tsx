import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
 import { Loader2, AlertCircle, CheckCircle, Mail, Lock, User } from 'lucide-react';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
}

export function AuthForm({ mode, onModeChange }: AuthFormProps) {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Validate inputs
      const validation = authSchema.safeParse({
        email,
        password,
        fullName: mode === 'signup' ? fullName : undefined,
      });

      if (!validation.success) {
        setError(validation.error.errors[0].message);
        setLoading(false);
        return;
      }

      if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('An account with this email already exists. Please sign in instead.');
          } else {
            setError(error.message);
          }
        } else {
          setSuccess('Account created! Please check your email to verify your account before signing in.');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            setError('Invalid email or password. Please try again.');
          } else if (error.message.includes('Email not confirmed')) {
            setError('Please verify your email before signing in. Check your inbox for a confirmation link.');
          } else {
            setError(error.message);
          }
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
     <form onSubmit={handleSubmit} className="space-y-5">
       {error && (
         <Alert variant="destructive" className="animate-fade-in">
           <AlertCircle className="h-4 w-4" />
           <AlertDescription>{error}</AlertDescription>
         </Alert>
       )}
       
       {success && (
         <Alert className="border-success bg-success/10 text-success animate-fade-in">
           <CheckCircle className="h-4 w-4" />
           <AlertDescription>{success}</AlertDescription>
         </Alert>
       )}

       {mode === 'signup' && (
         <div className="space-y-2">
           <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
           <div className="relative">
             <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
               className="pl-10"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
         </div>
       )}

       <div className="space-y-2">
         <Label htmlFor="email" className="text-sm font-medium">Email</Label>
         <div className="relative">
           <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
             className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
       </div>

       <div className="space-y-2">
         <Label htmlFor="password" className="text-sm font-medium">Password</Label>
         <div className="relative">
           <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
             className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
       </div>

       <Button type="submit" className="w-full h-11 font-medium" disabled={loading}>
         {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
         {mode === 'signin' ? 'Sign In' : 'Create Account'}
       </Button>

       <div className="relative">
         <div className="absolute inset-0 flex items-center">
           <span className="w-full border-t" />
         </div>
         <div className="relative flex justify-center text-xs uppercase">
           <span className="bg-background px-2 text-muted-foreground">
             {mode === 'signin' ? 'New to ArchetypeOS?' : 'Already have an account?'}
           </span>
         </div>
       </div>
 
       <Button
         type="button"
         variant="outline"
         className="w-full h-11"
         onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
       >
         {mode === 'signin' ? 'Create an account' : 'Sign in instead'}
       </Button>
     </form>
  );
}
