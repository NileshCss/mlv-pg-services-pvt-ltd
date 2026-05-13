// Application constants
export const SITE_NAME = 'MLV PG Services'
export const SITE_DESCRIPTION = 'Premium Student PG Near Acharya Institute'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918809630649'

// Colors
export const COLORS = {
  primary: '#0d1b85',
  secondary: '#c9a84c',
  dark: '#111827',
  white: '#ffffff',
  light: '#f9fafb',
  gray: '#6b7280',
}

// Room types and prices
export const ROOM_TYPES = [
  {
    id: 'single',
    name: 'Single Sharing',
    price: 13000,
    description: 'Private Room',
    features: [
      'Personal Space & Privacy',
      'Study Table & Chair',
      'Wardrobe & Storage',
      'Attached/Shared Bath',
      'WiFi + Power Backup',
    ],
  },
  {
    id: 'double',
    name: 'Double Sharing',
    price: 9500,
    description: '2-Bed Room (Featured)',
    features: [
      'Spacious Shared Room',
      'Study Table & Chair',
      'Wardrobe & Storage',
      'Shared Bath',
      'WiFi + Power Backup',
    ],
  },
  {
    id: 'triple',
    name: 'Triple Sharing',
    price: 7500,
    description: '3-Bed Room (Budget-Friendly)',
    features: [
      'Spacious Shared Room',
      'Study Table & Chair',
      'Wardrobe & Storage',
      'Shared Bath',
      'WiFi + Power Backup',
    ],
  },
]

// Facilities
export const FACILITIES = [
  {
    icon: '🍽️',
    title: 'Unlimited Food',
    description: 'Breakfast, Lunch & Dinner — fresh, hygienic, unlimited quantity',
  },
  {
    icon: '⚡',
    title: '24/7 Electricity',
    description: 'Uninterrupted power with backup generator for all rooms',
  },
  {
    icon: '📶',
    title: 'High-Speed WiFi',
    description: 'Blazing fast internet for study and entertainment',
  },
  {
    icon: '📹',
    title: 'CCTV Security',
    description: '24/7 surveillance for complete safety and peace of mind',
  },
  {
    icon: '💧',
    title: 'RO Water',
    description: 'Pure drinking water available all day throughout the facility',
  },
  {
    icon: '🧺',
    title: 'Laundry Service',
    description: 'Convenient laundry facilities to save your precious time',
  },
  {
    icon: '🧹',
    title: 'Housekeeping',
    description: 'Daily cleaning and maintenance for a hygienic environment',
  },
  {
    icon: '👨‍👩‍👧',
    title: 'Parent-Like Support',
    description: 'Dedicated staff who care for you like their own family',
  },
]

// Gender options
export const GENDERS = ['Male', 'Female', 'Other']

// Nationality options
export const NATIONALITIES = [
  'Indian',
  'Nepali',
  'Bhutanese',
  'Sri Lankan',
  'Bangladeshi',
  'Afghan',
  'Pakistani',
  'Other',
]

// Room preferences
export const ROOM_PREFERENCES = ['Single Sharing', 'Double Sharing', 'Triple Sharing', 'No Preference']

// Food preferences
export const FOOD_PREFERENCES = ['Vegetarian', 'Non-Vegetarian', 'Both', 'Vegan']

// Form validation messages
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  invalidEmail: 'Please enter a valid email address',
  invalidPhone: 'Please enter a valid phone number (10 digits)',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be at most ${max} characters`,
}

// Hero section content
export const HERO_CONTENT = {
  badge: '🏛️ Opposite Acharya Institute of Technology',
  heading: 'Premium Student PG\nNear Acharya Institute',
  subheading: 'Unlimited Food | Safe Environment | Parent-Like Care\nYour home away from home in Bangalore.',
  pills: [
    '🍽️ Unlimited Hygienic Food',
    '⚡ 24/7 Electricity',
    '👨‍👩‍👧 Parent-Like Support',
  ],
  stats: [
    { label: 'Students Stayed', value: '500+' },
    { label: 'Average Rating', value: '4.9/5' },
    { label: 'States Represented', value: '5+' },
  ],
}

// SEO Keywords
export const SEO_KEYWORDS = [
  'PG near Acharya Institute',
  'Student PG in Bangalore',
  'Unlimited food PG Bangalore',
  'Boys PG near Acharya',
  'Girls PG near Acharya',
  'Best student PG Bangalore',
]
