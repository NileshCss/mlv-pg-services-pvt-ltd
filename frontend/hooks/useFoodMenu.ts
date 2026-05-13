'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FoodMenuItem } from '@/types/food'

// ─── Static fallback data (shown when Supabase is unreachable or table is empty) ─
const FALLBACK_MENU: FoodMenuItem[] = [
  { id: '1', day: 'Monday',    day_order: 1, breakfast: 'Idli + Sambar + Coconut Chutney',        lunch: 'Rice + Dal Tadka + Aloo Sabzi + Salad + Papad',   dinner: 'Chapati + Paneer Butter Masala + Dal',             is_active: true, created_at: '', updated_at: '' },
  { id: '2', day: 'Tuesday',   day_order: 2, breakfast: 'Poha + Chai + Banana',                   lunch: 'Rice + Rajma Masala + Jeera Rice + Raita',         dinner: 'Chapati + Mixed Veg Curry + Soup',                 is_active: true, created_at: '', updated_at: '' },
  { id: '3', day: 'Wednesday', day_order: 3, breakfast: 'Upma + Juice + Boiled Egg',              lunch: 'Rice + Chole Masala + Roti + Raita',               dinner: 'Chapati + Dal Makhani + Salad',                    is_active: true, created_at: '', updated_at: '' },
  { id: '4', day: 'Thursday',  day_order: 4, breakfast: 'Dosa + Sambar + Chutney',               lunch: 'Rice + Kadhi Pakoda + Sabzi + Papad',             dinner: 'Chapati + Aloo Matar + Dal',                       is_active: true, created_at: '', updated_at: '' },
  { id: '5', day: 'Friday',    day_order: 5, breakfast: 'Bread Toast + Omelette / Jam + Chai',   lunch: 'Rice + Dal Fry + Egg Curry / Paneer + Salad',     dinner: 'Chapati + Egg Bhurji / Paneer Bhurji + Soup',      is_active: true, created_at: '', updated_at: '' },
  { id: '6', day: 'Saturday',  day_order: 6, breakfast: 'Paratha + Curd + Pickle',               lunch: 'Rice + Sambar + Coconut Sabzi + Papad',           dinner: 'Chapati + Dal + Khichdi + Raita',                  is_active: true, created_at: '', updated_at: '' },
  { id: '7', day: 'Sunday',    day_order: 7, breakfast: 'Puri + Aloo Sabzi + Halwa',             lunch: 'Rice + Special Chicken Curry / Paneer + Salad',   dinner: 'Veg / Chicken Biryani + Raita + Sherbet',          is_active: true, created_at: '', updated_at: '' },
]

export function useFoodMenu() {
  const [menu, setMenu] = useState<FoodMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    async function fetchMenu() {
      try {
        const { data, error } = await supabase
          .from('food_menu')
          .select('*')
          .eq('is_active', true)
          .order('day_order', { ascending: true })

        if (error) throw error

        if (data && data.length > 0) {
          setMenu(data)
        } else {
          setMenu(FALLBACK_MENU)
          setUsingFallback(true)
        }
      } catch (err) {
        console.error('Food menu fetch failed — using fallback:', err)
        setMenu(FALLBACK_MENU)
        setUsingFallback(true)
        setError('Using offline menu data')
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
  }, [])

  return { menu, loading, error, usingFallback }
}
