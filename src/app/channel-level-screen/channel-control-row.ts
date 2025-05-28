import type { RgbColor } from '../../ui/color.ts'
import { createButton } from '../../ui/components/button.ts'
import { createFader } from '../../ui/components/fader.ts'
import { group } from '../../ui/components/group.ts'
import type { Drawable } from '../../ui/drawable.ts'
import { translate } from '../../ui/transform/translate.ts'
import type { Channel } from '../model.ts'

export const createChannelControlRow = ({
  onLevelChanged,
  onMuted,
  channel,
}: {
  onLevelChanged?: (level: number) => void
  onMuted?: (muted: boolean) => void
  selected?: boolean
  channel: Channel
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
      color: currentMuted ? [64, 64, 64] : channel.settings.color,
    })

  let currentMuted = channel.muted
  let currentLevel = channel.level
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

export type ChannelControlRowProps = Parameters<
  typeof createChannelControlRow
>[0]
