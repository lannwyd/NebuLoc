import { useState } from "react";
import { X } from "lucide-react";

export default function ModalDevices({ isOpen, onClose, title, children }) {

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white rounded-2xl shadow-xl z-50 transition-all duration-300 ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
                
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5">
                    {children}
                </div>
            </div>
        </>
    );
}