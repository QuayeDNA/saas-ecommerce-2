import React from "react";
import { Link } from "react-router-dom";
import {
    CaskmafDatahubLogoCompact,
} from "../components/common/CaskmafDatahubLogo";
import { Card, CardHeader, CardBody } from "../design-system";

interface AuthLayoutProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    footerText?: string;
    footerLinkText?: string;
    footerLinkTo?: string;
    showLogo?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
    title,
    subtitle,
    children,
    footerText,
    footerLinkText,
    footerLinkTo,
    showLogo = true,
}) => {
    return (
        <div className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-slate-950 flex flex-col sm:flex sm:items-center sm:justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(0,87,255,0.16),transparent_28%)]" />
            <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-primary-500/20 blur-[90px]" />
            <div className="absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-white/5 blur-[110px]" />

            <div className="relative z-10 flex flex-col items-center justify-center px-6 py-8 text-center text-white sm:hidden min-h-[34vh] space-y-4">
                {showLogo && (
                    <div className="flex justify-center items-center mb-3">
                        <CaskmafDatahubLogoCompact width={300} height={54} />
                    </div>
                )}
                <h1 className="text-2xl font-bold text-white mb-3">{title}</h1>
                {subtitle && (
                    <p className="mb-3 max-w-xs text-sm text-primary-100/85">{subtitle}</p>
                )}
            </div>

            <div className="relative z-10 w-full sm:max-w-md mt-auto sm:mt-0 px-0 sm:px-4 sm:py-8">
                <Card
                    variant="bottom-sheet"
                    noPadding
                    className="border border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur-xl"
                >
                    <CardHeader className="hidden sm:block w-full border-b border-[var(--color-border)] bg-gradient-to-br from-primary-900 to-primary-800 px-6 pt-8 pb-6 text-center text-white rounded-t-[24px]">
                        {showLogo && (
                            <div className="mb-4 flex justify-center items-center">
                                <CaskmafDatahubLogoCompact width={300} height={54} />
                            </div>
                        )}
                        <h1 className="mb-2 text-2xl font-bold text-white">{title}</h1>
                        {footerText && footerLinkText && footerLinkTo && (
                            <p className="text-sm text-primary-100/85">
                                {footerText}{" "}
                                <Link
                                    to={footerLinkTo}
                                    className="font-semibold text-white hover:text-primary-100 transition-colors"
                                >
                                    {footerLinkText}
                                </Link>
                            </p>
                        )}
                    </CardHeader>

                    <CardBody className="px-6 pb-8 pt-8 sm:px-8 sm:pt-6 bg-[var(--color-surface)] text-[var(--color-text)]">                        <div className="sm:hidden mb-6 text-center">
                        {footerText && footerLinkText && footerLinkTo && (
                            <p className="text-[15px] text-slate-600">
                                {footerText}{" "}
                                <Link
                                    to={footerLinkTo}
                                    className="font-bold text-[var(--color-primary-300)] hover:text-[var(--color-primary-400)] transition-colors"
                                >
                                    {footerLinkText}
                                </Link>
                            </p>
                        )}
                    </div>

                        {children}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};
