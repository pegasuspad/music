/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { Note, Program } from 'easymidi'
import Soundfont, { type Player, type InstrumentName } from 'soundfont-player'
import { Events } from '../../src/typed-event-emitter.ts'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type NoteEventMap = {
  noteon: (msg: Note) => void
  noteoff: (msg: Note) => void
  program: (msg: Program) => void
}

export class WebMidiPiano {
  // — static lookup from MIDI program number (0–127) to Soundfont.js instrument names —
  private static PROGRAM_TO_INSTRUMENT: Record<number, InstrumentName> = {
    0: 'acoustic_grand_piano' as InstrumentName,
    1: 'bright_acoustic_piano' as InstrumentName,
    2: 'electric_grand_piano' as InstrumentName,
    3: 'honkytonk_piano' as InstrumentName,
    4: 'electric_piano_1' as InstrumentName,
    5: 'electric_piano_2' as InstrumentName,
    6: 'harpsichord' as InstrumentName,
    7: 'clavinet' as InstrumentName,
    8: 'celesta' as InstrumentName,
    9: 'glockenspiel' as InstrumentName,
    10: 'music_box' as InstrumentName,
    11: 'vibraphone' as InstrumentName,
    12: 'marimba' as InstrumentName,
    13: 'xylophone' as InstrumentName,
    14: 'tubular_bells' as InstrumentName,
    15: 'dulcimer' as InstrumentName,
    16: 'drawbar_organ' as InstrumentName,
    17: 'percussive_organ' as InstrumentName,
    18: 'rock_organ' as InstrumentName,
    19: 'church_organ' as InstrumentName,
    20: 'reed_organ' as InstrumentName,
    21: 'accordion' as InstrumentName,
    22: 'harmonica' as InstrumentName,
    23: 'tango_accordion' as InstrumentName,
    24: 'acoustic_guitar_nylon' as InstrumentName,
    25: 'acoustic_guitar_steel' as InstrumentName,
    26: 'electric_guitar_jazz' as InstrumentName,
    27: 'electric_guitar_clean' as InstrumentName,
    28: 'electric_guitar_muted' as InstrumentName,
    29: 'overdriven_guitar' as InstrumentName,
    30: 'distortion_guitar' as InstrumentName,
    31: 'guitar_harmonics' as InstrumentName,
    32: 'acoustic_bass' as InstrumentName,
    33: 'electric_bass_finger' as InstrumentName,
    34: 'electric_bass_pick' as InstrumentName,
    35: 'fretless_bass' as InstrumentName,
    36: 'slap_bass_1' as InstrumentName,
    37: 'slap_bass_2' as InstrumentName,
    38: 'synth_bass_1' as InstrumentName,
    39: 'synth_bass_2' as InstrumentName,
    40: 'violin' as InstrumentName,
    41: 'viola' as InstrumentName,
    42: 'cello' as InstrumentName,
    43: 'contrabass' as InstrumentName,
    44: 'tremolo_strings' as InstrumentName,
    45: 'pizzicato_strings' as InstrumentName,
    46: 'orchestral_harp' as InstrumentName,
    47: 'timpani' as InstrumentName,
    48: 'string_ensemble_1' as InstrumentName,
    49: 'string_ensemble_2' as InstrumentName,
    50: 'synth_strings_1' as InstrumentName,
    51: 'synth_strings_2' as InstrumentName,
    52: 'choir_aahs' as InstrumentName,
    53: 'voice_oohs' as InstrumentName,
    54: 'synth_voice' as InstrumentName,
    55: 'orchestra_hit' as InstrumentName,
    56: 'trumpet' as InstrumentName,
    57: 'trombone' as InstrumentName,
    58: 'tuba' as InstrumentName,
    59: 'muted_trumpet' as InstrumentName,
    60: 'french_horn' as InstrumentName,
    61: 'brass_section' as InstrumentName,
    62: 'synth_brass_1' as InstrumentName,
    63: 'synth_brass_2' as InstrumentName,
    64: 'soprano_sax' as InstrumentName,
    65: 'alto_sax' as InstrumentName,
    66: 'tenor_sax' as InstrumentName,
    67: 'baritone_sax' as InstrumentName,
    68: 'oboe' as InstrumentName,
    69: 'english_horn' as InstrumentName,
    70: 'bassoon' as InstrumentName,
    71: 'clarinet' as InstrumentName,
    72: 'piccolo' as InstrumentName,
    73: 'flute' as InstrumentName,
    74: 'recorder' as InstrumentName,
    75: 'pan_flute' as InstrumentName,
    76: 'blown_bottle' as InstrumentName,
    77: 'shakuhachi' as InstrumentName,
    78: 'whistle' as InstrumentName,
    79: 'ocarina' as InstrumentName,
    80: 'lead_1_square' as InstrumentName,
    81: 'lead_2_sawtooth' as InstrumentName,
    82: 'lead_3_calliope' as InstrumentName,
    83: 'lead_4_chiff' as InstrumentName,
    84: 'lead_5_charang' as InstrumentName,
    85: 'lead_6_voice' as InstrumentName,
    86: 'lead_7_fifths' as InstrumentName,
    87: 'lead_8_bass_lead' as InstrumentName,
    88: 'pad_1_new_age' as InstrumentName,
    89: 'pad_2_warm' as InstrumentName,
    90: 'pad_3_polysynth' as InstrumentName,
    91: 'pad_4_choir' as InstrumentName,
    92: 'pad_5_bowed' as InstrumentName,
    93: 'pad_6_metallic' as InstrumentName,
    94: 'pad_7_halo' as InstrumentName,
    95: 'pad_8_sweep' as InstrumentName,
    96: 'fx_1_rain' as InstrumentName,
    97: 'fx_2_soundtrack' as InstrumentName,
    98: 'fx_3_crystal' as InstrumentName,
    99: 'fx_4_atmosphere' as InstrumentName,
    100: 'fx_5_brightness' as InstrumentName,
    101: 'fx_6_goblins' as InstrumentName,
    102: 'fx_7_echoes' as InstrumentName,
    103: 'fx_8_sci_fi' as InstrumentName,
    104: 'sitar' as InstrumentName,
    105: 'banjo' as InstrumentName,
    106: 'shamisen' as InstrumentName,
    107: 'koto' as InstrumentName,
    108: 'kalimba' as InstrumentName,
    109: 'bagpipe' as InstrumentName,
    110: 'fiddle' as InstrumentName,
    111: 'shanai' as InstrumentName,
    112: 'tinkle_bell' as InstrumentName,
    113: 'agogo' as InstrumentName,
    114: 'steel_drums' as InstrumentName,
    115: 'woodblock' as InstrumentName,
    116: 'taiko_drum' as InstrumentName,
    117: 'melodic_tom' as InstrumentName,
    118: 'synth_drum' as InstrumentName,
    119: 'reverse_cymbal' as InstrumentName,
    120: 'guitar_fret_noise' as InstrumentName,
    121: 'breath_noise' as InstrumentName,
    122: 'seashore' as InstrumentName,
    123: 'bird_tweet' as InstrumentName,
    124: 'telephone_ring' as InstrumentName,
    125: 'helicopter' as InstrumentName,
    126: 'applause' as InstrumentName,
    127: 'gunshot' as InstrumentName,
  }

