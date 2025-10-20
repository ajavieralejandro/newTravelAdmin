// lib/google-fonts.ts
import fonts from './google-fonts.json' assert { type: 'json' };

// El archivo tiene las fuentes como claves de objeto
export const GOOGLE_FONTS = Object.keys(fonts);
