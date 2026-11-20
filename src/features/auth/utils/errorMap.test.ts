import { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'

import { applyFieldErrors, mapApiError } from 'src/features/auth/utils/errorMap'

function errorWith(status: number, data: unknown): unknown {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    statusText: '',
    headers: {},
    config: {} as never,
    data,
  })
}

describe('mapApiError', () => {
  it('maps a 422 string response', () => {
    expect(
      mapApiError(errorWith(422, { success: false, message: 'Invalid credentials', data: null })),
    ).toMatchObject({ status: 422, messageKey: 'errors.invalidCredentials' })
  })

  it('maps a known error code', () => {
    expect(
      mapApiError(
        errorWith(403, {
          success: false,
          message: 'Suspended',
          data: { code: 'ACCOUNT_SUSPENDED' },
        }),
      ),
    ).toMatchObject({ status: 403, code: 'ACCOUNT_SUSPENDED' })
  })

  it('captures field errors', () => {
    const mapped = mapApiError(
      errorWith(422, {
        success: false,
        message: 'Validation error',
        data: [{ field: 'email', message: 'errors.emailInvalid' }],
      }),
    )
    expect(mapped.fields).toEqual([{ field: 'email', message: 'errors.emailInvalid' }])
  })

  it('falls back to a network error', () => {
    expect(mapApiError(new Error('offline'))).toEqual({
      status: 0,
      messageKey: 'errors.network',
    })
  })
})

describe('applyFieldErrors', () => {
  it('uses the first field from an array and ignores unknown fields', () => {
    const errors: Array<{ field: string; message: string }> = []
    applyFieldErrors(
      {
        status: 422,
        messageKey: 'errors.generic',
        fields: [{ field: 'email', message: 'errors.emailInvalid' }],
      },
      (field, error) => {
        errors.push({ field, message: error.message })
      },
    )
    expect(errors).toEqual([{ field: 'email', message: 'errors.emailInvalid' }])
  })
})
