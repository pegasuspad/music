import type { CallAndResponseContext } from '../call-and-response-context.ts'
import { HigherOrLower } from '../challenges/higher-or-lower.ts'

export const makeStartNewChallenge =
  () => (context: CallAndResponseContext) => {
    return {
      enter: () => {
        context.challenge = HigherOrLower.createRandom()
      },
      getResult: () => 'done' as const,
      isDone: () => true,
      stateName: 'start-new-challenge' as const,
    }
  }
