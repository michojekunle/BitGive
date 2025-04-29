"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Bitcoin,
  Gift,
  Heart,
  Home,
  LogOut,
  Menu,
  Settings,
  Wallet,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import ConnectBtn from "./connect-btn";
import { useActiveAccount } from "thirdweb/react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const account = useActiveAccount();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const requiresSignIn = () => {
    if (pathname === "/" || pathname.startsWith("/charities")) return false;
    if(!account) return true
    return false;
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-border/40 bg-card/30 backdrop-blur-sm md:flex">
        <div className="flex h-16 items-center border-b border-border/40 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#F7931A] to-[#F5A623] text-white shadow-glow-sm">
              <Bitcoin className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#F7931A] to-[#F5A623]">
              BitGive
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-auto py-4">
          <nav className="grid gap-1 px-2">
            {[
              { path: "/", label: "Dashboard", icon: Home },
              { path: "/charities", label: "Charities", icon: Heart },
              {
                path: "/create-campaign",
                label: "Create Campaign",
                icon: Bitcoin,
              },
              { path: "/my-nfts", label: "My NFTs", icon: Gift },
              { path: "/donations", label: "Donations", icon: Wallet },
            ].map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                  isActive(item.path)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive(item.path) && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-gradient-to-b from-[#F7931A] to-[#F5A623]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive(item.path)
                      ? "text-accent-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-border/40 p-4">
          <ConnectBtn />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden transition-opacity duration-300",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <motion.div
          className="fixed inset-y-0 left-0 w-64 bg-card/90 backdrop-blur-md border-r border-border/40"
          initial={{ x: "-100%" }}
          animate={{ x: mobileOpen ? 0 : "-100%" }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <div className="flex h-16 items-center justify-between border-b border-border/40 px-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#F7931A] to-[#F5A623] text-white shadow-glow-sm">
                <Bitcoin className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#F7931A] to-[#F5A623]">
                BitGive
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="py-4">
            <nav className="grid gap-1 px-2">
              {[
                { path: "/", label: "Dashboard", icon: Home },
                { path: "/charities", label: "Charities", icon: Heart },
                {
                  path: "/create-campaign",
                  label: "Create Campaign",
                  icon: Bitcoin,
                },
                { path: "/my-nfts", label: "My NFTs", icon: Gift },
                { path: "/donations", label: "Donations", icon: Wallet },
              ].map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                    isActive(item.path)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive(item.path) && (
                    <div className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-gradient-to-b from-[#F7931A] to-[#F5A623]" />
                  )}
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive(item.path)
                        ? "text-accent-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="absolute bottom-0 w-full border-t border-border/40 p-4">
            <ConnectBtn />
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between md:justify-end border-b border-border/40 bg-background/80 backdrop-blur-md px-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-7 w-7" />
            <span className="sr-only">Toggle Menu</span>
          </Button>

          <div className="flex items-center gap-4">
            <ConnectBtn />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {requiresSignIn() ? (
              <div className="w-full h-full mt-16 flex flex-col items-center justify-center">
                <h4 className="mb-5 font-medium text-lg text-muted-foreground">Please sign in to access this page</h4>
                <ConnectBtn />
              </div>
            ) : (
              children
            )}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm p-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-1">
            <span>Powered by</span>
            <Link
              href="https://rootstock.io"
              target="_blank"
              className="flex items-center gap-1 font-medium hover:text-foreground transition-colors"
            >
              Rootstock
              <Bitcoin className="h-4 w-4 text-[#F7931A]" />
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
