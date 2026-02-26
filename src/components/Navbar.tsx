"use client";
import React, { useState, useEffect } from "react";
import {
  Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button,
  Modal, ModalContent, ModalHeader, ModalBody,
  useDisclosure, Input, Divider,
  Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, User as HeroUser
} from "@heroui/react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion"; // เก็บไว้ใช้กับ Navbar Active Tab เท่านั้น
import { FcGoogle } from "react-icons/fc";
import { signIn, signOut, useSession } from "next-auth/react";
import { IoWarningOutline, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

export default function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isOpen) {
      setErrorMessage("");
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setErrorMessage("");
  }, [authMode]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleAuth = async () => {
    setErrorMessage("");

    if (authMode === "register" && formData.password !== formData.confirmPassword) {
      setErrorMessage("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setIsLoading(true);
    try {
      if (authMode === "register") {
        const res = await fetch("/api/auth/credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "register",
            username: formData.username,
            email: formData.email,
            password: formData.password
          })
        });
        const data = await res.json();
        if (res.ok) {
          alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
          setAuthMode("login");
        } else {
          setErrorMessage(data.message || "เกิดข้อผิดพลาด");
        }
      } else {
        const result = await signIn("credentials", {
          identifier: formData.email,
          password: formData.password,
          redirect: false,
          callbackUrl: pathname, 
        });

        if (result?.error) {
          setErrorMessage("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        } else {
          onOpenChange();
          router.refresh(); 
        }
      }
    } catch (err) {
      setErrorMessage("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: pathname });
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (!mounted) return <div className="h-16 bg-black/40 border-b border-white/10" />;

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
            {status === "loading" ? (
              <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
            ) : !session ? (
              <Button 
                onPress={() => { setAuthMode("login"); onOpen(); }}
                variant="flat" 
                className="bg-blue-600/20 text-blue-400 border border-blue-500/50 hover:bg-blue-600 hover:text-white transition-all px-8 text-xs font-bold"
              >
                LOGIN
              </Button>
            ) : (
              <Dropdown placement="bottom-end" className="bg-black/90 border border-white/10 text-white shadow-2xl">
                <DropdownTrigger>
                  <div className="flex items-center outline-none">
                    <HeroUser
                      as="button"
                      avatarProps={{
                        isBordered: true,
                        src: session.user?.image || undefined,
                        showFallback: true,
                        name: (session.user?.name || "U").charAt(0).toUpperCase(),
                        className: "border-blue-500 bg-slate-800 ml-3"
                      }}
                      className="transition-transform"
                      name={session.user?.name || "User"}
                      classNames={{
                        name: "text-white font-bold text-sm",
                      }}
                    />
                  </div>
                </DropdownTrigger>
                <DropdownMenu aria-label="User Actions" variant="flat">
                  <DropdownItem key="profile" onPress={() => router.push("/profile")}>
                    User Profile
                  </DropdownItem>
                  <DropdownItem key="logout" color="danger" className="text-danger" onPress={handleLogout}>
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )}
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
                {/* 🟢 แก้ไข: ใช้การเช็คเงื่อนไขปกติ แทน Framer Motion เพื่อความลื่นไหล */}
                {errorMessage && (
                  <div className="bg-danger-500/10 border border-danger-500/50 p-3 rounded-xl flex items-center gap-3 text-danger-500 text-xs font-bold transition-opacity duration-200">
                    <IoWarningOutline size={18} />
                    {errorMessage}
                  </div>
                )}

                {authMode === "register" && (
                  <Input 
                    label="Username" variant="bordered" labelPlacement="outside" placeholder="Enter your username" 
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                )}
                
                <Input 
                  label={authMode === "login" ? "Username or Email" : "Email"} 
                  variant="bordered" labelPlacement="outside" placeholder="Enter your email" 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                
                <Input 
                  label="Password" 
                  type={isVisible ? "text" : "password"} 
                  variant="bordered" labelPlacement="outside" placeholder="Enter your password" 
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  endContent={
                    <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                      {isVisible ? (
                        <IoEyeOffOutline className="text-2xl text-default-400" />
                      ) : (
                        <IoEyeOutline className="text-2xl text-default-400" />
                      )}
                    </button>
                  }
                />
                
                {authMode === "register" && (
                  <Input 
                    label="Confirm Password" type="password" variant="bordered" labelPlacement="outside" placeholder="Confirm your password" 
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                )}

                <Button color="primary" className="w-full font-bold mt-2" isLoading={isLoading} onPress={handleAuth}>
                  {authMode === "login" ? "Log In" : "Sign Up"}
                </Button>
                
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
                  startContent={<FcGoogle className="text-xl mr-2" />}
                  onPress={handleGoogleLogin}
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