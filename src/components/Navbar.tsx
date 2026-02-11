"use client";
import React, { useState } from "react";
import {
  Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button,
  Modal, ModalContent, ModalHeader, ModalBody,
  useDisclosure, Input, Divider
} from "@heroui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { FcGoogle } from "react-icons/fc";
export default function AppNavbar() {
  const pathname = usePathname();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
  // ใช้ State คุมโหมดภายใน Modal (Login หรือ Register)
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const menuItems = [
    { name: "HOME", href: "/" },
    { name: "BUILD", href: "/build" },
    { name: "FORUM", href: "/forum" },
  ];

  return (
    <>
      <Navbar maxWidth="xl" className="bg-black/40 backdrop-blur-md border-b border-white/10 fixed top-0">
        <NavbarBrand>
          <NextLink href="/"><p className="font-bold text-2xl text-white tracking-widest cursor-pointer">LOGO</p></NextLink>
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          {menuItems.map((item) => (
            <NavbarItem key={item.name} className="relative h-full flex items-center">
              <Link as={NextLink} href={item.href} className={`relative z-10 px-4 py-2 text-sm font-semibold transition-colors ${pathname === item.href ? "text-white" : "text-gray-400"}`}>
                {item.name}
              </Link>
              {pathname === item.href && (
                <motion.div layoutId="navbar-active" className="absolute inset-0 bg-blue-500/20 rounded-lg border-b-2 border-blue-500" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
              )}
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem>
            {/* Navbar มีแค่ปุ่ม LOGIN ปุ่มเดียวตามที่คุณต้องการ */}
            <Button 
              onPress={() => { setAuthMode("login"); onOpen(); }}
              variant="flat" 
              className="bg-blue-600/20 text-blue-400 border border-blue-500/50 hover:bg-blue-600 hover:text-white transition-all px-8 text-xs font-bold"
            >
              LOGIN
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        backdrop="blur"
        placement="center"
        classNames={{
          backdrop: "bg-black/60 backdrop-blur-xl",
          base: "bg-black/80 border border-white/10 shadow-2xl p-4",
          header: "border-b-0 text-white text-2xl font-bold",
          body: "py-2",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {authMode === "login" ? "Login" : "Create Account"}
                <p className="text-sm font-normal text-gray-400">
                  {authMode === "login" 
                    ? "Welcome back! Please enter your details." 
                    : "Join us to save and share your PC builds."}
                </p>
              </ModalHeader>
              
              <ModalBody className="flex flex-col gap-4">
                {/* ช่องกรอกข้อมูลที่จะปรับเปลี่ยนตาม authMode */}
                {authMode === "register" && (
                  <Input label="Username" variant="bordered" labelPlacement="outside" placeholder="Enter your username" />
                )}
                
                <Input label="Email" variant="bordered" labelPlacement="outside" placeholder="Enter your email" />
                
                <Input label="Password" type="password" variant="bordered" labelPlacement="outside" placeholder="Enter your password" />
                
                {authMode === "register" && (
                  <Input label="Confirm Password" type="password" variant="bordered" labelPlacement="outside" placeholder="Confirm your password" />
                )}

                <Button color="primary" className="w-full font-bold mt-2" onPress={onClose}>
                  {authMode === "login" ? "Log In" : "Sign Up"}
                </Button>
                
                {/* ส่วนสลับโหมดระหว่าง Login และ Register */}
                <div className="text-center mt-2">
                  <p className="text-xs text-gray-500">
                    {authMode === "login" ? "Don't have an account?" : "Already have an account?"}
                    <button 
                      onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                      className="ml-2 text-blue-400 hover:underline font-bold transition-all"
                    >
                      {authMode === "login" ? "Sign Up" : "Log In"}
                    </button>
                  </p>
                </div>
                
                <div className="flex items-center gap-4 py-2">
                  <Divider className="flex-1 bg-white/10" />
                  <span className="text-xs text-gray-500">OR</span>
                  <Divider className="flex-1 bg-white/10" />
                </div>

                <Button 
                  variant="bordered" 
                  className="w-full border-white/10 text-white hover:bg-white/5 transition-colors font-medium" 
                  startContent={<FcGoogle className="text-xl mr-2" />} // ใช้ไอคอน Google ตรงนี้
                >
                  Continue with Google
                </Button>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}