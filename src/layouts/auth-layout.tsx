import React from "react";
import { Link } from "react-router-dom";
import { DirectDataLogo } from "../components/common/DirectDataLogo";
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
        <div className="min-h-[100dvh] flex flex-col relative bg-slate-900 sm:bg-gray-100 sm:justify-center sm:items-center">
            {/* Mobile background/header area */}
            <div className="flex flex-col flex-grow items-center justify-center p-6 text-center sm:hidden text-white min-h-[35vh]">
                {showLogo && (
                    <div className="flex justify-center items-center mb-6">
                        <DirectDataLogo width={100} height={120} />
                    </div>
                )}
                <h1 className="text-2xl font-bold mb-2">{title}</h1>
                {subtitle && <p className="text-gray-300 text-sm max-w-xs">{subtitle}</p>}
            </div>

            {/* Main form container mimicking a bottom sheet on mobile, standard card on desktop */}
            <div className="w-full sm:max-w-md mt-auto sm:mt-0 z-10 transition-transform duration-300 transform translate-y-0">
                <Card variant="bottom-sheet" noPadding>
                    {/* Desktop-only header */}
                    <CardHeader className="hidden sm:block text-center pt-8 pb-6 bg-slate-900 w-full border-b-0 rounded-t-[24px]">
                        {showLogo && (
                            <div className="flex justify-center items-center mb-4">
                                <DirectDataLogo width={80} height={100} />
                            </div>
                        )}
                        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
                        {footerText && footerLinkText && footerLinkTo && (
                            <p className="text-gray-300 text-sm">
                                {footerText}{" "}
                                <Link
                                    to={footerLinkTo}
                                    className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    {footerLinkText}
                                </Link>
                            </p>
                        )}
                    </CardHeader>

                    <CardBody className="p-6 sm:p-8 pt-8 sm:pt-6">
                        {footerText && footerLinkText && footerLinkTo && (
                            <div className="sm:hidden mb-6 text-center">
                                <p className="text-gray-600 text-[15px]">
                                    {footerText}{" "}
                                    <Link
                                        to={footerLinkTo}
                                        className="font-bold text-primary-600 hover:text-primary-700 transition-colors"
                                    >
                                        {footerLinkText}
                                    </Link>
                                </p>
                            </div>
                        )}

                        {children}
                    </CardBody>
                </Card>
            </div>

            {/* Background shape decors (desktop only) */}
            <div className="hidden sm:block absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-primary-100 rounded-full mix-blend-multiply blur-[100px] opacity-60 -z-10"></div>
            <div className="hidden sm:block absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-blue-100 rounded-full mix-blend-multiply blur-[100px] opacity-60 -z-10"></div>
        </div>
    );
};
