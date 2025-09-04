"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@portalis/ui";

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Countries", href: "/countries" },
  { name: "Residency Programs", href: "/programs" },
  { name: "Providers", href: "/providers" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-card border-r min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Portalis Admin</h2>
      </div>
      <nav className="px-4 space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
