import type { PadEvent } from '../../devices/pad-event.ts'
import type { InteractionEvent, InteractionEventType } from './input-event.ts'
import { InputMap } from './input-map.ts'

export class InputRouter {
  private inputMap: InputMap | null = null

  /**
   * Sets the per-frame InputMap to use for routing events.
   */
  public setMap(map: InputMap): void {
    this.inputMap = map
  }

  /**
   * Handles a raw PadInputEvent from a device, transforming it into a semantic UI event and invoking the appropriate
   * handler from the current InputMap.
   */
  public handle(event: PadEvent): void {
    if (!this.inputMap) {
      return
    }

    //    logger.info({ event }, 'InputRouter: got input event')

    const { x, y } = event
    const type: InteractionEventType =
      event.type === 'pad-down' ? 'press' : 'release'

    const handler = this.inputMap.getHandler(x, y, type)
    if (!handler) {
      console.log('noasdf')
      return
    }

    const interactionEvent = {
      type,
      absoluteX: x,
      absoluteY: y,
      x,
      y,
    } satisfies InteractionEvent

    handler(interactionEvent)
  }
}
