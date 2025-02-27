/*
 * @poppinss/validator-lite
 *
 * (c) Poppinss
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { StringFnOptions, StringFnUrlOptions } from '../contracts'
import { ensureValue } from './helpers'

/**
 * Formats against which a string can be optionally validated. We
 * lazy load the dependencies required for validating formats
 */
const formats: {
  [format in Exclude<StringFnOptions['format'], undefined>]: (
    key: string,
    value: string,
    options: StringFnOptions
  ) => void
} = {
  email: (key: string, value: string, options: StringFnOptions) => {
    if (!require('validator/lib/isEmail')(value)) {
      throw new Error(
        options.message ||
          `Value for environment variable "${key}" must be a valid email, instead received "${value}"`
      )
    }
  },
  host: (key: string, value: string, options: StringFnOptions) => {
    if (
      !require('validator/lib/isFQDN')(value, { require_tld: false }) &&
      !require('validator/lib/isIP')(value)
    ) {
      throw new Error(
        options.message ||
          `Value for environment variable "${key}" must be a valid (domain or ip), instead received "${value}"`
      )
    }
  },
  url: (key: string, value: string, options: StringFnUrlOptions) => {
    const { tld = true, protocol = true } = options
    if (!require('validator/lib/isURL')(value, { require_tld: tld, require_protocol: protocol })) {
      throw new Error(
        options.message ||
          `Value for environment variable "${key}" must be a valid URL, instead received "${value}"`
      )
    }
  },
  uuid: (key: string, value: string, options: StringFnOptions) => {
    if (!require('validator/lib/isUUID')(value)) {
      throw new Error(
        options.message ||
          `Value for environment variable "${key}" must be a valid UUID, instead received "${value}"`
      )
    }
  },
}

/**
 * Enforces the value to exist and be of type string
 */
export function string(options?: StringFnOptions) {
  return function validate(key: string, value?: string): string {
    ensureValue(key, value, options?.message)

    if (options?.format) {
      formats[options.format](key, value, options)
    }

    return value
  }
}

/**
 * Same as the string rule, but allows non-existing values too
 */
string.optional = function optionalString(options?: StringFnOptions) {
  return function validate(key: string, value?: string): string | undefined {
    if (!value) {
      return undefined
    }

    if (options?.format) {
      formats[options.format](key, value, options)
    }

    return value
  }
}
