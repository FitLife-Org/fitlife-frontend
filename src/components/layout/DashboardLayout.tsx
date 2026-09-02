import {
    useRef,
    type ReactNode,
} from "react";

import {
    useLocation,
} from "react-router-dom";

import {
    useGSAP,
} from "@gsap/react";

import gsap from "gsap";

import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";

import {
    useUiStore,
} from "../../store/uiStore";

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({
                                            children,
                                        }: DashboardLayoutProps) {
    const sidebarOpen =
        useUiStore(
            (state) =>
                state.sidebarOpen,
        );

    const setSidebarOpen =
        useUiStore(
            (state) =>
                state.setSidebarOpen,
        );

    const location =
        useLocation();

    const mainRef =
        useRef<HTMLElement>(
            null,
        );

    useGSAP(
        () => {
            if (
                !mainRef.current
            ) {
                return;
            }

            gsap.fromTo(
                mainRef.current,
                {
                    y: 10,
                    opacity: 0,
                },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.28,
                    ease: "power2.out",
                    clearProps:
                        "transform,opacity",
                },
            );
        },
        {
            dependencies: [
                location.pathname,
            ],
            scope: mainRef,
        },
    );

    return (
        <div
            className="
        min-h-screen
        w-full
        overflow-x-hidden
        bg-slate-50
      "
        >
            {/* =================================================
          MOBILE SIDEBAR OVERLAY
      ================================================= */}

            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Đóng menu"
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                    className="
            fixed
            inset-0
            z-30
            bg-slate-950/45
            backdrop-blur-[1px]
            lg:hidden
          "
                />
            )}

            {/* =================================================
          SIDEBAR
      ================================================= */}

            <Sidebar />

            {/* =================================================
          APPLICATION CONTENT
      ================================================= */}

            <div
                className="
          flex
          min-h-screen
          min-w-0
          flex-col
          overflow-x-hidden
          lg:pl-[280px]
        "
            >
                <Header />

                <main
                    ref={mainRef}
                    className="
            min-w-0
            flex-1
            overflow-x-hidden
          "
                >
                    <div
                        className="
              mx-auto
              w-full
              max-w-[1600px]
              px-4
              py-6
              sm:px-6
              lg:px-8
              lg:py-8
              xl:px-10
            "
                    >
                        {children}
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}