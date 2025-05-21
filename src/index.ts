import { NovationLaunchpadMiniMk3 } from './vendors/novation/launchpad-mini-mk3/novation-launchpad-mini-mk3.ts'

const main = (): Promise<void> => {
  return new Promise(() => {
    new NovationLaunchpadMiniMk3()
  })
}

await main()
