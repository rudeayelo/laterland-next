import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Flex,
  Input,
  Tag as ChakraTag,
  TagLabel,
  TagCloseButton
} from "@chakra-ui/core";

/* -------------------------------------------------------------------------- */
/*                                     Tag                                    */
/* -------------------------------------------------------------------------- */

interface TagProps {
  value: string;
  index: number;
  onRemove: (i: number) => void;
}

const Tag = ({ value, index, onRemove }: TagProps) => (
  <ChakraTag
    rounded="full"
    variant="solid"
    variantColor="green"
    size="sm"
    fontSize="xs"
    mr={2}
    mb={2}
  >
    <TagLabel>{value}</TagLabel>
    <TagCloseButton
      onClick={e => {
        e.preventDefault();
        onRemove(index);
      }}
    />
  </ChakraTag>
);

/* -------------------------------------------------------------------------- */
/*                                  TagsInput                                 */
/* -------------------------------------------------------------------------- */

type Tags = string[];

interface ReactTagInputProps {
  tags: Tags;
  onChange: (value: string) => void;
  onAdd: (tags: Tags) => void;
  onRemove: (tags: Tags) => void;
  placeholder?: string;
}

const TagsInput = ({
  tags,
  onChange,
  onAdd,
  onRemove,
  placeholder = "tags"
}: ReactTagInputProps) => {
  const [nextTag, setNextTag] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const resetNextTag = () => setNextTag("");

  const addTag = (value: string) => {
    const newTags = tags.concat(value);
    onAdd(newTags);
  };

  const removeTag = (i: number) => {
    const newTags = tags.filter((_, index) => index !== i);
    onRemove(newTags);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNextTag(e.target.value);
    onChange(e.target.value);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter
    if (e.keyCode === 13) {
      e.preventDefault();

      if (nextTag === "") return;

      addTag(nextTag);
    }

    // Backspace
    if (e.keyCode === 8 || e.keyCode === 46) {
      if (nextTag !== "") return;

      removeTag(tags.length - 1);
    }
  };

  useEffect(resetNextTag, [tags]);

  return (
    <Flex alignItems="baseline" flexWrap="wrap">
      {tags.map((tag, i) => (
        <Tag key={i} value={tag} index={i} onRemove={removeTag} />
      ))}
      <Input
        value={nextTag}
        placeholder={placeholder || "Type and press enter"}
        onChange={onInputChange}
        onKeyDown={onInputKeyDown}
        variant="unstyled"
        autoCorrect="off"
        autoCapitalize="none"
        size="sm"
        lineHeight="24px"
        mb={2}
        width="12ch"
      />
    </Flex>
  );
};

export { TagsInput };
