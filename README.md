# tailwind-rem-to-rem

A Tailwind CSS plugin that converts REM values in your Tailwind config based on different base font sizes.

```bash
npm install tailwind-rem-to-rem
```

## Usage

Add the plugin to your `tailwind.config.js`:

```js
import tailwindRemToRem from "tailwind-rem-to-rem";

export default {
  theme: {
    extend: {
      fontSize: tailwindRemToRem({ baseFontSize: 16, newFontSize: 10 }),
    },
  },
};
```

## Options

- `baseFontSize`: The base font size to convert from
- `newFontSize`: The new font size to convert to

## License

MIT
