import { ReactNode, useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { ShoppingBag, Wallet, User } from "lucide-react";

// Đăng ký plugin useGSAP
gsap.registerPlugin(useGSAP);

interface LayoutProps {
  children: ReactNode;
  walletContent: ReactNode;
  profileContent: ReactNode;
}

export function Layout({
  children,
  walletContent,
  profileContent,
}: LayoutProps) {
  const [activeTab, setActiveTab] = useState("store");
  const containerRef = useRef<HTMLDivElement>(null);

  // Hiệu ứng tải trang lần đầu (Mount)
  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.from(".header-logo", { 
      y: -30, 
      opacity: 0, 
      duration: 0.6, 
      ease: "back.out(1.7)" 
    })
    .from(".header-title", { 
      x: -20, 
      opacity: 0, 
      duration: 0.5 
    }, "-=0.4")
    .from(".tabs-list", { 
      y: 20, 
      opacity: 0, 
      duration: 0.5, 
      ease: "power2.out" 
    }, "-=0.3");
  }, { scope: containerRef });

  // Hiệu ứng mỗi khi thay đổi Tab
  useGSAP(() => {
    gsap.from(".tab-content", {
      y: 15,
      opacity: 0,
      duration: 0.4,
      ease: "power2.out",
      clearProps: "all" // Xóa các inline style của GSAP sau khi chạy xong để tránh lỗi CSS
    });
  }, { dependencies: [activeTab], scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 header-logo">
                <img
                  src="https://res.cloudinary.com/duopgsqbv/image/upload/v1779720149/z7845595736939_488081c4d5d966b4de13e74e5d1ed1aa-removebg-preview_jnqo49.png"
                  alt="logo"
                  className="w-45"
                />
              </div>
              <div className="header-title">
                <h1 className="text-5xl font-bold text-white font-['Montserrat']">
                  FitLife
                </h1>
              </div>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="tabs-list grid w-full max-w-md grid-cols-3 bg-muted/50 border border-border/50">
              <TabsTrigger
                value="store"
                className="flex items-center gap-2 data-[state=active]:bg-[#0F88B7] data-[state=active]:text-black data-[state=active]:shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Gói Tập</span>
              </TabsTrigger>
              <TabsTrigger
                value="wallet"
                className="flex items-center gap-2 data-[state=active]:bg-[#0CAAAB] data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(255,107,53,0.3)] transition-all"
              >
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Ví Của Tôi</span>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="flex items-center gap-2 data-[state=active]:bg-[#04E386] data-[state=active]:text-black data-[state=active]:shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Tài Khoản</span>
              </TabsTrigger>
            </TabsList>

            <div className="tab-content">
              <TabsContent value="store" className="mt-8">
                {children}
              </TabsContent>

              <TabsContent value="wallet" className="mt-8">
                {walletContent}
              </TabsContent>

              <TabsContent value="profile" className="mt-8">
                {profileContent}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </header>
    </div>
  );
}