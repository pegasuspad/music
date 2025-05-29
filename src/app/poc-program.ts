import { group } from '../ui/components/group.ts'
import type { Program } from '../engine/program.ts'
import type { RgbColor } from '../ui/color.ts'
import { createChannelLevelScreen } from './channel-level-screen/channel-level-screen.ts'
import { createGlobalNav } from './global-nav.ts'
import type { MidiDevice } from '../midi/midi-device.ts'
import type { Channel } from 'easymidi'

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

export const createPoc = (synthesizer: MidiDevice): Program => {
  let selectedChannel = 0

  const selectChannel = (index: number) => {
    selectedChannel = index
  }

  for (let i = 0; i < 256; i++) {
    for (let c = 0; c < 16; c++) {
      synthesizer.send('noteoff', {
        note: i,
        channel: c as Channel,
        velocity: 0,
      })
    }
  }

  // synthesizer.on('noteon', (note) => {
  //   console.log('ON', JSON.stringify(note, null, 2))
  //   if (note.channel !== 0) {
  //     return
  //   }

  //   channels.forEach((channel, index) => {
  //     if (!channel.muted) {
  //       synthesizer.send('noteon', {
  //         ...note,
  //         channel: (index + 1) as Channel,
  //       })
  //     }
  //   })
  // })

  // synthesizer.on('noteoff', (note) => {
  //   console.log('OFF', JSON.stringify(note, null, 2))
  //   if (note.channel !== 0) {
  //     return
  //   }

  //   channels.forEach((channel, index) => {
  //     synthesizer.send('noteoff', {
  //       ...note,
  //       channel: (index + 1) as Channel,
  //     })
  //   })
  // })

  synthesizer.send('program', {
    channel: 1,
    number: 48,
  })

  synthesizer.send('program', {
    channel: 2,
    number: 75,
  })

  const channelLevelScreen = createChannelLevelScreen({
    channels: channels.map((channel) => ({ ...channel })),
    onChannelUpdated: (index, channel) => {
      channels[index] = channel
      selectChannel(index)

      synthesizer.send('cc', {
        controller: 0x07,
        value: channel.level,
        channel: index as Channel,
      })

      synthesizer.send('noteon', {
        note: 30,
        velocity: 96,
        channel: index as Channel,
      })

      setTimeout(() => {
        synthesizer.send('noteoff', {
          note: 30,
          velocity: 64,
          channel: index as Channel,
        })
      }, 250)
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
