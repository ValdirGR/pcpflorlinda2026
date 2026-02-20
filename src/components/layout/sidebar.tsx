"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderOpen,
  Tag,
  Factory,
  PieChart,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Shield,
  Monitor,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Coleções", href: "/colecoes", icon: FolderOpen },
  { name: "Referências", href: "/referencias", icon: Tag },
  { name: "Produção", href: "/producao", icon: Factory },
  { name: "Gerencial", href: "/gerencial", icon: PieChart },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
];

export default function Sidebar({
  collapsed,
  onCollapsedChange,
}: {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white rounded-lg p-2 shadow-md border border-gray-200"
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 flex flex-col",
          collapsed ? "w-[72px]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-700/50">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo.png"
              alt="FlorLinda"
              width={collapsed ? 36 : 140}
              height={36}
              className="object-contain brightness-0 invert"
            />
          </Link>

          {/* Collapse toggle (desktop) */}
          <button
            onClick={() => onCollapsedChange(!collapsed)}
            className="hidden lg:flex items-center justify-center h-7 w-7 rounded-md hover:bg-slate-700/50 transition-colors"
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed && "rotate-180"
              )}
            />
          </button>

          {/* Close button (mobile) */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 hover:bg-slate-700/50 rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-300 shadow-sm"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-pink-400" : "text-slate-400"
                  )}
                />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}

          {/* TV Dashboard - visível para todos */}
          <div className="my-3 border-t border-slate-700/50" />

          <Link
            href="/tv-dashboard"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              pathname.startsWith("/tv-dashboard")
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 shadow-sm"
                : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
            )}
          >
            <Monitor
              className={cn(
                "h-5 w-5 flex-shrink-0",
                pathname.startsWith("/tv-dashboard") ? "text-cyan-400" : "text-slate-400"
              )}
            />
            {!collapsed && <span>TV Dashboard</span>}
          </Link>

          {/* Admin - visível apenas para administradores */}
          {session?.user?.nivel === "admin" && (
            <>
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname.startsWith("/admin")
                    ? "bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 shadow-sm"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                )}
              >
                <Shield
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    pathname.startsWith("/admin") ? "text-purple-400" : "text-slate-400"
                  )}
                />
                {!collapsed && <span>Administração</span>}
              </Link>
            </>
          )}
        </nav>

        {/* User section */}
        <div className="border-t border-slate-700/50 p-3">
          {session?.user && (
            <div
              className={cn(
                "flex items-center gap-3",
                collapsed ? "justify-center" : "px-3 py-2"
              )}
            >
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-sm font-bold">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-slate-400 capitalize">
                    {session.user.nivel}
                  </p>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 mt-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
