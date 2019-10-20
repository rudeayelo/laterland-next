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
import { Badge, Box, Flex, Text } from "@chakra-ui/core";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  MdCode,
  MdDelete,
  MdDescription,
  MdEdit,
  MdLink,
  MdRemoveRedEye,
} from "react-icons/md";
import { FaYoutube, FaGithub, FaTwitter } from "react-icons/fa";
import { Icon } from "./Icon";
import { Loading } from "./Loading";
import {
  useAlert,
  useApi,
} from "../hooks";

/* -------------------------------------------------------------------------- */
/*                               Post container                               */
/* -------------------------------------------------------------------------- */

interface PostContainerProps extends BorderProps {
  isCheckpoint?: boolean
}

const PostContainer = styled(Box)<PostContainerProps>`
  cursor: pointer;
  overflow: hidden;
  background: ${({isCheckpoint, theme}) =>
    // @ts-ignore
    isCheckpoint && theme.colors.orange["50"]
  };

  &:not(:last-child) {
    ${border}
  }
`;

PostContainer.defaultProps = {
  borderBottom: "1px solid",
  borderColor: "gray.100",
  position: "relative"
};

/* -------------------------------------------------------------------------- */
/*                                 Post title                                 */
/* -------------------------------------------------------------------------- */

const PostDescriptionStyle = styled(Text)`
  /*
  // @ts-ignore */
  text-decoration: solid underline ${({theme}) => theme.colors.blue["300"]}
`
const PostDescription = props =>
  <PostDescriptionStyle
    lineHeight="base"
    fontWeight="medium"
    color="gray.900"
    {...props} />

/* -------------------------------------------------------------------------- */
/*                                Post details                                */
/* -------------------------------------------------------------------------- */

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
      <Icon
        as={SourceIcon}
        color={color}
        size={14}
        style={{ display: "inline-block" }}
      />
      <Text as="span" ml={1} color={color}>
        {children}
      </Text>
      <Text as="span" mx={1}>
        /
      </Text>
    </Detail>
  );
};

/* -------------------------------------------------------------------------- */
/*                           Edit and Delete actions                          */
/* -------------------------------------------------------------------------- */

const EDIT_POST_SWIPE_THRESHOLD = 50;
const DELETE_POST_SWIPE_THRESHOLD = -50;
const INDICATOR_WIDTH = "20vw";
const sharedIndicatorStyle = {
  y: "-50%",
  position: "absolute",
  top: "50%",
} as const
const sharedIndicatorHandleStyle = {
  width: INDICATOR_WIDTH,
  height: "100%",
  position: "absolute",
  top: 0,
} as const

const EditIndicator = ({ dragX, onDragEnd }) => {
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
    <>
      <motion.div
        drag="x"
        style={{ left: 0, ...sharedIndicatorHandleStyle }}
        dragConstraints={{ left: 0, right: 0 }}
        onUpdate={({x}) => dragX.set(x)}
        onDragEnd={(_, info) => {
          info.point.x > EDIT_POST_SWIPE_THRESHOLD && onDragEnd();
        }}
        transition={{ ease: "easeOut", duration: 0.2 }}
      />
      <motion.div style={{ color, x, left: 0, ...sharedIndicatorStyle }}>
        <Box py={3} pl={3}>
          <Icon as={MdEdit} size={28} />
        </Box>
      </motion.div>
    </>
  );
};

const DeleteIndicator = ({ deleting, dragX, onDragEnd }) => {
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
    <>
      <motion.div
        drag="x"
        style={{ right: 0, ...sharedIndicatorHandleStyle }}
        dragConstraints={{ left: 0, right: 0 }}
        onUpdate={({x}) => dragX.set(x)}
        onDragEnd={(_, info) => {
          info.point.x < DELETE_POST_SWIPE_THRESHOLD && onDragEnd();
        }}
        transition={{ ease: "easeOut", duration: 0.2 }}
      />
      <motion.div style={{ color, x, right: 0, ...sharedIndicatorStyle }}>
        <Box py={3} pr={3}>
          {deleting
            ? <Loading size="24px" thickness={0.15} color="red" />
            : <Icon as={MdDelete} size={28} />}

        </Box>
      </motion.div>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*                                    Post                                    */
/* -------------------------------------------------------------------------- */

const Post = ({ post, isCheckpoint }) => {
  const router = useRouter();
  const alert = useAlert();
  const postEl = useRef<HTMLInputElement>(null);
  const x = useMotionValue(0);
  const [editing, setEditing] = useState(false);
  const {
    data: deletePostData,
    error: deletePostError,
    loading: deletePostLoading,
    execute: deletePost
  } = useApi(`/delete`, {
    body: { url: post.href, hash: post.id },
    lazy: true
  });
  const {
    execute: setCheckpoint
  } = useApi(`/checkpoint`, {
    body: { hash: post.id },
    lazy: true
  });

  useEffect(() => {
    if (isCheckpoint && postEl && postEl.current) {
      postEl.current.scrollIntoView({ block: "center" });
    }
  }, [isCheckpoint, postEl]);

  useEffect(() => {
    if (!deletePostLoading && deletePostData && !deletePostData.error) {
      alert({
        title: "Post deleted successfuly",
        icon: MdDelete,
        intent: "success"
      })
    }
  }, [deletePostLoading, deletePostData]);

  useEffect(() => {
    if (deletePostError || deletePostData?.error) {
      alert({
        title: "Error deleting the post",
        description: deletePostError || deletePostData.data,
        intent: "error"
      })
    }
  }, [deletePostError, deletePostData]);

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
    setCheckpoint()
    window.location.href = post.href;
  };

  return (
    <PostContainer isCheckpoint={isCheckpoint} ref={postEl}>
      <EditIndicator dragX={x} onDragEnd={goToUpdateView} />
      <DeleteIndicator dragX={x} onDragEnd={deletePost} deleting={deletePostLoading} />
      <motion.div
        onTap={goToPostHref}
        style={{ x }}
        variants={variants}
        animate={
          deletePostLoading
            ? "deleting"
            : deletePostData && !deletePostData.error
              ? "deleted"
              : editing
                ? "editing"
                : "default"
        }
        transition={{ ease: "easeOut", duration: 0.2 }}
      >
        <Box px={3} py={3}>
          <PostDescription>
            {isCheckpoint &&
              <Badge
                as="span"
                transform="translateY(-2px)"
                borderColor="orange.200"
                borderStyle="solid"
                borderWidth={1}
                variantColor="orange"
                borderRadius="full"
                px={1}
                mr={2}
              >
                <Icon
                  as={MdRemoveRedEye}
                  size={4}
                />
              </Badge>
            }
            {post.description}
          </PostDescription>
          <Flex my={1} alignItems="center">
            <SourceUrl>{extractDomain(post.href)}</SourceUrl>
            <Detail>{formatDistance(postDate, new Date())} ago</Detail>
          </Flex>
        </Box>
      </motion.div>
    </PostContainer>
  );
};

export { Post }