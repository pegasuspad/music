import { group } from '../ui/components/group.ts'
import type { Program } from '../engine/program.ts'
import { createChannelLevelScreen } from './channel-level-screen/channel-level-screen.ts'
import type { MidiDevice } from '../midi/midi-device.ts'
import { LaunchpadController } from './controller.ts'
import { createSideTrackSelector } from './global-nav/side-track-selector.ts'
import { createTopScreenSelector } from './global-nav/top-screen-selector.ts'
import { createSoundSelectScreen } from './sound-select-screen/sound-select-screen.ts'
import type { Cell, Drawable } from '../ui/drawable.ts'
import type { RgbColor } from '../ui/color.ts'
import type { Instrument, InstrumentFamily } from '../midi/gm2.ts'
import { exec } from 'node:child_process'

export const createPoc = (synthesizer: MidiDevice): Program => {
  const controller = new LaunchpadController(synthesizer, 2)
  controller.stopAllSound()
  controller.selectSound(0, { program: 73 })
  controller.selectSound(1, { program: 73 })
  const selectedFamilies: Record<number, InstrumentFamily> = {}
  const selectedInstruments: Record<number, Instrument> = {}
  let selectedChannelId = controller.channels[0].id
  let selectedScreenId = 0

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

  const channelLevelScreenFactory = createChannelLevelScreen({
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

  const makeSoundSelectScreen = createSoundSelectScreen({
    onFamilySelected: (family) => {
      selectedFamilies[selectedChannelId] = family
    },
    onInstrumentSelected: (instrument) => {
      exec(`say ${JSON.stringify(instrument.name)}`)

      selectedInstruments[selectedChannelId] = instrument
      controller.selectSound(selectedChannelId, {
        program: instrument.patch,
      })
    },
    selectedFamily: selectedFamilies[selectedChannelId],
    selectedInstrument: selectedInstruments[selectedChannelId],
  })

  const makeSelectedScreen = () => {
    switch (selectedScreenId) {
      case 0:
        return channelLevelScreenFactory
      case 1:
        return makeSoundSelectScreen
      default:
        return () =>
          ({
            draw: () => [] as Cell<RgbColor>[],
          }) satisfies Drawable<RgbColor>
    }
  }

  return {
    getRoot: () =>
      group(
        makeSelectedScreen()(),
        createSideTrackSelector({
          channels: controller.channels,
          onChannelSelected: (channelId) => {
            selectedChannelId = channelId
          },
          selectedChannelId,
        }),
        createTopScreenSelector({
          numberOfScreens: 2,
          onScreenSelected: (id) => {
            selectedScreenId = id
          },
          selectedScreenId,
        }),
      ),
  }
}
