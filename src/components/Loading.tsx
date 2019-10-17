import { CircularProgress } from "@chakra-ui/core";

const Loading = ({
  color = "blue",
  thickness = 0.1,
  size = "36px",
  ...rest
}) => (
  <CircularProgress
    isIndeterminate
    color={color}
    thickness={thickness}
    size={size}
    {...rest}
  />
);

export { Loading };
