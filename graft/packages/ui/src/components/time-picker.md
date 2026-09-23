# packages/ui/src/components/time-picker.tsx

- pad · function · L19-L19 — pad = (n: number)
- toLabel · function · L22-L28 — function toLabel(value: string): string
- toValue · function · L31-L38 — function toValue(data: UpdateEventData): string | null
- tick · function · L41-L41 — tick = ()
- TimeSuggestion · interface · L43-L48 — interface TimeSuggestion
- TimePickerProps · interface · L50-L62 — interface TimePickerProps
- TimePicker · function · L64-L82 — function TimePicker({ value, onChange, suggestions, suggestionsLabel = "Suggested", placeholder = "Choose a time", disabled, ...field }: TimePickerProps)
- ClockPanel · function · L84-L187 — function ClockPanel({ value, onChange, suggestions, suggestionsLabel }: Pick<TimePickerProps, "value" | "onChange" | "suggestions" | "suggestionsLabel">)
- relabel · function · L135-L139 — relabel = ()
