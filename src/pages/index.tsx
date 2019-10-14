import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import {
  border,
  BorderProps,
  alignItems,
  AlignItemsProps
} from "styled-system";
import format from "date-fns/lightFormat";
import formatDistance from "date-fns/formatDistance";
import extractDomain from "extract-domain";
import { Box, Button, Flex, Text } from "@rudeland/ui";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  MdCode,
  MdDelete,
  MdDescription,
  MdEdit,
  MdLink
} from "react-icons/md";
import { FaYoutube, FaGithub, FaTwitter } from "react-icons/fa";
import { Alert, Loading, PageLoading } from "../components";
import {
  useAuth,
  useFetch,
  useLocalStorage,
  useScrollYPosition
} from "../hooks";

const EDIT_POST_SWIPE_THRESHOLD = 50;
const DELETE_POST_SWIPE_THRESHOLD = -50;

interface DetailProps extends AlignItemsProps {}

const Detail = styled(Text).attrs({
  as: "span"
})<DetailProps>`
  &:not(:first-child) {
    margin-left: ${({ theme }) => theme.space[1]}px;

    &::before {
      content: "/ ";
    }
  }

  ${alignItems}
`;

Detail.defaultProps = {
  textSize: 0,
  color: "g.50"
};

const sourceCategories = {
  github: {
    color: "g.10",
    icon: FaGithub
  },
  code: {
    color: "blue.dark",
    icon: MdCode
  },
  video: {
    color: "#ff0000",
    icon: FaYoutube
  },
  tweet: {
    color: "#1da1f2",
    icon: FaTwitter
  },
  article: {
    color: "green.light",
    icon: MdDescription
  },
  other: {
    color: "g.50",
    icon: MdLink
  }
};

// TODO: Move this to a table in Firebase
const sourceUrls = {
  "medium.com": sourceCategories.article,
  "hackernoon.com": sourceCategories.article,
  "dev.to": sourceCategories.article,
  "css-tricks.com": sourceCategories.article,
  "codesandbox.io": sourceCategories.code,
  "codepen.io": sourceCategories.code,
  "github.com": sourceCategories.github,
  "github.io": sourceCategories.github,
  "twitter.com": sourceCategories.tweet,
  "youtube.com": sourceCategories.video
};

const SourceUrl = ({ children }) => {
  const Icon = sourceUrls[children]
    ? sourceUrls[children].icon
    : sourceCategories.other.icon;
  const color = sourceUrls[children]
    ? sourceUrls[children].color
    : sourceCategories.other.color;

  return (
    <Detail color={color} display="inline-flex" alignItems="center">
      <Icon size={14} style={{ display: "inline-block" }} />
      <Box display="inline" ml={1}>
        {children}
      </Box>
    </Detail>
  );
};

interface PostContainerProps extends BorderProps {}

const PostContainer = styled(Box)<PostContainerProps>`
  cursor: pointer;
  overflow: hidden;

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

const EditIcon = styled(MdEdit)``;

EditIcon.defaultProps = {
  size: 28
};

const EditIndicator = ({ dragX }) => {
  const x = useTransform(
    dragX,
    [10, 45, EDIT_POST_SWIPE_THRESHOLD],
    [-44, -24, 0]
  );
  const color = useTransform(
    dragX,
    [10, 45, EDIT_POST_SWIPE_THRESHOLD],
    ["hsl(210,0%,90%)", "hsl(210,10%,80%)", "hsl(210,100%,60%)"]
  );

  return (
    <motion.div
      style={{ color, x, y: "-50%", position: "absolute", top: "50%", left: 0 }}
    >
      <Box py={3} pl={3}>
        <EditIcon />
      </Box>
    </motion.div>
  );
};

const DeleteIcon = styled(MdDelete)``;

DeleteIcon.defaultProps = {
  size: 28
};

const DeleteIndicator = ({ dragX }) => {
  const x = useTransform(
    dragX,
    [-10, -45, DELETE_POST_SWIPE_THRESHOLD],
    [44, 24, 0]
  );
  const color = useTransform(
    dragX,
    [-10, -45, DELETE_POST_SWIPE_THRESHOLD],
    ["hsl(10,0%,90%)", "hsl(10,10%,80%)", "hsl(10,70%,45%)"]
  );

  return (
    <motion.div
      style={{
        color,
        x,
        y: "-50%",
        position: "absolute",
        top: "50%",
        right: 0
      }}
    >
      <Box py={3} pr={3}>
        <DeleteIcon />
      </Box>
    </motion.div>
  );
};

const Post = ({ post }) => {
  const router = useRouter();
  const { user } = useAuth();
  const postDate = new Date(post.time);
  const postISODate = format(postDate, "yyyy-MM-dd");
  const x = useMotionValue(0);
  const {
    data: deletePostResponse,
    loading: deletePostLoading,
    execute: deletePost
  } = useFetch(
    `/api/delete?uid=${user.uid}&url=${post.href}`,
    JSON.stringify({ url: post.href, hash: post.id })
  );

  const goToUpdateView = () => {
    router.push(`/update?url=${post.href}&fallback_date=${postISODate}`);
  };

  const goToPostHref = () => {
    window.location.href = post.href;
  };

  return (
    <PostContainer>
      <EditIndicator dragX={x} />
      <DeleteIndicator dragX={x} />
      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
          info.point.x > EDIT_POST_SWIPE_THRESHOLD && goToUpdateView();
          info.point.x < DELETE_POST_SWIPE_THRESHOLD && deletePost();
        }}
      >
        {deletePostLoading ? (
          <Loading size={32} />
        ) : deletePostResponse && !deletePostResponse.error ? (
          <Text p={3}>Post deleted</Text>
        ) : (
          <motion.div onTap={goToPostHref}>
            <PostDescription>{post.description}</PostDescription>
            <Flex my={1} alignItems="center">
              <SourceUrl>{extractDomain(post.href)}</SourceUrl>
              <Detail>{formatDistance(postDate, new Date())} ago</Detail>
            </Flex>
          </motion.div>
        )}
      </motion.div>
    </PostContainer>
  );
};

export default () => {
  const { user } = useAuth();
  const [scrollPos, setScrollPos] = useLocalStorage("scrollPos", 0);
  const scrollYPos = useScrollYPosition();
  const isAfterMount = useRef(null);
  const { data, error, loading } = useFetch(
    `/api/list?uid=${user.uid}&toread=yes`
  );

  useEffect(() => {
    if (isAfterMount.current) {
      setScrollPos(scrollYPos);
    } else {
      isAfterMount.current = true;
    }
  }, [scrollYPos]);

  useEffect(() => {
    !loading &&
      window.scrollTo({
        top: scrollPos,
        behavior: "smooth"
      });
  }, [loading]);

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
