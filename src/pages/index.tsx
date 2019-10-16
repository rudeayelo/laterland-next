import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import {
  border,
  BorderProps,
  alignItems,
  AlignItemsProps,
  space,
  SpaceProps
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
  MdError,
  MdLink,
  MdClose
} from "react-icons/md";
import { FaYoutube, FaGithub, FaTwitter } from "react-icons/fa";
import { Alert, useAlert, PageLoading } from "../components";
import { useApi, useAuth, useLocalStorage, useScrollYPosition } from "../hooks";

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
  position: "relative"
};

interface PostContentProps extends SpaceProps {}

const PostContent = styled(motion.div)<PostContentProps>`
  ${space}
`;

PostContent.defaultProps = {
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
  const { alertSuccess, alertDanger } = useAlert();
  const x = useMotionValue(0);
  const [editing, setEditing] = useState(false);
  const { data, error, loading, execute: deletePost } = useApi(`/delete`, {
    body: { url: post.href, hash: post.id },
    lazy: true
  });

  useEffect(() => {
    if (!loading && data && !data.error) {
      alertSuccess(
        <Flex alignItems="center" flex={1}>
          <MdClose size={24} />
          <Box ml={2}>
            <Text>Post deleted successfuly</Text>
          </Box>
        </Flex>
      );
    }
  }, [loading, data]);

  useEffect(() => {
    if (error || data?.error) {
      alertDanger(
        <Flex alignItems="center" flex={1}>
          <MdError size={24} />
          <Box ml={2}>
            <Text>Error deleting the post:</Text>
            <Text textSize={1}>{error || data.error}</Text>
          </Box>
        </Flex>
      );
    }
  }, [error, data]);

  const variants = {
    default: {
      opacity: 1
    },
    deleting: {
      opacity: 0.5
    },
    deleted: {
      height: 0,
      paddingTop: 0,
      paddingBottom: 0
    },
    editing: {
      x: "50%"
    }
  };

  const postDate = new Date(post.time);
  const postISODate = format(postDate, "yyyy-MM-dd");

  const goToUpdateView = () => {
    setEditing(true);
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
        variants={variants}
        animate={
          loading
            ? "deleting"
            : data && !data.error
            ? "deleted"
            : editing
            ? "editing"
            : "default"
        }
        transition={{ ease: "easeOut", duration: 0.2 }}
      >
        <PostContent onTap={goToPostHref}>
          <PostDescription>{post.description}</PostDescription>
          <Flex my={1} alignItems="center">
            <SourceUrl>{extractDomain(post.href)}</SourceUrl>
            <Detail>{formatDistance(postDate, new Date())} ago</Detail>
          </Flex>
        </PostContent>
      </motion.div>
    </PostContainer>
  );
};

export default () => {
  const { signout } = useAuth();
  const [scrollPos, setScrollPos] = useLocalStorage("scrollPos", 0);
  const scrollYPos = useScrollYPosition();
  const isAfterMount = useRef(null);
  const { data, error, loading } = useApi(`/list`, { body: { toread: "yes" } });

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
      <Alert
        intent="danger"
        alignItems="center"
        justifyContent="space-between"
        m={3}
      >
        <Text>Error loading posts</Text>
        <Button onClick={signout} intent="danger" ml="auto" size="small">
          Try signin out
        </Button>
      </Alert>
    );

  return loading ? (
    <PageLoading />
  ) : (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        x: 30,
        opacity: 0
      }}
      transition={{ ease: "easeOut", duration: 0.2 }}
    >
      <Text as="h1" fontWeight={2} textSize={4} py={3} px={3}>
        {data.length} unread posts
      </Text>
      {data.map(post => (
        <Post post={post} key={post.id} />
      ))}
    </motion.div>
  );
};
