import { group } from '../ui/components/group.ts'
import type { Program } from '../engine/program.ts'
import { createChannelLevelScreen } from './channel-level-screen/channel-level-screen.ts'
import { createGlobalNav } from './global-nav.ts'
import type { MidiDevice } from '../midi/midi-device.ts'
import { LaunchpadController } from './controller.ts'

export const createPoc = (synthesizer: MidiDevice): Program => {
  const controller = new LaunchpadController(synthesizer, 8)
  controller.stopAllSound()
  controller.selectSound(0, { program: 73 })
  controller.selectSound(1, { program: 73 })
  let selectedChannelId = controller.channels[0].id

  // play notes when level changed?
  //
  // synthesizer.send('noteon', {
  //   note: 30,
  //   velocity: 64,
  //   channel: index as Channel,
  // })
  //
  // setTimeout(() => {
  //   synthesizer.send('noteoff', {
  //     note: 30,
  //     velocity: 0,
  //     channel: index as Channel,
  //   })
  // }, 250)

  const channelLevelScreen = createChannelLevelScreen({
    channels: [...controller.channels],
    onLevelChanged: (channelId, level) => {
      controller.setLevel(channelId, level)
      selectedChannelId = channelId
    },
    onMuteStatusChanged: (channelId, muted) => {
      controller.setMuted(channelId, muted)
      selectedChannelId = channelId
    },
    selectedChannelId,
  })

  return {
    getRoot: () =>
      group(
        channelLevelScreen(),
        createGlobalNav({
          channels: controller.channels,
          onChannelSelected: (channelId) => {
            selectedChannelId = channelId
          },
          selectedChannelId,
        }),
      ),
  }
}
