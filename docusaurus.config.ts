import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'UDE Specifications',
  tagline: 'Design and Technical Documentation for Universal Documentation Engine',
  favicon: 'img/favicon.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://Sir-Derryk.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/ude-design-docs/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Sir-Derryk', // Usually your GitHub org/user name.
  projectName: 'ude-design-docs', // Usually your repo name.

  onBrokenLinks: 'throw',

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  stylesheets: [
    {
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap',
      type: 'text/css',
    },
  ],

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          lastVersion: 'current',
          versions: {
            current: {
              label: '0.5 (Testing of Documentation)',
              path: '',
            },
            '0.4': {
              label: '0.4 (Documentation)',
              path: '0.4',
            },
            '0.3': {
              label: '0.3 (Prototype)',
              path: '0.3',
            },
            '0.2': {
              label: '0.2 (MVP Planning)',
              path: '0.2',
            },
            '0.1': {
              label: '0.1 (Requirements)',
              path: '0.1',
            },
          },
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Universal Documentation Engine Specifications',
      logo: {
        alt: 'UDE Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          href: 'https://sir-derryk.github.io/ude-user-docs/',
          label: 'User Guides',
          position: 'left',
        },
        {
          href: 'https://sir-derryk.github.io/ude-user-docs/api/',
          label: 'API Reference',
          position: 'left',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/Sir-Derryk/ude-design-docs',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Specifications',
              to: '/0.1',
            },
          ],
        },
        {
          title: 'Portals',
          items: [
            {
              label: 'User Guides',
              href: 'https://sir-derryk.github.io/ude-user-docs/',
            },
            {
              label: 'API Reference',
              href: 'https://sir-derryk.github.io/ude-user-docs/api/',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/Sir-Derryk/ude-design-docs',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Universal Documentation Engine (UDE).`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
