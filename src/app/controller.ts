import { logger } from '../logger.ts'
import type { MidiDevice } from '../midi/midi-device.ts'
import type { RgbColor } from '../ui/color.ts'
import type { MidiChannel } from './model.ts'
import { Channel } from './channel.ts'

const _log = logger.child({}, { msgPrefix: '[APP] ' })

/**
 * Default display colors for our channels. Used for UI controls such as faders.
 */
const ChannelColors: RgbColor[] = [
  [67, 103, 125],
  [85, 127, 97],
  [100, 80, 127],
  [127, 63, 51],
  [0, 0, 127],
  [127, 127, 0],
  [127, 0, 127],
  [0, 127, 127],
]

/**
 * MIDI channel numbers to assign to our virtual channels.
 */
const MidiChannels = [3, 4, 5, 6, 7, 8, 10, 11] satisfies MidiChannel[]

export class LaunchpadController {
  /**
   * Set of channels managed by this controller.
   */
  private _channels: Channel[]

  /**
   * Creates a new LaunchpadController.
   * @param instrument MIDI device being controlled by this instance.
   * @param channelCount Number of channels to manage. Defaults to four.
   */
  constructor(
    private readonly instrument: MidiDevice,
    channelCount = 4,
  ) {
    if (channelCount < 1 || channelCount > 8) {
      throw new Error(
        `The channelCount must be between 1 and 8, inclusive. [channelCount=${channelCount}]`,
      )
    }

    this._channels = Array.from(
      { length: channelCount },
      (_, i) => new Channel(this.instrument, MidiChannels[i], ChannelColors[i]),
    )

    this.hookInstrumentEvents()
  }

  private hookInstrumentEvents() {
    this.instrument.on('noteon', (note) => {
      this.channels.forEach((channel) => {
        if (!channel.muted) {
          this.instrument.send('noteon', {
            ...note,
            channel: channel.midiChannel,
          })
        }
      })
    })

    this.instrument.on('noteoff', (note) => {
      this.channels.forEach((channel) => {
        this.instrument.send('noteoff', {
          ...note,
          channel: channel.midiChannel,
        })
      })
    })
  }

  private channelById(id: number): Channel | undefined {
    return this._channels.find((channel) => channel.id === id)
  }

  public get channels(): readonly Readonly<Channel>[] {
    return this._channels
  }

  /**
   * Mutes all sounds currently playing. If an optional channel id is provided, only that channel will be muted.
   * This does not mute the channels, so if new notes are played sound will resume as normal.
   * @param channelId ID of the channel in the controller's channel list. If not set, then all channels will be muted.
   */
  public stopAllSound(channelId?: number) {
    if (channelId !== undefined) {
      this.channelById(channelId)?.stopAllSound()
    } else {
      this.channels.forEach((channel) => {
        channel.stopAllSound()
      })
    }
  }

  /**
   * Sets the muted status for the channel with the specified ID.
   * @param channelId ID of the channel which should have its mute state updated.
   * @param muted
   */
  public setMuted(channelId: number, muted: boolean) {
    const channel = this.channelById(channelId)
    if (channel) {
      channel.muted = muted
    }
  }

  /**
   * Sets the level (volume) for the channel with the specified ID.
   * @param channelId ID of the channel which should have its mute state updated.
   * @param level Level to set for the channel, in the range 0-127. Will be clamped to that range. Non-integers will be
   *    rounded to the nearest integer.
   */
  public setLevel(channelId: number, level: number) {
    const channel = this.channelById(channelId)
    if (channel) {
      channel.level = level
    }
  }

  /**
   * Selects the sound played by notes on a specified channel.
   * @param channelId ID of the channel which should have its sound changed.
   * @param sound The specific sound to select.
   * @param sound.bank MIDI bank LSB
   * @param sound.program Program change number to select.
   */
  public selectSound(
    channelId: number,
    sound: {
      /**
       * MIDI bank select LSB to select as the sound variation.
       * @defaultValue 0
       */
      bank?: number

      /**
       * Value of the MIDI program change message to use for sound selection.
       */
      program: number
    },
  ) {
    this.channelById(channelId)?.selectSound(sound)
  }
}
