---
'@oito2/ui': minor
'@oito2/ui-themes': minor
---

Add the oito2 color system. `@oito2/ui` derives complete schemes (all Material 3 roles plus text-safe semantic, chrome and syntax colors, WCAG AA or AAA with high contrast) from an accent with `createColorTheme` or from a theme family's roles with `colorThemeFromRoles`, applies them with `ThemeProvider` (light, dark or system; accent and high contrast from the system by default) and exposes them to components through `useTheme()`. The Svelte-free parts are also available from `@oito2/ui/theme`, and `@oito2/ui/schemes.css` ships every base scheme as CSS. `@oito2/ui-themes` adds the 13 presets (Everforest, Rosé Pine, Nord, Dracula/Alucard and Catppuccin) with `presetColorTheme`, `presetTheme` and `@oito2/ui-themes/presets.css`.
