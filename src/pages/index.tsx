import { useRouter } from "next/router";
import styled from "styled-components";
import { border, BorderProps } from "styled-system";
import format from "date-fns/lightFormat";
import formatDistance from "date-fns/formatDistance";
import extractDomain from "extract-domain";
import { Box, Button, Flex, Text } from "@rudeland/ui";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { MdEdit } from "react-icons/md";
import { Alert, PageLoading } from "../components";
import { useAuth, useFetch } from "../hooks";

const EDIT_POST_SWIPE_THRESHOLD = 50;

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
  py: 2,
  position: "relative"
};

const PostDescription = styled(Text)`
  text-decoration: underline solid ${({ theme }) => theme.colors.blue.light};
`;

PostDescription.defaultProps = {
  lineHeight: 1.6,
  fontWeight: 1
};

const EditIcon = styled(MdEdit)`
  color: ${({ theme }) => theme.colors.blue.base};
`;

EditIcon.defaultProps = {
  size: 28
};

const EditIndicator = ({ dragX }) => {
  const x = useTransform(
    dragX,
    [10, 45, EDIT_POST_SWIPE_THRESHOLD],
    [-50, -30, 0]
  );

  return (
    <motion.div
      style={{ x, y: "-50%", position: "absolute", top: "50%", left: 0 }}
    >
      <Box py={3} pl={3}>
        <EditIcon />
      </Box>
    </motion.div>
  );
};

const Post = ({ post }) => {
  const router = useRouter();
  const postDate = new Date(post.time);
  const postISODate = format(postDate, "yyyy-MM-dd");
  const x = useMotionValue(0);

  const goToUpdateView = () => {
    router.push(`/update?url=${post.href}&fallback_date=${postISODate}`);
  };

  const goToPostHref = () => {
    window.location.href = post.href;
  };

  return (
    <PostContainer>
      <Box>
        <EditIndicator dragX={x} />
      </Box>
      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) =>
          info.point.x > EDIT_POST_SWIPE_THRESHOLD && goToUpdateView()
        }
      >
        <motion.div onTap={goToPostHref}>
          <PostDescription>{post.description}</PostDescription>
          <Box>
            <Detail>{extractDomain(post.href)}</Detail>
            <Detail>{formatDistance(postDate, new Date())} ago</Detail>
          </Box>
        </motion.div>
      </motion.div>
    </PostContainer>
  );
};

export default () => {
  const { user } = useAuth();
  const { data, error, loading } = useFetch(
    `/api/list?uid=${user.uid}&toread=yes`
  );

  if (error)
    return (
      <Alert intent="danger" alignItems="center" alignSelf="flex-start">
        Error loading posts
      </Alert>
    );

  return loading ? (
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
