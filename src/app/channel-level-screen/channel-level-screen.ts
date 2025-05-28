import type { RgbColor } from '../../ui/color.ts'
import { group } from '../../ui/components/group.ts'
import type { Drawable } from '../../ui/drawable.ts'
import { translate } from '../../ui/transform/translate.ts'
import type { Channel } from '../model.ts'
import { createChannelControlRow } from './channel-control-row.ts'

export const createChannelLevelScreen = ({
  channels,
  onChannelUpdated,
  selectedChannel,
}: {
  channels: Channel[]
  onChannelUpdated?: (index: number, channel: Channel) => void
  selectedChannel: number
}): (() => Drawable<RgbColor>) => {
  const channelControlRows = channels.map((channel, index) =>
    createChannelControlRow({
      channel,
      onLevelChanged: (level) => {
        onChannelUpdated?.(index, { ...channel, level })
      },
      onMuted: (muted) => {
        onChannelUpdated?.(index, { ...channel, muted })
      },
      selected: selectedChannel === index,
    }),
  )

  return () =>
    group(
      ...channelControlRows.map((channelControls, index) =>
        group(translate(0, 7 - index, channelControls())),
      ),
    )
}
