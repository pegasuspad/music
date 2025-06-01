import type { Note } from 'easymidi'
import type { Program } from '../engine/program.ts'
import type { MidiDevice } from '../midi/midi-device.ts'
import { group } from '../ui/components/group.ts'
import { createRectangle } from '../ui/components/rectangle.ts'
import { translate } from '../ui/transform/translate.ts'
import type { NovationLaunchpadMiniMk3 } from '../vendors/novation/launchpad-mini-mk3/novation-launchpad-mini-mk3.ts'
import { speak } from './speak.ts'

const notes = [
  {
    name: 'A',
    value: 58,
  },
  {
    name: 'B',
    value: 58,
  },
  {
    name: 'C',
    value: 60,
  },
  {
    name: 'D',
    value: 61,
  },
  {
    name: 'E',
    value: 62,
  },
  {
    name: 'F',
    value: 63,
  },
  {
    name: 'G',
    value: 64,
  },
  {
    name: 'A',
    value: 65,
  },
]

const getRandomInt = (max: number) => {
  return Math.floor(Math.random() * max)
}

export const createNoteMatchProgram = (
  launchpad: NovationLaunchpadMiniMk3,
  synthesizer: MidiDevice,
): Program => {
  let activeNoteIndex = getRandomInt(8)
  let intervalHandle: ReturnType<typeof setInterval> | undefined
  const pingInterval = 5000

  const chooseNote = () => {
    activeNoteIndex = getRandomInt(8)
    ping()

    if (intervalHandle) {
      clearInterval(intervalHandle)
    }
    intervalHandle = setInterval(ping, pingInterval)
  }

  const ping = () => {
    console.log('ping')
    synthesizer.send('noteon', {
      channel: 3,
      note: notes[activeNoteIndex].value,
      velocity: 64,
    })
  }

  const handleNoteOn = (note: Note) => {
    if (note.note === notes[activeNoteIndex].value) {
      synthesizer.send('program', {
        channel: 0,
        number: 15 * 8 + 6,
      })

      synthesizer.send('noteon', {
        channel: 0,
        note: 60,
        velocity: 64,
      })

      setTimeout(() => {
        synthesizer.send('noteoff', {
          channel: 0,
          note: 60,
          velocity: 64,
        })
        chooseNote()
      }, 1250)
    }
  }

  return {
    getRoot: () =>
      translate(
        activeNoteIndex,
        0,
        createRectangle({
          color: [0, 0, 127],
          height: 8,
          width: 1,
        }),
      ),
    initialize: () => {
      chooseNote()
      synthesizer.on('noteon', handleNoteOn)
    },
    shutdown: () => {
      if (intervalHandle) {
        clearInterval(intervalHandle)
      }
      synthesizer.off('noteon', handleNoteOn)
    },
  }
}
