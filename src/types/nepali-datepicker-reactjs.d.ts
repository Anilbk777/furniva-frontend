declare module '@sbmdkl/nepali-datepicker-reactjs' {
  import type { Component, CSSProperties } from 'react'

  export type NepaliCalendarLanguage =
    | 'en'
    | 'ne'
    | 'EN'
    | 'NE'
    | 'english'
    | 'nepali'

  export type NepaliCalendarTheme =
    | 'red'
    | 'blue'
    | 'green'
    | 'dark'
    | 'deepdark'
    | 'default'

  export interface NepaliCalendarProps {
    className?: string
    defaultDate?: string
    dateFormat?: string
    language?: NepaliCalendarLanguage
    minDate?: string
    maxDate?: string
    onChange?: (value: string) => void
    style?: CSSProperties
    theme?: NepaliCalendarTheme
    hideDefaultValue?: boolean
    placeholder?: string
  }

  export default class Calendar extends Component<NepaliCalendarProps> {}
}
