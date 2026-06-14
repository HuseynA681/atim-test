import React, { useState } from "react";
import { Menu, X, BookOpen, Briefcase, Award, Users, Building, GraduationCap, Sun, Moon, LogOut, User as UserIcon, Settings, CheckCircle } from "lucide-react";
import { User } from "../types"; // Assuming types.ts is in the parent directory

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  currentUser,
  onLogout,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "catalog", label: "Kataloq", icon: BookOpen, roles: ["admin", "student", "corporate", null] }, // null for not logged in
    { id: "workspace", label: "İş Sahəsi", icon: Briefcase, roles: ["student"] },
    { id: "exam", label: "İmtahan", icon: Award, roles: ["student"] },
    { id: "verify", label: "Doğrulama", icon: CheckCircle, roles: ["admin", "student", "corporate", null] },
    { id: "corporate", label: "Korporativ", icon: Building, roles: ["admin", "corporate"] },
    { id: "mentorship", label: "Mentorluq", icon: Users, roles: ["admin", "student"] },
    { id: "career", label: "Karyera", icon: GraduationCap, roles: ["admin", "student"] },
    { id: "admin", label: "Admin Panel", icon: Settings, roles: ["admin"] },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!currentUser) {
      return item.roles.includes(null); // Show items for non-logged-in users
    }
    return item.roles.includes(currentUser.role);
  });

  return (
    <nav className={`sticky top-0 z-40 w-full backdrop-blur-md transition-colors duration-200 ${
      darkMode ? "bg-[#0b1226]/80 border-b border-slate-800" : "bg-white/80 border-b border-slate-200"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="#" onClick={() => setActiveTab("catalog")} className="flex items-center space-x-2">
              <img className="h-8 w-auto" src={darkMode ? "/logo-dark.png" : "/logo-light.png"} alt="ATIM Logo" /> {/* Placeholder for logo */}
              <span className={`text-xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>ATİM</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {filteredNavItems.map((item) => (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === item.id
                    ? darkMode
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : darkMode
                      ? "text-slate-300 hover:bg-slate-800"
                      : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right side: User, Dark Mode, Logout */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser && (
              <div className="flex items-center space-x-2">
                <UserIcon className={`w-4 h-4 ${darkMode ? "text-slate-400" : "text-slate-600"}`} />
                <span className={`text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                  {currentUser.fullName} ({currentUser.role})
                </span>
              </div>
            )}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full transition-colors duration-200 ${
                darkMode ? "text-yellow-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {currentUser && (
              <button
                onClick={onLogout}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  darkMode ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                <LogOut className="w-4 h-4 inline-block mr-1" /> Çıxış
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md ${
                darkMode ? "text-slate-400 hover:text-white hover:bg-slate-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500`}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className={`md:hidden ${darkMode ? "bg-[#0b1226]" : "bg-white"} pb-4`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {filteredNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  activeTab === item.id
                    ? darkMode
                      ? "bg-blue-600 text-white"
                      : "bg-blue-600 text-white"
                    : darkMode
                      ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-slate-700">
            <div className="flex items-center px-5">
              {currentUser && (
                <div className="flex-shrink-0">
                  <UserIcon className={`h-8 w-8 rounded-full ${darkMode ? "text-slate-400" : "text-slate-600"}`} />
                </div>
              )}
              <div className="ml-3">
                {currentUser && (
                  <>
                    <div className={`text-base font-medium leading-none ${darkMode ? "text-white" : "text-slate-900"}`}>
                      {currentUser.fullName}
                    </div>
                    <div className={`text-sm font-medium leading-none ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      {currentUser.role}
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`ml-auto flex-shrink-0 p-1 rounded-full ${
                  darkMode ? "text-yellow-400 hover:bg-slate-700" : "text-slate-600 hover:bg-slate-100"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white`}
              >
                <span className="sr-only">Toggle dark mode</span>
                {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
            </div>
            <div className="mt-3 px-2 space-y-1">
              {currentUser && (
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                    darkMode ? "text-slate-300 hover:bg-slate-800 hover:text-white" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  Çıxış
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}