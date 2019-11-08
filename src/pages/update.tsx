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
import { Machine } from 'xstate';
import { useMachine } from '@xstate/react';
import matchSorter from "match-sorter";
import { MdDelete, MdSave } from "react-icons/md";
import { PageLoading, TagsInput } from "../components";
import { useAlert } from "../hooks";
import { useMutation, useQuery } from "../providers"

const updatePostMachine = Machine({
  id: 'updatePost',
  initial: 'idle',
  states: {
    idle: {
      on: {
        UPDATE: "updating",
        DELETE: "deleting",
      }
    },
    updating: {
      entry: "onUpdate",
      on: {
        UPDATE_SUCCESS: {
          target: "updated"
        },
        UPDATE_FAILED: {
          target: "idle",
          actions: "onPostUpdateFailed"
        }
      }
    },
    updated: {
      entry: "onPostUpdateSuccess",
      on: { '': "idle" }
    },
    deleting: {
      entry: "onDelete",
      on: {
        DELETE_SUCCESS: {
          target: "deleted"
        },
        DELETE_FAILED: {
          target: "idle",
          actions: "onPostDeleteFailed"
        }
      }
    },
    deleted: {
      entry: "onPostDeleteSuccess",
      on: { '': "idle" }
    },
  }
});

const POST_QUERY = `
  query($id: String) {
    post(id: $id) {
      description
      href
      tags
      suggestedTags
    }
  }
`

const UPDATE_POST_MUTATION = `
mutation($id: String!, $description: String!, $tags: String!) {
    updatePost(id: $id, description: $description, tags: $tags) {
      result
    }
  }
`

const DELETE_POST_MUTATION = `
  mutation($id: String) {
    delete(id: $id ) {
      result
    }
  }
`

const ALL_TAGS_QUERY = `
  {
    tags
  }
`

export default () => {
  const router = useRouter();
  const { id } = router.query;
  const alert = useAlert();
  const [tags, setTags] = useState([]);
  const [autocompleteTags, setAutocompleteTags] = useState([]);
  const [description, setDescription] = useState("");
  const { data, error: postError, isLoading } = useQuery("post", POST_QUERY, { id })
  const { data: allTags } = useQuery("allTags", ALL_TAGS_QUERY)
  const { execute: updatePost, response: updatePostResponse } = useMutation(
    UPDATE_POST_MUTATION,
    { id, description, tags: tags.join(" ") }
  );
  const {execute: deletePost, response: deletePostResponse} = useMutation(
    DELETE_POST_MUTATION, { id }
  )

  const [current, send] = useMachine(updatePostMachine, {
    actions: {
      onUpdate: () => updatePost(),
      onPostUpdateSuccess: () => {
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
      },
      onPostUpdateFailed: () => alert({
        title: "Error updating the post",
        description: updatePostResponse.errors[0].message,
        intent: "error"
      }),
      onDelete: () => deletePost(),
      onPostDeleteSuccess: () => {
        setTimeout(() => {
          router.push(`/`);
        }, 3000);

        alert({
          title: "Post deleted",
          intent: "success",
          icon: MdDelete
        });
      },
      onPostDeleteFailed: () => alert({
        title: "Error deleting the post",
        description: deletePostResponse.errors[0].message,
        intent: "error"
      }),
    }
  });

  const onTagClick = suggestedTag => {
    return setTags(tags => [...tags, suggestedTag]);
  };

  const onNextTagChange = value => {
    if (allTags) {
      let matches = matchSorter(allTags.tags, value).slice(0, 3);

      if (value.length > 2) { setAutocompleteTags(matches) }
    }
  };

  const onAutocompleteTagClick = autocompleteTag => {
    setTags(tags => [...tags, autocompleteTag]);
  };

  useEffect(() => {
    if (data?.post) {
      const {post: { description, tags}} = data
      setDescription(description);
      setTags(tags.length ? tags.split(" ") : []);
    }
  }, [data]);

  useEffect(() => {
    setAutocompleteTags([]);
  }, [tags]);

  useEffect(() => {
    updatePostResponse && !updatePostResponse.errors && send("UPDATE_SUCCESS")
    updatePostResponse?.errors && send("UPDATE_FAILED")
  }, [updatePostResponse]);

  useEffect(() => {
    deletePostResponse && !deletePostResponse.errors && send("DELETE_SUCCESS")
    deletePostResponse?.errors && send("DELETE_FAILED")
  }, [deletePostResponse]);

  if (postError) return (
    <Flex justifyContent="center" alignItems="center">
      <Text>Error loading post</Text>
    </Flex>
  );

  return (
    <>
      {isLoading ? (
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
                send("UPDATE");
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
                mt={2}
              >
                <a href={data.post.href} title={data.post.description}>
                  {data.post.href}
                </a>
              </Text>
              <Box position="relative" mt={2}>
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
                        onMouseDown={e => e.preventDefault()}
                        onClick={_ => onAutocompleteTagClick(autocompleteTag)}
                        key={autocompleteTag}
                      >
                        {autocompleteTag}
                      </Button>
                    ))}
                  </Box>
                )}
                <TagsInput
                  tags={tags}
                  onAdd={setTags}
                  onChange={onNextTagChange}
                  onRemove={setTags}
                />
              </Box>
            </Flex>
            {!!data?.post.suggestedTags.length && (
              <Box pt={4}>
                {data?.post.suggestedTags
                    .filter(suggestedTag => !tags.includes(suggestedTag))
                    .map(suggestedTag => (
                      <Button
                        variantColor="blue"
                        fontWeight="normal"
                        onMouseDown={e => e.preventDefault()}
                        onClick={_ => onTagClick(suggestedTag)}
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
            )}
            <Flex alignItems="center" alignSelf="flex-start" mt={5}>
              <Button
                onClick={() => send("DELETE")}
                variant="link"
                variantColor="red"
                size="sm"
                leftIcon={MdDelete}
                isLoading={current.matches("deleting")}
                loadingText={current.matches("deleting") && "Deleting"}
                fontWeight="normal"
              >
                Delete
              </Button>
              <Button
                onClick={() => send("UPDATE")}
                variantColor="green"
                leftIcon={MdSave}
                isLoading={current.matches("updating")}
                loadingText={current.matches("updating") && "Updating"}
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
