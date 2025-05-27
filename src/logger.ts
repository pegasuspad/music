import { pino } from 'pino'

import { getConfig } from './config.ts'

export const logger = pino({
  level: getConfig().logLevel,
})
