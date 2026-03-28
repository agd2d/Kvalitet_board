export type TaskStatus = 'afventer' | 'planlagt' | 'igangværende' | 'afsluttet'

export interface Profile {
  id: string
  company_name: string | null
  contact_name: string | null
  phone: string | null
  created_at: string
}

export interface Service {
  id: string
  name: string
  description: string | null
  duration_hours: number | null
  active: boolean
}

export interface Task {
  id: string
  customer_id: string
  service_id: string | null
  title: string
  description: string | null
  status: TaskStatus
  scheduled_at: string | null
  completed_at: string | null
  created_at: string
  services?: Service
  task_employees?: TaskEmployee[]
  task_feedback?: TaskFeedback[]
}

export interface TaskEmployee {
  id: string
  task_id: string
  employee_name: string
  employee_role: string | null
  assigned_at: string
}

export interface TaskFeedback {
  id: string
  task_id: string
  customer_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface Message {
  id: string
  task_id: string
  sender_id: string
  sender_type: 'customer' | 'admin'
  content: string
  created_at: string
}

// Supabase Database generic type
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      services: {
        Row: Service
        Insert: Omit<Service, 'id'>
        Update: Partial<Omit<Service, 'id'>>
      }
      tasks: {
        Row: Omit<Task, 'services' | 'task_employees' | 'task_feedback'>
        Insert: Omit<Task, 'id' | 'created_at' | 'services' | 'task_employees' | 'task_feedback'>
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'services' | 'task_employees' | 'task_feedback'>>
      }
      task_employees: {
        Row: TaskEmployee
        Insert: Omit<TaskEmployee, 'id'>
        Update: Partial<Omit<TaskEmployee, 'id'>>
      }
      task_feedback: {
        Row: TaskFeedback
        Insert: Omit<TaskFeedback, 'id' | 'created_at'>
        Update: Partial<Omit<TaskFeedback, 'id' | 'created_at'>>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at'>
        Update: Partial<Omit<Message, 'id' | 'created_at'>>
      }
    }
  }
}
