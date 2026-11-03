import type { Progress } from '../types'

// Reads the band's facts from PROGRESS.md, in the format SKILL.md defines.
export function parse(text: string): Progress {
  const field = (name: string) => text.match(new RegExp(`^\\*\\*${name}:\\*\\*\\s*(.+)$`, 'm'))?.[1]?.trim() ?? ''
  const wins = text.split(/^## /m).find(s => s.startsWith('Wins')) ?? ''
  return {
    app: text.match(/^# (.+?)(?: progress)?\s*$/m)?.[1] ?? 'Your app',
    level: field('Level'),
    next: field('Next'),
    wins: wins.split('\n').filter(line => line.startsWith('- ')).length,
  }
}

// The workspace a folder belongs to: its `.learning` link, or the folder itself inside ~/Learning/<app>/.
export function candidates(cwd: string, home: string | undefined): string[] {
  const list = [`${cwd}/.learning`]
  const learning = home && `${home}/Learning/`
  if (learning && cwd.startsWith(learning)) list.push(learning + cwd.slice(learning.length).split('/')[0])
  return list
}
