import { group } from '../../ui/components/group.ts'
import { createChannelLevelScreen } from './channel-level-screen/channel-level-screen.ts'
import type { MidiDevice } from '../../midi/midi-device.ts'
import { LaunchpadController } from './controller.ts'
import { createSideTrackSelector } from './global-nav/side-track-selector.ts'
import { createTopScreenSelector } from './global-nav/top-screen-selector.ts'
import { createSoundSelectScreen } from './sound-select-screen/sound-select-screen.ts'
import type { Cell, Drawable } from '../../ui/drawable.ts'
import type { RgbColor } from '../../ui/color.ts'
import type { NovationLaunchpadMiniMk3 } from '../../vendors/novation/launchpad-mini-mk3/novation-launchpad-mini-mk3.ts'
import { logger } from '../../logger.ts'
import { speak } from '../speak.ts'
import type { ReadbackEvent } from '../../vendors/novation/launchpad-mini-mk3/events.ts'
import {
  InstrumentFamilies,
  type Instrument,
  type InstrumentFamily,
} from '../../midi/instrument-data.ts'
import { InstrumentsByFamily } from '../../midi/instruments.ts'
import type { Program } from '../../engine/engine.ts'

const log = logger.child({}, { msgPrefix: '[PROGRAM] ' })

export const createSoundPickerProgram = (
  launchpad: NovationLaunchpadMiniMk3,
  synthesizer: MidiDevice,
  {
    speakInstrumentNames = true,
  }: {
    /**
     * Whether to speak instrument names as they are selected or not.
     * @defaultValue true
     */
    speakInstrumentNames?: boolean
  } = {},
): Program => {
  const channelCount = 1
  const controller = new LaunchpadController(synthesizer, channelCount)
  const selectedFamilies: Record<number, InstrumentFamily> = {}
  const selectedInstruments: Record<number, Instrument> = {}
  let selectedChannelId = controller.channels[0].id
  let selectedScreenId = 1

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

  const selectFamily = (family: InstrumentFamily) => {
    selectedFamilies[selectedChannelId] = family
  }

  const selectInstrument = (instrument: Instrument) => {
    if (speakInstrumentNames) {
      speak(instrument.name)
    }

    selectedInstruments[selectedChannelId] = instrument
    controller.selectSound(selectedChannelId, {
      bank: instrument.bank.lsb,
      program: instrument.patch,
    })
  }

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

  const makeSoundSelectScreen = () =>
    createSoundSelectScreen({
      onFamilySelected: selectFamily,
      onInstrumentSelected: selectInstrument,
      selectedFamily: selectedFamilies[selectedChannelId],
      selectedInstrument: selectedInstruments[selectedChannelId],
    })()

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
          }) satisfies Drawable
    }
  }

  const handleReadback = ({ command, data }: ReadbackEvent) => {
    if (command === 'select-mode' && data[0] !== 1) {
      log.info('Setting programmer mode.')
      void launchpad.sendCommand('select-mode', 'programmer')
    }
  }

  return {
    getDrawable: () => {
      return group(
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
      )
    },
    initialize: () => {
      log.info('Initializing "Sound Picker" program.')

      // reset instruments and mute all tracks except first
      for (let i = 0; i < channelCount; i++) {
        selectedFamilies[i] = InstrumentFamilies[0]
        selectedInstruments[i] =
          InstrumentsByFamily[selectedFamilies[i].name][0]
        controller.selectSound(i, {
          bank: selectedInstruments[i].bank.lsb,
          program: selectedInstruments[i].patch,
        })

        if (i > 0) {
          controller.setMuted(i, true)
        }
      }

      selectedChannelId = controller.channels[0].id
      selectedScreenId = 1

      controller.initialize()
      launchpad.events.on('readback', handleReadback)
    },
    shutdown: () => {
      log.info('Shutting down "Sound Picker" program.')
      controller.shutdown()
      launchpad.events.off('readback', handleReadback)
    },
  }
}
