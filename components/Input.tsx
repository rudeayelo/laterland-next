import styled from "styled-components";
import {
  alignSelf,
  AlignSelfProps,
  borderRadius,
  BorderRadiusProps,
  color,
  ColorProps,
  display,
  DisplayProps,
  flex,
  FlexProps,
  fontSize,
  FontSizeProps,
  fontWeight,
  FontWeightProps,
  space,
  SpaceProps
} from "styled-system";
import c from "color";
import { baseTheme } from "@rudeland/ui";
import { ClassName } from "../typings";

const toShadow = (color: string): string =>
  c(color)
    .alpha(0.2)
    .hsl()
    .string();

export interface InputProps
  extends AlignSelfProps,
    BorderRadiusProps,
    ColorProps,
    DisplayProps,
    FlexProps,
    FontSizeProps,
    FontWeightProps,
    SpaceProps,
    ClassName {}

const Input = styled.input<InputProps>`
  -webkit-appearance: initial; /* Resets the appearance in mobile Safari */
  display: block;
  flex-wrap: nowrap;
  align-items: center;
  border: none;

  ${alignSelf};
  ${borderRadius};
  ${color};
  ${display};
  ${flex};
  ${fontSize};
  ${fontWeight};
  ${space};

  &:hover,
  &:focus {
    transition: box-shadow 150ms ease-in;
  }

  &:focus {
    outline: none;
    box-shadow: ${({ theme }) =>
      `0 0 0 3px ${toShadow(theme.colors.blue.dark)}, ${theme.shadows[1]}`};
  }
`;

Input.defaultProps = {
  borderRadius: 1,
  fontWeight: 1,
  fontSize: 2,
  px: 2,
  py: 2,
  theme: baseTheme
};

export { Input };
