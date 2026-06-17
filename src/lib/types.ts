export interface Collection {
  id: number
  name: string
  slug: string
  description: string | null
  cover_url: string | null
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  collection_id: number
  created_at: string
}

export interface Series {
  id: number
  name: string
  created_at: string
}

export interface Author {
  id: number
  name: string
  slug: string
  bio: string | null
  photo_url: string | null
  created_at: string
}

export interface Book {
  id: number
  slug: string
  title: string
  subtitle: string | null
  author_id: number | null
  description: string | null
  price: number
  cover_url: string | null
  category_id: number | null
  publisher: string | null
  pages: number
  translator: string | null
  series_id: number | null
  age_target: string
  binding_type: string
  language: string
  published_at: string | null
  is_visible: boolean
  is_trending: boolean
  sales_count: number
  created_at?: string
}

export interface CartItem {
  bookId: number
  slug: string
  title: string
  author: string
  price: number
  coverUrl: string
  quantity: number
}

export interface Order {
  id: number
  customer_email: string | null
  user_id: string | null
  items: CartItem[]
  total: number
  stripe_session_id: string | null
  status: 'pending' | 'paid' | 'shipped' | 'cancelled'
  shipping_name: string | null
  shipping_address: {
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  } | null
  shipping_phone: string | null
  shipping_country: string | null
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  created_at: string
}
