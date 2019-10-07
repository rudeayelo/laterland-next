import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import { Box, Button, Flex, Text } from "@rudeland/ui";
import { Alert, Input, Loading } from "../components";
import { useAuth, useFetch } from "../hooks";
import { MdDone, MdClose } from "react-icons/md";

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

  useEffect(() => {
    if (data) {
      setDescription(data.description);
      setTags(data.tags);
    }
  }, [data]);

  if (error) return <Text>Error loading post</Text>;

  console.log({ updateLoading, updateResponse });

  return (
    <>
      {loading ? (
        <Loading />
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
              fontWeight={2}
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
          {/* <Box alignSelf="flex-end">
            <Button
              appearance="primary"
              intent="success"
              size="large"
              iconBefore={<MdDone size={20} />}
              onClick={() => console.log("save")}
              mt={2}
            >
              Save
            </Button>
          </Box> */}
        </Flex>
      )}
    </>
  );
};
