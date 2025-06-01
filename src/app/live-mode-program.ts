import type { Program } from '../engine/program.ts'
import { logger } from '../logger.ts'
import { group } from '../ui/components/group.ts'
import type { NovationLaunchpadMiniMk3 } from '../vendors/novation/launchpad-mini-mk3/novation-launchpad-mini-mk3.ts'

const log = logger.child({}, { msgPrefix: '[PROGRAM] ' })

export const createLiveModeProgram = ({
  launchpad,
}: {
  launchpad: NovationLaunchpadMiniMk3
}): Program => ({
  getRoot: () => group(),
  initialize: async () => {
    log.info('Initializing "Live Mode" program.')
    await launchpad.sendCommand('select-mode', 'live')
  },
})
