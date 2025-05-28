import type { RgbColor } from '../ui/color.ts'

export interface Channel {
  settings: {
    color: RgbColor
  }
  level: number
  muted: boolean
}
