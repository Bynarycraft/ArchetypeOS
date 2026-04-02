'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Clock, FileText, Video, BookOpen, ExternalLink, Users, AlertCircle } from 'lucide-react'
import { TabHelperCard } from '@/components/layout/tab-helper-card'
import { getYouTubeEmbedUrl, getYouTubeWatchUrl } from '@/lib/content-url'

interface Course {
  id: string
  title: string
  description: string | null
  difficulty: string
  contentUrl: string | null
  contentType: string | null
  duration: number | null
  roadmap?: { archetype: string }
  tests?: { id: string; title: string; type: string }[]
  _count?: { enrollments: number }
}

function getSourceMeta(resourceUrl: string) {
  try {
    const parsed = new URL(resourceUrl)
    return {
      hostname: parsed.hostname,
      pathname: parsed.pathname,
    }
  } catch {
    return null
  }
}

interface Enrollment {
  id: string
  status: string
  progress: number
}

interface TestResult {
  id: string
  score: number
  status: string
  submittedAt: string | null
  attemptNumber: number
  test: {
    id: string
    title: string
    passingScore: number
  }
}

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId

  const [course, setCourse] = useState<Course | null>(null)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [completedLessons, setCompletedLessons] = useState<number[]>([])

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/courses/${courseId}`)
        if (!res.ok) {
          if (res.status === 404) router.push('/404')
          return
        }
        const data = await res.json()
        setCourse(data)

        const enrollRes = await fetch(`/api/courses/${courseId}/enroll-status`)
        if (enrollRes.ok) {
          const enrollData = await enrollRes.json()
          setEnrollment(enrollData)
        }

        const resultsRes = await fetch(`/api/courses/${courseId}/test-results`)
        if (resultsRes.ok) {
          const resultsData = await resultsRes.json()
          setTestResults(resultsData)
        }
      } catch (err) {
        console.error('Error fetching course:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [courseId, router])

  useEffect(() => {
    if (!enrollment) return
    const lessonCount = 3
    const completed = Math.round((enrollment.progress / 100) * lessonCount)
    setCompletedLessons(Array.from({ length: completed }, (_, idx) => idx + 1))
  }, [enrollment])

  const handleStartCourse = async () => {
    setEnrolling(true)
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setEnrollment(data)
      }
    } catch (err) {
      console.error('Failed to enroll:', err)
    } finally {
      setEnrolling(false)
    }
  }

  const lessons = [
    { id: 1, title: 'Read course overview and objectives' },
    { id: 2, title: 'Study primary learning material' },
    { id: 3, title: 'Complete course assessment' },
  ]

  const handleMarkComplete = async () => {
    const allLessons = lessons.map((lesson) => lesson.id)
    setCompletedLessons(allLessons)

    try {
      const res = await fetch(`/api/courses/${courseId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: 100 }),
      })

      if (res.ok) {
        const updated = await res.json()
        setEnrollment(updated)
      } else {
        setEnrollment((prev) => prev ? { ...prev, progress: 100, status: 'completed' } : prev)
      }
    } catch (err) {
      console.error('Failed to mark course complete:', err)
      setEnrollment((prev) => prev ? { ...prev, progress: 100, status: 'completed' } : prev)
    }
  }

  const completedCount = lessons.filter((lesson) => completedLessons.includes(lesson.id)).length
  const calculatedProgress = Math.round((completedCount / lessons.length) * 100)

  const toggleLesson = async (lessonId: number) => {
    const nextCompleted = completedLessons.includes(lessonId)
      ? completedLessons.filter((id) => id !== lessonId)
      : [...completedLessons, lessonId]

    setCompletedLessons(nextCompleted)

    try {
      const progress = Math.round((nextCompleted.length / lessons.length) * 100)
      const res = await fetch(`/api/courses/${courseId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress }),
      })
      if (res.ok) {
        const updated = await res.json()
        setEnrollment(updated)
      }
    } catch (err) {
      console.error('Failed to update progress:', err)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  )

  if (!course) return <p className="p-4 text-red-500">Course not found</p>

  const youtubeEmbedUrl = course.contentUrl ? getYouTubeEmbedUrl(course.contentUrl) : null
  const youtubeWatchUrl = course.contentUrl ? getYouTubeWatchUrl(course.contentUrl) : null

  const isEnrolled = !!enrollment
  const isCompleted = enrollment?.status === 'completed'
  const difficulty = course.difficulty?.toLowerCase() || 'beginner'

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return { bg: 'bg-emerald-500/10', text: 'text-emerald-500' }
      case 'intermediate': return { bg: 'bg-amber-500/10', text: 'text-amber-500' }
      case 'advanced': return { bg: 'bg-rose-500/10', text: 'text-rose-500' }
      default: return { bg: 'bg-primary/10', text: 'text-primary' }
    }
  }

  const difficultyColor = getDifficultyColor(difficulty)
  const sourceMeta = course.contentUrl ? getSourceMeta(course.contentUrl) : null

  const renderSupportingAsset = () => {
    if (!course?.contentUrl) {
      return null
    }

    if (course.contentType === 'video' && youtubeEmbedUrl) {
      return (
        <div className="space-y-3">
          <div className="relative w-full pb-[56.25%] rounded-2xl overflow-hidden bg-black/10">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={youtubeEmbedUrl}
              title={course.title}
              allowFullScreen
            />
          </div>
          {youtubeWatchUrl ? (
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => window.open(youtubeWatchUrl, '_blank')} className="rounded-xl font-bold">
                <ExternalLink className="mr-2 h-4 w-4" /> Watch on YouTube
              </Button>
            </div>
          ) : null}
        </div>
      )
    }

    if (course.contentType === 'pdf' && course.contentUrl.startsWith('http')) {
      return (
        <div className="space-y-3">
          <div className="relative w-full rounded-2xl overflow-hidden border border-border/40 bg-background/40" style={{ height: '640px' }}>
            <iframe
              src={course.contentUrl}
              className="w-full h-full"
              title={course.title}
            />
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => window.open(course.contentUrl || '#', '_blank')} className="rounded-xl font-bold">
              <FileText className="mr-2 h-4 w-4" /> Open PDF in New Tab
            </Button>
          </div>
        </div>
      )
    }

    if (course.contentType === 'image' || /\.(png|jpg|jpeg|webp|gif)$/i.test(course.contentUrl)) {
      return (
        <div className="rounded-2xl overflow-hidden border border-border/40 bg-background/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={course.contentUrl} alt={course.title} className="w-full h-auto object-cover" />
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-border/40 bg-background/20 px-6 py-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h4 className="font-bold">Source material</h4>
            <p className="text-sm text-muted-foreground">This course links to an external resource. Click the button to open it.</p>
            {sourceMeta ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="rounded-full border-border/50 bg-background/40 px-3 py-1 font-semibold normal-case">
                  {sourceMeta.hostname}
                </Badge>
                {sourceMeta.pathname ? (
                  <span className="truncate max-w-[28rem]">{sourceMeta.pathname}</span>
                ) : null}
              </div>
            ) : null}
          </div>
          <Button onClick={() => window.open(course.contentUrl || '#', '_blank')} className="rounded-2xl font-bold shrink-0">
            <ExternalLink className="mr-2 h-4 w-4" /> Open Source
          </Button>
        </div>
      </div>
    )
  }

  const contentUrl = course.contentUrl || ''
  const isYouTube = contentUrl.includes('youtube') || contentUrl.includes('youtu.be')
  const embedUrl = contentUrl
    .replace('watch?v=', 'embed/')
    .replace('youtu.be/', 'youtube.com/embed/')

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Back Link */}
      <Link href="/courses" className="inline-flex items-center gap-3 text-sm font-bold text-muted-foreground hover:text-primary">
        ← Back to Knowledge Library
      </Link>

      {/* Header Section */}
      <TabHelperCard
        summary="This page explains one course in detail and lets learners complete lessons and assessments."
        points={[
          "Review the course description and available content assets.",
          "Mark lessons complete to update progress.",
          "Open linked assessments and submit attempts.",
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-none font-black tracking-widest px-3 py-1.5">ELITE MODULE</Badge>
            <Badge className={`${difficultyColor.bg} ${difficultyColor.text} text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full border-none`}>
              {course.difficulty?.toUpperCase() || 'STANDARD'}
            </Badge>
            {isCompleted && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 fill-current" />
                <span className="text-xs font-black">Completed</span>
              </div>
            )}
          </div>
          <h1 className="text-5xl font-black">{course.title}</h1>
          <p className="text-muted-foreground text-xl">{course.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-secondary/30 border border-white/5">
              <div className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Duration</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /><span className="text-lg font-bold">{course.duration || 'N/A'} min</span></div>
            </div>
            <div className="p-4 rounded-2xl bg-secondary/30 border border-white/5">
              <div className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Type</div>
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-blue-500" />
                <span className="text-lg font-bold">Video</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-secondary/30 border border-white/5">
              <div className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Enrolled</div>
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /><span className="text-lg font-bold">{course._count?.enrollments || 0}</span></div>
            </div>
          </div>
        </div>

        {/* Enrollment Card */}
        <Card className="border-none glass rounded-3xl overflow-hidden group h-fit sticky top-8 shadow-2xl shadow-primary/10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-50" />
          <CardContent className="pt-8 relative z-10 space-y-6">
            {!isEnrolled ? (
              <div className="space-y-2 text-center">
                <h3 className="text-lg font-black">Ready to Learn?</h3>
                <p className="text-sm text-muted-foreground">Enroll in this course to start your journey</p>
                <Button onClick={handleStartCourse} disabled={enrolling} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/30">
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-lg font-black">Your Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold">Completion</span>
                    <span className="font-black text-primary">{Math.max(enrollment.progress, calculatedProgress)}%</span>
                  </div>
                  <Progress value={Math.max(enrollment.progress, calculatedProgress)} className="h-3 rounded-full" />
                </div>
                <Badge className="bg-primary/20 text-primary border-none font-bold capitalize">{enrollment.status}</Badge>
                {enrollment.progress < 100 && (
                  <Button onClick={handleMarkComplete} variant="outline" className="w-full rounded-2xl font-bold">
                    Mark Content Complete
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Course Content */}
      <div className="space-y-8">
        <Card className="border-none glass rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border/10 p-8 pb-4">
            <h2 className="text-2xl font-black">Modules and Lessons</h2>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            {lessons.map((lesson) => {
              const isDone = completedLessons.includes(lesson.id)
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => toggleLesson(lesson.id)}
                  className="w-full rounded-2xl border border-border/50 bg-background/40 px-5 py-4 text-left hover:border-primary/40 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">{lesson.title}</div>
                    {isDone ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-none">Completed</Badge>
                    ) : (
                      <Badge variant="outline">Mark complete</Badge>
                    )}
                  </div>
                </button>
              )
            })}
          </CardContent>
        </Card>

          <Card className="border-none glass rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border/10 p-8 pb-4">
            <h2 className="text-2xl font-black">Course Content</h2>
          </CardHeader>
          <CardContent className="p-8">
            {course.contentUrl ? (
              <div className="space-y-4">
                {renderSupportingAsset() ?? (
                  <div className="p-8 rounded-2xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center text-center">
                    <div className="mb-4 p-4 rounded-full bg-primary/10">
                      <Video className="h-8 w-8 text-blue-500" />
                    </div>
                    <h4 className="font-bold mb-2">{course.contentType === 'pdf' ? 'PDF Document' : course.contentType === 'link' ? 'External Resource' : 'Learning Material'}</h4>
                    {(course.contentType === 'video' ? youtubeWatchUrl : course.contentUrl) && (
                      <Button onClick={() => window.open((course.contentType === 'video' ? youtubeWatchUrl : course.contentUrl) || '#', '_blank')} className="rounded-2xl font-bold">
                        Open Content
                      </Button>
                    )}
                  </div>
                )}
                <Button
                  onClick={() => window.open(contentUrl, '_blank', 'noopener,noreferrer')}
                  className="rounded-2xl font-bold"
                  disabled={!contentUrl}
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Open on YouTube
                </Button>
              </div>
            ) : (
              <div className="p-8 rounded-2xl border-2 border-dashed border-border/40 text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Content not yet available for this course.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {course.tests && course.tests.length > 0 && (
          <Card className="border-none glass rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border/10 p-8 pb-4">
              <h2 className="text-2xl font-black">Assessments</h2>
            </CardHeader>
            <CardContent className="p-8 space-y-3">
              {course.tests.map((test) => (
                <Link
                  key={test.id}
                  href={`/courses/${course.id}/test/${test.id}`}
                  className="flex items-center justify-between rounded-2xl border border-border/50 p-4 hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="font-semibold">{test.title}</span>
                  <span className="inline-flex items-center text-sm font-medium text-primary">
                    Start <ExternalLink className="ml-2 h-4 w-4" />
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
