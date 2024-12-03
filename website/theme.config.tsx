import { DocsThemeConfig } from "nextra-theme-docs";
import React from "react";

const config: DocsThemeConfig = {
  logo: () => (
    <>
      <img src="/favicon/android-chrome-192x192.png" width={32} height={32} />
      <span
        style={{
          fontWeight: "bold",
          fontSize: "1.2rem",
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        Nestia
      </span>
      <span>NestJS Helper Libraries</span>
    </>
  ),
  project: {
    link: "https://github.com/samchon/nestia",
    // icon: <img
    //   alt="Nestia Github repo stars"
    //   src="https://img.shields.io/github/stars/samchon/nestia?style=social"
    // />
  },
  chat: {
    link: "https://discord.gg/E94XhzrUCZ",
  },
  docsRepositoryBase: "https://github.com/samchon/nestia/blob/master/website",
  footer: {
    text: () => (
      <span>
        Made by{" "}
        <a
          href="https://github.com/samchon"
          target="_blank"
          style={{ color: "blue" }}
        >
          <u> Samchon </u>
        </a>
      </span>
    ),
  },
  useNextSeoProps() {
    return {
      defaultTitle: "Nestia Guide Documents",
      titleTemplate: "Nestia Guide Documents - %s",
      additionalLinkTags: [
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/favicon/apple-touch-icon.png",
        },
        {
          rel: "manifest",
          href: "/favicon/site.webmanifest",
        },
        ...[16, 32].map((size) => ({
          rel: "icon",
          type: "image/png",
          sizes: `${size}x${size}`,
          href: `/favicon/favicon-${size}x${size}.png`,
        })),
      ],
      additionalMetaTags: [
        {
          property: "og:image",
          content: "/og.jpg",
        },
        {
          property: "og:type",
          content: "object",
        },
        {
          property: "og:title",
          content: "Nestia Guide Documents",
        },
        {
          property: "og:description",
          content: "NestJS Helper Libraries",
        },
        {
          property: "og:site_name",
          content: "Nestia Guide Documents",
        },
        {
          property: "og:url",
          content: "https://nestia.io",
        },
        {
          name: "twitter:card",
          content: "summary",
        },
        {
          name: "twitter:image",
          content: "https://nestia.io/og.jpg",
        },
        {
          name: "twitter:title",
          content: "Nestia Guide Documents",
        },
        {
          name: "twitter:description",
          content: "NestJS Helper Libraries",
        },
        {
          name: "twitter:site",
          content: "@SamchonGithub",
        },
      ],
    };
  },
};

export default config;
