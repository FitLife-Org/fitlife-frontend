import { Link } from "react-router-dom";
import { ROUTES } from "../../config/routes";
import Button from "../common/Button";
import { HeartPulse, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { getRedirectPathByRoles } from "../../utils/authRedirect";

export default function GuestHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Trang chủ", href: "#home" },
    { label: "Tính năng", href: "#features" },
    { label: "Gói tập", href: "#pricing" },
    { label: "AI Assistant", href: "#ai" },
    { label: "Về chúng tôi", href: "#about" },
    { label: "Liên hệ", href: "#contact" },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href.startsWith("#")) {
      const element = document.getElementById(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 shadow-sm backdrop-blur-md py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <HeartPulse className="h-8 w-8 text-fit-primary" />
            <div className="flex flex-col">
               <span className="text-2xl font-bold tracking-tight text-slate-900 leading-none">
                 FitLife
               </span>
               <span className="text-[10px] text-slate-500 font-medium">Sống khỏe mỗi ngày</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={`text-sm font-semibold transition-colors hover:text-fit-primary ${
                  index === 0 ? "text-fit-primary border-b-2 border-fit-primary pb-1" : "text-slate-600"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <Link to={getRedirectPathByRoles(user.roles)}>
                <Button className="rounded-full px-6 font-semibold">
                  Vào hệ thống
                </Button>
              </Link>
            ) : (
              <>
                <Link to={ROUTES.LOGIN}>
                  <Button variant="outline" className="rounded-full px-6 font-semibold">
                    Đăng nhập
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button className="rounded-full px-6 font-semibold">Bắt đầu ngay hôm nay</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-slate-600">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
