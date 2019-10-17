import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import styled from "../styled";
import {
  border,
  BorderProps,
} from "styled-system";
import format from "date-fns/lightFormat";
import formatDistance from "date-fns/formatDistance";
import extractDomain from "extract-domain";
import { Box, Button, Flex, Text } from "@chakra-ui/core";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  MdCode,
  MdDelete,
  MdDescription,
  MdEdit,
  MdLink,
} from "react-icons/md";
import { FaYoutube, FaGithub, FaTwitter } from "react-icons/fa";
import { Alert, Icon, Loading, PageLoading } from "../components";
import { useAlert, useApi, useAuth, useLocalStorage, useScrollYPosition } from "../hooks";

const Detail = props => <Text fontSize="xs" color="gray.500" {...props} />

const sourceCategories = {
  github: {
    color: "gray.900",
    icon: FaGithub
  },
  code: {
    color: "blue.700",
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
    color: "green.300",
    icon: MdDescription
  },
  other: {
    color: "gray.500",
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
  const SourceIcon = sourceUrls[children]
    ? sourceUrls[children].icon
    : sourceCategories.other.icon;
  const color = sourceUrls[children]
    ? sourceUrls[children].color
    : sourceCategories.other.color;

  return (
    <Detail display="inline-flex" alignItems="center">
      <Icon as={SourceIcon} color={color} size={14} style={{ display: "inline-block" }} />
      <Text as="span" ml={1} color={color}>
        {children}
      </Text>
      <Text as="span" mx={1}>
        /
      </Text>
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
  borderColor: "gray.100",
  position: "relative"
};

// @ts-ignore
const PostDescriptionStyle = styled(Text)`text-decoration: solid underline ${({theme}) => theme.colors.blue["300"]}`
const PostDescription = props => <PostDescriptionStyle lineHeight="base" fontWeight="medium" {...props} />

const EDIT_POST_SWIPE_THRESHOLD = 50;
const DELETE_POST_SWIPE_THRESHOLD = -50;
const sharedIndicatorStyle = { y: "-50%", position: "absolute", top: "50%" } as const

const EditIndicator = ({ dragX }) => {
  const x = useTransform(
    dragX,
    [10, 45, EDIT_POST_SWIPE_THRESHOLD],
    [-40, -20, 0]
  );
  const color = useTransform(
    dragX,
    [10, 45, EDIT_POST_SWIPE_THRESHOLD],
    ["hsl(210,0%,90%)", "hsl(210,10%,80%)", "hsl(210,100%,60%)"]
  );

  return (
    <motion.div style={{ color, x, left: 0, ...sharedIndicatorStyle }}>
      <Box py={3} pl={3}>
        <Icon as={MdEdit} size={28} />
      </Box>
    </motion.div>
  );
};

const DeleteIndicator = ({ dragX, deleting }) => {
  const x = useTransform(
    dragX,
    [-10, -45, DELETE_POST_SWIPE_THRESHOLD],
    [40, 20, 0]
  );
  const color = useTransform(
    dragX,
    [-10, -45, DELETE_POST_SWIPE_THRESHOLD],
    ["hsl(10,0%,90%)", "hsl(10,10%,80%)", "hsl(10,70%,45%)"]
  );

  return (
    <motion.div style={{ color, x, right: 0, ...sharedIndicatorStyle }}>
      <Box py={3} pr={3}>
        {deleting
          ? <Loading size="24px" thickness={0.15} color="red" />
          : <Icon as={MdDelete} size={28} />}

      </Box>
    </motion.div>
  );
};

const Post = ({ post }) => {
  const router = useRouter();
  const alert = useAlert();
  const x = useMotionValue(0);
  const [editing, setEditing] = useState(false);
  const { data, error, loading, execute: deletePost } = useApi(`/delete`, {
    body: { url: post.href, hash: post.id },
    lazy: true
  });

  useEffect(() => {
    if (!loading && data && !data.error) {
      alert({
        title: "Post deleted successfuly",
        icon: MdDelete,
        intent: "success"
      })
    }
  }, [loading, data]);

  useEffect(() => {
    if (error || data?.error) {
      alert({
        title: "Error deleting the post",
        description: error || data.data,
        intent: "error"
      })
    }
  }, [error, data]);

  const variants = {
    default: {
      opacity: 1
    },
    deleting: {
      opacity: 0.5,
      x: -50,
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
      <DeleteIndicator dragX={x} deleting={loading} />
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
        dragMomentum={false}
      >
        <motion.div onTap={goToPostHref}>
          <Box px={3} py={3}>
          <PostDescription>{post.description}</PostDescription>
            <Flex my={1} alignItems="center">
              <SourceUrl>{extractDomain(post.href)}</SourceUrl>
              <Detail>{formatDistance(postDate, new Date())} ago</Detail>
            </Flex>
          </Box>
        </motion.div>
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
        intent="error"
        alignItems="center"
        justifyContent="space-between"
        m={3}
      >
        <Text>Error loading posts</Text>
        <Button onClick={signout} variantColor="white" variant="outline" ml="auto" size="sm">
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
      <Text as="h1" fontWeight="medium" fontSize="xl" pt={10} pb={3} px={3} m={0}>
        {data.length} unread posts
      </Text>
      {data.map(post => <Post post={post} key={post.id} />)}
    </motion.div>
  );
};
