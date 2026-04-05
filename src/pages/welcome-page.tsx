import { useNavigate } from "react-router-dom";
import { DirectDataLogo } from "../components/common/DirectDataLogo";
import { useAuth } from "../hooks";
import { useEffect } from "react";
import { FaArrowDown } from "react-icons/fa";

export const WelcomePage = () => {
    const { authState } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (authState.isAuthenticated && authState.dashboardUrl) {
            navigate(authState.dashboardUrl);
        }
    }, [authState, navigate]);

    return (
        <div className="min-h-[100dvh] flex flex-col bg-blue-600 text-white relative overflow-hidden items-center justify-between px-6 py-10 selection:bg-blue-400">
            {/* Top Info */}
            <div className="w-full flex flex-col items-center mt-6 animate-fadeIn" style={{ animationDelay: '0.1s', opacity: 0 }}>
                <DirectDataLogo width={85} height={85} className="mb-4 shadow-xl shadow-blue-900/20" />
                <h1 className="text-[2rem] font-extrabold tracking-tight mb-1">DirectData</h1>
                <p className="text-blue-100 text-sm font-medium tracking-wide">Ghana's #1 Data Reseller</p>
            </div>

            {/* Middle Graphic / Illustration */}
            <div className="relative flex-1 flex items-center justify-center w-full max-w-sm my-8 animate-fadeIn" style={{ animationDelay: '0.3s', opacity: 0 }}>
                {/* Phone Wireframe */}
                <div className="w-[110px] h-[190px] border border-white/30 rounded-[24px] flex flex-col items-center pt-6 pb-4 px-4 bg-blue-600/40 backdrop-blur-md z-10 shadow-2xl shadow-blue-900/30">
                    <div className="w-10 h-10 rounded-full bg-white/20 mb-4" />
                    <div className="w-[110%] h-2.5 rounded-full bg-white/20 mb-3" />
                    <div className="w-[90%] h-2.5 rounded-full bg-white/20 mb-3" />
                    <div className="w-[110%] h-2.5 rounded-full bg-white/20" />
                </div>

                {/* Left Floating Element */}
                <div className="absolute top-[10%] left-[8%] w-[4.5rem] h-[4.5rem] border border-white/20 rounded-full flex items-center justify-start">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 -translate-x-[5px]" />
                </div>

                {/* Right Top Floating Element */}
                <div className="absolute top-[25%] right-[10%] w-12 h-12 border border-white/20 rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-400 -translate-y-4" />
                </div>

                {/* Right Bottom Floating Element */}
                <div className="absolute bottom-[10%] right-[12%] w-14 h-14 border border-white/20 rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 translate-x-4 translate-y-3" />
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="w-full max-w-sm flex flex-col items-center animate-fadeIn" style={{ animationDelay: '0.5s', opacity: 0 }}>
                <h2 className="text-[1.75rem] font-extrabold text-center mb-3 leading-[1.15] tracking-tight">
                    Buy Data & Airtime<br/>Instantly
                </h2>
                <p className="text-blue-100 text-center text-[13px] font-medium mb-8 px-4 leading-relaxed tracking-wide">
                    MTN, Telecel & AirtelTigo bundles at the best rates — delivered in seconds.
                </p>

                <div className="w-full flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/register')}
                        className="w-full py-3.5 border border-white/30 rounded-xl font-bold text-[15px] bg-white/10 hover:bg-white/20 active:scale-[0.98] transition-all"
                    >
                        Create Free Account
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-3.5 border border-white/30 rounded-xl font-bold text-[15px] bg-transparent hover:bg-white/10 active:scale-[0.98] transition-all"
                    >
                        Sign In
                    </button>
                </div>

                <p className="text-[11px] text-blue-200 mt-6 font-medium tracking-wide">
                    By continuing you agree to our <a href="#" className="underline underline-offset-2 hover:text-white transition-colors">Terms</a> & <a href="#" className="underline underline-offset-2 hover:text-white transition-colors">Privacy Policy</a>
                </p>

                {/* Optional Scroll Arrow */}
                <div className="mt-8 flex items-center justify-center w-8 h-8 rounded-full border border-white/20 opacity-50 bg-black/10">
                    <FaArrowDown className="text-white text-[10px]" />
                </div>
            </div>

            <style>
                { `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            ` }</style>
        </div>
    );
};
