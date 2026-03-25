"use client";
import React, { useState, useEffect } from "react";
import {
  Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button,
  Modal, ModalContent, ModalHeader, ModalBody,
  useDisclosure, Input, Divider,
  Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, User as HeroUser, Badge, ScrollShadow
} from "@heroui/react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion"; // เก็บไว้ใช้กับ Navbar Active Tab เท่านั้น
import { FcGoogle } from "react-icons/fc";
import { signIn, signOut, useSession, getSession } from "next-auth/react";
import { IoWarningOutline, IoEyeOutline, IoEyeOffOutline, IoNotificationsOutline, IoChatbubbleEllipsesOutline, IoWarning, IoHeart } from "react-icons/io5";

export default function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (!isOpen) {
      setErrorMessage("");
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (session) {
      // ดึงการแจ้งเตือน
      const fetchNotifications = async () => {
        try {
          const res = await fetch("/api/notifications");
          if (res.ok) {
            const data = await res.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
          }
        } catch (error) {
          console.error("Failed to fetch notifications");
        }
      };
      fetchNotifications();
      
      // อัปเดตทุกๆ 30 วินาที
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

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
          // ตรวจสอบ Role ของผู้ใช้ที่เพิ่งเข้าสู่ระบบ
          const updatedSession = await getSession();
          if ((updatedSession?.user as any)?.role === "ADMIN") {
            router.push("/admin");
          } else {
            router.refresh(); 
          }
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

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrorMessage("กรุณากรอก Email ที่ใช้สมัคร");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");

      alert(data.message || "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว");
      setAuthMode("login");
    } catch(err: any) {
      setErrorMessage(err.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setIsLoading(false);
    }
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
          <NextLink href={(session?.user as any)?.role === "ADMIN" ? "/admin" : "/"}>
            <p className="font-bold text-2xl text-white tracking-widest cursor-pointer">LOGO</p>
          </NextLink>
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
              <div className="flex items-center gap-4">
                {/* 🔴 Notification Bell */}
                <Dropdown placement="bottom-end" className="bg-black/95 border border-white/10 text-white shadow-2xl min-w-[300px]">
                  <DropdownTrigger>
                    <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors focus:outline-none flex items-center justify-center">
                      <Badge content={unreadCount} color="danger" shape="circle" isInvisible={unreadCount === 0} size="sm">
                        <IoNotificationsOutline className="text-2xl text-gray-300" />
                      </Badge>
                    </button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Notifications" variant="flat" disabledKeys={["empty"]} className="p-0">
                    {/* @ts-ignore */}
                    {[
                      <DropdownItem key="header" isReadOnly className="cursor-default border-b border-white/5 py-3">
                        <p className="font-bold text-lg text-white">การแจ้งเตือน</p>
                      </DropdownItem>,
                      
                      ...((notifications || []).length === 0 ? [
                        <DropdownItem key="empty" isReadOnly className="text-center py-6 text-gray-500">
                          ไม่มีการแจ้งเตือนใหม่
                        </DropdownItem>
                      ] : notifications.map((notif: any) => (
                        <DropdownItem 
                          key={notif.id} 
                          onPress={async () => {
                            if (!notif.isRead) {
                              try {
                                setUnreadCount(prev => Math.max(0, prev - 1));
                                setNotifications(prev => prev.filter(n => n.id !== notif.id)); // 🔴 ลบข้อความออกจากรายการทันที
                                await fetch("/api/notifications", {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ notifId: notif.id })
                                });
                              } catch(e) {}
                            }
                            router.push(notif.link);
                          }}
                          className={`py-3 px-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${!notif.isRead ? 'bg-white/5' : 'opacity-70'}`}
                          textValue={notif.message}
                        >
                          <div className="flex gap-3 items-start">
                            <div className="mt-1">
                              {/* 🔴 ถ้ายังไม่ได้อ่านให้มีจุดแดงเล็กๆกำกับด้วย */}
                              {!notif.isRead && <div className="absolute top-4 left-2 w-2 h-2 bg-danger rounded-full shadow-[0_0_8px_rgba(255,0,0,0.8)] animate-pulse" />}
                              {notif.type === 'REPORT' || notif.type === 'WARNING' ? (
                                <IoWarning className="text-danger text-xl ml-2" />
                              ) : notif.type === 'LIKE' ? (
                                <IoHeart className="text-danger text-xl ml-2" />
                              ) : (
                                <IoChatbubbleEllipsesOutline className="text-primary text-xl ml-2" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className={`text-sm whitespace-normal ${!notif.isRead ? 'font-bold text-white' : 'font-medium text-gray-400'}`}>{notif.message}</span>
                              <span className="text-xs text-gray-500 mt-1">
                                {new Date(notif.date).toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                              </span>
                            </div>
                          </div>
                        </DropdownItem>
                      )))
                    ]}
                    
                  </DropdownMenu>
                </Dropdown>

                {/* 🟢 Profile Dropdown */}
                <Dropdown placement="bottom-end" className="bg-black/90 border border-white/10 text-white shadow-2xl">
                  <DropdownTrigger>
                    <div className="flex items-center outline-none cursor-pointer">
                      <HeroUser
                        as="button"
                        avatarProps={{
                          isBordered: true,
                          src: session.user?.image || undefined,
                          showFallback: true,
                          name: (session.user?.name || "U").charAt(0).toUpperCase(),
                          className: "border-blue-500 bg-slate-800"
                        }}
                        className="transition-transform"
                        name={session.user?.name || "User"}
                        description={(session.user as any)?.role === "ADMIN" ? "Admin" : ""}
                        classNames={{
                          name: "text-white font-bold text-sm",
                          description: "text-danger-400 text-xs font-bold"
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
              </div>
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
                {authMode === "login" ? "Login" : authMode === "register" ? "Create Account" : "Reset Password"}
                <p className="text-sm font-normal text-gray-400">
                  {authMode === "login" 
                    ? "Welcome back! Please enter your details." 
                    : authMode === "register"
                    ? "Join us to save and share your PC builds."
                    : "Enter your email to receive a password reset link."}
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
                  classNames={{ label: "w-full max-w-full text-[15px] whitespace-normal overflow-visible text-clip" }}
                />
                
                {authMode !== "forgot" && (
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
                )}
                
                {authMode === "register" && (
                  <Input 
                    label="Confirm Password" type="password" variant="bordered" labelPlacement="outside" placeholder="Confirm your password" 
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                )}

                <Button color="primary" className="w-full font-bold mt-2" isLoading={isLoading} onPress={authMode === "forgot" ? handleForgotPassword : handleAuth}>
                  {authMode === "login" ? "Log In" : authMode === "register" ? "Sign Up" : "Send Reset Link"}
                </Button>
                
                <div className="text-center mt-2 flex flex-col gap-2">
                  {authMode === "login" && (
                    <button 
                      onClick={() => setAuthMode("forgot")}
                      className="text-xs text-gray-400 hover:text-white hover:underline transition-all"
                    >
                      Forgot password?
                    </button>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    {authMode === "login" ? "Don't have an account?" : authMode === "forgot" ? "Remembered your password?" : "Already have an account?"}
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