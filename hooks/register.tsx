import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import { candidates, parse } from './progress'

// A band above the prompt for a learner's app: level, wins, next goal, and buttons that say what a beginner
// would otherwise have to type. It shows only in a folder linked to a training-wheels workspace (one with a
// PROGRESS.md). Early-access API: every hook passes the event on if it fails, so the skill never depends on it.

// Change a shape tag when that value's fields change: a reload keeps what an older version saved.
const progress = atom({ plugin: 'training-wheels', key: 'progress' } as const, null, { shape: 'progress-1' })
const isStarted = atom({ plugin: 'training-wheels', key: 'isStarted' } as const, false)

const SKILL = 'training-wheels:training-wheels'
const isSkill = (command: string) => command === SKILL || command === 'training-wheels'

async function refresh($: EngineInterface) {
  const paths = candidates(await $.session.cwd(), await $.env.get('HOME'))
  for (const dir of paths) {
    const file = `${dir}/PROGRESS.md`
    if (!(await $.fs.exists(file))) continue
    const next = parse(await $.fs.read(file))
    return update($, progress, () => next)
  }
  return update($, progress, () => null)
}

// "1 (The Boss)" reads as "Level 1 · The Boss"; levels the learner renamed show as written.
const levelLabel = (level: string) => level.replace(/^(\d+)\s*\((.+)\)$/, 'Level $1 · $2') || 'Level 1'

const say = ($: EngineInterface, text: string) => void $.prompt.submit({ text })

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    await update($, isStarted, () => false)
    await refresh($)
    return result
  })

  // Buttons send plain prompts, which only make sense once the skill is loaded in this session.
  on('command.run', async ($, e, next) => {
    if (isSkill(e.command)) await update($, isStarted, () => true)
    return next(e)
  }).catch(($, e, next) => next(e))

  on('prompt.submit', async ($, e, next) => {
    if (/^\/training-wheels(:training-wheels)?(\s|$)/.test(e.text)) await update($, isStarted, () => true)
    await refresh($)
    return next(e)
  }).catch(($, e, next) => next(e))

  // The skill writes PROGRESS.md during the turn; the first session also creates the workspace link.
  on('tool.call', async ($, e, next) => {
    const result = await next(e)
    $.clock.after(0, () => void refresh($))
    return result
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const now = await read($, progress)
    if (!now || e.props.hasSurvey) return next(e)
    // Other plugins share the band: draw theirs below ours instead of replacing it.
    const below = await next(e).catch(() => undefined)
    const { Box, Button, Text } = $.ui.resolve(e)
    const started = await read($, isStarted)

    // Desktop buttons are taller than a text row: without a gap they overlap the line above.
    const isDesktop = e.surface === 'desktop'

    const buttons = started ? (
      <Box gap={1} alignItems="center">
        <Button key="try" variant="primary" label="I'll try it" onPress={() => say($, "I'll try this one myself.")} />
        <Button key="you" variant="secondary" label="You do this one" onPress={() => say($, 'Can you do this one for me?')} />
        <Box flexGrow={1} />
        <Button key="trophies" plain label="Trophies" onPress={() => say($, 'Show me my trophy page.')} />
        <Button key="ready" plain label="Am I ready?" onPress={() => say($, 'Am I ready for the next level?')} />
        <Button key="done" plain label="Done for today" onPress={() => say($, "Let's stop here for today.")} />
      </Box>
    ) : (
      <Box>
        <Button key="start" variant="primary" label="Start today's session" onPress={() => void $.command.run({ command: SKILL })} />
      </Box>
    )

    const mine = (
      <Box flexDirection="column" gap={isDesktop ? 1 : 0} width={e.props.bodyColumns}>
        <Box justifyContent="space-between">
          <Text wrap="truncate-end">
            <Text bold>{now.app}</Text>
            <Text dimColor>  ·  {levelLabel(now.level)}</Text>
          </Text>
          <Text>🏆 {now.wins} {now.wins === 1 ? 'win' : 'wins'}</Text>
        </Box>
        {now.next && (
          <Text wrap="truncate-end">
            <Text dimColor>Next  </Text>
            {now.next}
          </Text>
        )}
        {buttons}
      </Box>
    )
    return below ? (
      <Box flexDirection="column">
        {mine}
        {below}
      </Box>
    ) : (
      mine
    )
  }).catch(($, e, next) => next(e))
}
