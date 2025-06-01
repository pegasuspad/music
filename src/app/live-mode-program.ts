import type { Program } from '../engine/program.ts'
import { group } from '../ui/components/group.ts'
import type { NovationLaunchpadMiniMk3 } from '../vendors/novation/launchpad-mini-mk3/novation-launchpad-mini-mk3.ts'

export const createLiveModeProgram = ({
  launchpad,
}: {
  launchpad: NovationLaunchpadMiniMk3
}): Program => ({
  getRoot: () => group(),
  initialize: async () => {
    await launchpad.sendCommand('select-mode', 'live')
  },
})
