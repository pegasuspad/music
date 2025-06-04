import type { Channel } from 'easymidi'
import type {
  CallAndResponseChallenge,
  ChallengeResult,
} from '../call-and-response-challenge.ts'
import { getNoteTicks, type SequencedEvent } from '../../../midi/sequencing.ts'
import type { Drawable } from '../../../ui/drawable.ts'
import { createRectangle } from '../../../ui/components/rectangle.ts'
import { group } from '../../../ui/components/group.ts'
import type { RgbColor } from '../../../ui/color.ts'
import { translate } from '../../../ui/transform/translate.ts'

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

const createUpArrow = ({ onPress }: { onPress: () => void }) => {
  return group(
    translate(
      2,
      0,
      createRectangle({
        color: [127, 127, 127],
        height: 3,
        width: 1,
        onPress,
      }),
    ),
    translate(
      1,
      1,
      createRectangle({
        color: [127, 127, 127],
        height: 1,
        width: 3,
        onPress,
      }),
    ),
    translate(
      0,
      0,
      createRectangle({
        color: [127, 127, 127],
        height: 1,
        width: 5,
        onPress,
      }),
    ),
  )
}

const createDownArrow = ({ onPress }: { onPress: () => void }) => {
  return group(
    translate(
      2,
      0,
      createRectangle({
        color: [127, 127, 127],
        height: 3,
        width: 1,
        onPress,
      }),
    ),
    translate(
      1,
      1,
      createRectangle({
        color: [127, 127, 127],
        height: 1,
        width: 3,
        onPress,
      }),
    ),
    translate(
      0,
      2,
      createRectangle({
        color: [127, 127, 127],
        height: 1,
        width: 5,
        onPress,
      }),
    ),
  )
}

const makeButton = ({
  color,
  direction,
  onPress,
}: {
  color: RgbColor
  direction: 'up' | 'down'
  onPress: () => void
}) =>
  group(
    createRectangle({
      color,
      height: 3,
      width: 7,
      onPress,
    }),
    ...(direction === 'up' ?
      [translate(1, 0, createUpArrow({ onPress }))]
    : [translate(1, 0, createDownArrow({ onPress }))]),
  )

export class HigherOrLower implements CallAndResponseChallenge {
  public readonly challengeReplayInterval = 6000
  private note1: number
  private note2: number
  private result: ChallengeResult = 'pending'

  public static createRandom(): CallAndResponseChallenge {
    let first = 0
    let second = 0

    while (first === second) {
      first = getRandomInt(notes.length)
      second = getRandomInt(notes.length)
    }

    return new HigherOrLower(notes[first].value, notes[second].value)
  }

  public constructor(note1: number, note2: number) {
    this.note1 = note1
    this.note2 = note2
  }

  public getChallengeUi(): Drawable {
    return group(
      translate(
        0,
        4,
        makeButton({
          color: [127, 127, 0],
          direction: 'up',
          onPress: () => {
            this.result = this.note2 > this.note1 ? 'correct' : 'incorrect'
          },
        }),
      ),
      translate(
        1,
        0,
        makeButton({
          color: [0, 0, 127],
          direction: 'down',
          onPress: () => {
            this.result = this.note2 < this.note1 ? 'correct' : 'incorrect'
          },
        }),
      ),
    )
  }

  public getResult(): ChallengeResult {
    return this.result
  }

  public handleResponseNote(_note: number, _duration: number): void {
    // noop
  }

  public getChallengeSequence(channel: Channel): SequencedEvent[] {
    return [
      {
        deltaTimeMs: 500,
        deltaType: 'milliseconds',
        event: 'noteon',
        data: {
          channel,
          note: this.note1,
          velocity: 96,
        },
      },
      {
        deltaTime: getNoteTicks('quarter'),
        event: 'noteoff',
        data: {
          channel,
          note: this.note1,
          velocity: 0,
        },
      },
      {
        deltaTime: getNoteTicks('quarter'),
        event: 'noteon',
        data: {
          channel,
          note: this.note2,
          velocity: 96,
        },
      },
      {
        deltaTime: getNoteTicks('quarter'),
        event: 'noteoff',
        data: {
          channel,
          note: this.note2,
          velocity: 0,
        },
      },
    ]
  }

  public reset() {
    this.result = 'pending'
  }
}
