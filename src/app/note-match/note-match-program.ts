import type { Channel, Note } from 'easymidi'
import type { Program } from '../../engine/program.ts'
import type { MidiDevice } from '../../midi/midi-device.ts'
import { group } from '../../ui/components/group.ts'
import { createRectangle } from '../../ui/components/rectangle.ts'
import { translate } from '../../ui/transform/translate.ts'
import type { NovationLaunchpadMiniMk3 } from '../../vendors/novation/launchpad-mini-mk3/novation-launchpad-mini-mk3.ts'
import {
  ChallengeController,
  type EarTrainingChallenge,
} from './ear-training-challenge.ts'
import { NoteController } from './note-controller.ts'
import { SingleNoteEarTraining } from './challenges/single-note-ear-training.ts'
import { logger } from '../../logger.ts'

const log = logger.child({}, { msgPrefix: '[PROGRAM] ' })

const notes = [
  {
    name: 'C',
    value: 60,
  },
  {
    name: 'D',
    value: 62,
  },
  {
    name: 'E',
    value: 64,
  },
  {
    name: 'F',
    value: 65,
  },
  {
    name: 'G',
    value: 67,
  },
  {
    name: 'A',
    value: 69,
  },
  {
    name: 'B',
    value: 71,
  },

  {
    name: 'C',
    value: 72,
  },
]

const getRandomInt = (max: number) => {
  return Math.floor(Math.random() * max)
}

const MidiChannels = {
  Challenge: 4,
  CorrectFeedback: 5,
  Echo: 3,
  IncorrectFeedack: 6,
  Input: 0,
} as const

export const createNoteMatchProgram = (
  launchpad: NovationLaunchpadMiniMk3,
  synthesizer: MidiDevice,
): Program => {
  let activeNoteIndex: number | undefined
  let challenge: EarTrainingChallenge | undefined
  const noteController = new NoteController(synthesizer)

  const challengeController = new ChallengeController({
    challengeChannel: MidiChannels.Challenge,
    echoChannel: MidiChannels.Echo,
    inputChannel: MidiChannels.Input,
    midi: synthesizer,
    noteController,
    onCorrectResponse: async () => {
      await applause().then(() => {
        startNewChallenge()
      })
    },
    onIncorrectResponse: () => {
      // noop
    },
  })

  const startNewChallenge = (): void => {
    activeNoteIndex = getRandomInt(8)
    challenge = new SingleNoteEarTraining(notes[activeNoteIndex].value)
    challengeController.setChallenge(challenge)
  }

  const stopNotes = (channel: Channel = 1) => {
    synthesizer.send('cc', {
      channel,
      controller: 0x78,
      value: 0,
    })
  }

  const applause = async (): Promise<void> => {
    synthesizer.send('program', {
      channel: MidiChannels.CorrectFeedback,
      number: 15 * 8 + 6,
    })

    await new Promise<void>((resolve) => {
      noteController.play(60, 1250, {
        channel: MidiChannels.CorrectFeedback,
        onComplete: resolve,
      })
    })

    return new Promise<void>((resolve) => {
      setTimeout(resolve, 1000)
    })
  }

  const error = async (): Promise<void> => {
    synthesizer.send('program', {
      channel: MidiChannels.CorrectFeedback,
      number: 10 * 8 + 0,
    })

    return new Promise<void>((resolve) => {
      noteController.play(22, 150, {
        channel: MidiChannels.CorrectFeedback,
        onComplete: resolve,
      })
    })
  }

  return {
    getRoot: () =>
      group(
        createRectangle({
          color: [0, 0, 0],
          height: 9,
          width: 9,
        }),
        translate(
          activeNoteIndex ?? 0,
          0,
          activeNoteIndex === undefined ? group() : (
            createRectangle({
              color: [0, 0, 127],
              height: 8,
              width: 1,
            })
          ),
        ),
      ),
    initialize: () => {
      log.info('Initializing "Note Match" program.')
      synthesizer.send('program', {
        channel: MidiChannels.Echo,
        number: 0,
      })
      synthesizer.send('program', {
        channel: MidiChannels.Challenge,
        number: 0,
      })
    },
    shutdown: () => {
      challengeController.stop()
    },
    tick: () => {
      challengeController.tick()
      noteController.tick()

      if (challenge === undefined) {
        startNewChallenge()
      }
    },
  }
}
