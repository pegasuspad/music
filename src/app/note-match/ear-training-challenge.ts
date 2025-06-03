import type { Channel } from 'easymidi'
import type { NoteController } from './note-controller.ts'
import type { MidiDevice } from '../../midi/midi-device.ts'
import { currentTimeMillis } from '../../engine/timer.ts'
import { ChallengeInputHandler } from '../musical-exercise/ressponse-input-handler.ts'
import type { CallAndResponseChallenge } from '../musical-exercise/call-and-response-challenge.ts'

const challengeReplayInterval = 4000

export class ChallengeController {
  private challenge: CallAndResponseChallenge | undefined
  private challengeChannel: Channel
  private input: ChallengeInputHandler
  private noteController: NoteController
  private onCorrectResponse: () => Promise<void> | void
  private onIncorrectResponse: () => Promise<void> | void
  private replayChallengeAt = 0
  private state: 'ready' | 'started' = 'ready'

  public constructor(options: {
    challengeChannel: Channel
    echoChannel: Channel
    inputChannel: Channel
    midi: MidiDevice
    noteController: NoteController
    onCorrectResponse: () => Promise<void> | void
    onIncorrectResponse: () => Promise<void> | void
  }) {
    this.challengeChannel = options.challengeChannel
    this.input = new ChallengeInputHandler(
      options.midi,
      options.inputChannel,
      options.echoChannel,
      this.handleNote.bind(this),
    )
    this.noteController = options.noteController
    this.onCorrectResponse = options.onCorrectResponse
    this.onIncorrectResponse = options.onIncorrectResponse

    this.start()
  }

  private async handleNote(note: number, duration: number) {
    this.challenge?.handleResponseNote(note, duration)
    const result = this.challenge?.getResult()
    if (result === 'correct') {
      await this.onCorrectResponse()
    } else if (result === 'incorrect') {
      await this.onIncorrectResponse()
      this.replayChallengeAt = currentTimeMillis() + 700
    }
  }

  private async replayChallengeNow() {
    if (this.challenge) {
      this.replayChallengeAt = currentTimeMillis() + challengeReplayInterval

      await this.challenge.playChallenge(
        this.noteController,
        this.challengeChannel,
      )
    }
  }

  public setChallenge(challenge: CallAndResponseChallenge) {
    this.challenge = challenge
    this.replayChallengeAt = 0
  }

  private start() {
    if (this.state === 'ready') {
      this.input.start()
      this.state = 'started'
    }
  }

  public stop() {
    if (this.state === 'started') {
      this.input.stop()
      this.state = 'ready'
    }
  }

  public tick() {
    if (this.challenge && this.state === 'started') {
      if (currentTimeMillis() >= this.replayChallengeAt) {
        void this.replayChallengeNow()
      }
    }
  }
}
