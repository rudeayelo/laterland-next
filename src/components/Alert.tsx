import styled from "../styled";
import { variant } from "styled-system";
import { Flex } from "@chakra-ui/core";
import { Intent } from "../typings";

export interface AlertProps extends Intent {}

const intent = variant({
  prop: "intent",
  variants: {
    none: {
      color: "gray.800",
      backgroundColor: "gray.200"
    },
    success: {
      color: "green.800",
      backgroundColor: "green.200"
    },
    error: {
      color: "red.800",
      backgroundColor: "red.200"
    },
    warning: {
      color: "orange.800",
      backgroundColor: "orange.200"
    }
  }
});

const Alert = styled(Flex)<AlertProps>`
  ${intent}
`;

Alert.defaultProps = {
  py: 4,
  px: 5,
  borderRadius: "sm",
  intent: "none"
};

export { Alert };
