import { useRouter } from "next/router";
import styled from "styled-components";
import { border, BorderProps } from "styled-system";
import format from "date-fns/lightFormat";
import formatDistance from "date-fns/formatDistance";
import extractDomain from "extract-domain";
import { Box, Button, Flex, Text } from "@rudeland/ui";
import { PageLoading } from "../components";
import { useAuth, useFetch } from "../hooks";

const Detail = styled(Text).attrs({
  as: "span"
})`
  &:not(:last-child) {
    margin-right: 4px;
    &::after {
      content: " /";
    }
  }
`;

Detail.defaultProps = {
  textSize: 0,
  color: "g.50",
  mb: 3
};

interface PostContainerProps extends BorderProps {}

const PostContainer = styled(Box)<PostContainerProps>`
  cursor: pointer;

  &:not(:last-child) {
    ${border}
  }
`;

PostContainer.defaultProps = {
  borderBottom: "1px solid",
  borderColor: "g.90",
  px: 3,
  py: 2
};

const PostDescription = styled(Text)`
  text-decoration: underline solid ${({ theme }) => theme.colors.blue.light};
`;

PostDescription.defaultProps = {
  lineHeight: 1.6,
  fontWeight: 1
};

const Post = ({ post }) => {
  const router = useRouter();
  const postDate = new Date(post.time);
  const postISODate = format(postDate, "yyyy-MM-dd");

  return (
    <PostContainer
      onClick={() => {
        router.push(`/update?url=${post.href}&fallback_date=${postISODate}`);
      }}
    >
      <PostDescription>{post.description}</PostDescription>
      <Box>
        <Detail>{extractDomain(post.href)}</Detail>
        <Detail>{formatDistance(postDate, new Date())} ago</Detail>
      </Box>
    </PostContainer>
  );
};

export default () => {
  const { user, signout, userLoading } = useAuth();
  console.log("userLoading", userLoading);
  const { data, error, loading } = useFetch(
    `/api/list?uid=${user && user.uid}&toread=yes`
  );

  if (error)
    return (
      <Text>
        Error loading posts, <Text onClick={signout}>sign out maybe?</Text>
      </Text>
    );

  return userLoading || loading ? (
    <PageLoading />
  ) : (
    <>
      <Text as="h1" fontWeight={2} textSize={4} py={3} px={3}>
        {data.length} unread posts
      </Text>
      {data.map(post => (
        <Post post={post} key={post.id} />
      ))}
    </>
  );
};
