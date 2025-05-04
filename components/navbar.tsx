"use client";

import { useState } from "react";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import { Skeleton } from "@heroui/skeleton";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  UserIcon,
  Logo,
  SettingsIcon,
  SavedIcon,
  LogoutIcon,
} from "@/components/icons";

import { useAuthModals } from "@/context/useAuthModals";
import { useAuth } from "@/context/AuthContext";

export const Navbar = () => {
  const { openModal } = useAuthModals();
  const { user, loading, logout } = useAuth();

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">BEPVY</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium"
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>

        {/* Show loading state */}
        {loading ? (
          <NavbarItem className="hidden lg:flex">
            <Skeleton className="w-32 h-10 rounded-lg" />
          </NavbarItem>
        ) : user ? (
          // User is logged in - show user menu
          <NavbarItem className="hidden lg:flex">
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button variant="light" className="px-3">
                  <div className="flex items-center gap-2">
                    <Avatar
                      name={user.name.charAt(0)}
                      color="primary"
                      size="sm"
                    />
                    <span className="font-medium">{user.name}</span>
                  </div>
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User actions">
                <DropdownItem
                  key="profile"
                  startContent={<UserIcon className="w-4 h-4" />}
                >
                  My Profile
                </DropdownItem>
                <DropdownItem
                  key="saved-calculations"
                  startContent={<SavedIcon className="w-4 h-4" />}
                >
                  Saved Calculations
                </DropdownItem>
                <DropdownItem
                  key="settings"
                  startContent={<SettingsIcon className="w-4 h-4" />}
                >
                  Settings
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  startContent={<LogoutIcon className="w-4 h-4" />}
                  onClick={logout}
                >
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        ) : (
          // User is not logged in - show login button
          <NavbarItem className="hidden lg:flex gap-2">
            <Button
              onPress={() => openModal("register")}
              variant="light"
              color="primary"
            >
              Sign Up
            </Button>
            <Button
              onPress={() => openModal("login")}
              startContent={<UserIcon />}
              color="primary"
            >
              Log in
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {/* Navigation Items */}
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}

          {/* Authentication Items for Mobile */}
          <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
            {user ? (
              <>
                <div className="mb-3 px-3 flex items-center gap-2">
                  <Avatar
                    name={user.name.charAt(0)}
                    color="primary"
                    size="sm"
                  />
                  <span className="font-medium">{user.name}</span>
                </div>
                <NavbarMenuItem>
                  <Link color="foreground" href="/profile" size="lg">
                    My Profile
                  </Link>
                </NavbarMenuItem>
                <NavbarMenuItem>
                  <Link color="foreground" href="/saved-calculations" size="lg">
                    Saved Calculations
                  </Link>
                </NavbarMenuItem>
                <NavbarMenuItem>
                  <Link color="danger" href="#" size="lg" onClick={logout}>
                    Logout
                  </Link>
                </NavbarMenuItem>
              </>
            ) : (
              <>
                <NavbarMenuItem>
                  <Button
                    onPress={() => openModal("login")}
                    color="primary"
                    fullWidth
                  >
                    Log in
                  </Button>
                </NavbarMenuItem>
                <NavbarMenuItem>
                  <Button
                    onPress={() => openModal("register")}
                    variant="light"
                    color="primary"
                    fullWidth
                  >
                    Sign Up
                  </Button>
                </NavbarMenuItem>
              </>
            )}
          </div>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
