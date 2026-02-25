# Feature: Sarvam AI Light Theme UI Refactor

## Description
This pull request completely refactors the application UI from the previous dark theme/glassmorphism aesthetic to a professional, light, and ethereal aesthetic inspired by Sarvam AI.

### Key Changes:
- **CSS Architecture Overhaul:** Re-wrote `--bg-root`, `--bg-main`, `--bg-card`, text tokens, and shadow tokens in `index.css`.
- **Backgrounds:** Removed dark `#080b12` background in favor of `#fdfdfd` and white `#ffffff` cards to give the app a clean feel.
- **Micro-interactions:** Updated buttons to use deep charcoal/blue accents, pill-shapes (`border-radius: 99px`), and soft bottom shadows.
- **Component Styling Updates:**
  - Sidebar and Top Navigation now use light gradient accents and drop-shadows rather than glowing heavy borders.
  - Modals and toast notifications now correctly render on a translucent light background with black typography.
  - Context menu updated to use a light translucent blur.
  - Progress and storage bars updated to use softer purples and violet gradients.
- **Terminal Component Integration:** Made the OS System Call Terminal render out at the bottom of the Dashboard route automatically, and styled it with JetBrains Mono to look like a modern embedded dev console underneath the UI components.

## Verification
- Verified all routes (Dashboard, Trash, Analytics, Settings, iNode Table) function properly with the new CSS tokens.
- Captured screenshots verifying the UI updates match the expected Sarvam AI quality visual design.

Please review and merge if everything looks good!
