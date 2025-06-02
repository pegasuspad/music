import type { Channel } from 'easymidi'
import type { MidiDevice } from '../../midi/midi-device.ts'
import { currentTimeMillis } from '../../engine/timer.ts'

interface ActiveNote {
  /**
   * Callback to invoke when the specified note completes.
   */
  callback?: () => void

  /**
   * Channel on which the note should be stopped.
   */
  channel: Channel

  /**
   * MIDI note value to stop
   */
  note: number

  /**
   * Time, in epoch ms, at which to stop the note.
   */
  stopAt: number
}

export class NoteController {
  private readonly notes = new Map<string, ActiveNote>()

  constructor(
    private readonly device: MidiDevice,
    private defaultChannel: Channel = 3,
  ) {}

  /**
   * Plays a note. Returns a callback which will stop the note.
   */
  public play(
    note: number,
    duration: number,
    {
      channel = this.defaultChannel,
      onComplete,
      velocity = 96,
    }: {
      /**
       * Channel on which to play the note
       * @defaultValue this.defaultChannel
       */
      channel?: Channel

      /**
       * Optional callback to invoke when the note is stopped.
       */
      onComplete?: () => void

      /**
       * Velocity with which to play the note.
       * @defaultValue 96
       */
      velocity?: number
    },
  ) {
    this.device.send('noteon', {
      channel,
      note,
      velocity,
    })

    const stopAt = currentTimeMillis() + duration
    const key = `${channel}#${note}#${stopAt}`

    this.notes.set(key, {
      callback: onComplete,
      channel,
      note,
      stopAt,
    })

    return () => {
      this.stop(channel, note)
      this.notes.delete(key)
    }
  }

  public stop(channel: Channel, note: number) {
    this.device.send('noteoff', {
      channel,
      note,
      velocity: 0,
    })
  }

  public tick() {
    for (const [key, note] of this.notes) {
      if (note.stopAt <= currentTimeMillis()) {
        this.stop(note.channel, note.note)
        note.callback?.()
        this.notes.delete(key)
      }
    }
  }
}
