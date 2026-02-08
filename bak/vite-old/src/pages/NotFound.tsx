 import { useLocation, Link } from "react-router-dom";
 import { useEffect } from "react";
 import { Hexagon, ArrowLeft } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { ThemeToggle } from "@/components/ThemeToggle";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
     <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="border-b bg-background/80 backdrop-blur-md">
         <div className="container flex items-center justify-between h-16 px-4">
           <Link to="/" className="flex items-center gap-3">
             <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent">
               <Hexagon className="h-6 w-6 text-white" />
             </div>
             <span className="text-lg font-bold tracking-tight">ArchetypeOS</span>
           </Link>
           <ThemeToggle />
         </div>
       </header>
 
       {/* Content */}
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
         <div className="text-center space-y-6">
           <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted">
             <span className="text-4xl font-bold text-muted-foreground">404</span>
           </div>
           <div className="space-y-2">
             <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
             <p className="text-muted-foreground max-w-md mx-auto">
               Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
             </p>
           </div>
           <Button asChild>
             <Link to="/">
               <ArrowLeft className="h-4 w-4 mr-2" />
               Back to Home
             </Link>
           </Button>
         </div>
      </div>
    </div>
  );
};

export default NotFound;
