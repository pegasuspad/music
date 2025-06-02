import type { Channel } from 'easymidi'
import { logger } from '../../../logger.ts'
import type {
  ChallengeResult,
  EarTrainingChallenge,
} from '../ear-training-challenge.ts'
import type { NoteController } from '../note-controller.ts'

const log = logger.child({}, { msgPrefix: '[EAR] ' })

export class SingleNoteEarTraining implements EarTrainingChallenge {
  public readonly challengeReplayInterval = 4000
  private note: number

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
    log.info('Playing challenge.')

    output.play(this.note, 1000, {
      channel,
      onComplete: () => {
        log.info('Challenge playback completed.')
      },
      velocity: 96,
    })
  }
}
