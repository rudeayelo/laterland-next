import App from "next/app";
import Head from "next/head";
import React from "react";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { Box, Button, createTheme, Flex } from "@rudeland/ui";
import { UserProvider } from "../components/UserProvider";
import { useAuth } from "../hooks";
import { MdPerson } from "react-icons/md";

const Main = ({ children }) => {
  const { user, signin } = useAuth();

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

  html, button, input {
    font-family: 'IBM Plex Sans', "SF UI Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }

  body {
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
        <Head>
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/icon-512.png" />
          <link rel="manifest" href="/manifest.json" />
          <link
            href="https://fonts.googleapis.com/css?family=IBM+Plex+Sans:400,500,600&display=swap"
            rel="stylesheet"
          />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, shrink-to-fit=no"
          />
          <meta name="theme-color" content="#fff" />

          <title>Laterland</title>
        </Head>
        <GlobalStyle />
        <ThemeProvider
          theme={createTheme({
            accentColor: "hsl(36,80%,70%)",
            fontWeights: [400, 500, 600]
          })}
        >
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
