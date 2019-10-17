import { Flex } from "@chakra-ui/core";
import { Loading } from "./Loading";

const PageLoading = () => (
  <Flex
    justifyContent="center"
    alignItems="center"
    height="100vh"
    width="100vw"
  >
    <Loading size="56px" />
  </Flex>
);

export { PageLoading };
