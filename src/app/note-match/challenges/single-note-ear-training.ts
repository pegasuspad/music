import type { Channel } from 'easymidi'
import { logger } from '../../../logger.ts'
import type {
  ChallengeResult,
  EarTrainingChallenge,
} from '../ear-training-challenge.ts'
import type { NoteController } from '../note-controller.ts'

const log = logger.child({}, { msgPrefix: '[EAR] ' })

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


export class SingleNoteEarTraining implements EarTrainingChallenge {
  public readonly challengeReplayInterval = 4000
  private note: number

  public static createRandom(): EarTrainingChallenge {
    const index = getRandomInt(notes.length)
    return new SingleNoteEarTraining(notes[index].value)
  }

  public constructor(note: number) {
    this.note = note
  }

  public handleNote(note: number, _duration: number): ChallengeResult {
    log.info(`Received response note: ${note}`)

    if (note === this.note) {
      return 'correct'
    } else {
      return 'incorrect'
    }
  }

  public playChallenge(output: NoteController, channel: Channel) {
    log.debug('Playing challenge.')

    return new Promise<void>(resolve => {
      output.play(this.note, 1000, {
        channel,
        onComplete: () => {
          log.debug('Challenge playback completed.')
          resolve()
        },
        velocity: 96,
      })
    })
  }
}
