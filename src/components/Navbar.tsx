"use client";
import React, { useState, useEffect } from "react";
import {
  Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button,
  Modal, ModalContent, ModalHeader, ModalBody,
  useDisclosure, Input, Divider,
  Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, User as HeroUser, Badge, ScrollShadow
} from "@heroui/react";
import Image from "next/image";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { signIn, signOut, useSession, getSession } from "next-auth/react";
import { IoWarningOutline, IoEyeOutline, IoEyeOffOutline, IoNotificationsOutline, IoChatbubbleEllipsesOutline, IoWarning, IoHeart, IoHomeOutline, IoBuildOutline, IoChatbubblesOutline, IoPersonOutline, IoLogOutOutline, IoLogInOutline, IoMenuOutline, IoCloseOutline, IoChevronForwardOutline, IoShieldHalfOutline } from "react-icons/io5";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // รับ Event จาก Component อื่นๆ (เช่นหน้า Build) เพื่อสั่งเปิด Modal
  useEffect(() => {
    const handleOpenLoginModal = () => {
      setAuthMode("login");
      onOpen();
    };
    window.addEventListener("open-login-modal", handleOpenLoginModal);
    return () => window.removeEventListener("open-login-modal", handleOpenLoginModal);
  }, [onOpen]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleAuth = async () => {
    setErrorMessage("");

    // Validate inputs
    if (authMode === "register") {
      if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
        setErrorMessage("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setErrorMessage("รูปแบบอีเมลไม่ถูกต้อง");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setErrorMessage("รหัสผ่านไม่ตรงกัน");
        return;
      }
    } else if (authMode === "login") {
      if (!formData.email.trim() || !formData.password.trim()) {
        setErrorMessage("กรุณากรอกอีเมล/ชื่อผู้ใช้ และรหัสผ่าน");
        return;
      }
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
          setErrorMessage("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
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

  // ปิด mobile menu เมื่อเปลี่ยนหน้า
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // ป้องกัน scroll เมื่อ mobile menu เปิดอยู่
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  if (!mounted) return <div className="h-16 bg-black/40 border-b border-white/10" />;

  const menuItems = [
    { name: "หน้าแรก", nameEn: "HOME", href: "/", icon: IoHomeOutline },
    { name: "จัดสเปค", nameEn: "BUILD", href: "/build", icon: IoBuildOutline },
    { name: "ชุมชน", nameEn: "FORUM", href: "/forum", icon: IoChatbubblesOutline },
  ];

  return (
    <>
      <Navbar maxWidth="xl" className="bg-black/40 backdrop-blur-md border-b border-white/10 fixed top-0">
        <NavbarBrand>
          <NextLink href={(session?.user as any)?.role === "ADMIN" ? "/admin" : "/"}>
            <Image
              src="/logo.png"
              alt="SnapBuild Logo"
              width={140}
              height={40}
              className="object-contain cursor-pointer"
              priority
            />
          </NextLink>
        </NavbarBrand>

        {/* Desktop nav links */}
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          {menuItems.map((item) => (
            <NavbarItem key={item.nameEn} className="relative h-full flex items-center">
              <Link as={NextLink} href={item.href} className={`relative z-10 px-4 py-2 text-sm font-semibold transition-colors ${pathname === item.href ? "text-white" : "text-gray-400"}`}>
                {item.nameEn}
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
              <>
                {/* Desktop LOGIN button */}
                <Button 
                  onPress={() => { setAuthMode("login"); onOpen(); }}
                  variant="flat" 
                  className="hidden sm:flex bg-blue-600/20 text-blue-400 border border-blue-500/50 hover:bg-blue-600 hover:text-white transition-all px-8 text-xs font-bold"
                >
                  LOGIN
                </Button>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-4">
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
                                setNotifications(prev => prev.filter(n => n.id !== notif.id));
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

          {/* 🍔 Hamburger Button — mobile only */}
          <NavbarItem className="sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative z-[110] flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMobileMenuOpen ? (
                  <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <IoCloseOutline className="text-2xl text-white" />
                  </motion.span>
                ) : (
                  <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <IoMenuOutline className="text-2xl text-white" />
                  </motion.span>
                )}
              </AnimatePresence>
              {/* unread dot on hamburger */}
              {unreadCount > 0 && !isMobileMenuOpen && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full shadow-[0_0_6px_rgba(239,68,68,0.8)] animate-pulse" />
              )}
            </button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* ===== MOBILE DRAWER ===== */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm sm:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 z-[105] h-full w-[80vw] max-w-xs bg-slate-950 border-l border-white/10 shadow-2xl sm:hidden flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                <Image
                  src="/logo.png"
                  alt="SnapBuild Logo"
                  width={120}
                  height={36}
                  className="object-contain"
                />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <IoCloseOutline className="text-xl text-white" />
                </button>
              </div>

              {/* User Card (if logged in) */}
              {session && (
                <div className="mx-4 mt-4 mb-2 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center overflow-hidden shrink-0">
                    {session.user?.image ? (
                      <img src={session.user.image} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-sm">{(session.user?.name || "U").charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-sm truncate">{session.user?.name || "User"}</p>
                    <p className="text-gray-400 text-xs truncate">{session.user?.email || ""}</p>
                    {(session.user as any)?.role === "ADMIN" && (
                      <span className="text-[10px] font-bold text-danger-400 uppercase tracking-widest">Admin</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <div className="ml-auto shrink-0 bg-danger rounded-full w-5 h-5 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">{unreadCount}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Nav Links */}
              <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-3">เมนูหลัก</p>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <NextLink
                      key={item.nameEn}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${
                        active
                          ? "bg-blue-500/20 border border-blue-500/40 text-white"
                          : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
                      }`}
                    >
                      <Icon className={`text-xl shrink-0 ${active ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm">{item.name}</span>
                        <span className={`text-[10px] font-medium tracking-widest ${active ? 'text-blue-400' : 'text-gray-600'}`}>{item.nameEn}</span>
                      </div>
                      {active && <IoChevronForwardOutline className="ml-auto text-blue-400 shrink-0" />}
                    </NextLink>
                  );
                })}

                {/* Admin link */}
                {(session?.user as any)?.role === "ADMIN" && (
                  <NextLink
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${
                      pathname.startsWith("/admin")
                        ? "bg-danger/10 border border-danger/30 text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
                    }`}
                  >
                    <IoShieldHalfOutline className={`text-xl shrink-0 ${pathname.startsWith("/admin") ? 'text-danger' : 'text-gray-500 group-hover:text-gray-300'}`} />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">แดชบอร์ด</span>
                      <span className={`text-[10px] font-medium tracking-widest ${pathname.startsWith("/admin") ? 'text-danger-400' : 'text-gray-600'}`}>ADMIN</span>
                    </div>
                    {pathname.startsWith("/admin") && <IoChevronForwardOutline className="ml-auto text-danger shrink-0" />}
                  </NextLink>
                )}

                {/* Profile link (if logged in) */}
                {session && (
                  <NextLink
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${
                      pathname === "/profile"
                        ? "bg-blue-500/20 border border-blue-500/40 text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
                    }`}
                  >
                    <IoPersonOutline className={`text-xl shrink-0 ${pathname === '/profile' ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">โปรไฟล์</span>
                      <span className={`text-[10px] font-medium tracking-widest ${pathname === '/profile' ? 'text-blue-400' : 'text-gray-600'}`}>PROFILE</span>
                    </div>
                    {pathname === "/profile" && <IoChevronForwardOutline className="ml-auto text-blue-400 shrink-0" />}
                  </NextLink>
                )}
              </nav>

              {/* Drawer Footer */}
              <div className="px-4 pb-8 pt-3 border-t border-white/10 space-y-2">
                {!session ? (
                  <Button
                    color="primary"
                    className="w-full font-bold"
                    startContent={<IoLogInOutline />}
                    onPress={() => { setIsMobileMenuOpen(false); setAuthMode("login"); onOpen(); }}
                  >
                    เข้าสู่ระบบ / LOGIN
                  </Button>
                ) : (
                  <Button
                    color="danger"
                    variant="flat"
                    className="w-full font-bold border border-danger/30"
                    startContent={<IoLogOutOutline />}
                    onPress={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  >
                    ออกจากระบบ
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                    isRequired
                  />
                )}
                
                <Input 
                  label={authMode === "login" ? "Username or Email" : "Email"} 
                  variant="bordered" labelPlacement="outside" placeholder="Enter your email" 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  classNames={{ label: "w-full max-w-full text-[15px] whitespace-normal overflow-visible text-clip" }}
                  isRequired
                />
                
                {authMode !== "forgot" && (
                  <Input 
                    label="Password" 
                    type={isVisible ? "text" : "password"} 
                    variant="bordered" labelPlacement="outside" placeholder="Enter your password" 
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    isRequired
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
                    isRequired
                    classNames={{ label: "w-full max-w-full text-[15px] whitespace-normal overflow-visible text-clip" }}
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