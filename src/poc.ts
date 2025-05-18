import * as easymidi from 'easymidi'

await new Promise((resolve, reject) => {
  console.log('starting')

  console.log('outs', JSON.stringify(easymidi.getOutputs(), null, 2))

  const pianoOut = new easymidi.Output('Roland Digital Piano')

  for (let i = 0; i < 256; i++) {
    pianoOut.send('noteoff', {
      note: i,
      channel: 4
    })
  }

  const pianoIn = new easymidi.Input('Roland Digital Piano')
  pianoIn.on('noteon', (note) => {

    console.log('note', JSON.stringify(note, null, 2))

    if (note.channel !== 0) {
      return
    }

    // for the birds
    // pianoOut.send('program', {
    //   channel: 5,
    //   number: 123 //  Math.floor(Math.random() * 128)
    // })
  
    pianoOut.send('noteon', {
      ...note,
      channel: 4,
      velocity: Math.min(127, 0.875 * note.velocity),
    })
  })

  pianoIn.on('noteoff', (note) => {

    if (note.channel !== 0) {
      return
    }

    pianoOut.send('noteoff', {
      ...note,
      channel: 4
    })

    // setTimeout(() => {
    //   pianoOut.send('noteon', {
    //     ...note,
    //     velocity: Math.min(127, 0.7 * note.velocity),
    //     channel: 4
    //   })
    // }, 0)

    // setTimeout(() => {
    //   pianoOut.send('noteoff', {
    //     ...note,
    //     channel: 4
    //   })
    // }, 100)
  })

  const input = new easymidi.Input('Launchpad Mini MK3 LPMiniMK3 MIDI Out');
  input.on('program', function (msg) {
    console.log('program change:', JSON.stringify(msg, null, 2))

    // if (msg.channel === 4) {
    //   pianoOut.send('program', {
    //     ...msg,
    //     channel: 5
    //   })
    // }
  });
  
})