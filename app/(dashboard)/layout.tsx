import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-background/95 selection:bg-primary/10">
            <Sidebar />
            <main className="flex-1 overflow-y-auto px-8 py-10 relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 -z-10 w-[300px] h-[300px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
