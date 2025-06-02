import type { Channel, Note } from 'easymidi'
import type { NoteController } from './note-controller.ts'
import type { MidiDevice } from '../../midi/midi-device.ts'
import { currentTimeMillis } from '../../engine/timer.ts'
import { logger } from '../../logger.ts'

export type ChallengeResult =
  // the provided input is correct
  | 'correct'
  // the provided input is incorrect
  | 'incorrect'
  // more input notes are required
  | 'pending'

export interface EarTrainingChallenge {
  /**
   * Interval, in millseconds, at which the challenge should automatically replay if there is no input.
   */
  challengeReplayInterval: number

  /**
   * Called when a user plays a note in response to the challenge.
   */
  handleNote(note: number, duration: number): ChallengeResult

  /**
   * Play the challenge sequence, resolving the promise when playback is complete.
   */
  playChallenge(output: NoteController, channel: Channel): void
}

const log = logger.child({}, { msgPrefix: '[EAR] ' })

interface CurrentNote {
  startTime: number
  value: number
}

export class ChallengeInputHandler {
  private noteOffHandler: (event: Note) => void
  private noteOnHandler: (event: Note) => void
  private currentNote: CurrentNote | undefined
  private state: 'ready' | 'started' = 'ready'

  public constructor(
    private readonly midi: MidiDevice,
    private readonly inputChannel: Channel,
    private readonly echoChannel: Channel,
    private readonly onNote: (note: number, duration: number) => void,
  ) {
    this.noteOffHandler = this.handleNoteOff.bind(this)
    this.noteOnHandler = this.handleNoteOn.bind(this)

    this.start()
  }

  private handleNoteOff(note: Note) {
    this.midi.send('noteoff', {
      ...note,
      channel: this.echoChannel,
    })

    if (
      this.inputChannel === note.channel &&
      this.currentNote?.value === note.note
    ) {
      const duration = currentTimeMillis() - this.currentNote.startTime

      log.info(`Checking note input. [note=${note.note}, duration=${duration}]`)

      this.onNote(this.currentNote.value, duration)
      this.currentNote = undefined
    }
  }

  private handleNoteOn(note: Note) {
    if (this.inputChannel === note.channel) {
      if (!this.isPlaying) {
        this.midi.send('noteon', {
          ...note,
          channel: this.echoChannel,
        })

        this.currentNote = {
          startTime: currentTimeMillis(),
          value: note.note,
        }
      }
    }
  }

  public get isPlaying() {
    return this.currentNote !== undefined
  }

  public start() {
    if (this.state === 'ready') {
      this.midi.on('noteoff', this.noteOffHandler)
      this.midi.on('noteon', this.noteOnHandler)

      this.state = 'started'
    }
  }

  public stop() {
    if (this.state === 'started') {
      this.midi.off('noteoff', this.noteOffHandler)
      this.midi.off('noteon', this.noteOnHandler)

      this.state = 'ready'
    }
  }
}

export class ChallengeController {
  private challenge: EarTrainingChallenge | undefined
  private challengeChannel: Channel
  private input: ChallengeInputHandler
  private noteController: NoteController
  private onCorrectResponse: () => void
  private onIncorrectResponse: () => void
  private replayChallengeAt = 0
  private state: 'ready' | 'started' = 'ready'

  public constructor(options: {
    challengeChannel: Channel
    echoChannel: Channel
    inputChannel: Channel
    midi: MidiDevice
    noteController: NoteController
    onCorrectResponse: () => void
    onIncorrectResponse: () => void
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

  private handleNote(note: number, duration: number) {
    const result = this.challenge?.handleNote(note, duration)
    if (result === 'correct') {
      this.onCorrectResponse()
    } else if (result === 'incorrect') {
      this.onIncorrectResponse()
      this.replayChallengeAt = currentTimeMillis() + 700
    }
  }

  private replayChallengeNow() {
    if (this.challenge) {
      this.replayChallengeAt =
        currentTimeMillis() + this.challenge.challengeReplayInterval

      this.challenge.playChallenge(this.noteController, this.challengeChannel)
    }
  }

  public setChallenge(challenge: EarTrainingChallenge) {
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
        this.replayChallengeNow()
      }
    }
  }
}
