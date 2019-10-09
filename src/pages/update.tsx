import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Button, Flex, Text } from "@rudeland/ui";
import { Alert, Input, Loading, PageLoading } from "../components";
import { useAuth, useFetch } from "../hooks";
import { MdDone, MdClose, MdDeleteForever } from "react-icons/md";

export default () => {
  const router = useRouter();
  const { url, fallback_date } = router.query;
  const { user } = useAuth();
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
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

  if (error) return <Text>Error loading post</Text>;

  return (
    <>
      {loading ? (
        <PageLoading />
      ) : (
        <Flex
          flexDirection="column"
          justifyContent="flex-end"
          pb={3}
          px={3}
          height="100vh"
        >
          {updateLoading ? (
            <Loading size={32} mb={3} />
          ) : (
            updateResponse && (
              <Alert
                intent={updateResponse.error ? "danger" : "success"}
                alignItems="center"
                alignSelf="flex-start"
                mb={3}
              >
                {updateResponse.error ? (
                  <>
                    <MdClose size={24} style={{ marginRight: 8 }} />{" "}
                    {updateResponse.data}
                  </>
                ) : (
                  <>
                    <MdDone size={24} style={{ marginRight: 8 }} /> Updated!
                  </>
                )}
              </Alert>
            )
          )}
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
              autoCorrect="off"
              autoCapitalize="none"
              placeholder="tags"
              onChange={e => setTags(e.target.value)}
              onKeyPress={e => {
                e.key === "Enter" && update();
              }}
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
                    onClick={() => setTags(tags => `${tags} ${suggestedTag}`)}
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
              iconBefore={<MdDeleteForever size={20} />}
              mr={2}
              mb={2}
            >
              Delete
            </Button>
          </Box>
        </Flex>
      )}
    </>
  );
};