  // typed emitter under the hood
  private emitter = new Events<NoteEventMap>()

  // AudioContext + tracking active nodes so we can stop each note
  private audioCtx = new (window.AudioContext ??
    (window as any).webkitAudioContext)()
  private activeNodes = new Map<number, { node: any }>()

  // Track which program each channel is using (default = 0)
  private channelPrograms = new Map<number, number>()

  // Cache a Soundfont.js Player per channel
  private programPlayers = new Map<number, Player>()

  // Mapping from MIDI note number → HTML element (for highlighting)
  private keyElements = new Map<number, HTMLElement>()

  // The notes for one octave (C4=60 up to C5=72)
  private readonly whiteNotes = [60, 62, 64, 65, 67, 69, 71, 72]
  private readonly blackNotes = [61, 63, 66, 68, 70]

  constructor(container: HTMLElement) {
    // Initialize all channels (0–15) to program 0
    for (let ch = 0; ch < 16; ch++) {
      this.channelPrograms.set(ch, 0)
    }

    // Preload program 0 (acoustic_grand_piano) for channel 0 immediately
    Soundfont.instrument(
      this.audioCtx,
      WebMidiPiano.PROGRAM_TO_INSTRUMENT[0],
    ).then((p) => {
      this.programPlayers.set(0, p)
    })
    Soundfont.instrument(
      this.audioCtx,
      WebMidiPiano.PROGRAM_TO_INSTRUMENT[126],
    ).then((p) => {
      this.programPlayers.set(126, p)
    })

    //  — style the container as a relative-positioned “keyboard” frame —
    container.style.position = 'relative'
    container.style.width = '700px'
    container.style.height = '200px'
    container.style.userSelect = 'none'
    container.style.touchAction = 'none'

    // (A) Render all white keys side by side
    const whiteKeyCount = this.whiteNotes.length
    const whiteWidthPct = 100 / whiteKeyCount

    this.whiteNotes.forEach((noteNum, idx) => {
      const key = document.createElement('div')
      key.dataset.note = noteNum.toString()
      Object.assign(key.style, {
        position: 'absolute',
        left: `${idx * whiteWidthPct}%`,
        width: `${whiteWidthPct}%`,
        height: '100%',
        backgroundColor: 'white',
        border: '1px solid black',
        boxSizing: 'border-box',
        zIndex: '0',
      })
      this.attachPointerHandlers(key, noteNum)
      container.appendChild(key)
      this.keyElements.set(noteNum, key)
    })

    // (B) Render black keys on top, positioned between the whites
    const blackWidthPct = whiteWidthPct * 0.6
    const halfBw = blackWidthPct / 2
    // Map each black note to the index of the white key *before* it:
    const blackPositions: Record<number, number> = {
      61: 0, // C# between white[0]=C (60) and white[1]=D (62)
      63: 1, // D#
      66: 3, // F#
      68: 4, // G#
      70: 5, // A#
    }

    this.blackNotes.forEach((noteNum) => {
      const whiteIdx = blackPositions[noteNum]
      const leftPct = (whiteIdx + 1) * whiteWidthPct - halfBw
      const key = document.createElement('div')
      key.dataset.note = noteNum.toString()
      Object.assign(key.style, {
        position: 'absolute',
        left: `${leftPct}%`,
        width: `${blackWidthPct}%`,
        height: '60%',
        backgroundColor: 'black',
        border: '1px solid #333',
        borderRadius: '0 0 4px 4px',
        zIndex: '1',
      })
      this.attachPointerHandlers(key, noteNum)
      container.appendChild(key)
      this.keyElements.set(noteNum, key)
    })
  }

