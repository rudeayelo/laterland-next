import c from "color";
import { theme } from "@chakra-ui/core";

const lightness = (color: string, amount: number): string =>
  c(color)
    .lightness(amount)
    .hsl()
    .string();

const lighten = (color: string, amount: number): string =>
  c(color)
    .lighten(amount)
    .hsl()
    .string();

const darken = (color: string, amount: number): string =>
  c(color)
    .darken(amount)
    .hsl()
    .string();

const baseColors = {
  blue: "hsl(210, 100%, 60%)",
  green: "hsl(90, 50%, 45%)",
  grey: "hsl(210, 5%, 40%)",
  orange: "hsl(36, 80%, 50%)",
  red: "hsl(10, 70%, 45%)"
};

const paletteColors = {
  blue: {
    50: lighten(baseColors.blue, 0.6),
    100: lighten(baseColors.blue, 0.5),
    200: lighten(baseColors.blue, 0.4),
    300: lighten(baseColors.blue, 0.3),
    400: lighten(baseColors.blue, 0.2),
    500: baseColors.blue,
    600: darken(baseColors.blue, 0.2),
    700: darken(baseColors.blue, 0.4),
    800: darken(baseColors.blue, 0.6),
    900: darken(baseColors.blue, 0.8)
  },
  green: {
    50: lighten(baseColors.green, 0.5),
    100: lighten(baseColors.green, 0.4),
    200: lighten(baseColors.green, 0.3),
    300: lighten(baseColors.green, 0.2),
    400: lighten(baseColors.green, 0.1),
    500: baseColors.green,
    600: darken(baseColors.green, 0.2),
    700: darken(baseColors.green, 0.4),
    800: darken(baseColors.green, 0.6),
    900: darken(baseColors.green, 0.8)
  },
  orange: {
    50: lighten(baseColors.orange, 0.9),
    100: lighten(baseColors.orange, 0.7),
    200: lighten(baseColors.orange, 0.5),
    300: lighten(baseColors.orange, 0.3),
    400: lighten(baseColors.orange, 0.15),
    500: baseColors.orange,
    600: darken(baseColors.orange, 0.2),
    700: darken(baseColors.orange, 0.4),
    800: darken(baseColors.orange, 0.6),
    900: darken(baseColors.orange, 0.8)
  },
  red: {
    50: lighten(baseColors.red, 0.98),
    100: lighten(baseColors.red, 0.7),
    200: lighten(baseColors.red, 0.5),
    300: lighten(baseColors.red, 0.3),
    400: lighten(baseColors.red, 0.15),
    500: baseColors.red,
    600: darken(baseColors.red, 0.2),
    700: darken(baseColors.red, 0.4),
    800: darken(baseColors.red, 0.6),
    900: darken(baseColors.red, 0.8)
  },
  gray: {
    50: lightness(baseColors.grey, 95),
    100: lightness(baseColors.grey, 90),
    200: lightness(baseColors.grey, 80),
    300: lightness(baseColors.grey, 70),
    400: lightness(baseColors.grey, 60),
    500: lightness(baseColors.grey, 50),
    600: lightness(baseColors.grey, 40),
    700: lightness(baseColors.grey, 25),
    800: lightness(baseColors.grey, 10),
    900: lightness(baseColors.grey, 5)
  }
};

const aliasColors = {
  background: paletteColors.gray["50"],
  accentBackground: "white",
  primary: paletteColors.blue["500"],
  accent: paletteColors.green["500"]
};

const colors = {
  ...paletteColors,
  ...aliasColors
};

const fonts = {
  heading: `"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
  body: `"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
  mono: `SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace`
};

const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
  "4xl": 64,
  "5xl": 72,
  "6xl": 100
};

const shadows = {
  sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl:
    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  outline: "0 0 0 3px rgba(66, 153, 225, 0.6)",
  inner: "inset 0 2px 4px 0 rgba(0,0,0,0.06)",
  none: "none"
};

const space = {
  px: "1px",
  "0": "0",
  "1": "0.25rem",
  "2": "0.5rem",
  "3": "0.75rem",
  "4": "1rem",
  "5": "1.25rem",
  "6": "1.5rem",
  "8": "2rem",
  "10": "2.5rem",
  "12": "3rem",
  "16": "4rem",
  "20": "5rem",
  "24": "6rem",
  "32": "8rem",
  "40": "10rem",
  "48": "12rem",
  "56": "14rem",
  "64": "16rem"
};

const radii = {
  none: 0,
  sm: 3,
  md: 6,
  lg: 12,
  full: "99em",
  rounded: "99em"
};

const customTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    ...colors
  },
  fonts,
  fontSizes,
  radii,
  shadows,
  space
};

export { customTheme };
