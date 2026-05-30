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

export interface Book {
  id: number
  slug: string
  title: string
  author: string
  description: string | null
  price: number
  cover_url: string | null
  category_id: number | null
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
  items: CartItem[]
  total: number
  stripe_session_id: string | null
  status: 'pending' | 'paid' | 'shipped' | 'cancelled'
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  created_at: string
}
