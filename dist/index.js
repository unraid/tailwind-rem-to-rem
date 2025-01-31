import { scaleRemFactor } from "./utils";
import defaultTheme from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";
export default plugin.withOptions(() => {
    return function () {
        // Plugin functionality can be added here if needed in the future
    };
}, (options) => {
    var _a, _b;
    const baseFontSize = (_a = options === null || options === void 0 ? void 0 : options.baseFontSize) !== null && _a !== void 0 ? _a : 16;
    const newFontSize = (_b = options === null || options === void 0 ? void 0 : options.newFontSize) !== null && _b !== void 0 ? _b : 10;
    return {
        theme: scaleRemFactor(defaultTheme, baseFontSize, newFontSize),
    };
});
