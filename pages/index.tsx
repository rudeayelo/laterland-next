import { useRouter } from "next/router";
import styled from "styled-components";
import { border, BorderProps } from "styled-system";
import format from "date-fns/lightFormat";
import formatDistance from "date-fns/formatDistance";
import extractDomain from "extract-domain";
import { Box, Button, Flex, Text } from "@rudeland/ui";
import { Loading } from "../components";
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

const Post = ({ post }) => {
  const router = useRouter();
  const postDate = new Date(post.time);
  const postISODate = format(postDate, "yyyy-MM-dd");

  return (
    <PostContainer>
      <Text
        onClick={() => {
          router.push(`/update?url=${post.href}&fallback_date=${postISODate}`);
        }}
      >
        {post.description}
      </Text>
      <Box>
        <Detail>{extractDomain(post.href)}</Detail>
        <Detail>{formatDistance(postDate, new Date())} ago</Detail>
      </Box>
    </PostContainer>
  );
};

export default () => {
  const { user, signout } = useAuth();
  const { data, error, loading } = useFetch(
    `/api/list?uid=${user.uid}&toread=yes`
  );

  if (error)
    return (
      <Text>
        Error loading posts, <Text onClick={signout}>sign out maybe?</Text>
      </Text>
    );

  return (
    <Box>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Text as="h1" fontWeight={2} textSize={4} py={3} px={3}>
            {data.length} unread posts
          </Text>
          {data.map(post => (
            <Post post={post} key={post.id} />
          ))}
        </>
      )}
    </Box>
  );
};