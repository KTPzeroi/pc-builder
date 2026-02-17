"use client";
import React, { useState } from "react";
import {
  Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button,
  Modal, ModalContent, ModalHeader, ModalBody,
  useDisclosure, Input, Divider,
  Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, User as HeroUser
} from "@heroui/react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";

export default function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<{name: string, email: string, image?: string | null} | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleAuth = async () => {
    if (authMode === "register" && formData.password !== formData.confirmPassword) {
      alert("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: authMode,
          identifier: authMode === "login" ? formData.email : undefined,
          username: formData.username,
          email: authMode === "register" ? formData.email : undefined,
          password: formData.password
        })
      });

      const data = await res.json();

      if (res.ok) {
        if (authMode === "register") {
          alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
          setAuthMode("login");
        } else {
          setCurrentUser({
            name: data.name,
            email: data.email,
            image: data.image
          });
          onOpenChange();
        }
      } else {
        alert(data.message || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert("ระบบ Login ด้วย Google จะถูกเพิ่มในภายหลัง");
  };

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
            {!currentUser ? (
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
                        src: currentUser.image || undefined,
                        showFallback: true,
                        name: currentUser.name.charAt(0).toUpperCase(),
                        className: "border-blue-500 bg-slate-800 ml-3" // 🟢 เพิ่ม ml-3 เพื่อเว้นระยะห่างระหว่างชื่อและรูป
                      }}
                      className="transition-transform"
                      name={currentUser.name}
                      classNames={{
                        name: "text-white font-bold text-sm",
                      }}
                    />
                  </div>
                </DropdownTrigger>
                <DropdownMenu aria-label="User Actions" variant="flat">
                  {/* 🟢 นำปุ่ม User Profile กลับมา */}
                  <DropdownItem key="profile" onPress={() => router.push("/profile")}>
                    User Profile
                  </DropdownItem>
                  <DropdownItem 
                    key="logout" 
                    color="danger" 
                    className="text-danger" 
                    onPress={() => {
                      // 1. เคลียร์สถานะ User ในเครื่อง
                      setCurrentUser(null); 
                      
                      // 2. เปลี่ยนเส้นทางกลับไปที่หน้า Home
                      router.push("/"); 
                      
                      // 3. ใช้ setTimeout เล็กน้อยเพื่อให้ router.push ทำงานก่อนแล้วค่อย Refresh
                      // หรือจะใช้ window.location.href = "/" เพื่อทั้งเปลี่ยนหน้าและ Refresh ทีเดียวก็ได้ครับ
                      setTimeout(() => {
                        window.location.reload(); 
                      }, 100);
                    }}
                  >
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
                {authMode === "register" && (
                  <Input 
                    label="Username" variant="bordered" labelPlacement="outside" placeholder="Enter your username" 
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                )}
                
                <Input 
                  label={authMode === "login" ? "Username or Email" : "Email"} 
                  variant="bordered" 
                  labelPlacement="outside" 
                  placeholder={authMode === "login" ? "Enter your username or email" : "Enter your email"} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                
                <Input 
                  label="Password" type="password" variant="bordered" labelPlacement="outside" placeholder="Enter your password" 
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                
                {authMode === "register" && (
                  <Input 
                    label="Confirm Password" type="password" variant="bordered" labelPlacement="outside" placeholder="Confirm your password" 
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                )}

                <Button 
                    color="primary" 
                    className="w-full font-bold mt-2" 
                    isLoading={isLoading}
                    onPress={handleAuth}
                >
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