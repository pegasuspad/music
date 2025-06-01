/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { isBrowser } from './is-browser.ts'

export const speak = (text: string) => {
  if (isBrowser()) {
    console.warn(`Unable to 'speak' text from browser: ${text}`)
  } else {
    const child_process = require('node:child_process')
    child_process.exec(`say ${JSON.stringify(text)}`)
  }
}
