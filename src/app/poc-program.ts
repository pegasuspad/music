import { group } from '../ui/components/group.ts'
import type { Program } from '../engine/program.ts'
import type { RgbColor } from '../ui/color.ts'
import { createChannelLevelScreen } from './channel-level-screen/channel-level-screen.ts'
import { createGlobalNav } from './global-nav.ts'

const ChannelColors: RgbColor[] = [
  [67, 103, 125],
  [85, 127, 97],
  [100, 80, 127],
  [127, 63, 51],
]

const channels = ChannelColors.map((color) => ({
  settings: {
    color,
  },
  level: 127,
  muted: false,
}))

export const createPoc = (): Program => {
  let selectedChannel = 0

  const selectChannel = (index: number) => {
    selectedChannel = index
  }

  const channelLevelScreen = createChannelLevelScreen({
    channels: channels.map((channel) => ({ ...channel })),
    onChannelUpdated: (index, channel) => {
      channels[index] = channel
      selectChannel(index)
    },
    selectedChannel,
  })

  return {
    getRoot: () =>
      group(
        channelLevelScreen(),
        createGlobalNav({
          channels: channels.map((channel) => ({ ...channel })),
          onChannelSelected: selectChannel,
          selectedChannel,
        }),
      ),
  }
}
