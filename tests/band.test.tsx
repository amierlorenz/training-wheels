import { expect, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'

import { parse } from '../hooks/progress'

type On = Parameters<TestBody>[1]

const BAND = {
  plugin: 'training-wheels',
  component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: false, maxRows: 20, bodyColumns: 100, scroll: { offset: 0, bodyRows: 20 }, view: {} },
} as const

const PROGRESS = `# Outfit Picker progress

**Platform:** web app
**Level:** 1 (The Boss)
**Next:** Make the "Cold" button show a jacket.

## Wins
- 2026-11-08 Saw the app run for the first time.
- 2026-11-08 Picked the colors.

## Glossary
- **View**: one box on the screen.
`

// Nothing sits beneath the plugin: these hooks stand for the engine and the disk.
function engine(on: On, cwd: string, files: Record<string, string>) {
  const sent: { prompts: string[]; commands: string[] } = { prompts: [], commands: [] }
  on('session.cwd', () => ({ value: cwd }))
  on('env.get', () => ({ value: '/home/kid' }))
  on('fs.exists', (_, e) => ({ value: e.path in files }))
  on('fs.read', (_, e) => ({ value: files[e.path] ?? '' }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('tool.call', () => ({ result: {} }))
  on('prompt.submit', (_, e) => {
    sent.prompts.push(e.text)
    return { text: e.text }
  })
  on('command.run', (_, e) => {
    sent.commands.push(e.command)
    return { text: '' }
  })
  return sent
}

test('PROGRESS.md gives the app, level, next goal and wins', () => {
  expect(parse(PROGRESS)).toEqual({
    app: 'Outfit Picker',
    level: '1 (The Boss)',
    next: 'Make the "Cold" button show a jacket.',
    wins: 2,
  })
})

test('no band in a folder without a training-wheels workspace', async ($, on) => {
  engine(on, '/work/other', {})
  // Beneath the plugin: stands for the engine's own band.
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine band</Text>
  })
  await $.session.start({ cwd: '/work/other', surface: 'desktop', isInteractive: true })
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect(await ui.find({ type: 'Text', text: 'engine band' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Level/ })).toBeUndefined()
  await ui.unmount()
})

test('a linked app folder shows the band with a start button, on terminal and desktop', async ($, on) => {
  const sent = engine(on, '/work/outfit', { '/work/outfit/.learning/PROGRESS.md': PROGRESS })
  await $.session.start({ cwd: '/work/outfit', surface: 'desktop', isInteractive: true })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...BAND, surface })
    expect(await ui.find({ type: 'Text', text: 'Outfit Picker' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Level 1 · The Boss/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /2 wins/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Make the "Cold" button/ })).toBeDefined()
    expect(await ui.find({ key: 'try' })).toBeUndefined()
    await ui.unmount()
  }

  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  await ui.press({ key: 'start' })
  expect(sent.commands).toContain('training-wheels:training-wheels')
  await ui.unmount()
})

test('once the skill runs, the buttons send what a beginner would type', async ($, on) => {
  const sent = engine(on, '/home/kid/Learning/outfit-picker/notes', {
    '/home/kid/Learning/outfit-picker/PROGRESS.md': PROGRESS,
  })
  await $.session.start({ cwd: '/home/kid/Learning/outfit-picker/notes', surface: 'desktop', isInteractive: true })
  await $.prompt.submit({ text: '/training-wheels', wait: false, origin: { kind: 'composer' } })

  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect(await ui.find({ key: 'start' })).toBeUndefined()
  await ui.press({ key: 'try' })
  await ui.press({ key: 'ready' })
  expect(sent.prompts).toContain("I'll try this one myself.")
  expect(sent.prompts).toContain('Am I ready for the next level?')
  await ui.unmount()
})
