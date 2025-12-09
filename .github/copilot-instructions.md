# FitnessApp — Copilot Instructions

## Stack
- **Framework:** Expo SDK 51 / React Native 0.74
- **Language:** TypeScript (`strict`, `noImplicitAny=false`).
- **Navigation:** React Navigation material-top-tabs (positioned bottom), Reanimated v3, Gesture Handler, RN SVG.
- **Config:** Babel `babel-preset-expo` with `react-native-reanimated/plugin` (keep this plugin last).

## Package Management
- Use `npm` (package-lock present); do not mix with yarn/pnpm.
- Install native/Expo packages with `npx expo install <pkg>` to stay on SDK-compatible versions.
- Scripts: `npm start`, `npm run android|ios|web`, `npm run typecheck`, EAS builds via provided scripts.

## Architecture & Directories
- **Entry:** `App.tsx`. Source under `src/` (`navigation/MainTabs.tsx`, `screens/`, `components/`, `components/ui/`, `theme/`, `i18n/`, `data/`).
- **Data Source:** `src/data/exercises.json` (consumed via the typed helper in `exercises.ts`).
- **Tokens:** Theme tokens live in `src/theme/tokens.ts`.
- **Logic:** Functional components + hooks only. Keep screens thin; move reusable UI to `components/` and logic to `hooks/`.

## State Management (Context + Local State)
- **React Context:** Use strictly for global configuration (Theme, I18n, Auth).
- **Local State:** Use `useState` and `useReducer` for screen-level logic.
- **Data Passing:** Pass data between screens using React Navigation `route.params`.

## Internationalization
- Keep all user-facing copy in `src/i18n/translations.ts` with stable keys.
- Ensure layouts allow for longer strings (avoid fixed widths).
- Use the existing `useI18n` hook (from `I18nProvider`).

## TypeScript & Style
- Strict TS; avoid `any` unless justified. Type props and JSON imports explicitly.
- No ESLint config; validate with `npm run typecheck`.
- **Naming:** components/screens `PascalCase` files; utilities `camelCase`.

## Styling Approach
- Default to `StyleSheet.create` using tokens from `src/theme/tokens.ts`.
- Avoid ad-hoc inline styles.
- Do not introduce NativeWind or other style systems unless explicitly documented.
- Use the existing `useTheme` hook to access colors/spacing.

## Imports & Path Aliases
- Prefer alias imports (`@/components/Button`) instead of deep relatives (`../../../`).
- Keep `@/*` mapped to `src/*` in `tsconfig` and Babel/Metro resolver.
- **Import Order:** React -> 3rd Party Libs -> Aliases -> Relative Paths.

## Design Principles
- **Loose Coupling:** Components define clear interfaces.
- **High Cohesion:** Group related responsibilities.
- **KISS:** Straightforward solutions > clever abstractions.
- **YAGNI:** Implement only what is needed NOW.

## Navigation & UI Expectations
- Preserve 5-tab layout with bottom-positioned material top tabs.
- Use `react-native-safe-area-context` for edges.
- Keep Reanimated plugin and gesture-handler setup intact.

## AI Behavior & Code Generation (CRITICAL)
- **Be Concise:** Do not explain basic concepts. Focus on the solution.
- **No Hallucinations:** Do not import non-existent libraries (e.g., no Zustand). Check `package.json` first.
- **Updates:** Provide full context for small files; precise diffs for large files.
- **Error Handling:** Fail gracefully.

## Assets
- Store images/SVGs under `assets/` (anatomy assets under `assets/anatomy/...`).

## Testing & Verification
- Run `npm run typecheck` after TS changes.
- Runtime: `npm start` with Expo Go.
