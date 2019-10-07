import App from "next/app";
import React from "react";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { Box, Button, createTheme, Flex } from "@rudeland/ui";
import { UserProvider } from "../components/UserProvider";
import { useAuth } from "../hooks";
import { MdPerson } from "react-icons/md";

const Main = ({ children }) => {
  const { user, signin } = useAuth();

  console.log(user.isSignedIn);

  if (!user.isSignedIn)
    return (
      <Flex
        flexDirection="column"
        justifyContent="flex-end"
        pb={3}
        px={3}
        height="100vh"
      >
        <Box alignSelf="flex-end">
          <Button
            onClick={signin}
            size="large"
            iconBefore={<MdPerson size="20px" />}
          >
            Sign in
          </Button>
        </Box>
      </Flex>
    );

  return children;
};

const GlobalStyle = createGlobalStyle`
  html, body { padding: 0; margin: 0; }

  body {
    font-family: "SF UI Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    background: white;
  }

  *, *::before, *::after {
    box-sizing: border-box
  }
`;

export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;

    return (
      <>
        <GlobalStyle />
        <ThemeProvider theme={createTheme({ accentColor: "hsl(36,80%,70%)" })}>
          <UserProvider>
            <Main>
              <Component {...pageProps} />
            </Main>
          </UserProvider>
        </ThemeProvider>
      </>
    );
  }
}
