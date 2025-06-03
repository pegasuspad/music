import type { CallAndResponseContext } from '../call-and-response-context.ts'
import { SingleNoteEarTraining } from '../challenges/single-note-ear-training.ts'

export const makeStartNewChallenge =
  () => (context: CallAndResponseContext) => {
    return {
      enter: () => {
        context.challenge = SingleNoteEarTraining.createRandom()
      },
      getResult: () => 'done' as const,
      isDone: () => true,
      stateName: 'start-new-challenge' as const,
    }
  }
