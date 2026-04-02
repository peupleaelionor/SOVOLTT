// src/theme/typography.ts — Typographie Sovoltt

export const typography = {
  // Titres
  h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h2: { fontSize: 26, fontWeight: '700' as const, lineHeight: 34 },
  h3: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  h4: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  
  // Corps de texte
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyBold: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  
  // Labels et captions
  label: { fontSize: 14, fontWeight: '500' as const, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  captionBold: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16 },
  
  // Boutons
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 20 },
  buttonSmall: { fontSize: 14, fontWeight: '600' as const, lineHeight: 18 },
  
  // Grands chiffres (jauges, stats)
  stat: { fontSize: 36, fontWeight: '700' as const, lineHeight: 44 },
  statSmall: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
};
