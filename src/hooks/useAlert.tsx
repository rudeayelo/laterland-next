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
  extended?: React.ReactNode;
  description?: string;
  duration?: number;
}

const useAlert = () => {
  const toast = useToast();

  const alert = ({
    icon,
    title,
    description,
    extended,
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
        <Box px={3} pt={3} minW="100vw">
          <Alert
            intent={intent}
            alignItems="center"
            justifyContent="space-between"
          >
            <Flex alignItems="center" flex={1}>
              <Icon as={icon || AlertIcon} size={5} />
              <Box ml={3} textAlign="left" flex={1}>
                <Text fontWeight="medium">{title}</Text>
                {description && <Text fontSize="sm">{description}</Text>}
              </Box>
              {extended}
            </Flex>
          </Alert>
        </Box>
      )
    });
  };

  return alert;
};

export { useAlert };
