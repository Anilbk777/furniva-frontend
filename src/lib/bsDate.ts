const nepaliDigits = '०१२३४५६७८९'

/** Convert Devanagari digits (used by the BS calendar) to ASCII digits. */
export function toAsciiDigits(value: string): string {
  return String(value ?? '').replace(/[०-९]/g, (digit) =>
    String(nepaliDigits.indexOf(digit)),
  )
}

/** Convert ASCII digits to Devanagari digits for Nepali labels. */
export function toNepaliDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (digit) => nepaliDigits[Number(digit)] ?? digit)
}
