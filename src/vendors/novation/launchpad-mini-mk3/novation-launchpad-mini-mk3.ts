import isEqual from 'lodash-es/isEqual.js'
import { MidiDevice } from '../../../devices/midi-device.ts'
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
import { tryParseReadbackMessage } from './try-parse-readback-message.ts'

const DeviceInquiryHeader = [
  0x7e, 0x00, 0x06, 0x02, 0x00, 0x20, 0x29, 0x13, 0x01, 0x00, 0x00,
]

const log = logger.child({}, { msgPrefix: '[LAUNCHPAD] ' })

type ReadbackHandlerFn = (data: {
  command: number
  data: number[]
  raw: number[]
}) => boolean

export class NovationLaunchpadMiniMk3 {
  private _initializationLogsDisplayed = false
  public readonly _input: MidiDevice
  private _output: MidiDevice

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
  }

  /**
   * List of functions waiting for SysEx readback data. Each time we receive a SysEx message, all handlers will be
   * called. If the handler returns `true` (indicating it processed the expected readback), then it will be removed from
   * the list.
   */
  private _readbackHandlers: ReadbackHandlerFn[] = []

  private handleReadbacks(data: number[]) {
    const parsed =
      data.length > 8 ?
        {
          command: data[6],
          data: data.slice(7, -1),
          raw: data.slice(1, -1),
        }
      : {
          command: 0,
          data: [],
          raw: data.length >= 2 ? data.slice(1, -1) : data,
        }

    const completed: ReadbackHandlerFn[] = []
    this._readbackHandlers.forEach((handler) => {
      if (handler(parsed)) {
        completed.push(handler)
      }
    })

    this._readbackHandlers = this._readbackHandlers.filter(
      (candidate) => !completed.includes(candidate),
    )
  }

  /**
   * Callback which is invoked when the Launchpad's input device is (re)connected to USB.
   */
  private async onInputConnect(): Promise<void> {
    log.info(`Connected: ${this._input.name}`)
    this._input.on('sysex', (sysex) => {
      this.onSysEx(sysex)
    })

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
    const result = tryParseReadbackMessage(bytes)
    if (!result.success) {
      log.warn(
        { message: bytes.map((b) => `${b}`).join(', ') },
        `Received unrecognized SysEx message (${bytes.length} bytes)`,
      )
      return
    }

    const { command: code, data } = result
    const command = lookupCommand(code)
    if (command === undefined) {
      log.warn(
        { message: bytes.map((b) => `${b}`).join(', ') },
        `Received SysEx message with unrecognized command code: ${code}`,
      )
    } else {
      log.debug(
        {
          command: code,
          data,
        },
        `Received SysEx readback message for command: ${code}`,
      )

      // this.emit(command.name, command.fromBytes(data))
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

  /**
   * Sends a readback sysex message, returning the response. Will reject if the response is not received within the
   * specified timeout.
   * @param message
   */
  private readback(
    message: number[],
    handler: ReadbackHandlerFn,
    timeoutMs = 1000,
  ): Promise<number[]> {
    return new Promise<number[]>((_, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new Error(
            `Timeout exceeded waiting for SysEx readback. [${timeoutMs}]`,
          ),
        )
      }, timeoutMs)

      this._readbackHandlers.push((data) => {
        const result = handler(data)
        if (result) {
          clearTimeout(timeout)
        }

        return result
      })

      this._output.send('sysex', message)
    })
  }

  public getFirmwareVersion(timeoutMs = 250): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new Error(`Timeout waiting for device version. [${timeoutMs} ms]`),
        )
      }, timeoutMs)

      this._readbackHandlers.push(({ raw }) => {
        const lengthMatches = raw.length === DeviceInquiryHeader.length + 4
        const headerMatches = isEqual(
          DeviceInquiryHeader,
          raw.slice(0, DeviceInquiryHeader.length),
        )
        if (lengthMatches && headerMatches) {
          clearTimeout(timeout)

          resolve(
            Number.parseInt(raw.slice(DeviceInquiryHeader.length).join(''), 10),
          )
          return true
        }

        return false
      })

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
    this._output.send('sysex', message)
    return Promise.resolve()
  }
}
