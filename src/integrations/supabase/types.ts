export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      Account: {
        Row: {
          access_token: string | null
          expires_at: number | null
          id: string
          id_token: string | null
          provider: string
          providerAccountId: string
          refresh_token: string | null
          scope: string | null
          session_state: string | null
          token_type: string | null
          type: string
          userId: string
        }
        Insert: {
          access_token?: string | null
          expires_at?: number | null
          id: string
          id_token?: string | null
          provider: string
          providerAccountId: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type: string
          userId: string
        }
        Update: {
          access_token?: string | null
          expires_at?: number | null
          id?: string
          id_token?: string | null
          provider?: string
          providerAccountId?: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Account_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Archetype: {
        Row: {
          createdAt: string
          description: string | null
          id: string
          name: string
          roadmapId: string | null
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          id: string
          name: string
          roadmapId?: string | null
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          id?: string
          name?: string
          roadmapId?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Archetype_roadmapId_fkey2"
            columns: ["roadmapId"]
            isOneToOne: false
            referencedRelation: "Roadmap"
            referencedColumns: ["id"]
          },
        ]
      }
      AuditLog: {
        Row: {
          action: string
          details: string | null
          id: string
          targetId: string | null
          targetType: string | null
          timestamp: string
          userId: string
        }
        Insert: {
          action: string
          details?: string | null
          id: string
          targetId?: string | null
          targetType?: string | null
          timestamp?: string
          userId: string
        }
        Update: {
          action?: string
          details?: string | null
          id?: string
          targetId?: string | null
          targetType?: string | null
          timestamp?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "AuditLog_userId_fkey2"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Course: {
        Row: {
          contentType: string
          contentUrl: string | null
          createdAt: string
          createdBy: string | null
          description: string | null
          difficulty: string
          duration: number | null
          id: string
          moduleId: string | null
          roadmapId: string | null
          thumbnail: string | null
          title: string
          updatedAt: string
          version: string
        }
        Insert: {
          contentType?: string
          contentUrl?: string | null
          createdAt?: string
          createdBy?: string | null
          description?: string | null
          difficulty?: string
          duration?: number | null
          id: string
          moduleId?: string | null
          roadmapId?: string | null
          thumbnail?: string | null
          title: string
          updatedAt?: string
          version?: string
        }
        Update: {
          contentType?: string
          contentUrl?: string | null
          createdAt?: string
          createdBy?: string | null
          description?: string | null
          difficulty?: string
          duration?: number | null
          id?: string
          moduleId?: string | null
          roadmapId?: string | null
          thumbnail?: string | null
          title?: string
          updatedAt?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "Course_moduleId_fkey2"
            columns: ["moduleId"]
            isOneToOne: false
            referencedRelation: "Module"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Course_roadmapId_fkey2"
            columns: ["roadmapId"]
            isOneToOne: false
            referencedRelation: "Roadmap"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          progress_percent: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          progress_percent?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          progress_percent?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      CourseEnrollment: {
        Row: {
          completedAt: string | null
          courseId: string
          enrolledAt: string
          id: string
          progress: number
          status: string
          userId: string
        }
        Insert: {
          completedAt?: string | null
          courseId: string
          enrolledAt?: string
          id: string
          progress?: number
          status?: string
          userId: string
        }
        Update: {
          completedAt?: string | null
          courseId?: string
          enrolledAt?: string
          id?: string
          progress?: number
          status?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "CourseEnrollment_courseId_fkey2"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "CourseEnrollment_userId_fkey2"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          content_type: string | null
          content_url: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          id: string
          roadmap_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content_type?: string | null
          content_url?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          roadmap_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content_type?: string | null
          content_url?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          roadmap_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          content: string
          course_id: string | null
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          course_id?: string | null
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          course_id?: string | null
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      Feedback: {
        Row: {
          courseId: string | null
          createdAt: string
          id: string
          isPrivate: boolean
          rating: number | null
          receiverId: string
          senderId: string
          text: string
          threadId: string | null
          type: string
          updatedAt: string
        }
        Insert: {
          courseId?: string | null
          createdAt?: string
          id: string
          isPrivate?: boolean
          rating?: number | null
          receiverId: string
          senderId: string
          text: string
          threadId?: string | null
          type?: string
          updatedAt?: string
        }
        Update: {
          courseId?: string | null
          createdAt?: string
          id?: string
          isPrivate?: boolean
          rating?: number | null
          receiverId?: string
          senderId?: string
          text?: string
          threadId?: string | null
          type?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Feedback_receiverId_fkey2"
            columns: ["receiverId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Feedback_senderId_fkey2"
            columns: ["senderId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_sessions: {
        Row: {
          course_id: string | null
          created_at: string
          duration_minutes: number | null
          end_time: string | null
          id: string
          start_time: string
          user_id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          user_id: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      LearningSession: {
        Row: {
          createdAt: string
          durationMinutes: number | null
          endTime: string | null
          id: string
          notes: string | null
          reflectionId: string | null
          startTime: string
          status: string
          userId: string
        }
        Insert: {
          createdAt?: string
          durationMinutes?: number | null
          endTime?: string | null
          id: string
          notes?: string | null
          reflectionId?: string | null
          startTime?: string
          status?: string
          userId: string
        }
        Update: {
          createdAt?: string
          durationMinutes?: number | null
          endTime?: string | null
          id?: string
          notes?: string | null
          reflectionId?: string | null
          startTime?: string
          status?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "LearningSession_userId_fkey2"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Module: {
        Row: {
          createdAt: string
          description: string | null
          id: string
          name: string
          order: number
          roadmapId: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          id: string
          name: string
          order: number
          roadmapId: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          id?: string
          name?: string
          order?: number
          roadmapId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Module_roadmapId_fkey2"
            columns: ["roadmapId"]
            isOneToOne: false
            referencedRelation: "Roadmap"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          archetype: string | null
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          supervisor_id: string | null
          updated_at: string
        }
        Insert: {
          archetype?: string | null
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          supervisor_id?: string | null
          updated_at?: string
        }
        Update: {
          archetype?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          supervisor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      Reflection: {
        Row: {
          courseId: string | null
          createdAt: string
          id: string
          learningSessionId: string
          mood: string | null
          text: string
          updatedAt: string
          userId: string
        }
        Insert: {
          courseId?: string | null
          createdAt?: string
          id: string
          learningSessionId: string
          mood?: string | null
          text: string
          updatedAt?: string
          userId: string
        }
        Update: {
          courseId?: string | null
          createdAt?: string
          id?: string
          learningSessionId?: string
          mood?: string | null
          text?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Reflection_learningSessionId_fkey2"
            columns: ["learningSessionId"]
            isOneToOne: false
            referencedRelation: "LearningSession"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Reflection_userId_fkey2"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      reflections: {
        Row: {
          content: string
          course_id: string | null
          created_at: string
          id: string
          mood: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          course_id?: string | null
          created_at?: string
          id?: string
          mood?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          course_id?: string | null
          created_at?: string
          id?: string
          mood?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reflections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reflections_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "learning_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      Roadmap: {
        Row: {
          archetype: string | null
          createdAt: string
          description: string | null
          id: string
          name: string
          updatedAt: string
        }
        Insert: {
          archetype?: string | null
          createdAt?: string
          description?: string | null
          id: string
          name: string
          updatedAt?: string
        }
        Update: {
          archetype?: string | null
          createdAt?: string
          description?: string | null
          id?: string
          name?: string
          updatedAt?: string
        }
        Relationships: []
      }
      roadmaps: {
        Row: {
          archetype: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          archetype: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          archetype?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      Session: {
        Row: {
          expires: string
          id: string
          sessionToken: string
          userId: string
        }
        Insert: {
          expires: string
          id: string
          sessionToken: string
          userId: string
        }
        Update: {
          expires?: string
          id?: string
          sessionToken?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Session_userId_fkey2"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Skill: {
        Row: {
          createdAt: string
          description: string | null
          evidence: string | null
          evidenceCourses: string | null
          id: string
          lastUpdated: string
          level: number
          name: string
          proficiency: number
          updatedAt: string
          userId: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          evidence?: string | null
          evidenceCourses?: string | null
          id: string
          lastUpdated?: string
          level?: number
          name: string
          proficiency?: number
          updatedAt?: string
          userId: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          evidence?: string | null
          evidenceCourses?: string | null
          id?: string
          lastUpdated?: string
          level?: number
          name?: string
          proficiency?: number
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Skill_userId_fkey2"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          created_at: string
          id: string
          level: number | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: number | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: number | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      Test: {
        Row: {
          attemptLimit: number
          courseId: string
          createdAt: string
          description: string | null
          gradingType: string
          id: string
          passingScore: number
          questions: string
          timeLimit: number | null
          title: string
          type: string
          updatedAt: string
        }
        Insert: {
          attemptLimit?: number
          courseId: string
          createdAt?: string
          description?: string | null
          gradingType?: string
          id: string
          passingScore?: number
          questions: string
          timeLimit?: number | null
          title: string
          type?: string
          updatedAt?: string
        }
        Update: {
          attemptLimit?: number
          courseId?: string
          createdAt?: string
          description?: string | null
          gradingType?: string
          id?: string
          passingScore?: number
          questions?: string
          timeLimit?: number | null
          title?: string
          type?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Test_courseId_fkey2"
            columns: ["courseId"]
            isOneToOne: false
            referencedRelation: "Course"
            referencedColumns: ["id"]
          },
        ]
      }
      test_results: {
        Row: {
          answers: Json | null
          attempt_number: number | null
          created_at: string
          feedback: string | null
          graded_by: string | null
          id: string
          score: number | null
          started_at: string | null
          status: string | null
          submitted_at: string | null
          test_id: string
          user_id: string
        }
        Insert: {
          answers?: Json | null
          attempt_number?: number | null
          created_at?: string
          feedback?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          started_at?: string | null
          status?: string | null
          submitted_at?: string | null
          test_id: string
          user_id: string
        }
        Update: {
          answers?: Json | null
          attempt_number?: number | null
          created_at?: string
          feedback?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          started_at?: string | null
          status?: string | null
          submitted_at?: string | null
          test_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      TestResult: {
        Row: {
          answers: string
          attemptNumber: number
          createdAt: string
          feedback: string | null
          gradedAt: string | null
          gradedBy: string | null
          id: string
          score: number
          startedAt: string
          status: string
          submittedAt: string | null
          testId: string
          userId: string
        }
        Insert: {
          answers: string
          attemptNumber?: number
          createdAt?: string
          feedback?: string | null
          gradedAt?: string | null
          gradedBy?: string | null
          id: string
          score: number
          startedAt?: string
          status?: string
          submittedAt?: string | null
          testId: string
          userId: string
        }
        Update: {
          answers?: string
          attemptNumber?: number
          createdAt?: string
          feedback?: string | null
          gradedAt?: string | null
          gradedBy?: string | null
          id?: string
          score?: number
          startedAt?: string
          status?: string
          submittedAt?: string | null
          testId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "TestResult_testId_fkey2"
            columns: ["testId"]
            isOneToOne: false
            referencedRelation: "Test"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "TestResult_userId_fkey2"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          course_id: string
          created_at: string
          id: string
          max_attempts: number | null
          passing_score: number | null
          questions: Json
          time_limit_minutes: number | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          max_attempts?: number | null
          passing_score?: number | null
          questions?: Json
          time_limit_minutes?: number | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          max_attempts?: number | null
          passing_score?: number | null
          questions?: Json
          time_limit_minutes?: number | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tests_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          archetype: string | null
          createdAt: string
          email: string | null
          emailVerified: string | null
          id: string
          image: string | null
          name: string | null
          password: string | null
          role: string
          supervisorId: string | null
          totalLearningHours: number
          updatedAt: string
        }
        Insert: {
          archetype?: string | null
          createdAt?: string
          email?: string | null
          emailVerified?: string | null
          id: string
          image?: string | null
          name?: string | null
          password?: string | null
          role?: string
          supervisorId?: string | null
          totalLearningHours?: number
          updatedAt?: string
        }
        Update: {
          archetype?: string | null
          createdAt?: string
          email?: string | null
          emailVerified?: string | null
          id?: string
          image?: string | null
          name?: string | null
          password?: string | null
          role?: string
          supervisorId?: string | null
          totalLearningHours?: number
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "User_supervisorId_fkey"
            columns: ["supervisorId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      VerificationToken: {
        Row: {
          expires: string
          identifier: string
          token: string
        }
        Insert: {
          expires: string
          identifier: string
          token: string
        }
        Update: {
          expires?: string
          identifier?: string
          token?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_first_user: { Args: never; Returns: boolean }
      is_supervisor_of: {
        Args: { _supervisor_id: string; _user_id: string }
        Returns: boolean
      }
      promote_to_learner: { Args: { _user_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "candidate" | "learner" | "supervisor" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["candidate", "learner", "supervisor", "admin"],
    },
  },
} as const
