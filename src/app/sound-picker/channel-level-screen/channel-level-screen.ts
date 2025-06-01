import type { RgbColor } from '../../../ui/color.ts'
import { group } from '../../../ui/components/group.ts'
import type { Drawable } from '../../../ui/drawable.ts'
import { translate } from '../../../ui/transform/translate.ts'
import type { Channel } from '../channel.ts'
import { createChannelControlRow } from './channel-control-row.ts'

export const createChannelLevelScreen = ({
  channels,
  onLevelChanged,
  onMuteStatusChanged,
  selectedChannelId,
}: {
  channels: Readonly<Channel>[]
  onLevelChanged?: (channelId: number, level: number) => void
  onMuteStatusChanged?: (channelId: number, muted: boolean) => void
  selectedChannelId: number
}): (() => Drawable<RgbColor>) => {
  const channelControlRows = channels.map((channel) =>
    createChannelControlRow({
      channel,
      onLevelChanged: (level) => {
        onLevelChanged?.(channel.id, level)
      },
      onMuted: (muted) => {
        onMuteStatusChanged?.(channel.id, muted)
      },
      selected: selectedChannelId === channel.id,
    }),
  )

  return () =>
    group(
      ...channelControlRows.map((channelControls, index) =>
        group(translate(0, 7 - index, channelControls())),
      ),
    )
}
