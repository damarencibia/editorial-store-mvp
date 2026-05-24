import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Faltan PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const users = [
  { email: 'admin@editorial.com',    password: 'Admin123!', role: 'admin',    full_name: 'Admin Editorial' },
  { email: 'cliente1@test.com',      password: 'Test123!',  role: 'customer', full_name: 'María García' },
  { email: 'cliente2@test.com',      password: 'Test123!',  role: 'customer', full_name: 'Carlos López' },
  { email: 'cliente3@test.com',      password: 'Test123!',  role: 'customer', full_name: 'Ana Martínez' },
]

async function seedUsers() {
  for (const u of users) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', u.email)
      .maybeSingle()

    if (existing) {
      console.log(`~ ${u.email} ya existe`)
      continue
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    })

    if (error) {
      console.error(`✗ ${u.email}: ${error.message}`)
      continue
    }

    await supabase
      .from('profiles')
      .update({ role: u.role, full_name: u.full_name })
      .eq('id', data.user.id)

    console.log(`✓ ${u.email} (${u.role})`)
  }

  console.log('\nUsuarios de prueba listos:')
  console.log('  admin@editorial.com / Admin123!  → admin')
  for (const u of users.slice(1)) {
    console.log(`  ${u.email} / ${u.password}  → ${u.role}`)
  }
}

seedUsers()
