import { Box, Button, Flex, Text, useToast } from "@chakra-ui/core";
import { MdDone, MdError, MdInfo, MdWarning } from "react-icons/md";
import { Alert, Icon } from "../components";
import { Intent } from "../typings";

interface UseAlertOptions extends Intent {
  title: string;
  position?:
    | "top"
    | "top-left"
    | "top-right"
    | "bottom"
    | "bottom-left"
    | "bottom-right";
  icon?: React.ReactNode;
  description?: string;
  duration?: number;
}

const useAlert = () => {
  const toast = useToast();

  const alert = ({
    icon,
    title,
    description,
    duration = 2000,
    position = "top",
    intent = "none"
  }: UseAlertOptions) => {
    const icons = {
      none: MdInfo,
      success: MdDone,
      warning: MdWarning,
      error: MdError
    };

    const AlertIcon = icons[intent];

    toast({
      position,
      duration,
      render: () => (
        <Alert
          intent={intent}
          alignItems="center"
          justifyContent="space-between"
          mx={3}
          mt={3}
        >
          <Flex alignItems="center" flex={1}>
            <Icon as={icon || AlertIcon} size={5} />
            <Box ml={2} textAlign="left">
              <Text fontWeight="medium">{title}</Text>
              {description && <Text fontSize="sm">{description}</Text>}
            </Box>
          </Flex>
        </Alert>
      )
    });
  };

  return alert;
};

export { useAlert };
