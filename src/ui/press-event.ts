export interface PressEvent {
  /**
   * Absolute x-coordinate of where the presss occurred, without any local offset.
   */
  absoluteX: number

  /**
   * Absolute y-coordinate of where the presss occurred, without any local offset.
   */
  absoluteY: number

  /**
   * Local x-coordinate of where the press occurred.
   */
  x: number

  /**
   * Local y-coordinate of where the press occurred.
   */
  y: number
}