  // — implements TypedEventEmitter —
  on<E extends keyof NoteEventMap>(event: E, listener: NoteEventMap[E]) {
    this.emitter.on(event, listener)
    return this
  }
  off<E extends keyof NoteEventMap>(event: E, listener: NoteEventMap[E]) {
    this.emitter.off(event, listener)
    return this
  }

  /**
   * Convert a MIDI note number (0–127) to a note name string for Soundfont.js,
   * e.g. 60 → "C4", 61 → "C#4", 69 → "A4", 72 → "C5".
   */
  private midiToNoteName(midi: number): string {
    const noteNames = [
      'C',
      'C#',
      'D',
      'D#',
      'E',
      'F',
      'F#',
      'G',
      'G#',
      'A',
      'A#',
      'B',
    ]
    const octave = Math.floor(midi / 12) - 1
    const name = noteNames[midi % 12]
    return `${name}${octave}`
  }

  /**
   * `send(...)` mimics easymidi’s Output.send(...) signature.
   * We handle:
   *   • "program"   → program change (msg: { program: number; channel?: number })
   *   • "noteon"    → note-on (msg: { note: number; velocity: number; channel?: number })
   *   • "noteoff"   → note-off (msg: { note: number; velocity: number; channel?: number })
   * Other events are ignored.
   */
  send(event: string, msg: any) {
    console.log(`MIDI event "${event}", data: ${JSON.stringify(msg, null, 2)}`)

    if (event === 'program') {
      // Update the program for that channel
      this.channelPrograms.set(msg.channel, msg.number)
      return
    }

    const {
      note,
      velocity,
      channel = 0,
    } = msg as {
      note: number
      velocity: number
      channel?: number
    }

    if (event === 'noteon' && velocity > 0) {
      this.playNote(note, velocity, channel)
    } else if (event === 'noteoff' || (event === 'noteon' && velocity === 0)) {
      this.stopNote(note)
    }
  }

