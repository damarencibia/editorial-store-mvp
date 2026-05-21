import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan variables de entorno PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const books = [
  {
    slug: 'cien-anos-de-soledad',
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    description: 'La historia de la familia Buendía en el pueblo ficticio de Macondo, una obra maestra del realismo mágico que narra el ciclo vital de siete generaciones.',
    price: 1499,
    cover_url: 'https://picsum.photos/seed/book1/300/450',
  },
  {
    slug: '1984',
    title: '1984',
    author: 'George Orwell',
    description: 'Una novela distópica que presenta un futuro totalitario donde el Gran Hermano lo vigila todo.',
    price: 1299,
    cover_url: 'https://picsum.photos/seed/book2/300/450',
  },
  {
    slug: 'el-principito',
    title: 'El Principito',
    author: 'Antoine de Saint-Exupéry',
    description: 'Un piloto perdido en el desierto se encuentra con un pequeño príncipe que viene de otro planeta.',
    price: 999,
    cover_url: 'https://picsum.photos/seed/book3/300/450',
  },
  {
    slug: 'don-quijote-de-la-mancha',
    title: 'Don Quijote de la Mancha',
    author: 'Miguel de Cervantes',
    description: 'Las aventuras del ingenioso hidalgo que enloquece leyendo libros de caballerías.',
    price: 1899,
    cover_url: 'https://picsum.photos/seed/book4/300/450',
  },
  {
    slug: 'orgullo-y-prejuicio',
    title: 'Orgullo y prejuicio',
    author: 'Jane Austen',
    description: 'La historia de Elizabeth Bennet y su complicada relación con el señor Darcy.',
    price: 1199,
    cover_url: 'https://picsum.photos/seed/book5/300/450',
  },
  {
    slug: 'el-hobbit',
    title: 'El Hobbit',
    author: 'J.R.R. Tolkien',
    description: 'Bilbo Bolsón es arrastrado a una aventura épica para recuperar el tesoro de los enanos.',
    price: 1399,
    cover_url: 'https://picsum.photos/seed/book6/300/450',
  },
]

async function seed() {
  const { data: existing, error: checkError } = await supabase
    .from('books')
    .select('slug')
    .limit(1)

  if (checkError) {
    console.error('Error al conectar con Supabase:', checkError.message)
    process.exit(1)
  }

  if (existing && existing.length > 0) {
    console.log('La tabla books ya tiene datos. Omitiendo seed.')
    return
  }

  const { error } = await supabase.from('books').insert(books)

  if (error) {
    console.error('Error al insertar datos:', error.message)
    process.exit(1)
  }

  console.log(`✓ Se insertaron ${books.length} libros correctamente.`)
}

seed()
