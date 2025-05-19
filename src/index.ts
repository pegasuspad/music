import { NovationLaunchpadMiniMk3 } from './vendors/novation/novation-launchpad-mini-mk3.js'

const main = (): Promise<void> => {
  return new Promise(() => {
    new NovationLaunchpadMiniMk3()
  })
}

await main()
