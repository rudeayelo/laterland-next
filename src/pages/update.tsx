import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Box, Button, Flex, Text } from "@rudeland/ui";
import { motion } from "framer-motion"
import { useAlert, Input, Loading, PageLoading } from "../components";
import { useAuth, useFetch } from "../hooks";
import { MdDone, MdClose } from "react-icons/md";

export default () => {
  const router = useRouter();
  const { url, fallback_date } = router.query;
  const { user } = useAuth();
  const { alertInfo, alertSuccess, alertDanger, closeAlert } = useAlert();
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const tagsInput = useRef(null);
  const { data, error, loading } = useFetch(
    `/api/get?uid=${user.uid}&url=${url}&dt=${fallback_date}`
  );
  const { data: suggestedTags, loading: suggestedTagsLoading } = useFetch(
    `/api/suggest?uid=${user.uid}&url=${url}`
  );
  const {
    data: updateResponse,
    loading: updateLoading,
    execute: update
  } = useFetch(
    `/api/update?uid=${user.uid}&url=${url}`,
    JSON.stringify({ url, description, tags, hash: data && data.hash })
  );
  const {
    data: deletePostResponse,
    loading: deletePostLoading,
    execute: deletePost
  } = useFetch(
    `/api/delete?uid=${user.uid}&url=${url}`,
    JSON.stringify({ url, hash: data && data.hash })
  );

  useEffect(() => {
    if (data) {
      setDescription(data.description);
      setTags(data.tags);
    }
  }, [data]);

  useEffect(() => {
    if (tagsInput && tagsInput.current) {
      const inputValueLength = tagsInput.current.value.length;
      tagsInput.current.focus();
      tagsInput.current.setSelectionRange(inputValueLength, inputValueLength);
    }
  }, [tags]);

  useEffect(() => {
    if (!updateLoading && updateResponse) {
      if (!updateResponse.error) {
        const redirect = setTimeout(() => {
          router.push(`/`);
        }, 3000);

        closeAlert();
        alertSuccess(
          <Flex alignItems="center" flex={1}>
            <MdDone size={24} />
            <Box ml={2}>Updated!</Box>
            <Button
              intent="success"
              size="small"
              onClick={() => clearTimeout(redirect)}
              ml="auto"
            >
              Cancel redirect
            </Button>
          </Flex>
        );
      } else {
        closeAlert();
        alertDanger(
          <Flex alignItems="center">
            <MdClose size={24} style={{ marginRight: 8 }} />{" "}
            {updateResponse.data}
          </Flex>
        );
      }
    }
  }, [updateResponse, updateLoading]);

  const onTagClick = (e, suggestedTag) => {
    e.stopPropagation();
    return setTags(tags => `${tags} ${suggestedTag}`);
  };

  const onUpdate = () => {
    alertInfo(
      <Flex alignItems="center">
        <Loading size={32} ml={2} />
        Updating...
      </Flex>
    );
    update();
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
              update();
            }}
          >
            <Input
              value={description}
              autoCorrect="off"
              autoCapitalize="none"
              onChange={e => setDescription(e.target.value)}
              onKeyPress={e => {
                e.key === "Enter" && update();
              }}
              fontSize={4}
              fontWeight={1}
            />
            <Text
              textSize={0}
              color="blue.base"
              px={2}
              onClick={() => {
                window.location.href = data.href;
              }}
            >
              {data.href}
            </Text>
            <Input
              value={tags}
              ref={tagsInput}
              autoCorrect="off"
              autoCapitalize="none"
              placeholder="tags"
              onChange={e => setTags(e.target.value)}
              onKeyPress={e => {
                e.key === "Enter" && onUpdate();
              }}
              fontWeight={0}
            />
          </Flex>
          {suggestedTagsLoading ? (
            <Loading size={32} pt={3} />
          ) : (
            !!suggestedTags.length && (
              <Box pt={3}>
                {suggestedTags.map(suggestedTag => (
                  <Button
                    appearance="default"
                    onClick={e => onTagClick(e, suggestedTag)}
                    size="small"
                    mr={2}
                    mb={2}
                    key={suggestedTag}
                  >
                    {suggestedTag}
                  </Button>
                ))}
              </Box>
            )
          )}
          <Box alignSelf="flex-start">
            <Button
              appearance="default"
              intent="danger"
              onClick={deletePost}
              iconBefore={<MdClose size={20} />}
              mr={2}
              mt={2}
            >
              Delete
            </Button>
          </Box>
        </Flex>
        </motion.div>
      )}
    </>
  );
};
