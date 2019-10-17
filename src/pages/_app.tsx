import App from "next/app";
import Head from "next/head";
import React from "react";
import { Global, css } from "@emotion/core";
import { Box, Button, Flex, ThemeProvider } from "@chakra-ui/core";
import { AnimatePresence } from "framer-motion";
import { customTheme } from "../theme";
import { PageLoading, UserProvider } from "../components";
import { useAuth } from "../hooks/useAuth";
import { MdPerson } from "react-icons/md";

const Main = ({ children }) => {
  const { user, signin } = useAuth();

  if (user.isLoading) return <PageLoading />;

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
            size="md"
            leftIcon={MdPerson}
            variantColor="blue"
            variant="solid"
            fontWeight="medium"
          >
            Sign in
          </Button>
        </Box>
      </Flex>
    );

  return children;
};

export default class MyApp extends App {
  render() {
    const { Component, pageProps, router } = this.props;

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
        <Global
          styles={css`
            html,
            body,
            p {
              padding: 0;
              margin: 0;
            }

            html,
            button,
            input {
              font-family: ${customTheme.fonts.body};
            }

            body {
              background: white;
              color: ${customTheme.colors.gray[900]};
            }

            *,
            *::before,
            *::after {
              box-sizing: border-box;
              border-width: 0px;
              border-style: solid;
            }
          `}
        />
        <ThemeProvider theme={customTheme}>
          <UserProvider>
            <Main>
              <AnimatePresence exitBeforeEnter>
                <Component {...pageProps} key={router.route} />
              </AnimatePresence>
            </Main>
          </UserProvider>
        </ThemeProvider>
      </>
    );
  }
}
