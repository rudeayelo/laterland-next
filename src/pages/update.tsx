import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  Text
} from "@chakra-ui/core";
import { motion } from "framer-motion";
import { Loading, PageLoading } from "../components";
import { useAlert, useApi } from "../hooks";
import { MdDelete, MdSave } from "react-icons/md";

export default () => {
  const router = useRouter();
  const { url, fallback_date } = router.query;
  const alert = useAlert();
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const tagsInput = useRef(null);
  const { data, error, loading } = useApi(`/get`, {
    body: { url, dt: fallback_date }
  });
  const { data: suggestedTags, loading: suggestedTagsLoading } = useApi(
    `/suggest`,
    { body: { url } }
  );
  const {
    data: updateResponse,
    error: updateResponseError,
    loading: updateLoading,
    execute: update
  } = useApi(`/update`, {
    body: { url, description, tags, hash: data && data.hash },
    lazy: true
  });
  const {
    data: deletePostResponse,
    loading: deletePostLoading,
    execute: deletePost
  } = useApi(`/delete`, {
    body: { url, hash: data && data.hash },
    lazy: true
  });

  useEffect(() => {
    if (data) {
      setDescription(data.description);
      setTags(data.tags);
    }
  }, [data]);

  useEffect(() => {
    if (!updateLoading && updateResponse) {
      if (!updateResponse.error) {
        const redirect = setTimeout(() => {
          router.push(`/`);
        }, 3000);

        // TODO: Cancel redirect button
        alert({
          title: "Post updated",
          intent: "success"
        });
      } else {
        alert({
          title: "Error updating the post",
          description: updateResponseError || updateResponse.data,
          intent: "error"
        });
      }
    }
  }, [updateResponse, updateLoading]);

  const onTagClick = (e, suggestedTag) => {
    e.stopPropagation();
    return setTags(tags => `${tags} ${suggestedTag}`);
  };

  if (error) return <Text>Error loading post</Text>;

  return (
    <>
      {loading ? (
        <PageLoading />
      ) : (
        <motion.div
          initial={{
            x: 30,
            opacity: 0
          }}
          exit={{
            opacity: 0
          }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ease: "easeOut", duration: 0.2 }}
        >
          <Flex
            flexDirection="column"
            justifyContent="flex-end"
            pb={3}
            px={3}
            height="100vh"
          >
            <Box alignSelf="flex-start" mb={5}>
              <Button
                variantColor="red"
                onClick={deletePost}
                leftIcon={MdDelete}
              >
                Delete
              </Button>
            </Box>
            <Flex
              as="form"
              flexDirection="column"
              onSubmit={e => {
                e.preventDefault();
                update();
              }}
            >
              <Editable
                value={description}
                onChange={e => setDescription(e)}
                submitOnBlur={false}
                fontSize="xl"
                fontWeight="medium"
              >
                <EditablePreview />
                <EditableInput
                  autoCorrect="off"
                  autoCapitalize="none"
                  borderRadius="sm"
                />
              </Editable>
              <Text
                fontSize="sm"
                color="primary"
                onClick={() => {
                  window.location.href = data.href;
                }}
                mt={2}
              >
                {data.href}
              </Text>
              <Editable
                value={tags}
                onChange={e => setTags(e)}
                submitOnBlur={false}
                selectAllOnFocus={false}
                fontSize="sm"
                placeholder="tags"
                mt={2}
              >
                <EditablePreview py={1} />
                <EditableInput
                  autoCorrect="off"
                  autoCapitalize="none"
                  borderRadius="sm"
                  py={1}
                />
              </Editable>
            </Flex>
            {suggestedTagsLoading ? (
              <Loading size="32px" pt={3} />
            ) : (
              !!suggestedTags.length && (
                <Box pt={4}>
                  {suggestedTags.map(suggestedTag => (
                    <Button
                      variantColor="blue"
                      fontWeight="normal"
                      onClick={e => onTagClick(e, suggestedTag)}
                      size="xs"
                      mr={2}
                      mb={2}
                      px={3}
                      borderRadius="rounded"
                      key={suggestedTag}
                    >
                      {suggestedTag}
                    </Button>
                  ))}
                </Box>
              )
            )}
            <Box alignSelf="flex-start" mt={5}>
              <Button
                isLoading={updateLoading}
                loadingText={updateLoading && "Updating"}
                variantColor="green"
                onClick={update}
                leftIcon={MdSave}
              >
                Update
              </Button>
            </Box>
          </Flex>
        </motion.div>
      )}
    </>
  );
};
