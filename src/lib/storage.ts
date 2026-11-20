type LangKey = 'lang'
type SessionKey = 'pendingEmail' | 'otpCooldownUntil'

function read(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function write(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value)
  } catch {
    return
  }
}

function remove(storage: Storage, key: string): void {
  try {
    storage.removeItem(key)
  } catch {
    return
  }
}

export const storage = {
  getLang(): string | null {
    return read(localStorage, 'lang' satisfies LangKey)
  },
  setLang(value: string): void {
    write(localStorage, 'lang' satisfies LangKey, value)
  },
  getPendingEmail(): string | null {
    return read(sessionStorage, 'pendingEmail' satisfies SessionKey)
  },
  setPendingEmail(value: string): void {
    write(sessionStorage, 'pendingEmail' satisfies SessionKey, value)
  },
  getOtpCooldownUntil(): number | null {
    const raw = read(sessionStorage, 'otpCooldownUntil' satisfies SessionKey)
    const value = raw === null ? Number.NaN : Number(raw)
    return Number.isFinite(value) ? value : null
  },
  setOtpCooldownUntil(timestamp: number): void {
    write(sessionStorage, 'otpCooldownUntil' satisfies SessionKey, String(timestamp))
  },
  clearSession(): void {
    remove(sessionStorage, 'pendingEmail' satisfies SessionKey)
    remove(sessionStorage, 'otpCooldownUntil' satisfies SessionKey)
  },
}
