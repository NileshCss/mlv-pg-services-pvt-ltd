export interface FoodMenuItem {
  id: string
  day: string
  day_order: number
  breakfast: string | null
  lunch: string | null
  dinner: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
