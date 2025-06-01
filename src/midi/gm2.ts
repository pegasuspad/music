export interface InstrumentFamily {
  /**
   * Set of instruments in this family.
   */
  instruments: readonly Instrument[]

  /**
   * Human readable name for this instrument family.
   */
  name: string
}

export interface Instrument {
  /**
   * Human readable name for this instrument
   */
  name: string

  /**
   * MIDI GM2 patch number for this instrument
   */
  patch: number
}

const InstrumentData = [
  {
    family: 'Piano',
    instruments: [
      'Acoustic Grand Piano',
      'Bright Acoustic Piano',
      'Electric Grand Piano',
      'Honky-tonk Piano',
      'Electric Piano 1',
      'Electric Piano 2',
      'Harpsichord',
      'Clavinet',
    ],
  },
  {
    family: 'Chromatic Percussion',
    instruments: [
      'Celesta',
      'Glockenspiel',
      'Music Box',
      'Vibraphone',
      'Marimba',
      'Xylophone',
      'Tubular Bells',
      'Dulcimer',
    ],
  },
  {
    family: 'Organ',
    instruments: [
      'Drawbar Organ',
      'Percussive Organ',
      'Rock Organ',
      'Church Organ',
      'Reed Organ',
      'Accordion',
      'Harmonica',
      'Tango Accordion',
    ],
  },
  {
    family: 'Guitar',
    instruments: [
      'Acoustic Guitar (nylon)',
      'Acoustic Guitar (steel)',
      'Electric Guitar (jazz)',
      'Electric Guitar (clean)',
      'Electric Guitar (muted)',
      'Overdriven Guitar',
      'Distortion Guitar',
      'Guitar Harmonics',
    ],
  },
  {
    family: 'Bass',
    instruments: [
      'Acoustic Bass',
      'Electric Bass (finger)',
      'Electric Bass (pick)',
      'Fretless Bass',
      'Slap Bass 1',
      'Slap Bass 2',
      'Synth Bass 1',
      'Synth Bass 2',
    ],
  },
  {
    family: 'Strings',
    instruments: [
      'Violin',
      'Viola',
      'Cello',
      'Contrabass',
      'Tremolo Strings',
      'Pizzicato Strings',
      'Orchestral Harp',
      'Timpani',
    ],
  },
  {
    family: 'Ensemble',
    instruments: [
      'String Ensemble 1',
      'String Ensemble 2',
      'Synth Strings 1',
      'Synth Strings 2',
      'Choir Aahs',
      'Voice Oohs',
      'Synth Voice',
      'Orchestra Hit',
    ],
  },
  {
    family: 'Brass',
    instruments: [
      'Trumpet',
      'Trombone',
      'Tuba',
      'Muted Trumpet',
      'French Horn',
      'Brass Section',
      'Synth Brass 1',
      'Synth Brass 2',
    ],
  },
  {
    family: 'Reed',
    instruments: [
      'Soprano Sax',
      'Alto Sax',
      'Tenor Sax',
      'Baritone Sax',
      'Oboe',
      'English Horn',
      'Bassoon',
      'Clarinet',
    ],
  },
  {
    family: 'Pipe',
    instruments: [
      'Piccolo',
      'Flute',
      'Recorder',
      'Pan Flute',
      'Blown Bottle',
      'Shakuhachi',
      'Whistle',
      'Ocarina',
    ],
  },
  {
    family: 'Synth Lead',
    instruments: [
      'Lead 1 (square)',
      'Lead 2 (sawtooth)',
      'Lead 3 (calliope)',
      'Lead 4 (chiff)',
      'Lead 5 (charang)',
      'Lead 6 (voice)',
      'Lead 7 (fifths)',
      'Lead 8 (bass + lead)',
    ],
  },
  {
    family: 'Synth Pad',
    instruments: [
      'Pad 1 (new age)',
      'Pad 2 (warm)',
      'Pad 3 (polysynth)',
      'Pad 4 (choir)',
      'Pad 5 (bowed)',
      'Pad 6 (metallic)',
      'Pad 7 (halo)',
      'Pad 8 (sweep)',
    ],
  },
  {
    family: 'Synth Effects',
    instruments: [
      'FX 1 (rain)',
      'FX 2 (soundtrack)',
      'FX 3 (crystal)',
      'FX 4 (atmosphere)',
      'FX 5 (brightness)',
      'FX 6 (goblins)',
      'FX 7 (echoes)',
      'FX 8 (sci-fi)',
    ],
  },
  {
    family: 'Ethnic',
    instruments: [
      'Sitar',
      'Banjo',
      'Shamisen',
      'Koto',
      'Kalimba',
      'Bagpipe',
      'Fiddle',
      'Shanai',
    ],
  },
  {
    family: 'Percussive',
    instruments: [
      'Tinkle Bell',
      'Agogo',
      'Steel Drums',
      'Woodblock',
      'Taiko Drum',
      'Melodic Tom',
      'Synth Drum',
      'Reverse Cymbal',
    ],
  },
  {
    family: 'Sound Effects',
    instruments: [
      'Guitar Fret Noise',
      'Breath Noise',
      'Seashore',
      'Bird Tweet',
      'Telephone Ring',
      'Helicopter',
      'Applause',
      'Gunshot',
    ],
  },
] as const

export const InstrumentFamilyNames = InstrumentData.map(
  (family) => family.family,
)
export type InstrumentFamilyName = (typeof InstrumentFamilyNames)[number]

export type InstrumentName<
  T extends InstrumentFamilyName = InstrumentFamilyName,
> = ((typeof InstrumentData)[number] & { family: T })['instruments']

export const InstrumentFamilies = InstrumentData.map((item, familyIndex) => ({
  instruments: item.instruments.map((instrumentName, instrumentIndex) => ({
    name: instrumentName,
    patch: familyIndex * 8 + instrumentIndex,
  })),
  name: item.family,
})) satisfies InstrumentFamily[]
