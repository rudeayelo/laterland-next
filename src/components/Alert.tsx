import styled from "styled-components";
import {
  color,
  ColorProps,
  background,
  BackgroundProps,
  border,
  BorderProps,
  variant
} from "styled-system";
import { baseTheme, Flex } from "@rudeland/ui";
import { Intent } from "../typings";

export interface AlertProps
  extends BackgroundProps,
    BorderProps,
    ColorProps,
    Intent {}

const intent = variant({
  prop: "intent",
  variants: {
    default: {
      color: "g.30",
      backgroundColor: "g.90"
    },
    success: {
      color: "green.dark",
      backgroundColor: "green.lightest"
    },
    danger: {
      color: "red.dark",
      backgroundColor: "red.lightest"
    },
    warning: {
      color: "orange.dark",
      backgroundColor: "orange.lightest"
    }
  }
});

const Alert = styled(Flex)<AlertProps>`
  ${intent}
  ${background};
  ${border};
  ${color};
`;

Alert.defaultProps = {
  px: 3,
  py: 3,
  borderRadius: 2,
  intent: "default",
  theme: baseTheme
};

export { Alert };
