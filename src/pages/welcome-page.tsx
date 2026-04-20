import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CaskmafDatahubLogo } from "../components/common/CaskmafDatahubLogo";
import { Button } from "../design-system/components/button";
import { useAuth } from "../hooks";

export const WelcomePage = () => {
    const { authState } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (authState.isAuthenticated && authState.dashboardUrl) {
            navigate(authState.dashboardUrl);
        }
    }, [authState, navigate]);

    return (
        <div className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-slate-950 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(0,87,255,0.18),transparent_30%)]" />
            <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-primary-500/20 blur-[90px]" />
            <div className="absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-white/5 blur-[110px]" />

            <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12 text-center sm:px-10">
                <div className="flex items-center justify-center rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
                    <CaskmafDatahubLogo width={132} height={152} className="text-white" />
                </div>

                <div className="mt-10 max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-100/75">
                        Caskmaf Datahub
                    </p>
                    <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                        Welcome to fast mobile data.
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-base text-primary-100/90 sm:text-lg">
                        Buy airtime and data bundles from trusted agents with a clean, simple experience.
                    </p>
                </div>

                <div className="mt-10 w-full max-w-sm space-y-3">
                    <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        onClick={() => navigate('/register')}
                        className="border-white/10 bg-white text-primary-900 hover:bg-primary-50"
                    >
                        Create Free Account
                    </Button>
                    <Button
                        variant="outline"
                        fullWidth
                        size="lg"
                        onClick={() => navigate('/login')}
                        className="border-white/20 bg-transparent text-white hover:bg-white/10"
                    >
                        Sign In
                    </Button>
                </div>

                <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-primary-100/70">
                    <a
                        href="/terms-of-service"
                        className="hover:text-primary-300 transition-colors"
                    >
                        Terms of Service
                    </a>
                    <span className="hidden sm:inline text-primary-500/40">•</span>
                    <a
                        href="/privacy-policy"
                        className="hover:text-primary-300 transition-colors"
                    >
                        Privacy Policy
                    </a>
                </div>
            </div>
        </div>
    );
};
