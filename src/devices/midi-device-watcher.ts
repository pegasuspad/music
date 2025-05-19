import * as easymidi from 'easymidi'
import EventEmitter from 'node:events'
import type { TypedEventEmitter } from './typed-event-emitter.ts'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type DeviceConnectionStateEventMap = {
  found: (name: string) => void
  lost: (name: string) => void
}

export type MidiDeviceEventEmitter =
  TypedEventEmitter<DeviceConnectionStateEventMap>

export class MidiDeviceWatcher extends (EventEmitter as new () => MidiDeviceEventEmitter) {
  private filter: string[] | undefined
  private pollIntervalMs: number
  private seen = new Set<string>()
  private handle?: NodeJS.Timeout

  constructor(options: { devicesToWatch?: string[]; pollIntervalMs?: number }) {
    super()

    this.filter = options.devicesToWatch
    this.pollIntervalMs = options.pollIntervalMs ?? 100
  }

  start() {
    this.tick()
  }

  stop() {
    clearTimeout(this.handle)
  }

  private tick() {
    const now = Date.now()
    const all = new Set([...easymidi.getInputs(), ...easymidi.getOutputs()])
    const wanted =
      this.filter ?
        new Set([...all].filter((d) => this.filter?.includes(d)))
      : all

    // newly found
    for (const d of wanted) {
      if (!this.seen.has(d)) {
        this.seen.add(d)
        this.emit('found', d)
      }
    }

    // disconnected
    for (const d of [...this.seen]) {
      if (!wanted.has(d)) {
        this.seen.delete(d)
        this.emit('lost', d)
      }
    }

    // schedule next
    this.handle = setTimeout(
      this.tick.bind(this),
      Math.max(0, this.pollIntervalMs - (Date.now() - now)),
    )
  }
}