  /**
   * Use Soundfont.js to play a note with the current channel’s program.
   * Convert MIDI number → note name (e.g. "C4").
   * If the Player isn’t loaded yet, load it, then play once ready.
   */
  private playNote(noteNum: number, velocity: number, channel: number) {
    const program = this.channelPrograms.get(channel) ?? 0
    const existingPlayer = this.programPlayers.get(program)
    const gainValue = velocity / 127
    const noteName = this.midiToNoteName(noteNum)

    if (existingPlayer) {
      const node = existingPlayer.play(noteName, this.audioCtx.currentTime, {
        gain: gainValue,
      })
      this.activeNodes.set(noteNum, { node })
      return
    }

    const instrName =
      WebMidiPiano.PROGRAM_TO_INSTRUMENT[program] ??
      WebMidiPiano.PROGRAM_TO_INSTRUMENT[0]

    Soundfont.instrument(this.audioCtx, instrName).then((player) => {
      this.programPlayers.set(program, player)
      const node = player.play(noteName, this.audioCtx.currentTime, {
        gain: gainValue,
      })
      this.activeNodes.set(noteNum, { node })
    })
  }

  /**
   * Stop the note’s active Soundfont.js node (if any).
   */
  private stopNote(noteNum: number) {
    const entry = this.activeNodes.get(noteNum)
    if (!entry) return
    entry.node.stop()
    this.activeNodes.delete(noteNum)
  }

  /**
   * Visually highlight or unhighlight a key when the user clicks.
   * We do NOT tint keys when handling external noteon/noteoff via send().
   */
  private highlightKey(noteNum: number, on: boolean) {
    const el = this.keyElements.get(noteNum)
    if (!el) return
    if (on) {
      el.style.backgroundColor =
        this.whiteNotes.includes(noteNum) ? '#cef' : '#888'
    } else {
      el.style.backgroundColor =
        this.whiteNotes.includes(noteNum) ? 'white' : 'black'
    }
  }

  /**
   * When the user clicks a key, emit a noteon/noteoff and play via playNote().
   * Also visually tint the key.
   */
  private attachPointerHandlers(keyEl: HTMLElement, noteNum: number) {
    let isDown = false

    keyEl.addEventListener('pointerdown', (e) => {
      e.preventDefault()
      if (isDown) return
      isDown = true
      const noteMsg: Note = { channel: 0, note: noteNum, velocity: 127 }
      this.emitter.emit('noteon', noteMsg)
      // this.playNote(noteNum, 127, 0)
      this.highlightKey(noteNum, true)
    })

    keyEl.addEventListener('pointerup', (e) => {
      e.preventDefault()
      if (!isDown) return
      isDown = false
      const noteMsg: Note = { channel: 0, note: noteNum, velocity: 0 }
      this.emitter.emit('noteoff', noteMsg)
      this.stopNote(noteNum)
      this.highlightKey(noteNum, false)
    })

    keyEl.addEventListener('pointerleave', () => {
      if (!isDown) return
      isDown = false
      const noteMsg: Note = { channel: 0, note: noteNum, velocity: 0 }
      this.emitter.emit('noteoff', noteMsg)
      this.stopNote(noteNum)
      this.highlightKey(noteNum, false)
    })
  }
}
