"use client";
import React, { useState } from "react";
import {
  Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button,
  Modal, ModalContent, ModalHeader, ModalBody,
  useDisclosure, Input, Divider, NavbarMenuToggle, NavbarMenu, NavbarMenuItem
} from "@heroui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";

export default function AppNavbar() {
  const pathname = usePathname();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const menuItems = [
    { name: "HOME", href: "/" },
    { name: "BUILD", href: "/build" },
    { name: "FORUM", href: "/forum" },
  ];

  return (
    <>
      <Navbar 
        maxWidth="xl" 
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        className="bg-black/40 backdrop-blur-md border-b border-white/10 fixed top-0"
      >
        {/* Mobile Toggle */}
        <NavbarContent className="sm:hidden" justify="start">
          <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} className="text-white" />
        </NavbarContent>

        {/* Logo */}
        <NavbarBrand>
          <NextLink href="/">
            <p className="font-bold text-xl md:text-2xl text-white tracking-widest cursor-pointer">LOGO</p>
          </NextLink>
        </NavbarBrand>

        {/* 💻 Desktop Menu: กลับมาใช้ Motion สไตล์เดิมที่คุณส่งมา */}
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          {menuItems.map((item) => (
            <NavbarItem key={item.name} className="relative h-full flex items-center">
              <Link 
                as={NextLink} 
                href={item.href} 
                className={`relative z-10 px-4 py-2 text-sm font-semibold transition-colors ${pathname === item.href ? "text-white" : "text-gray-400"}`}
              >
                {item.name}
              </Link>
              {/* ✅ Motion Div สไตล์เดิมที่คุณต้องการ */}
              {pathname === item.href && (
                <motion.div 
                  layoutId="navbar-active" 
                  className="absolute inset-0 bg-blue-500/20 rounded-lg border-b-2 border-blue-500" 
                  transition={{ type: "spring", stiffness: 380, damping: 30 }} 
                />
              )}
            </NavbarItem>
          ))}
        </NavbarContent>

        {/* Login Button */}
        <NavbarContent justify="end">
          <NavbarItem>
            <Button 
              onPress={() => { setAuthMode("login"); onOpen(); }}
              variant="flat" 
              className="bg-blue-600/20 text-blue-400 border border-blue-500/50 hover:bg-blue-600 hover:text-white transition-all px-4 md:px-8 text-xs font-bold"
            >
              LOGIN
            </Button>
          </NavbarItem>
        </NavbarContent>

        {/* 📱 Mobile Menu */}
        <NavbarMenu className="bg-black/90 backdrop-blur-xl pt-8 gap-4">
          {menuItems.map((item) => (
            <NavbarMenuItem key={item.name}>
              <Link
                as={NextLink}
                href={item.href}
                className={`w-full py-2 text-lg font-bold ${pathname === item.href ? "text-blue-500" : "text-white"}`}
                onPress={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
              {/* เพิ่มเส้นคั่นในมือถือเพื่อให้ดูไม่โล่ง */}
              <Divider className="bg-white/5" />
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>

      {/* Auth Modal (คงเดิมจากโค้ดล่าสุดของคุณ) */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        backdrop="blur"
        placement="center"
        classNames={{
          backdrop: "bg-black/60 backdrop-blur-xl",
          base: "bg-black/80 border border-white/10 shadow-2xl p-4 mx-4",
          header: "text-white text-2xl font-bold",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {authMode === "login" ? "Login" : "Create Account"}
                <p className="text-sm font-normal text-gray-400">
                  {authMode === "login" ? "Welcome back!" : "Join our community."}
                </p>
              </ModalHeader>
              <ModalBody className="flex flex-col gap-4 pb-8">
                {authMode === "register" && <Input label="Username" variant="bordered" labelPlacement="outside" placeholder="Username" />}
                <Input label="Email" variant="bordered" labelPlacement="outside" placeholder="Email" />
                <Input label="Password" type="password" variant="bordered" labelPlacement="outside" placeholder="Password" />
                
                <Button color="primary" className="w-full font-bold h-12" onPress={onClose}>
                  {authMode === "login" ? "Log In" : "Sign Up"}
                </Button>
                
                <div className="text-center mt-2">
                  <p className="text-xs text-gray-500">
                    {authMode === "login" ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => setAuthMode(authMode === "login" ? "register" : "login")} className="ml-2 text-blue-400 font-bold">
                      {authMode === "login" ? "Sign Up" : "Log In"}
                    </button>
                  </p>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}