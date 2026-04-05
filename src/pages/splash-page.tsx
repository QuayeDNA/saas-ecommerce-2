import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
        <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-slate-900 text-white relative overflow-hidden">
            <div className="z-10 animate-pulse transition-transform duration-1000 transform scale-110">
                <DirectDataLogo width={140} height={160} />
            </div>

            {/* Decorative blurred backgrounds matching the theme */}
            <div className="absolute top-[20%] left-[10%] w-[50vw] h-[50vw] sm:w-[30vw] sm:h-[30vw] bg-primary-500 rounded-full mix-blend-screen blur-[100px] opacity-30 animate-blob"></div>
            <div className="absolute top-[20%] right-[10%] w-[50vw] h-[50vw] sm:w-[30vw] sm:h-[30vw] bg-secondary-500 rounded-full mix-blend-screen blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[20%] left-[20%] w-[60vw] h-[60vw] sm:w-[40vw] sm:h-[40vw] bg-blue-500 rounded-full mix-blend-screen blur-[100px] opacity-30 animate-blob animation-delay-4000"></div>
        </div>
    );
};
