import React from "react";

interface AtimLogoProps {
  className?: string;
  variant?: "full" | "icon" | "horizontal";
  size?: "sm" | "md" | "lg" | "xl";
  darkMode?: boolean;
}

export default function AtimLogo({ className = "", variant = "full", size = "md", darkMode = true }: AtimLogoProps) {
  // Use Vite's dynamic asset URL resolution to guarantee error-free import without TypeScript type definitions for JPGs
  const logoUrl = new URL("https://github.com/HuseynA681/atim/tree/main/assets/atim.png", import.meta.url).href;

  // Sizing definitions to enforce perfect circles (square bounding boxes)
  const sizeClasses = {
    sm: "w-11 h-11",
    md: "w-20 h-20",
    lg: "w-40 h-40",
    xl: "w-64 h-64",
  };

  if (variant === "icon") {
    return (
      <div className={`aspect-square ${sizeClasses[size]} overflow-hidden rounded-full shadow-sm ${className}`}>
        <img
          src={logoUrl}
          alt="ATİM Logo"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  if (variant === "horizontal") {
    return (
      <div className={`flex items-center space-x-3 cursor-pointer ${className}`}>
        <div className="w-11 h-11 shrink-0 overflow-hidden rounded-full border border-teal-500/10 shadow-sm">
          <img
            src={logoUrl}
            alt="ATİM Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-1">
            <span className={`font-sans font-black tracking-tight text-base ${darkMode ? "text-slate-100" : "text-[#072040]"}`}>
              ATİM
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#caa75d]" />
          </div>
          <span className={`text-[8px] font-mono tracking-widest ${darkMode ? "text-slate-400" : "text-slate-500"} font-bold uppercase`}>
            TƏLİM Ekosistemi
          </span>
        </div>
      </div>
    );
  }

  // Full Brand Logo presentation
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div className={`${sizeClasses[size]} aspect-square overflow-hidden rounded-full shadow-lg shadow-black/10 border-2 border-teal-500/10 animate-fade-in relative`}>
        <img
          src={logoUrl}
          alt="ATİM Azərbaycan Təlim və İnnovasiyalar Mərkəzi"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
