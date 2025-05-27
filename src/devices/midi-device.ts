import EventEmitter from 'events'
import * as easymidi from 'easymidi'
import {
  type MidiEventMap,
  MidiEvents,
  MidiParameterMap,
} from './midi-events.ts'
import type { TypedEventEmitter } from '../typed-event-emitter.ts'
import { MidiDeviceWatcher } from './midi-device-watcher.ts'
import pino from 'pino'
import { logger } from '../logger.ts'

// combine the built-in connection events + the MIDI callbacks
type AllEvents = {
  connected: () => void
  disconnected: () => void
  error: () => void
} & MidiEventMap

export class MidiDevice extends (EventEmitter as new () => TypedEventEmitter<AllEvents>) {
  private device?: easymidi.Input | easymidi.Output
  private log: pino.Logger
  private _state: 'connected' | 'disconnected' | 'error' = 'disconnected'
  private createDeviceHandle: ReturnType<typeof setTimeout> | undefined
  private watcher: MidiDeviceWatcher

  constructor(
    public readonly name: string,
    private direction: 'input' | 'output' = 'input',
    pollIntervalMs = 100,
  ) {
    super()

    this.log = logger.child({}, { msgPrefix: `[${name}] ` })

    this.watcher = new MidiDeviceWatcher({
      devicesToWatch: [name],
      pollIntervalMs,
    })

    const setState = (state: 'connected' | 'disconnected' | 'error') => () => {
      this.log.debug(`state === ${state}`)
      this._state = state
    }

    this.on('connected', setState('connected'))
    this.on('disconnected', setState('disconnected'))
    this.on('error', setState('error'))

    this.watcher
      .on('found', this.connect.bind(this))
      .on('lost', this.disconnect.bind(this))
      .start()

    this.log.debug('Started DeviceWatcher.')
  }

  private tryCreateDevice() {
    try {
      const DeviceClass =
        this.direction === 'input' ? easymidi.Input : easymidi.Output
      this.device = new DeviceClass(this.name)
      this.hookAllEvents()

      this.emit('connected')
    } catch (_) {
      this.createDeviceHandle = setTimeout(this.tryCreateDevice.bind(this), 100)

      this.emit('error')
    }
  }

  private connect() {
    this.log.debug('Received event from DeviceWatcher: found')

    if (this.state === 'connected') {
      // already connected
      return
    }

    // easymidi reconnects if the device is already created, so we just set our connection state
    if (this.device === undefined) {
      this.tryCreateDevice()
    } else {
      this.emit('connected')
    }
  }

  private disconnect() {
    this.log.debug('Received event from DeviceWatcher: lost')

    if (this.state === 'disconnected') {
      // already disconnected
      return
    }

    // stop trying to create the device
    if (this.createDeviceHandle) {
      clearTimeout(this.createDeviceHandle)
    }

    this.device = undefined
    this.emit('disconnected')
  }

  /** for input devices only */
  private hookAllEvents() {
    if (this.direction !== 'input') {
      return
    }

    const input = this.device as easymidi.Input
    for (const event of MidiEvents) {
      const listener = ((...args: Parameters<MidiEventMap[typeof event]>) => {
        this.emit(event, ...args)
      }) as MidiEventMap[typeof event]

      input.on(event, listener)
    }
  }

  public override on<E extends keyof AllEvents>(
    event: E,
    listener: AllEvents[E],
  ): this {
    super.on(event, listener)

    this.log.debug(`Registering listener for event: ${event}`)

    // if they’re listening for "connected" *and* we already are... resend, so that clients can perform "on-connect"
    // initialization reliably
    if (event === 'connected' && this._state === 'connected') {
      this.log.debug(`Sending immediate 'connected' event for new listener.`)

      // schedule it async so it looks just like a normal event
      setImmediate(listener as () => void)
    } else if (event === 'connected') {
      this.log.debug(
        `Not connected when adding new 'connected' listener. [state=${this._state}]`,
      )
    }

    return this
  }

  /** for output devices only */
  public send = <E extends keyof MidiParameterMap>(
    evt: E,
    arg: MidiParameterMap[E],
  ) => {
    if (this.direction === 'output' && this.device) {
      const output = this.device as easymidi.Output
      output.send(evt, arg)
    }
  }

  public get state(): 'connected' | 'disconnected' | 'error' {
    return this._state
  }
}
