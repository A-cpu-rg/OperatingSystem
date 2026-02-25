# ✨ FixYourFiles

Smart file organizer that actually thinks.

## 🚀 Features

- 🔍 Preview before organizing
- 🧠 Smart categorization (not just extensions)
- ⏪ Undo support
- ⚡ Fast CLI

## 📦 Usage & How to run

1. Install dependencies:
```bash
npm install
```

2. Build the TypeScript source code:
```bash
npm run build
```

3. Run the application using the local `dist/index.js` or via `npx` (if linked) / Node:
```bash
node dist/index.js preview ./downloads
node dist/index.js organize ./downloads --force
node dist/index.js watch ./downloads
node dist/index.js history
node dist/index.js undo
```

*(Alternatively, you can run `npm link` to use it as `fixyourfiles` everywhere).*

### 💡 Example

**Before:**
messy folder 😵

**After:**
clean folders ✨
