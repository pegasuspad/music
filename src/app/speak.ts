import { exec } from 'node:child_process'
import { isBrowser } from './is-browser.ts'

export const speak = (text: string) => {
  if (isBrowser()) {
    console.warn(`Unable to 'speak' text from browser: ${text}`)
  } else {
    exec(`say ${JSON.stringify(text)}`)
  }
}
