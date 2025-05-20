import { pino } from 'pino'

import './config.ts'

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
})
