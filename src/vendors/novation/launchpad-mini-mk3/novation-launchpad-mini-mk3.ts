import { MidiDevice } from '../../../midi/midi-device.ts'
import { get } from 'lodash-es'
import { logger } from '../../../logger.ts'
import {
  CommandHeader,
  CommandTrailer,
  LaunchpadCommands,
  lookupCommand,
  type LaunchpadCommand,
  type LaunchpadCommandConfig,
  type LaunchpadCommandDataType,
} from './commands/index.ts'
import type { Sysex } from 'easymidi'
import { parseSysexMessage } from './sysex-messages.ts'
import { parseSysex } from '../../../midi/sysex-message-parser.ts'
import type { TypedEventEmitter } from '../../../typed-event-emitter.ts'
import EventEmitter from 'node:events'
import type {
  IdentityResponseEvent,
  LaunchpadEventMap,
  ReadbackEvent,
} from './events.ts'
import { setInterval } from 'node:timers'

export type LaunchpadEventEmitter = TypedEventEmitter<LaunchpadEventMap>

const log = logger.child({}, { msgPrefix: '[LAUNCHPAD] ' })

export class NovationLaunchpadMiniMk3 {
  private _initializationLogsDisplayed = false
  private _events = new EventEmitter() as LaunchpadEventEmitter
  public readonly _input: MidiDevice
  private _inputInitialized = false
  private _output: MidiDevice

  private _statsStartTime = 0
  private _bytesSent = 0

  constructor({
    inputDeviceName = 'Launchpad Mini MK3 LPMiniMK3 MIDI Out',
    outputDeviceName = 'Launchpad Mini MK3 LPMiniMK3 MIDI In',
  }: {
    inputDeviceName?: string
    outputDeviceName?: string
  } = {}) {
    this._input = new MidiDevice(inputDeviceName, 'input')
    this._output = new MidiDevice(outputDeviceName, 'output')

    this._input.on('connected', () => {
      void this.onInputConnect()
    })
    this._output.on('connected', () => {
      void this.onOutputConnect()
    })

    this._input.on('disconnected', () => {
      this.onDisconnect(this._input.name)
    })
    this._output.on('disconnected', () => {
      this.onDisconnect(this._output.name)
    })

    setInterval(() => {
      this._events.emit('midi-stats', {
        bytesSent: this._bytesSent,
        eventType: 'midi-stats',
        interval: Date.now() - this._statsStartTime,
      })
      this._statsStartTime = Date.now()
      this._bytesSent = 0
    }, 15000)
    this._statsStartTime = Date.now()
  }

  /**
   * Callback which is invoked when the Launchpad's input device is (re)connected to USB.
   */
  private async onInputConnect(): Promise<void> {
    log.info(`Connected: ${this._input.name}`)

    if (!this._inputInitialized) {
      this._input.on('sysex', (sysex) => {
        this.onSysEx(sysex)
      })
      this._inputInitialized = true
    }

    await this.logDeviceData()
  }

  /**
   * Callback which is invoked when the Launchpad's output device is (re)connected to USB.
   */
  private async onOutputConnect(): Promise<void> {
    log.info(`Connected: ${this._output.name}`)
    log.info('Setting programmer mode.')
    await this.sendCommand('select-mode', 'programmer')

    await this.logDeviceData()
  }

  /**
   * Called when the system detects that the device was disconnected from the USB port.
   */
  private onDisconnect(name: string) {
    log.info(`Disconnected: ${name}`)
  }

  /**
   * Handler invoked when the Launchpad sends a SysEx message. Will attempt to parse it is a valid readback, and emit
   * the corresponding event. Logs a warning and discards the event otherwise.
   * @param data
   */
  private onSysEx({ bytes }: Sysex) {
    const result = parseSysex(bytes)
    if (!result.valid) {
      log.warn(
        { message: bytes.map((b) => `${b}`).join(', ') },
        `Received invalid SysEx message (${bytes.length} bytes)`,
      )
    } else if (result.message.source === 'universal') {
      // handle universal message
      if (result.message.type === 'identity-response') {
        this._events.emit('identity-response', {
          eventType: 'identity-response',
          message: result.message,
        })
      } else {
        logger.warn(
          { message: result.message },
          `Received unexpected universal SysEx message of type: ${result.message.type}`,
        )
      }
    } else {
      const message = parseSysexMessage(result.message)
      if (message.type === 'unknown') {
        log.warn(
          { message: bytes.map((b) => `${b}`).join(', ') },
          `Received unrecognized SysEx message (${bytes.length} bytes)`,
        )
      } else {
        const command = lookupCommand(message.command)
        log.info(
          `Received SysEx readback message for command: ${command?.name ?? message.command}`,
        )

        if (command === undefined) {
          log.warn(
            { message: bytes.map((b) => `${b}`).join(', ') },
            `Received SysEx message with unrecognized command code: ${message.command}`,
          )
        } else {
          this._events.emit('readback', {
            command: command.name as ReadbackEvent['command'],
            data: message.payload,
            eventType: 'readback',
          })
        }
      }
    }
  }

  private async logDeviceData() {
    // wait for both input & output devices
    if (
      this._input.state !== 'connected' ||
      this._output.state !== 'connected'
    ) {
      return
    }

    if (!this._initializationLogsDisplayed) {
      try {
        const firmwareVersion = await this.getFirmwareVersion(5000)
        log.info(`Detected firmware version: ${firmwareVersion}`)
      } catch (err: unknown) {
        console.warn(
          `Failed to get firmware version: ${get(err, 'message', String(err))}`,
          err,
        )
      }

      this._initializationLogsDisplayed = true
    }
  }

  public get events(): Omit<LaunchpadEventEmitter, 'emit'> {
    return this._events
  }

  public getFirmwareVersion(timeoutMs = 250): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this._events.off('identity-response', handleResponse)
        reject(
          new Error(`Timeout waiting for device version. [${timeoutMs} ms]`),
        )
      }, timeoutMs)

      const handleResponse = ({ message }: IdentityResponseEvent) => {
        clearTimeout(timeout)
        resolve(Number.parseInt(message.version.join(''), 10))
      }
      this._events.on('identity-response', handleResponse)
      this._output.send('sysex', [0xf0, 0x7e, 0x7f, 0x06, 0x01, 0xf7])
    })
  }

  /**
   * Sends the specified SysEx command to the device. The data to send is not validated before sending.
   * @see - Launchpad Mini - Programmer's Referene Manual
   * @param command Name of the command to send.
   * @param data Command-specific data.
   */
  public sendCommand<C extends LaunchpadCommand = LaunchpadCommand>(
    command: C,
    data: LaunchpadCommandDataType<C>,
  ): Promise<void> {
    const commandConfig = LaunchpadCommands[command] as LaunchpadCommandConfig<
      LaunchpadCommandDataType<C>
    >
    const marshalledData = commandConfig.toBytes(data)

    const message = [
      ...CommandHeader,
      commandConfig.code,
      ...marshalledData,
      ...CommandTrailer,
    ]

    log.debug(
      { data, message: message.map((b) => `${b}`).join(', ') },
      `Sending command: ${command}`,
    )

    this._bytesSent += message.length

    this._output.send('sysex', message)
    return Promise.resolve()
  }
}
