import { Box, Button, Flex, IconButton, Text } from "@chakra-ui/core";
import { motion } from "framer-motion";
import { MdSync } from "react-icons/md";
import { Alert, PageLoading, Post, useAuth } from "../components";
import { useApi } from "../hooks";

export default () => {
  const { signout } = useAuth();
  const { data, error, loading, execute } = useApi(`/list`, {
    body: { toread: "yes" }
  });

  const sync = () => execute({ fetchFromPinboard: true });

  if (error)
    return (
      <Alert
        intent="error"
        alignItems="center"
        justifyContent="space-between"
        m={3}
      >
        <Text>Error loading posts</Text>
        <Button
          onClick={signout}
          variantColor="white"
          variant="outline"
          ml="auto"
          size="sm"
        >
          Try signin out
        </Button>
      </Alert>
    );

  if (loading && !data) return <PageLoading />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        x: 30,
        opacity: 0
      }}
      transition={{ ease: "easeOut", duration: 0.2 }}
    >
      <Flex justifyContent="space-between" mt={10} mb={3} mx={3}>
        <Text as="h1" color="gray.900" fontWeight="medium" fontSize="xl">
          {data.posts.length} unread posts
        </Text>
        <Box position="relative">
          <IconButton
            size="sm"
            onClick={sync}
            icon={MdSync}
            aria-label="Get new posts"
            isDisabled={!data.syncPending}
            isLoading={loading}
          />
          {data.syncPending && (
            <Box
              backgroundColor="blue.500"
              borderStyle="solid"
              borderWidth={2}
              borderColor="white"
              width={3}
              height={3}
              borderRadius="rounded"
              position="absolute"
              top={-4}
              right={-4}
            />
          )}
        </Box>
      </Flex>
      {data.posts.map(post => (
        <Post
          post={post}
          isCheckpoint={post.id === data.checkpoint}
          key={post.id}
        />
      ))}
    </motion.div>
  );
};
