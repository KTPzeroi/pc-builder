"use client";
import React from "react";
import {
  Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, Input, Divider
} from "@heroui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function AppNavbar() {
  const pathname = usePathname();
  // 1. สร้างตัวควบคุมการเปิด-ปิด Modal
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
            {/* 2. เปลี่ยนปุ่มให้มากดเปิด Modal แทนการ Link ไปหน้าอื่น */}
            <Button 
              onPress={onOpen}
              variant="flat" 
              className="bg-blue-600/20 text-blue-400 border border-blue-500/50 hover:bg-blue-600 hover:text-white transition-all px-8 text-xs font-bold"
            >
              LOGIN
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* 3. ส่วนของ Login Modal ที่จะโผล่มาทุกหน้า */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        backdrop="blur" // พื้นหลังเบลอตามที่คุณต้องการ
        placement="center"
        classNames={{
          backdrop: "bg-black/60 backdrop-blur-xl",
          base: "bg-black/80 border border-white/10 shadow-2xl p-4",
          header: "border-b-0 text-white text-2xl font-bold",
          body: "py-6",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Login
                <p className="text-sm font-normal text-gray-400">Welcome back! Please enter your details.</p>
              </ModalHeader>
              <ModalBody className="flex flex-col gap-4">
                <Input label="Username" variant="bordered" labelPlacement="outside" placeholder="Enter your username" />
                <Input label="Password" type="password" variant="bordered" labelPlacement="outside" placeholder="Enter your password" />
                <Button color="primary" className="w-full font-bold mt-2" onPress={onClose}>Sign In</Button>
                
                <div className="flex items-center gap-4 py-2">
                  <Divider className="flex-1 bg-white/10" />
                  <span className="text-xs text-gray-500">OR</span>
                  <Divider className="flex-1 bg-white/10" />
                </div>

                <Button variant="bordered" className="w-full border-white/10 text-white" startContent={<span className="w-4 h-4 bg-white rounded-full mr-1" />}>
                  Sign in with Google
                </Button>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}