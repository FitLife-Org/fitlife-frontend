import {
    useRef,
    type ReactNode,
} from "react";

import {
    useLocation,
} from "react-router-dom";

import gsap from "gsap";

import {
    useGSAP,
} from "@gsap/react";

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
            if (!mainRef.current) {
                return;
            }

            gsap.fromTo(
                mainRef.current,
                {
                    y: 12,
                    opacity: 0,
                },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.32,
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
                flex
                min-h-screen
                w-full
                max-w-full
                overflow-x-hidden
                bg-slate-50
            "
        >
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
                        bg-slate-950/40
                        backdrop-blur-[1px]
                        lg:hidden
                    "
                />
            )}

            <Sidebar />

            <div
                className="
                    flex
                    min-h-screen
                    min-w-0
                    max-w-full
                    flex-1
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
                        max-w-full
                        flex-1
                        overflow-x-hidden
                        px-4
                        py-6
                        sm:px-6
                        lg:px-8
                        xl:px-10
                    "
                >
                    <div
                        className="
                            mx-auto
                            w-full
                            min-w-0
                            max-w-[1600px]
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