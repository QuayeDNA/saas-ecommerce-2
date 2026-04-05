import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { DirectDataLogo } from "../components/common/DirectDataLogo";
import { useAuth } from "../hooks";

export const SplashPage = () => {
    const navigate = useNavigate();
    const { authState } = useAuth();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (authState.isAuthenticated && authState.dashboardUrl) {
                navigate(authState.dashboardUrl);
            } else {
                navigate("/welcome");
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [authState, navigate]);

    return (
        <div className="min-h-[100dvh] relative overflow-hidden bg-primary-900 text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-slate-950" />
            <div className="absolute -top-24 -left-24 h-[32rem] w-[32rem] rounded-full bg-primary-500/20 blur-[90px]" />
            <div className="absolute top-16 right-[-6rem] h-[28rem] w-[28rem] rounded-full bg-primary-200/15 blur-[90px]" />
            <div className="absolute bottom-0 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-slate-950/20 blur-[100px]" />

            <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12 sm:px-10">
                <div className="flex items-center justify-center rounded-[2rem] bg-white/10 border border-white/10 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
                    <DirectDataLogo width={140} height={160} className="text-white" />
                </div>

                <div className="mt-10 max-w-2xl text-center">
                    <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                        Instant mobile data for every connection.
                    </h1>
                    <p className="mt-4 text-base text-primary-100/90 sm:text-lg">
                        Fast, secure bundles from trusted Ghana agents.
                    </p>
                </div>

                <div className="mt-10 flex flex-col items-center gap-3">
                    <div className="inline-flex items-center justify-center rounded-full bg-white/10 p-3 text-white/90 shadow-lg shadow-slate-950/20">
                        <LoaderCircle className="h-6 w-6 animate-spin" aria-hidden="true" />
                    </div>
                </div>
            </div>
        </div>
    );
};
