import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const planPath = resolve(__dirname, '..', 'BUILD_PLAN.md')

const phases = [
  { id: 0, title: 'Fase 0 — Fundación' },
  { id: 1, title: 'Fase 1 — Tienda Pública Premium' },
  { id: 2, title: 'Fase 2 — Autenticación' },
  { id: 3, title: 'Fase 3 — Admin / CRM' },
  { id: 4, title: 'Fase 4 — Carrito y Checkout Mejorados' },
  { id: 5, title: 'Fase 5 — Features Avanzadas' },
]

function parsePlan(text) {
  const lines = text.split('\n')
  const result = []
  let currentPhase = null

  for (const line of lines) {
    const phaseMatch = line.match(/^## (Fase \d — .+)/)
    if (phaseMatch) {
      currentPhase = { title: phaseMatch[1], tasks: [] }
      result.push(currentPhase)
      continue
    }
    if (currentPhase) {
      const taskMatch = line.match(/^- \[( |x)\] (.+)/)
      if (taskMatch) {
        currentPhase.tasks.push({
          text: taskMatch[2],
          done: taskMatch[1] === 'x',
        })
      }
    }
  }

  return result
}

function printStatus(parsed) {
  let totalDone = 0
  let totalTasks = 0

  console.log('\n===============================')
  console.log('   BUILD PLAN — Editorial Store')
  console.log('===============================\n')

  for (let i = 0; i < parsed.length; i++) {
    const phase = parsed[i]
    const done = phase.tasks.filter((t) => t.done).length
    const total = phase.tasks.length
    totalDone += done
    totalTasks += total
    const pct = total > 0 ? Math.round((done / total) * 100) : 0
    const bar = renderBar(pct)
    const tag = done === total && total > 0 ? ' ✅' : done > 0 ? ' 🔄' : ' ⏳'

    console.log(`  ${phase.title}${tag}`)
    console.log(`  ${bar}  ${done}/${total} (${pct}%)`)

    // Show next incomplete tasks (max 3)
    const incomplete = phase.tasks.filter((t) => !t.done).slice(0, 3)
    if (incomplete.length > 0 && done !== total) {
      for (const task of incomplete) {
        console.log(`     · ${task.text}`)
      }
      if (phase.tasks.filter((t) => !t.done).length > 3) {
        console.log(`     · ... y ${phase.tasks.filter((t) => !t.done).length - 3} más`)
      }
    }
    console.log('')
  }

  // Overall
  const totalPct = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0
  console.log('───────────────────────────────')
  console.log(`  Total: ${totalDone}/${totalTasks} (${totalPct}%)`)
  console.log(`  ${renderBar(totalPct)}`)
  console.log('')

  // Show current phase (first incomplete phase)
  const currentPhase = parsed.find((p) => p.tasks.some((t) => !t.done))
  if (currentPhase) {
    const nextTask = currentPhase.tasks.find((t) => !t.done)
    console.log(`  ▶ Siguiente: "${nextTask?.text}"`)
    console.log(`    en ${currentPhase.title}\n`)
  } else {
    console.log('  🎉 Todas las fases completadas!\n')
  }
}

function renderBar(pct) {
  const width = 20
  const filled = Math.round((pct / 100) * width)
  return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']'
}

function updateProgressInFile(parsed) {
  let content = readFileSync(planPath, 'utf-8')

  const lines = []
  for (const phase of parsed) {
    const done = phase.tasks.filter((t) => t.done).length
    const total = phase.tasks.length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0
    lines.push(`**${phase.title.split(' — ')[0]}:** ${done}/${total} — ${pct}%`)
  }

  const totalDone = parsed.reduce((s, p) => s + p.tasks.filter((t) => t.done).length, 0)
  const totalTasks = parsed.reduce((s, p) => s + p.tasks.length, 0)
  const totalPct = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0

  const progressBlock = `<!-- progress_auto -->\n${lines.join('\n')}\n<!-- progress_end -->\n\n**Total:** ${totalDone}/${totalTasks} tareas completadas`

  content = content.replace(
    /<!-- progress_auto -->[\s\S]*?\*\*Total:.*tareas completadas/,
    progressBlock
  )

  writeFileSync(planPath, content, 'utf-8')
}

// --- CLI ---

const args = process.argv.slice(2)

if (args.includes('--mark-done') || args.includes('-m')) {
  const search = args.filter((a) => !a.startsWith('-')).join(' ') || ''
  if (!search) {
    console.error('Uso: node scripts/plan.js --mark-done "texto de la tarea"')
    process.exit(1)
  }
  let content = readFileSync(planPath, 'utf-8')
  const regex = new RegExp(`(- \\[ \\])(${escapeRegex(search)})`, 'i')
  if (regex.test(content)) {
    content = content.replace(regex, '- [x]$2')
    writeFileSync(planPath, content, 'utf-8')
    console.log(`✓ Marcada como completada: ${search}`)
  } else {
    console.log(`No se encontró: "${search}"`)
    process.exit(1)
  }
}

if (args.includes('--status') || args.includes('-s') || args.length === 0) {
  const content = readFileSync(planPath, 'utf-8')
  const parsed = parsePlan(content)
  printStatus(parsed)
  updateProgressInFile(parsed)
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
