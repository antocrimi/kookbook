import type { Preview } from "@storybook/react";

import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/dm-serif-display/400.css";

import "../src/theme.scss";
import { tokens } from "../src/tokens";   

const THEME_BACKGROUNDS: Record<string, string> = {
  "theme-1": tokens.theme['theme-1'].color.containment.surface.fill.default.value,
  "theme-2": tokens.theme['theme-2'].color.containment.surface.fill.default.value,
};

const preview: Preview = {
  globals: {
    theme: "dark",
  },
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global theme for components",
      defaultValue: "dark", // 👈 default goes here, not in globals: {}
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "dark", title: "Dark", icon: "moon" },
          { value: "light", title: "Light", icon: "sun" },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === "light" ? "theme-2" : "theme-1";

      // This document IS the iframe's document
      document.documentElement.setAttribute("data-theme", theme);
      document.documentElement.style.backgroundColor = THEME_BACKGROUNDS[theme];

      return Story();
    },
  ],
  parameters: {
    backgrounds: { disable: true },
    layout: "fullscreen",
    docs: {
      // Each story canvas inside the docs page uses the live CSS custom
      // property, so it reacts to data-theme changes automatically
      canvas: {
        style: {
          background: "var(--color-containment-surface-fill-default)",
        },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          "Foundation",
          ["Colors", "Icons", "Typography"],
          "Components",
          [
            "Accordion",
            "Avatar",
            "Badge",
            "Banner",
            "Button",
            "ButtonTabs",
            "Card",
            "Checkbox",
            "Chip",
            "Code",
            "Dialog",
            "DropdownMenu",
            "Logo",
            "Pagination",
            "ProgressIndicator",
            "RadioSelector",
            "Select",
            "Slider",
            "Switch",
            "Tabs",
            "Tag",
            "TextArea",
            "TextField",
            "Toast",
            "Toggle",
            "ToggleGroup",
            "Tooltip",
          ],
        ],
      },
    },
  },
};

export default preview;
