import { Input, type InputProps } from 'src/components/ui/Input'

export interface PhoneInputProps {
  id: string
  inputProps: InputProps
  error?: string
}

export function PhoneInput({ id, inputProps, error }: PhoneInputProps) {
  return (
    <Input
      {...inputProps}
      id={id}
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      maxLength={10}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : inputProps['aria-describedby']}
    />
  )
}
