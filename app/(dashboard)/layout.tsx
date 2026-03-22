import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="md:flex min-h-screen bg-background/95 selection:bg-primary/10">
            <Sidebar />
            <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-10 relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -z-10 w-[320px] h-[320px] md:w-[500px] md:h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 -z-10 w-[220px] h-[220px] md:w-[300px] md:h-[300px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-6xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
