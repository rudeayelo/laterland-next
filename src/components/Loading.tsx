import styled, { keyframes } from "styled-components";
import {
  border,
  BorderProps,
  space,
  SpaceProps,
  size,
  SizeProps
} from "styled-system";

interface LoadingProps extends BorderProps, SizeProps, SpaceProps {}

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const sweep = keyframes`
  0% {
    -webkit-clip-path: polygon(0% 0%, 0% 0%, 0% 0%, 50% 50%, 0% 0%, 0% 0%, 0% 0%);
    clip-path: polygon(0% 0%, 0% 0%, 0% 0%, 50% 50%, 0% 0%, 0% 0%, 0% 0%);
  }
  50% {
    -webkit-clip-path: polygon(0% 0%, 0% 100%, 0% 100%, 50% 50%, 100% 0%, 100% 0%, 0% 0%);
    clip-path: polygon(0% 0%, 0% 100%, 0% 100%, 50% 50%, 100% 0%, 100% 0%, 0% 0%);
  }
  100% {
    -webkit-clip-path: polygon(0% 0%, 0% 100%, 100% 100%, 50% 50%, 100% 100%, 100% 0%, 0% 0%);
    clip-path: polygon(0% 0%, 0% 100%, 100% 100%, 50% 50%, 100% 100%, 100% 0%, 0% 0%);
  }
`;

const Loading = styled.div.attrs({
  borderStyle: "solid"
})<LoadingProps>`
  animation: ${sweep} 1s linear alternate infinite, ${rotate} 0.8s linear infinite;

  ${border}
  ${size}
  ${space}
`;

Loading.defaultProps = {
  borderColor: "g.90",
  borderRadius: "50%",
  borderWidth: 4,
  size: 60
};

export { Loading };
