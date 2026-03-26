"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { TabHelperCard } from "@/components/layout/tab-helper-card";
import { getYouTubeEmbedUrl } from "@/lib/content-url";

export default function NewCoursePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        difficulty: "beginner",
        contentType: "video",
        contentUrl: "",
        content: "",
        duration: "",
    });
    const [videoValidationStatus, setVideoValidationStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
    const [videoValidationMessage, setVideoValidationMessage] = useState<string>("");

    const requiresContentUrl = formData.contentType !== "text";
    const contentUrlLabel = formData.contentType === "video" ? "YouTube URL *" : "Content URL";
    const contentUrlPlaceholder = formData.contentType === "video"
        ? "https://www.youtube.com/watch?v=..."
        : "https://example.com/resource";

    useEffect(() => {
        let canceled = false;

        if (formData.contentType !== "video") {
            setVideoValidationStatus("idle");
            setVideoValidationMessage("");
            return;
        }

        const trimmedUrl = formData.contentUrl.trim();
        if (!trimmedUrl) {
            setVideoValidationStatus("idle");
            setVideoValidationMessage("");
            return;
        }

        if (!getYouTubeEmbedUrl(trimmedUrl)) {
            setVideoValidationStatus("invalid");
            setVideoValidationMessage("Use a valid YouTube watch or short link.");
            return;
        }

        setVideoValidationStatus("checking");
        setVideoValidationMessage("Checking video availability...");

        const timer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/courses/validate-video?url=${encodeURIComponent(trimmedUrl)}`, {
                    cache: "no-store",
                });
                const data = await response.json().catch(() => ({}));

                if (canceled) return;

                if (!response.ok || !data?.isAvailable) {
                    setVideoValidationStatus("invalid");
                    setVideoValidationMessage(data?.error || "This YouTube video is unavailable.");
                    return;
                }

                setVideoValidationStatus("valid");
                setVideoValidationMessage("Video is available.");
            } catch (_error) {
                if (canceled) return;
                setVideoValidationStatus("invalid");
                setVideoValidationMessage("Could not verify video right now. Try again.");
            }
        }, 450);

        return () => {
            canceled = true;
            clearTimeout(timer);
        };
    }, [formData.contentType, formData.contentUrl]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        }

        if (status === "authenticated" && session?.user?.role !== "admin") {
            router.push("/dashboard");
        }
    }, [status, session, router]);

    if (status === "loading") {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const authReady = status === "authenticated" && session?.user?.role === "admin";

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSubmitError(null);

        if (formData.contentType === "video" && formData.contentUrl && !getYouTubeEmbedUrl(formData.contentUrl)) {
            setSubmitError("Use a valid YouTube link for video courses. Supported formats include youtube.com/watch and youtu.be links.");
            setLoading(false);
            return;
        }

        if (formData.contentType === "video" && formData.contentUrl.trim() && videoValidationStatus !== "valid") {
            setSubmitError("Use a public, reachable YouTube video before creating the course.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    content: formData.contentType === "text" ? formData.content : undefined,
                    duration: formData.duration ? parseInt(formData.duration) : null,
                }),
            });

            if (res.ok) {
                await res.json();
                router.push("/admin/courses");
            } else {
                const data = await res.json().catch(() => ({ error: "Failed to create course" }));
                setSubmitError(data.error || "Failed to create course");
            }
        } catch (error) {
            console.error("Error creating course:", error);
            setSubmitError("Error creating course");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {!authReady && (
                <div className="flex min-h-[40vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            )}

            {authReady && (
                <>
            {/* Navigation */}
            <Link
                href="/admin/courses"
                className="inline-flex items-center gap-3 text-sm font-bold text-muted-foreground hover:text-primary transition-all group w-fit"
            >
                <div className="p-2 rounded-lg bg-secondary/50 group-hover:bg-primary/10 group-hover:-translate-x-1 transition-all">
                    <ArrowLeft className="h-4 w-4" />
                </div>
                Back to Courses
            </Link>

            {/* Header */}
            <div className="pb-8 border-b border-border/10">
                <h1 className="text-5xl font-black tracking-tight text-gradient">
                    Create New Course
                </h1>
                <p className="text-muted-foreground mt-2 text-xl font-medium">
                    Add a new course to your learning library. Fill in the details below.
                </p>
            </div>

            <TabHelperCard
                summary="This tab creates new course entries that appear in the learner and admin course views."
                points={[
                    "Define title, difficulty, and content type.",
                    "Provide links or references for learning materials.",
                    "Save course data for immediate catalog availability.",
                ]}
            />

            {/* Form */}
            <Card className="border-none glass-card rounded-3xl shadow-2xl shadow-primary/5 max-w-3xl">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-2xl font-black">Course Details</CardTitle>
                    <CardDescription>
                        Provide comprehensive information about your course
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {submitError ? (
                            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-600">
                                {submitError}
                            </div>
                        ) : null}

                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-bold">
                                Course Title *
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="e.g., Advanced System Design"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="rounded-xl h-10 border-border/40 focus:border-primary"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-bold">
                                Course Description
                            </Label>
                            <textarea
                                id="description"
                                name="description"
                                placeholder="Describe the course content, learning outcomes, and what students will learn..."
                                value={formData.description}
                                onChange={handleChange}
                                rows={5}
                                className="w-full rounded-xl border border-border/40 px-4 py-3 text-sm bg-background/50 focus:outline-none focus:border-primary transition-colors resize-none"
                            />
                        </div>

                        {/* Difficulty */}
                        <div className="space-y-2">
                            <Label htmlFor="difficulty" className="text-sm font-bold">
                                Difficulty Level *
                            </Label>
                            <Select
                                value={formData.difficulty}
                                onValueChange={(value) =>
                                    handleSelectChange("difficulty", value)
                                }
                            >
                                <SelectTrigger className="rounded-xl h-10 border-border/40 focus:border-primary">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="beginner">Beginner</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="advanced">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Content Type */}
                        <div className="space-y-2">
                            <Label htmlFor="contentType" className="text-sm font-bold">
                                Content Type *
                            </Label>
                            <Select
                                value={formData.contentType}
                                onValueChange={(value) =>
                                    handleSelectChange("contentType", value)
                                }
                            >
                                <SelectTrigger className="rounded-xl h-10 border-border/40 focus:border-primary">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="image">Image</SelectItem>
                                    <SelectItem value="pdf">PDF Document</SelectItem>
                                    <SelectItem value="link">External Link</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Content URL */}
                        <div className="space-y-2">
                            <Label htmlFor="contentUrl" className="text-sm font-bold">
                                {contentUrlLabel}
                            </Label>
                            <Input
                                id="contentUrl"
                                name="contentUrl"
                                placeholder={contentUrlPlaceholder}
                                value={formData.contentUrl}
                                onChange={handleChange}
                                required={requiresContentUrl}
                                className="rounded-xl h-10 border-border/40 focus:border-primary"
                            />
                            {formData.contentType === "video" ? (
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Paste a YouTube watch link or short link, such as https://www.youtube.com/watch?v=... or https://youtu.be/....
                                    </p>
                                    {videoValidationStatus !== "idle" ? (
                                        <p className={`text-xs font-medium ${videoValidationStatus === "valid" ? "text-emerald-600" : videoValidationStatus === "checking" ? "text-amber-600" : "text-rose-600"}`}>
                                            {videoValidationStatus === "checking" ? (
                                                <span className="inline-flex items-center gap-1">
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    {videoValidationMessage}
                                                </span>
                                            ) : videoValidationMessage}
                                        </p>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>

                        {/* Inline Text Content */}
                        {formData.contentType === "text" ? (
                            <div className="space-y-2">
                                <Label htmlFor="content" className="text-sm font-bold">
                                    Course Text Content
                                </Label>
                                <textarea
                                    id="content"
                                    name="content"
                                    placeholder="Write the full course content here. Use # Heading, ## Subheading, and plain paragraphs for structure..."
                                    value={formData.content}
                                    onChange={handleChange}
                                    rows={14}
                                    className="w-full rounded-xl border border-border/40 px-4 py-3 text-sm bg-background/50 focus:outline-none focus:border-primary transition-colors resize-y"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Use # for main heading, ## for section headings, and blank lines to separate paragraphs. This content is rendered inline for learners.
                                </p>
                            </div>
                        ) : null}

                        {/* Duration */}
                        <div className="space-y-2">
                            <Label htmlFor="duration" className="text-sm font-bold">
                                Duration (minutes)
                            </Label>
                            <Input
                                id="duration"
                                name="duration"
                                type="number"
                                placeholder="e.g., 120"
                                value={formData.duration}
                                onChange={handleChange}
                                className="rounded-xl h-10 border-border/40 focus:border-primary"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-6 border-t border-border/10">
                            <Link href="/admin/courses" className="flex-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full rounded-xl font-bold"
                                >
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={loading || !formData.title || videoValidationStatus === "checking" || (formData.contentType === "video" && !!formData.contentUrl.trim() && videoValidationStatus === "invalid")}
                                className="flex-1 rounded-xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 font-bold text-primary-foreground"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Course"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
                </>
            )}
        </div>
    );
}
