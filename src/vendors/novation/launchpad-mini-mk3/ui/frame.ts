import type { LightingOptions } from '../model.ts'

export type Cleared = null

export class Grid<T> {
  /**
   * Values contained in each cell of this grid. Stored in row-major form.
   */
  private _cells!: T[]

  public constructor(
    public readonly width: number,
    public readonly height: number,
  ) {
    this.clear()
  }

  /**
   * Resets the grid so that every cell has an undefined value.
   */
  public clear() {
    this._cells = new Array<T>(this.width * this.height)
  }

  /**
   * Gets the value at position (x, y).
   */
  public get(x: number, y: number): T | undefined {
    return x >= 0 && x < this.width && y >= 0 && y < this.height ?
        this._cells[y * this.width + x]
      : undefined
  }

  /**
   * Sets a new value at position (x, y). Returns true if the value was successfully set, or false if it was not (due to
   * invalid arguments or other error.)
   */
  public set(x: number, y: number, value: T): boolean {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this._cells[y * this.width + x] = value
      return true
    } else {
      return false
    }
  }

  /**
   * Creates a new Grid with the values as this one.
   */
  public clone(): Grid<T> {
    const result = new Grid<T>(this.width, this.height)
    result._cells = this._cells.slice()
    return result
  }

  /**
   * Invokes the specified function for every non-empty cell in the frame, passing the (x, y) cell coordinate and the
   * value of that cell.
   */
  public forEach(fn: (x: number, y: number, value: T) => void): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const value = this.get(x, y)
        if (value !== undefined) {
          fn(x, y, value)
        }
      }
    }
  }

  /**
   * Invokes the specified function for every non-empty cell in the frame, passing the (x, y) cell coordinate and the
   * value of that cell. Returns an arry containing the result of each invocation.
   */
  public map<U = unknown>(fn: (x: number, y: number, value: T) => U): U[] {
    const results: U[] = []
    this.forEach((x, y, value) => {
      results.push(fn(x, y, value))
    })
    return results
  }

  /**
   * Compares the cell contents of this grid to another, and returns a 'diff' grid in which only modified cells are set.
   * That is, any cell which is the same in both grids will be unset in the result. Any cells which differ will have the
   * value from `this` Grid.
   */
  public diff(other: Grid<T>): Grid<T | Cleared> {
    const maxWidth = Math.max(this.width, other.width)
    const maxHeight = Math.max(this.height, other.height)

    const diffOne = (
      otherValue: T | undefined,
      thisValue: T | undefined,
    ): T | Cleared | undefined => {
      if (otherValue === thisValue) {
        return undefined
      } else if (thisValue !== undefined) {
        return thisValue
      } else {
        return null
      }
    }

    const result = new Grid<T | Cleared>(maxWidth, maxHeight)
    for (let x = 0; x < maxWidth; x++) {
      for (let y = 0; y < maxHeight; y++) {
        const otherValue = other.get(x, y)
        const thisValue = this.get(x, y)
        const resultValue = diffOne(otherValue, thisValue)
        if (resultValue !== undefined) {
          result.set(x, y, resultValue)
        }
      }
    }

    return result
  }
}

/**
 * A frame holds the LED state and related metadata for each of the 9x9 pads on the Launchpad.
 */
export class Frame {
  private _current: Grid<LightingOptions>
  private _previous: Grid<LightingOptions>

  public constructor(
    public readonly width = 9,
    public readonly height = 9,
  ) {
    this._current = new Grid<LightingOptions>(width, height)
    this._previous = new Grid<LightingOptions>(width, height)
  }

  /**
   * Resets the grid so that every cell has an undefined value.
   */
  public clear() {
    this._current.clear()
  }

  /**
   * Gets the value at position (x, y).
   */
  public get(x: number, y: number): LightingOptions | undefined {
    return this._current.get(x, y)
  }

  /**
   * Sets a new value at position (x, y). Returns true if the value was successfully set, or false if it was not (due to
   * invalid arguments or other error.)
   */
  public set(x: number, y: number, value: LightingOptions): boolean {
    return this._current.set(x, y, value)
  }

  /**
   * Renders the current frame buffer by passing cell values with (x, y) coordinates to the specified `render` callback
   * function. Will only pass the values which have been changed since the last call to `render`. If this is the first
   * render call, then any cell with a defined value will be sent.
   */
  public render(
    renderFn: (
      values: {
        x: number
        y: number
        lighting: LightingOptions | null
      }[],
    ) => void,
  ) {
    const diff = this._current.diff(this._previous)
    renderFn(
      diff.map((x, y, value) => ({
        x,
        y,
        lighting: value,
      })),
    )

    this._previous = this._current
    this._current = new Grid<LightingOptions>(this.width, this.height)
  }
}
