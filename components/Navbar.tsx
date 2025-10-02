"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Home, User as UserIcon, LogOut, Menu } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  user: {
    name: string;
  };
  onLogout: () => void;
  currentPage: "home" | "profile";
}

export default function Navbar({ user, onLogout, currentPage }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white sticky top-0 z-10 shadow">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/home" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="bg-black text-white w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg">
              S
            </div>
            <h1 className="text-xl font-bold">Social</h1>
          </Link>

          {/* Desktop Navigation - Home & Profile */}
          <div className="hidden md:flex items-center gap-2">
          <Link href="/home">
            <Button
              variant={currentPage === "home" ? "default" : "ghost"}
              size="sm"
              className={`font-medium cursor-pointer ${
                currentPage === "home" ? "bg-black hover:bg-gray-800 text-white" : ""
              }`}
            >
              <Home className="h-4 w-4 mr-1" />
              Home
            </Button>
          </Link>
          <Link href="/profile">
            <Button
              variant={currentPage === "profile" ? "default" : "ghost"}
              size="sm"
              className={`font-medium cursor-pointer ${
                currentPage === "profile" ? "bg-black hover:bg-gray-800 text-white" : ""
              }`}
            >
              <UserIcon className="h-4 w-4 mr-1" />
              Profile
            </Button>
          </Link>
          </div>
        </div>

        {/* Desktop Right Side - Avatar & Logout */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gray-200">
                {user.name[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden lg:inline">{user.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-gray-600 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span className="ml-1 hidden lg:inline">Logout</span>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-1">
            <Link href="/home" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant={currentPage === "home" ? "default" : "ghost"}
                className={`w-full justify-start cursor-pointer ${
                  currentPage === "home" ? "bg-black hover:bg-gray-800 text-white" : ""
                }`}
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant={currentPage === "profile" ? "default" : "ghost"}
                className={`w-full justify-start cursor-pointer ${
                  currentPage === "profile" ? "bg-black hover:bg-gray-800 text-white" : ""
                }`}
              >
                <UserIcon className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
            <div className="flex items-center gap-2 px-3 py-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gray-200">
                  {user.name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 cursor-pointer"
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
