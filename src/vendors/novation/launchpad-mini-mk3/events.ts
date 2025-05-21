import type {
  LaunchpadCommand,
  LaunchpadCommandDataType,
} from './commands/index.ts'

export interface LaunchpadEvent {
  /**
   * Type of event
   */
  eventType: string
}

export interface PadEvent extends LaunchpadEvent {
  /**
   * Type of event
   */
  eventType: 'pad-down' | 'pad-long-press' | 'pad-up'

  /**
   * X position of the associated pad. Zero is the leftmost column, and eight is the rightmost. Values 0-7 are assigned
   * to pads in the main grid.
   */
  x: number

  /**
   * Y position of the associated pad. Zero is the bottom row, and eight is the topmost. Values 0-7 are assigned
   * to pads in the main grid.
   */
  y: number
}

export interface PadDownEvent extends PadEvent {
  eventType: 'pad-down'
}

export interface PadUpEvent extends PadEvent {
  eventType: 'pad-up'
}

export interface PadLongPressEvent extends PadEvent {
  /**
   * How long the pad was held down before it was released.
   */
  duration: number

  eventType: 'pad-long-press'
}

export interface ReadbackEvent<C extends LaunchpadCommand = LaunchpadCommand>
  extends LaunchpadEvent {
  /**
   * Which command the readback data applies to.
   */
  command: C

  /**
   * The data sent by the Launchpad.
   */
  data: LaunchpadCommandDataType<C>

  eventType: 'readback'
}

export interface LaunchpadEventMap {
  'pad-down': (event: PadDownEvent) => void
  'pad-long-press': (event: PadLongPressEvent) => void
  'pad-up': (event: PadUpEvent) => void
  readback: (event: ReadbackEvent) => void
}
