import { useEffect, useState } from "react";
import { Box, Button, Flex, IconButton, Text } from "@chakra-ui/core";
import { motion } from "framer-motion";
import {
  MdSync,
} from "react-icons/md";
import { Alert, PageLoading } from "../components";
import {
  useApi,
  useAuth,
} from "../hooks";
import { Post } from "./index/Post"

export default () => {
  const { signout } = useAuth();
  const [posts, setPosts] = useState([])
  const [syncPending, setSyncPending] = useState(false)
  const { data, error, loading } = useApi(`/list`, { body: { toread: "yes" } });
  const {
    data: newData,
    error: newDataError,
    loading: syncing,
    execute: sync
  } = useApi(`/list`, {
    body: { toread: "yes", fetchFromPinboard: true },
    lazy: true
  });

  useEffect(() => {
    setPosts(newData?.posts || data?.posts || [])
    setSyncPending(newData?.syncPending || data?.syncPending || false)
  }, [data, newData])

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

  return loading ? (
    <PageLoading />
  ) : (
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
        <Text
          as="h1"
          color="gray.900"
          fontWeight="medium"
          fontSize="xl"
        >
          {posts.length} unread posts
        </Text>
        <Box position="relative">
          <IconButton
            size="sm"
            onClick={sync}
            icon={MdSync}
            aria-label="Get new posts"
            isDisabled={!syncPending}
            isLoading={syncing}
          />
          {syncPending &&
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
          }
        </Box>
      </Flex>
      {
        posts.map(post => (
          <Post
            post={post}
            isCheckpoint={post.id === data.checkpoint}
            key={post.id}
          />
        ))
      }
    </motion.div>
  );
};
