-- =============================================
-- Migration: initial_schema
-- Paste this in Supabase SQL Editor and execute
-- =============================================

CREATE TABLE IF NOT EXISTS books (
  id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  author      TEXT NOT NULL,
  description TEXT,
  price       INTEGER NOT NULL,
  cover_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id                BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  customer_email    TEXT,
  items             JSONB NOT NULL,
  total             INTEGER NOT NULL,
  stripe_session_id TEXT UNIQUE,
  status            TEXT DEFAULT 'pending',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS but allow public read access for books
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.books
  FOR SELECT USING (true);

-- =============================================
-- Seed data
-- =============================================

INSERT INTO books (slug, title, author, description, price, cover_url) VALUES
(
  'cien-anos-de-soledad',
  'Cien años de soledad',
  'Gabriel García Márquez',
  'La historia de la familia Buendía en el pueblo ficticio de Macondo, una obra maestra del realismo mágico que narra el ciclo vital de siete generaciones.',
  1499,
  'https://picsum.photos/seed/book1/300/450'
),
(
  '1984',
  '1984',
  'George Orwell',
  'Una novela distópica que presenta un futuro totalitario donde el Gran Hermano lo vigila todo y el pensamiento independiente es un crimen.',
  1299,
  'https://picsum.photos/seed/book2/300/450'
),
(
  'el-principito',
  'El Principito',
  'Antoine de Saint-Exupéry',
  'Un piloto perdido en el desierto se encuentra con un pequeño príncipe que viene de otro planeta, en una fábula sobre la amistad y el amor.',
  999,
  'https://picsum.photos/seed/book3/300/450'
),
(
  'don-quijote-de-la-mancha',
  'Don Quijote de la Mancha',
  'Miguel de Cervantes',
  'Las aventuras del ingenioso hidalgo que enloquece leyendo libros de caballerías y decide salir a buscar aventuras con su fiel escudero Sancho Panza.',
  1899,
  'https://picsum.photos/seed/book4/300/450'
),
(
  'orgullo-y-prejuicio',
  'Orgullo y prejuicio',
  'Jane Austen',
  'La historia de Elizabeth Bennet y su complicada relación con el señor Darcy, una ingeniosa crítica social sobre el matrimonio y la clase en la Inglaterra del siglo XIX.',
  1199,
  'https://picsum.photos/seed/book5/300/450'
),
(
  'el-hobbit',
  'El Hobbit',
  'J.R.R. Tolkien',
  'Bilbo Bolsón, un hobbit tranquilo, es arrastrado a una aventura épica para recuperar el tesoro de los enanos del dragón Smaug.',
  1399,
  'https://picsum.photos/seed/book6/300/450'
);
