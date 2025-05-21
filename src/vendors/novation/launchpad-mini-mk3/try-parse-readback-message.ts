import { CommandHeader, CommandTrailer } from './commands/index.ts'

export interface BaseParseReadbackMessageResult {
  /**
   * Command code associated with the readback data. Will be null if the message was not a valid readback.
   */
  command: null | number

  /**
   * Data associated with the readback data. Will be null if the message was not a valid readback.
   */
  data: null | number[]

  /**
   * Whether the data was successfully parsed as a readback message or not.
   */
  success: boolean
}

export type FailedParseReadbackMessageResult =
  BaseParseReadbackMessageResult & {
    command: null
    data: null
    success: false
  }

export type SuccessfulParseReadbackMessageResult =
  BaseParseReadbackMessageResult & {
    command: number
    data: number[]
    success: true
  }

export type ParseReadbackMessageResult =
  | FailedParseReadbackMessageResult
  | SuccessfulParseReadbackMessageResult

export const tryParseReadbackMessage = (
  data: number[],
): ParseReadbackMessageResult => {
  const validLength = () =>
    data.length >=
    CommandHeader.length +
      CommandTrailer.length +
      1 /* at least one message byte */

  const validHeader = () => CommandHeader.every((value, i) => data[i] === value)

  const validTrailer = () =>
    CommandTrailer.every(
      (value, i) => data[data.length - CommandTrailer.length + i] === value,
    )

  if (validLength() && validHeader() && validTrailer()) {
    return {
      command: data[CommandHeader.length],
      data: data.slice(
        CommandHeader.length + 1,
        data.length - CommandTrailer.length,
      ),
      success: true,
    }
  } else {
    return {
      command: null,
      data: null,
      success: false,
    }
  }
}
