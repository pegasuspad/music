import type pino from 'pino'
import type { MidiDevice } from '../../midi/midi-device.ts'
import type { RgbColor } from '../../ui/color.ts'
import type { MidiChannel } from './model.ts'
import { logger } from '../../logger.ts'
import { normalizeMidiByte } from '../../midi/normalize-midi-byte.ts'

export class Channel {
  /**
   * Current volume level for this channel.
   */
  private _level = 127

  private _log: pino.Logger

  /**
   * Whether this channel is currently muted or not.
   */
  private _muted = false

  public constructor(
    /**
     * Output MIDI device on which to play notes and update control or program values.
     */
    private _device: MidiDevice,

    /**
     * MIDI channel number (0-15) assigned to this instance.
     */
    private _midiChannel: MidiChannel,

    /**
     * Color used for UI elements assocaited with this channel.
     */
    private _color: RgbColor = [127, 127, 127],
  ) {
    this._log = logger.child({}, { msgPrefix: `[CHANNEL#${this.id}] ` })
  }

  /**
   * Mutes all sounds currently playing on this channel. This does not mute the channel, so if new notes are played
   * sound will resume as normal.
   */
  public stopAllSound() {
    this._device.send('cc', {
      channel: this.midiChannel,
      controller: 0x78,
      value: 0,
    })
  }

  /**
   * Selects the sound played by notes on this channel.
   * @param sound The specific sound to select.
   * @param sound.bank MIDI bank LSB
   * @param sound.program Program change number to select.
   */
  public selectSound({
    bank = 0,
    program,
  }: {
    /**
     * MIDI bank select LSB to select as the sound variation.
     * @defaultValue 0
     */
    bank?: number

    /**
     * Value of the MIDI program change message to use for sound selection.
     */
    program: number
  }) {
    this._device.send('cc', {
      channel: this.midiChannel,
      controller: 0,
      value: 121,
    })
    this._device.send('cc', {
      channel: this.midiChannel,
      controller: 32,
      value: bank,
    })

    console.log('send pro', this._device)
    this._device.send('program', {
      channel: this.midiChannel,
      number: program,
    })

    this._log.info({}, `Sent program change: ${program}`)
  }

  public get color() {
    return this._color
  }

  public get id(): number {
    return this.midiChannel
  }

  public get level() {
    return this._level
  }

  public set level(newValue: number) {
    const normalizedValue = normalizeMidiByte(newValue)
    if (this.level !== normalizedValue) {
      this._level = normalizedValue
      this._device.send('cc', {
        controller: 0x07,
        value: this.level,
        channel: this.midiChannel,
      })

      this._log.info(`Set level to ${normalizedValue}`)
    } else {
      this._log.debug(
        `Ignored attempt to set level, because the value did not change. [newValue=${normalizedValue}]`,
      )
    }
  }

  public get midiChannel() {
    return this._midiChannel
  }

  public get muted() {
    return this._muted
  }

  public set muted(newValue: boolean) {
    if (this.muted !== newValue) {
      this._muted = newValue
      this._log.info(`${newValue ? 'Muted' : 'Unmuted'} channel.`)
    } else {
      this._log.debug(
        `Ignored attempt to set muted, because the value did not change. [newValue=${newValue}]`,
      )
    }
  }
}
