import { createButton } from '../ui/components/button.ts'
import { group } from '../ui/components/group.ts'
import { translate } from '../ui/transform/translate.ts'
import type { Channel } from './model.ts'

export const createGlobalNav = ({
  channels = [],
  onChannelSelected,
  selectedChannel = 0,
}: {
  channels?: Channel[]
  onChannelSelected?: (index: number) => void
  selectedChannel?: number
}) =>
  group(
    ...channels.map((channel, index) =>
      translate(
        8,
        7 - index,
        createButton({
          color: selectedChannel === index ? channel.settings.color : [0, 0, 0],
          onPress: () => {
            onChannelSelected?.(index)
          },
        }),
      ),
    ),
  )
