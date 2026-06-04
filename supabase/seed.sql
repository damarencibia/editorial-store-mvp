INSERT INTO series (name) VALUES ('El Señor de los Anillos');

INSERT INTO authors (name, slug) VALUES
  ('Gabriel García Márquez', 'gabriel-garcia-marquez'),
  ('George Orwell', 'george-orwell'),
  ('Antoine de Saint-Exupéry', 'antoine-de-saint-exupery'),
  ('Miguel de Cervantes', 'miguel-de-cervantes'),
  ('Jane Austen', 'jane-austen'),
  ('J.R.R. Tolkien', 'jrr-tolkien');

INSERT INTO monthly_picks (book_id, position)
SELECT id, 1 FROM books WHERE slug = 'cien-anos-de-soledad';
INSERT INTO monthly_picks (book_id, position)
SELECT id, 2 FROM books WHERE slug = '1984';
INSERT INTO monthly_picks (book_id, position)
SELECT id, 3 FROM books WHERE slug = 'el-hobbit';

INSERT INTO books (slug, title, subtitle, author_id, description, price, cover_url, publisher, pages, translator, series_id, age_target, binding_type, language, published_at) VALUES
(
  'cien-anos-de-soledad',
  'Cien años de soledad',
  'Nada tiene sentido si no es para siempre',
  (SELECT id FROM authors WHERE slug = 'gabriel-garcia-marquez'),
  'La historia de la familia Buendía en el pueblo ficticio de Macondo, una obra maestra del realismo mágico que narra el ciclo vital de siete generaciones.',
  1499,
  'https://picsum.photos/seed/book1/300/450',
  'Sudamericana',
  496,
  NULL,
  NULL,
  'Adulto',
  'Tapa blanda',
  'ES',
  '1967-06-05'
),
(
  '1984',
  '1984',
  NULL,
  (SELECT id FROM authors WHERE slug = 'george-orwell'),
  'Una novela distópica que presenta un futuro totalitario donde el Gran Hermano lo vigila todo y el pensamiento independiente es un crimen.',
  1299,
  'https://picsum.photos/seed/book2/300/450',
  'Secker & Warburg',
  328,
  NULL,
  NULL,
  'Adulto',
  'Tapa blanda',
  'EN',
  '1949-06-08'
),
(
  'el-principito',
  'El Principito',
  'Lo esencial es invisible a los ojos',
  (SELECT id FROM authors WHERE slug = 'antoine-de-saint-exupery'),
  'Un piloto perdido en el desierto se encuentra con un pequeño príncipe que viene de otro planeta, en una fábula sobre la amistad y el amor.',
  999,
  'https://picsum.photos/seed/book3/300/450',
  'Reynal & Hitchcock',
  96,
  NULL,
  NULL,
  'Infantil',
  'Tapa dura',
  'FR',
  '1943-04-06'
),
(
  'don-quijote-de-la-mancha',
  'Don Quijote de la Mancha',
  'El ingenioso hidalgo que soñó imposibles',
  (SELECT id FROM authors WHERE slug = 'miguel-de-cervantes'),
  'Las aventuras del ingenioso hidalgo que enloquece leyendo libros de caballerías y decide salir a buscar aventuras con su fiel escudero Sancho Panza.',
  1899,
  'https://picsum.photos/seed/book4/300/450',
  'Francisco de Robles',
  863,
  NULL,
  NULL,
  'Adulto',
  'Tapa dura',
  'ES',
  '1605-01-16'
),
(
  'orgullo-y-prejuicio',
  'Orgullo y prejuicio',
  'Un corazón es un tesoro que no se vende',
  (SELECT id FROM authors WHERE slug = 'jane-austen'),
  'La historia de Elizabeth Bennet y su complicada relación con el señor Darcy, una ingeniosa crítica social sobre el matrimonio y la clase en la Inglaterra del siglo XIX.',
  1199,
  'https://picsum.photos/seed/book5/300/450',
  'Thomas Egerton',
  432,
  NULL,
  NULL,
  'Adulto',
  'Tapa blanda',
  'EN',
  '1813-01-28'
),
(
  'el-hobbit',
  'El Hobbit',
  'Incluso el más pequeño puede cambiar el rumbo del mundo',
  (SELECT id FROM authors WHERE slug = 'jrr-tolkien'),
  'Bilbo Bolsón, un hobbit tranquilo, es arrastrado a una aventura épica para recuperar el tesoro de los enanos del dragón Smaug.',
  1399,
  'https://picsum.photos/seed/book6/300/450',
  'George Allen & Unwin',
  310,
  'Elena Rius',
  (SELECT id FROM series WHERE name = 'El Señor de los Anillos'),
  'Juvenil',
  'Tapa blanda',
  'ES',
  '1937-09-21'
);
