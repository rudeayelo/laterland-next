import { Box, Button, Flex, Text } from "@chakra-ui/core";
import { motion } from "framer-motion";
import { Alert, PageLoading, Post } from "../components";
import { useAuth, useQuery } from "../providers";

const POSTS_QUERY = `
  {
    posts(fetchFromPinboard: true) {
      id
      description
      href
      time
      deleted
    }
    user {
      syncPending
      checkpoint
    }
  }
`;

export default () => {
  const { signout } = useAuth();
  const { data, error } = useQuery(POSTS_QUERY);

  if (error)
    return (
      <Box px={3} pt={3} minW="100vw">
        <Alert
          intent="error"
          alignItems="center"
          justifyContent="space-between"
        >
          <Flex alignItems="center" flex={1}>
            <Box ml={3} textAlign="left" flex={1}>
              <Text fontWeight="medium">Error</Text>
              <Text fontSize="sm">{data.errors[0].message}</Text>
            </Box>
            <Button
              onClick={signout}
              variantColor="white"
              variant="outline"
              ml="auto"
              size="sm"
            >
              Try signing out
            </Button>
          </Flex>
        </Alert>
      </Box>
    );

  if (!data) return <PageLoading />;

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
      <Text
        as="h1"
        color="gray.900"
        fontWeight="medium"
        fontSize="xl"
        mt={10}
        mb={3}
        mx={3}
      >
        {data.posts.length} unread posts
      </Text>
      {data.posts.map(post => (
        <Post
          post={post}
          isCheckpoint={post.id === data.user.checkpoint}
          key={post.id}
        />
      ))}
    </motion.div>
  );
};
