import { describe, expect, it } from 'vitest'

import { organizationSchema } from 'src/features/organization/schemas/organization.schemas'

describe('organization schema', () => {
  it('accepts and trims a valid organization name', () => {
    const result = organizationSchema.safeParse({ name: '  Shree Furniture  ' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.name).toBe('Shree Furniture')
  })

  it('rejects empty and overly long names', () => {
    expect(organizationSchema.safeParse({ name: '   ' }).success).toBe(false)
    expect(organizationSchema.safeParse({ name: 'a'.repeat(121) }).success).toBe(false)
  })
})
