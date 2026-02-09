import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qksxswglygmzvjecwygk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrc3hzd2dseWdtenZqZWN3eWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MTQwMjQsImV4cCI6MjA4MTk5MDAyNH0.rptWpRMTRMssCpcKhN7aesjmsYpg4IZpB40il8DeSL4'

export const supabase = createClient(supabaseUrl, supabaseKey)

export type User = {
  id: string
  name: string
  email: string
  phone_code: string
  phone_number: string
  photos: string[]
  country: string
  province?: string
  city?: string
  neighborhood?: string
  gender: string
  birth_date: string
  age: number
  height?: string
  marital_status: string
  occupation?: string
  looking_for: string
  interested_in: string
  min_age_pref: number
  max_age_pref: number
  interests: string[]
  religion?: string
  zodiac?: string
  smoke: string
  drink: string
  education_course?: string
  education_place?: string
  languages?: string
  bio?: string
  personality_vibe?: string
  first_date_idea?: string
  is_verified: boolean
  is_banned: boolean
  created_at: string
}

export type Like = {
  from_user: string
  to_user: string
  created_at: string
}

export type Match = {
  id: string
  users: string[]
  created_at: string
}

export type Message = {
  id: number
  match_id: string
  sender: string
  text: string
  created_at: string
}
