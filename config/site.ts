export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Next.js + HeroUI",
  description: "Make beautiful websites regardless of your design experience.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "About",
      href: "/About",
    },
    {
      label: "Simulator",
      href: "/simulator",
    },
  ],
  navMenuItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "About",
      href: "/About",
    },
    {
      label: "Simulator",
      href: "/simulator",
    },
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  sim_LumensItems: [
    { key: "incandescent", label: "Incandescent" },
    { key: "fluorescent", label: "Fluorescent" },
    { key: "led", label: "LED" },
    { key: "halogen", label: "Halogen" },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
