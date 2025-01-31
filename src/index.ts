import type { Config } from "tailwindcss";
import { scaleRemFactor } from "./utils";
import defaultTheme from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";

export default plugin.withOptions(
  () => {
    return function () {
      // Plugin functionality can be added here if needed in the future
    };
  },
  (options: { baseFontSize: number; newFontSize: number }): Partial<Config> => {
    const baseFontSize = options?.baseFontSize;
    const newFontSize = options?.newFontSize;

    if (baseFontSize <= 0 || newFontSize <= 0) {
      throw new Error("Font sizes must be positive numbers");
    }
    return {
      theme: scaleRemFactor(
        defaultTheme,
        baseFontSize,
        newFontSize
      ) as Config["theme"],
    };
  }
);
