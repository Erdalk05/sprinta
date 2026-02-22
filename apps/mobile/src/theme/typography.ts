import { TextStyle } from 'react-native'

export const typography: Record<string, TextStyle> = {
  h1:            { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  h2:            { fontSize: 22, fontWeight: '700', lineHeight: 30 },
  h3:            { fontSize: 18, fontWeight: '600', lineHeight: 26 },
  body:          { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyMedium:    { fontSize: 16, fontWeight: '500', lineHeight: 24 },
  label:         { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  caption:       { fontSize: 12, fontWeight: '400', lineHeight: 18 },
  captionMedium: { fontSize: 12, fontWeight: '600', lineHeight: 18 },
}
