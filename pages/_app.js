import React from "react";
import App, { Container } from "next/app";

import MainLayout from "../components/MainLayout";

import { CookiesProvider } from "react-cookie";

export default class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return {
      pageProps,
      cookies: typeof window !== "object" && ctx.req.universalCookies
    };
  }

  render() {
    const { Component, pageProps, cookies } = this.props;

    return (
      <Container>
        <CookiesProvider cookies={typeof window !== "object" && cookies}>
          <MainLayout>
            <Component {...pageProps} />
          </MainLayout>
        </CookiesProvider>
      </Container>
    );
  }
}
