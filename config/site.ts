// config/site.ts

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "BEPVY",
  description: "Illums YEs.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "About",
      href: "/about",
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
  // Enhanced lamp types with luminous flux values
  sim_LumensItems: [
    {
      key: "incandescent-60w",
      label: "Incandescent (60W)",
      fluxValue: 800,
      wattage: 60,
      type: "Incandescent",
    },
    {
      key: "incandescent-100w",
      label: "Incandescent (100W)",
      fluxValue: 1600,
      wattage: 100,
      type: "Incandescent",
    },
    {
      key: "fluorescent-t8-32w",
      label: "Fluorescent T8 (32W)",
      fluxValue: 2400,
      wattage: 32,
      type: "Fluorescent",
    },
    {
      key: "fluorescent-t5-28w",
      label: "Fluorescent T5 (28W)",
      fluxValue: 2800,
      wattage: 28,
      type: "Fluorescent",
    },
    {
      key: "led-9w",
      label: "LED Bulb (9W)",
      fluxValue: 800,
      wattage: 9,
      type: "LED",
    },
    {
      key: "led-12w",
      label: "LED Bulb (12W)",
      fluxValue: 1100,
      wattage: 12,
      type: "LED",
    },
    {
      key: "led-panel-36w",
      label: "LED Panel (36W)",
      fluxValue: 3600,
      wattage: 36,
      type: "LED",
    },
    {
      key: "halogen-50w",
      label: "Halogen (50W)",
      fluxValue: 900,
      wattage: 50,
      type: "Halogen",
    },
    {
      key: "halogen-100w",
      label: "Halogen (100W)",
      fluxValue: 1800,
      wattage: 100,
      type: "Halogen",
    },
  ],
  // Room types with recommended illuminance levels (in lux)
  roomTypes: [
    { key: "office", label: "Office", recommendedLux: 500 },
    { key: "classroom", label: "Classroom", recommendedLux: 500 },
    { key: "conference", label: "Conference Room", recommendedLux: 500 },
    { key: "corridor", label: "Corridor", recommendedLux: 100 },
    { key: "kitchen", label: "Kitchen", recommendedLux: 500 },
    { key: "bathroom", label: "Bathroom", recommendedLux: 200 },
    { key: "bedroom", label: "Bedroom", recommendedLux: 150 },
    { key: "living", label: "Living Room", recommendedLux: 200 },
    { key: "warehouse", label: "Warehouse", recommendedLux: 200 },
    { key: "industry", label: "Industrial Area", recommendedLux: 750 },
  ],
  // Contamination levels with descriptions
  contaminationLevels: [
    {
      key: "very clean",
      label: "Very Clean",
      description:
        "Environments with minimal dust or dirt (e.g., clean rooms, specialized labs)",
    },
    {
      key: "clean",
      label: "Clean",
      description:
        "Well-maintained environments with regular cleaning (e.g., offices, homes)",
    },
    {
      key: "normal",
      label: "Normal",
      description:
        "Standard environments with typical dust levels (e.g., classrooms, retail spaces)",
    },
    {
      key: "dirty",
      label: "Dirty",
      description:
        "Environments with high dust levels (e.g., industrial spaces, workshops)",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
