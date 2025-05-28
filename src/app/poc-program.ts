import { createFader } from '../ui/components/fader.ts'
import { group } from '../ui/components/group.ts'
import type { Program } from '../engine/program.ts'
import { translate } from '../ui/transform/translate.ts'
import type { RgbColor } from '../ui/color.ts'
import type { Drawable } from '../ui/drawable.ts'
import { createButton } from '../ui/components/button.ts'

interface Track {
  settings: {
    color: RgbColor
  }
  level: number
  muted: boolean
}

const createTrackControls = ({
  onLevelChanged,
  onMuted,
  selected = false,
  track,
}: {
  onLevelChanged?: (level: number) => void
  onMuted?: (muted: boolean) => void
  selected?: boolean
  track: Track
}): (() => Drawable<RgbColor>) => {
  const recreateFader = () =>
    createFader({
      length: 7,
      onChange: (value) => {
        currentLevel = value
        onLevelChanged?.(value)
      },
      orientation: 'horizontal',
      value: currentLevel,
      color: currentMuted ? [64, 64, 64] : track.settings.color,
    })

  let currentMuted = track.muted
  let currentLevel = track.level
  let fader = recreateFader()

  return () =>
    group(
      createButton({
        color: currentMuted ? [25, 0, 0] : [0, 25, 0],
        onPress: () => {
          currentMuted = !currentMuted
          onMuted?.(currentMuted)
          fader = recreateFader()
        },
      }),
      translate(1, 0, fader()),
    )
}

const TrackColors: RgbColor[] = [
  [67, 103, 125],
  [85, 127, 97],
  [100, 80, 127],
  [127, 63, 51],
]

const tracks = TrackColors.map((color) => ({
  settings: {
    color,
  },
  level: 127,
  muted: false,
}))

export const createPoc = (): Program => {
  let selectedTrack = 0

  const trackControls = tracks.map((track, index) =>
    createTrackControls({
      track,
      onLevelChanged: (level) => {
        track.level = level
        selectedTrack = index
      },
      onMuted: (muted) => {
        track.muted = muted
        selectedTrack = index
      },
      selected: selectedTrack === index,
    }),
  )

  return {
    getRoot: () =>
      group(
        ...trackControls.map((trackControls, index) =>
          group(
            translate(0, 7 - index, trackControls()),
            translate(
              8,
              7 - index,
              createButton({
                color:
                  selectedTrack === index ?
                    tracks[index].settings.color
                  : [0, 0, 0],
                onPress: () => {
                  selectedTrack = index
                },
              }),
            ),
          ),
        ),
      ),
  }
}
