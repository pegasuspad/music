export * from './common.ts'
export * from './select-layout.ts'
export * from './select-mode.ts'
export * from './setup-daw-faders.ts'

import { find } from 'lodash-es'
import { type LaunchpadCommandConfig } from './common.ts'
import { SelectLayoutCommand } from './select-layout.ts'
import { SelectModeCommand } from './select-mode.ts'
import { SetLedLightingCommand } from './set-led-lighting.ts'

export const LaunchpadCommands = {
  'select-layout': SelectLayoutCommand,
  'select-mode': SelectModeCommand,
  'set-led-lighting': SetLedLightingCommand,
} satisfies Record<string, LaunchpadCommandConfig>

export const lookupCommand = (
  code: number,
): (typeof LaunchpadCommands)[keyof typeof LaunchpadCommands] | undefined => {
  return find(LaunchpadCommands, (v) => v.code === code)
}

export type LaunchpadCommand = keyof typeof LaunchpadCommands
export type LaunchpadCommandDataType<T extends LaunchpadCommand> =
  (typeof LaunchpadCommands)[T] extends LaunchpadCommandConfig<infer U> ? U
  : never
