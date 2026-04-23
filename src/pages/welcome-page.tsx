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
        <div className="relative min-h-[100dvh] overflow-hidden bg-[var(--color-background)] text-[var(--color-text)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_30%)]" />
            <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-[var(--color-primary-500)]/20 blur-[90px]" />
            <div className="absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-[var(--color-surface)]/10 blur-[110px]" />

            <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12 text-center sm:px-10">
                <div className="flex items-center justify-center rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-8 shadow-2xl shadow-[rgba(15,23,42,0.3)] backdrop-blur-xl">
                    <CaskmafDatahubLogo width={132} height={152} className="text-[var(--color-text)]" />
                </div>

                <div className="mt-10 max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-secondary-text)]">
                        Caskmaf Datahub
                    </p>
                    <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl text-[var(--color-text)]">
                        Welcome to fast mobile data.
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-base text-[var(--color-muted-text)] sm:text-lg">
                        Buy airtime and data bundles from trusted agents with a clean, simple experience.
                    </p>
                </div>

                <div className="mt-10 w-full max-w-sm space-y-3">
                    <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        onClick={() => navigate('/register')}
                        className="border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-control-bg)]"
                    >
                        Create Free Account
                    </Button>
                    <Button
                        variant="outline"
                        fullWidth
                        size="lg"
                        onClick={() => navigate('/login')}
                        className="border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                    >
                        Sign In
                    </Button>
                </div>

                <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[var(--color-muted-text)]">
                    <a
                        href="/terms-of-service"
                        className="hover:text-[var(--color-text)] transition-colors"
                    >
                        Terms of Service
                    </a>
                    <span className="hidden sm:inline text-[var(--color-muted-text)]/70">•</span>
                    <a
                        href="/privacy-policy"
                        className="hover:text-[var(--color-text)] transition-colors"
                    >
                        Privacy Policy
                    </a>
                </div>
            </div>
        </div>
    );
};
