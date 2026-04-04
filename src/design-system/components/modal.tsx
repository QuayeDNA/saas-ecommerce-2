import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  mode?: "modal" | "bottom-sheet";
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, mode = "bottom-sheet" }) => {
  if (!isOpen) return null;
  const isBottomSheet = mode === "bottom-sheet";

  return (
    <div className={`fixed inset-0 z-50 flex ${isBottomSheet ? 'items-end' : 'items-center'} justify-center bg-black/50`}>
      <div
        className={`bg-white ${isBottomSheet ? 'rounded-t-[32px] rounded-b-none pb-safe-area animate-slide-in-from-bottom' : 'rounded-lg animate-fade-in mx-2'} shadow-lg max-w-md w-full p-6 relative`}
      >
        {isBottomSheet && (
          <div className="absolute top-0 left-0 right-0 h-8 flex justify-center items-center cursor-pointer" onClick={onClose} aria-hidden="true" >
            <div className="w-12 h-1.5 bg-gray-200 rounded-[10px]" />
          </div>
        )}

        <button
          className={`${isBottomSheet ? 'top-6' : 'top-2'} absolute right-4 text-gray-400 hover:text-black text-xl font-bold focus:outline-none`}
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        {title && <h2 className={`text-lg font-semibold mb-4 text-black ${isBottomSheet ? 'mt-4' : ''}`}>{title}</h2>}
        <div>{children}</div>
      </div>
    </div>
  );
}; 