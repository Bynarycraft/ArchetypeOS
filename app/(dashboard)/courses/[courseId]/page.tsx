"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
    PlayCircle,
    CheckCircle2,
    ArrowLeft,
    Clock,
    FileText,
    Star,
    Award,
    ExternalLink
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Course {
    id: string;
    title: string;
    description: string | null;
    difficulty: string;
    contentUrl: string | null;
    contentType: string | null;
    roadmap: {
        archetype: string;
    } | null;
    tests: { id: string; title: string }[];
}

interface Enrollment {
    id: string;
    status: string;
    progressPercent: number;
}

export default function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = use(params);
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCourse() {
            try {
                const res = await fetch(`/api/courses/${courseId}`);
                if (!res.ok) {
                    if (res.status === 404) router.push("/404");
                    return;
                }
                const data = await res.json();
                setCourse(data);

                // Fetch enrollment status
                const enrollRes = await fetch(`/api/courses/${courseId}/enroll-status`);
                if (enrollRes.ok) {
                    const enrollData = await enrollRes.json();
                    setEnrollment(enrollData);
                }
            } catch (error) {
                console.error("Failed to fetch course:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCourse();
    }, [courseId, router]);

    const handleStartCourse = async () => {
        try {
            const res = await fetch(`/api/courses/${courseId}/enroll`, {
                method: "POST",
            });
            if (res.ok) {
                const data = await res.json();
                setEnrollment(data);
                if (course?.contentUrl) {
                    window.open(course.contentUrl, "_blank");
                }
            }
        } catch (error) {
            console.error("Failed to start course:", error);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
    if (!course) return null;

    const isEnrolled = !!enrollment;
    const isCompleted = enrollment?.status === "completed";

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Navigation & Header */}
            <div className="flex flex-col gap-6">
                <Link href="/courses" className="inline-flex items-center gap-3 text-sm font-bold text-muted-foreground hover:text-primary transition-all group w-fit">
                    <div className="p-2 rounded-lg bg-secondary/50 group-hover:bg-primary/10 group-hover:-translate-x-1 transition-all">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                    Back to Knowledge Library
                </Link>
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-border/10">
                    <div className="space-y-4 max-w-3xl">
                        <div className="flex items-center gap-4">
                            <Badge className="bg-primary/10 text-primary border-none font-black tracking-widest px-3 py-1">ELITE MODULE</Badge>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 border border-yellow-500/10">
                                <Star className="h-3.5 w-3.5 fill-current" />
                                <span className="text-xs font-black">4.9 Master Rating</span>
                            </div>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-gradient leading-tight">{course.title}</h1>
                        <p className="text-muted-foreground text-xl font-medium leading-relaxed">{course.description}</p>
                    </div>
                    <Card className="shrink-0 border-none glass shadow-2xl shadow-primary/10 lg:w-72 overflow-hidden group/resume">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-50" />
                        <CardContent className="pt-8 relative z-10">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Duration</span>
                                    <span className="text-sm font-black flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> 4h 30m</span>
                                </div>
                                <div className="flex items-center justify-between pb-4 border-b border-border/10">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Complexity</span>
                                    <span className={`text-sm font-black flex items-center gap-2 ${course.difficulty === 'ADVANCED' ? 'text-red-500' :
                                        course.difficulty === 'INTERMEDIATE' ? 'text-amber-500' : 'text-emerald-500'
                                        }`}>
                                        <Award className="h-4 w-4" /> {course.difficulty}
                                    </span>
                                </div>
                                <Button
                                    onClick={handleStartCourse}
                                    className="w-full h-12 font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 group-hover/resume:scale-[1.02] active:scale-95 transition-all mt-2"
                                >
                                    {isCompleted ? "Review Lab" : isEnrolled ? "Resume Learning" : "Begin Module"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid gap-10 lg:grid-cols-12">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Video Player / Resource Preview */}
                    <div className="aspect-video rounded-[3rem] bg-black overflow-hidden relative group shadow-3xl border border-white/5 ring-1 ring-white/10">
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                <div onClick={handleStartCourse} className="p-8 rounded-full bg-primary/10 backdrop-blur-2xl mb-6 group-hover:scale-110 transition-all duration-500 cursor-pointer border border-primary/30 relative z-10 shadow-2xl">
                                    <PlayCircle className="h-20 w-20 text-primary fill-primary/10" />
                                </div>
                            </div>
                            <div className="text-center px-10 relative z-10">
                                <h3 className="text-white font-black text-2xl mb-3 tracking-tight">Archetype Knowledge Base</h3>
                                <p className="text-white/50 text-base max-w-sm font-medium leading-relaxed">Unlock the elite strategies of highly successful <strong>{course.roadmap?.archetype}s</strong>.</p>
                            </div>
                        </div>
                        <div className="absolute top-8 left-8 flex gap-3">
                            <Badge className="bg-red-600 text-white font-black border-none px-3 py-1 text-[10px] tracking-widest">LIVE PREVIEW</Badge>
                            <Badge className="glass text-white border-white/10 font-black uppercase text-[10px] px-3 py-1 tracking-widest">{course.contentType}</Badge>
                        </div>
                    </div>

                    <div className="space-y-8 glass-card p-10 rounded-[3rem]">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black tracking-tight">Module 1: Foundational Principles</h2>
                                <p className="text-primary font-bold text-sm tracking-widest uppercase">Chapter 1.0 • Introduction</p>
                            </div>
                            <Button
                                onClick={handleStartCourse}
                                variant="default"
                                className="h-12 px-8 font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30 bg-primary hover:bg-primary/90 text-primary-foreground group transition-all"
                            >
                                <ExternalLink className="mr-3 h-5 w-5 group-hover:rotate-45 transition-transform" /> {isEnrolled ? "Launch Lab" : "Unlock Lab"}
                            </Button>
                        </div>
                        <div className="prose prose-invert max-w-none text-muted-foreground/90 leading-loose text-lg font-medium">
                            <p>
                                Welcome to the first module of <strong>{course.title}</strong>. This content has been curated from top-tier industry sources to provide you with the most effective learning path for your professional growth.
                            </p>
                            <div className="grid md:grid-cols-2 gap-8 mt-10 not-prose">
                                {
                                    [
                                        { title: "Archetype DNA", desc: "Understanding the core psychological and technical patterns of the elite." },
                                        { title: "Strategic Precision", desc: "Application of resource-specific methodologies and frameworks." },
                                        { title: "Infinite Scalability", desc: "High-performance execution design for complex global systems." },
                                        { title: "Feedback Loops", desc: "Mastering the metrics and iterative growth cycles of the field." }
                                    ].map((obj, i) => (
                                        <div key={i} className="flex gap-4 p-4 rounded-2xl bg-secondary/30 border border-white/5">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary font-black text-xs">{i + 1}</div>
                                            <div>
                                                <h4 className="font-bold text-foreground text-sm">{obj.title}</h4>
                                                <p className="text-xs mt-1 leading-relaxed">{obj.desc}</p>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-secondary/40 to-transparent border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all duration-500 shadow-xl">
                            <div className="flex items-center gap-6">
                                <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                                    <FileText className="h-8 w-8" />
                                </div>
                                <div>
                                    <h4 className="font-black text-base text-foreground uppercase tracking-tight">The Master Handbook</h4>
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">PDF Extension • Final Version</p>
                                </div>
                            </div>
                            <Button variant="outline" className="h-12 px-6 font-black uppercase text-xs tracking-widest border-primary/20 text-primary hover:bg-primary/10 transition-all active:scale-95 shadow-sm">
                                View PDF
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Lessons List */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="border-none shadow-2xl glass-card rounded-[3rem] sticky top-10 overflow-hidden">
                        <CardHeader className="border-b border-border/10 bg-muted/30 p-8">
                            <CardTitle className="text-xl font-black uppercase tracking-tight">Course Journey</CardTitle>
                            <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary mt-1">8 Units • 4h 32m Complete</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/10">
                                {[
                                    { title: "Introduction to Archetypes", duration: "12m", active: true, done: true },
                                    { title: "Strategic Visioning", duration: "45m", active: false, done: true },
                                    { title: "The Execution Engine", duration: "1h 05m", active: false, done: false },
                                    { title: "Resource Optimization", duration: "38m", active: false, done: false },
                                    { title: "Scaling Your Impact", duration: "52m", active: false, done: false },
                                ].map((lesson, i) => (
                                    <div key={i} className={`p-6 flex items-center justify-between hover:bg-primary/5 transition-all cursor-pointer group ${lesson.active ? 'bg-primary/5 border-l-4 border-primary' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            {lesson.done ? (
                                                <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-500">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                            ) : (
                                                <div className={`p-1 rounded-full ${lesson.active ? 'bg-primary/20 text-primary' : 'bg-muted/40 text-muted-foreground'}`}>
                                                    <PlayCircle className="h-4 w-4" />
                                                </div>
                                            )}
                                            <span className={`text-sm font-black tracking-tight ${lesson.active ? 'text-primary' : ''}`}>{lesson.title}</span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-black tracking-widest">{lesson.duration}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="p-8 bg-muted/10 border-t border-border/10">
                                <Link href={course.tests[0] ? `/courses/${courseId}/test/${course.tests[0].id}` : "#"}>
                                    <Button className="w-full py-6 font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95" variant="outline">
                                        Final Assessment
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-accent/10 p-1 rounded-[3rem] overflow-hidden group">
                        <div className="bg-card rounded-[calc(3rem-4px)] p-8 text-center space-y-4">
                            <Award className="h-10 w-10 text-accent mx-auto animate-float" />
                            <h4 className="font-black text-lg tracking-tight">Earn Your Certificate</h4>
                            <p className="text-xs text-muted-foreground font-medium px-4">Complete all modules and pass the final exam to get recognized for your mastery.</p>
                            <Button variant="secondary" className="w-full font-black text-xs uppercase tracking-tighter" disabled>Locked</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Client-side helper components
function CardHeader({ className, children }: { className?: string, children: React.ReactNode }) {
    return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
}

function CardTitle({ className, children }: { className?: string, children: React.ReactNode }) {
    return <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
}

function CardDescription({ className, children }: { className?: string, children: React.ReactNode }) {
    return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>;
}
