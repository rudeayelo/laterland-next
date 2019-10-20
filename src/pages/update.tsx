import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  Menu,
  MenuList,
  MenuItem,
  Text
} from "@chakra-ui/core";
import { motion } from "framer-motion";
import matchSorter from "match-sorter";
import { MdDelete, MdSave } from "react-icons/md";
import { Loading, PageLoading } from "../components";
import { useAlert, useApi } from "../hooks";

export default () => {
  const router = useRouter();
  const { url, fallback_date } = router.query;
  const alert = useAlert();
  const [tags, setTags] = useState("");
  const [autocompleteTags, setAutocompleteTags] = useState([]);
  const [description, setDescription] = useState("");
  const { data, error, loading } = useApi(`/get`, {
    body: { url, dt: fallback_date }
  });
  const { data: suggestedTags, loading: suggestedTagsLoading } = useApi(
    `/suggest`,
    { body: { url } }
  );
  const {
    data: updatePostResponse,
    error: updatePostResponseError,
    loading: updatePostLoading,
    execute: updatePost
  } = useApi(`/update`, {
    body: { url, description, tags, hash: data && data.hash },
    lazy: true
  });
  const {
    data: deletePostResponse,
    error: deletePostResponseError,
    loading: deletePostLoading,
    execute: deletePost
  } = useApi(`/delete`, {
    body: { url, hash: data && data.hash },
    lazy: true
  });
  const { data: allTagsResponse } = useApi(`/tags`, {});

  useEffect(() => {
    if (tags.slice(-1) !== " ") {
      const inputTags = tags.split(" ");
      const lastTag = inputTags[inputTags.length - 1];

      if (allTagsResponse) {
        let entries: [string, number][] = Object.entries(allTagsResponse);
        let matches = matchSorter(entries, lastTag, {
          keys: [item => item[0]]
        }).slice(0, 3);

        if (tags.length > 2) {
          setAutocompleteTags(matches.map(match => match[0]));
        }
      }
    }
  }, [tags]);

  useEffect(() => {
    if (data) {
      setDescription(data.description);
      setTags(data.tags);
    }
  }, [data]);

  // Update post feedback
  useEffect(() => {
    if (!updatePostLoading && updatePostResponse) {
      if (!updatePostResponse.error) {
        const redirect = setTimeout(() => {
          router.push(`/`);
        }, 3000);

        alert({
          title: "Post updated",
          intent: "success",
          extended: (
            <Button
              variant="link"
              variantColor="green"
              color="green.800"
              fontWeight="normal"
              onClick={() => clearTimeout(redirect)}
              size="xs"
              ml={6}
            >
              Cancel redirection
            </Button>
          )
        });
      } else {
        alert({
          title: "Error updating the post",
          description: updatePostResponseError || updatePostResponse.data,
          intent: "error"
        });
      }
    }
  }, [updatePostResponse, updatePostLoading]);

  // Delete post feedback
  useEffect(() => {
    if (!deletePostLoading && deletePostResponse) {
      if (!deletePostResponse.error) {
        setTimeout(() => {
          router.push(`/`);
        }, 3000);

        alert({
          title: "Post deleted",
          intent: "success",
          icon: MdDelete
        });
      } else {
        alert({
          title: "Error deleting the post",
          description: deletePostResponseError || deletePostResponse.data,
          intent: "error"
        });
      }
    }
  }, [deletePostResponse, deletePostLoading]);

  const onTagClick = (e, suggestedTag) => {
    e.stopPropagation();
    return setTags(tags => `${tags} ${suggestedTag} `);
  };

  const onAutocompleteTagClick = (e, suggestedTag) => {
    e.stopPropagation();
    let tagsInput = tags.split(" ");
    let firstTags = tagsInput
      .filter((_, index) => index !== tagsInput.length - 1)
      .join(" ");

    setTimeout(() => {
      setAutocompleteTags([]);
    }, 0);

    return setTags(`${firstTags} ${suggestedTag} `);
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
            <Flex
              as="form"
              flexDirection="column"
              onSubmit={e => {
                e.preventDefault();
                updatePost();
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
                startWithEditView
                fontSize="sm"
                placeholder="tags"
                mt={2}
                position="relative"
              >
                {!!autocompleteTags.length && (
                  <Box
                    position="absolute"
                    bottom="100%"
                    background="white"
                    borderWidth={1}
                    borderStyle="solid"
                    borderColor="gray.200"
                    borderRadius="md"
                  >
                    {autocompleteTags.map(autocompleteTag => (
                      <Button
                        variant="link"
                        variantColor="blue"
                        fontWeight="normal"
                        fontSize="sm"
                        p={3}
                        onClick={e =>
                          onAutocompleteTagClick(e, autocompleteTag)
                        }
                        key={autocompleteTag}
                      >
                        {autocompleteTag}
                      </Button>
                    ))}
                  </Box>
                )}
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
                  {!!suggestedTags.length &&
                    suggestedTags.map(suggestedTag => (
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
            <Flex alignItems="center" alignSelf="flex-start" mt={5}>
              <Button
                onClick={deletePost}
                variant="link"
                variantColor="red"
                size="sm"
                leftIcon={MdDelete}
                isLoading={deletePostLoading}
                loadingText={deletePostLoading && "Deleting"}
                fontWeight="normal"
              >
                Delete
              </Button>
              <Button
                onClick={updatePost}
                variantColor="green"
                leftIcon={MdSave}
                isLoading={updatePostLoading}
                loadingText={updatePostLoading && "Updating"}
                isDisabled={!tags.length}
                ml={5}
              >
                Update
              </Button>
            </Flex>
          </Flex>
        </motion.div>
      )}
    </>
  );
};
