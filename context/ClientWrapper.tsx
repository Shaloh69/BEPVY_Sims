"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Link } from "@heroui/link";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSimulator =
    pathname.startsWith("/sim") || pathname.startsWith("/simulator");

  return (
    <>
      <main
        className={clsx(
          "pt-16 flex-grow bg-transparent relative",
          isSimulator ? "flex w-full" : "container mx-auto max-w-7xl px-6"
        )}
      >
        {children}
      </main>

      {/* Footer (hidden in simulator) */}
      {!isSimulator && (
        <footer className="w-full flex items-center justify-center py-3 bg-transparent">
          <Link
            isExternal
            className="flex items-center gap-1 text-current"
            href="https://heroui.com?utm_source=next-app-template"
            title="heroui.com homepage"
          >
            <span className="text-default-600">Powered by</span>
            <p className="text-primary">Node.js and Three.js</p>
          </Link>
        </footer>
      )}
    </>
  );
}
