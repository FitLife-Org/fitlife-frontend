import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Link,
    useSearchParams,
} from "react-router-dom";

import {
    CheckCircle2,
    Loader2,
    XCircle,
} from "lucide-react";

import { ROUTES } from "../../config/routes";
import { authService } from "../../services/authService";

type VerifyStatus =
    | "loading"
    | "success"
    | "error";

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();

    const [status, setStatus] =
        useState<VerifyStatus>("loading");

    const [message, setMessage] =
        useState("Äang xĂ¡c minh email...");

    const verificationStarted = useRef(false);

    useEffect(() => {
        /*
         * React StrictMode á»Ÿ mĂ´i trÆ°á»ng development
         * cĂ³ thá»ƒ gá»i useEffect hai láº§n.
         */
        if (verificationStarted.current) {
            return;
        }

        verificationStarted.current = true;

        const token = searchParams.get("token");

        if (!token) {
            setStatus("error");
            setMessage(
                "LiĂªn káº¿t xĂ¡c minh khĂ´ng há»£p lá»‡ hoáº·c thiáº¿u token.",
            );
            return;
        }

        const verifyEmail = async () => {
            try {
                const responseMessage =
                    await authService.verifyEmail(token);

                setStatus("success");

                setMessage(
                    responseMessage ||
                    "Email Ä‘Ă£ Ä‘Æ°á»£c xĂ¡c minh thĂ nh cĂ´ng.",
                );
            } catch (requestError: unknown) {
                setStatus("error");

                setMessage(
                    requestError instanceof Error
                        ? requestError.message
                        : "KhĂ´ng thá»ƒ xĂ¡c minh email.",
                );
            }
        };

        void verifyEmail();
    }, [searchParams]);

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[url('https://images.unsplash.com/photo-1593079831268-3381b0c42369?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center px-4">
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[3px]" />

            <section className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/70 bg-white/85 p-8 text-center shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
                {status === "loading" && (
                    <>
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-100">
                            <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
                        </div>

                        <h1 className="mt-6 text-3xl font-black text-slate-900">
                            Äang xĂ¡c minh email
                        </h1>

                        <p className="mt-3 text-slate-600">
                            {message}
                        </p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle2 className="h-11 w-11 text-green-600" />
                        </div>

                        <h1 className="mt-6 text-3xl font-black text-green-700">
                            XĂ¡c minh thĂ nh cĂ´ng
                        </h1>

                        <p className="mt-3 text-slate-600">
                            {message}
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                            TĂ i khoáº£n cá»§a báº¡n Ä‘Ă£ Ä‘Æ°á»£c kĂ­ch hoáº¡t.
                            Báº¡n cĂ³ thá»ƒ Ä‘Äƒng nháº­p ngay bĂ¢y giá».
                        </p>

                        <Link
                            to={ROUTES.LOGIN}
                            replace
                            className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 font-bold text-white transition hover:bg-slate-800"
                        >
                            ÄÄƒng nháº­p ngay
                        </Link>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                            <XCircle className="h-11 w-11 text-red-600" />
                        </div>

                        <h1 className="mt-6 text-3xl font-black text-red-700">
                            XĂ¡c minh tháº¥t báº¡i
                        </h1>

                        <p className="mt-3 text-slate-600">
                            {message}
                        </p>

                        <div className="mt-7 space-y-3">
                            <Link
                                to={ROUTES.CHECK_EMAIL}
                                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 font-bold text-white transition hover:bg-slate-800"
                            >
                                Gá»­i láº¡i email xĂ¡c minh
                            </Link>

                            <Link
                                to={ROUTES.LOGIN}
                                className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
                            >
                                Quay láº¡i Ä‘Äƒng nháº­p
                            </Link>
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}
