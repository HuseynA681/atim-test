import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Catalog from "./components/Catalog";
import Workspace from "./components/Workspace";
import Exam from "./components/Exam";
import Verification from "./components/Verification";
import Corporate from "./components/Corporate";
import Mentorship from "./components/Mentorship";
import Career from "./components/Career";
import AdminPanel from "./components/AdminPanel";
import AIChatBot from "./components/AIChatBot";
import Login from "./components/Login";

import { SEEDED_COURSES, SEEDED_MENTORS, CORPORATE_INITIAL_EMPLOYEES, SEEDED_JOBS } from "./data";
import { Course, Certificate, User, Mentor, CourseApplication } from "./types";
import { Star, Clock, Award, BookOpen, AlertCircle, Sparkles, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("catalog");
  const [darkMode, setDarkMode] = useState<boolean>(true);

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem("atim_courses_db");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return SEEDED_COURSES;
  });

  const [selectedCourseDetail, setSelectedCourseDetail] = useState<Course | null>(null);

  // Load and manage registered users database
  const [users, setUsers] = useState<User[]>([]);
  const [adminAuthInput, setAdminAuthInput] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Load users from MySQL on mount
  React.useEffect(() => {
    fetch("/api/users")
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch(err => console.error("Failed to fetch users:", err));
  }, []);

  // Track currently active session
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Default to null (guest)

  // Load and manage mentors database dynamically with persistence
  const [mentors, setMentors] = useState<Mentor[]>(() => {
    const saved = localStorage.getItem("atim_mentors_db");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return SEEDED_MENTORS;
  });

  // Pre-load default state certificates
  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const saved = localStorage.getItem("atim_certificates_db");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Load and manage course registration applications
  const [applications, setApplications] = useState<CourseApplication[]>(() => {
    const saved = localStorage.getItem("atim_applications_db");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [enrollModalCourseId, setEnrollModalCourseId] = useState<string | null>(null);

  // Centralized persistence Effects
  React.useEffect(() => {
    localStorage.setItem("atim_certificates_db", JSON.stringify(certificates));
  }, [certificates]);

  React.useEffect(() => {
    localStorage.setItem("atim_courses_db", JSON.stringify(courses));
  }, [courses]);

  React.useEffect(() => {
    if (currentUser) {
      localStorage.setItem("atim_loggedInUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("atim_loggedInUser");
    }
  }, [currentUser]);

  React.useEffect(() => {
    localStorage.setItem("atim_mentors_db", JSON.stringify(mentors));
  }, [mentors]);

  React.useEffect(() => {
    localStorage.setItem("atim_applications_db", JSON.stringify(applications));
  }, [applications]);

  // Persistent Handlers
  const handleCreateCourse = (newCourse: Course) => {
    setCourses(prev => [...prev, newCourse]);
  };

  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourses(prev => prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter((c) => c.id !== courseId));
  };

  const handleCreateUser = (username: string, fullName: string, role: "admin" | "co-admin" | "student" | "corporate" | "worker") => {
    const exists = users.some((u) => u.username === username);
    if (exists) return false;
    
    const createdAt = new Date().toLocaleDateString("az-AZ");
    const newUser: User = {
      username,
      fullName,
      role,
      createdAt
    };

    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    }).then(() => setUsers(prev => [...prev, newUser]));
    
    return true;
  };

  const handleUpdatePassword = (username: string, passwordInput: string) => {
    fetch(`/api/users/${username}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passwordInput })
    }).then(() => {
      setUsers(prev => prev.map(u => u.username === username ? { ...u, password: passwordInput } : u));
    });

    // Sync active session if this is the active user
    if (currentUser && currentUser.username === username) {
      setCurrentUser({ ...currentUser, password: passwordInput });
    }
  };

  const handleDeleteUser = (username: string) => {
    if (currentUser && username === currentUser.username) return false;
    const updated = users.filter((u) => u.username !== username);
    setUsers(updated);
    return true;
  };

  const handleResetPassword = (username: string) => {
    const updated = users.map((u) => {
      if (u.username === username) {
        const { password: _, ...rest } = u;
        return rest;
      }
      return u;
    });
    setUsers(updated as User[]);
  };

  const handleUpdateMentors = (updatedMentors: Mentor[]) => {
    setMentors(updatedMentors);
  };

  const handleLogout = () => {
    setActiveTab("catalog");
    setCurrentUser(null);
    setIsAdminAuthenticated(false);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setShowLoginModal(false);
  };

  // Handle student course enrollment application submission
  const handleEnrollCourse = (courseId: string, motivation: string) => {
    if (!currentUser) return;
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const newApp: CourseApplication = {
      id: `app-${Date.now()}`,
      username: currentUser.username,
      fullName: currentUser.fullName,
      courseId: courseId,
      courseTitle: course.title,
      motivation: motivation,
      submittedAt: new Date().toLocaleDateString("az-AZ") + " " + new Date().toLocaleTimeString("az-AZ").slice(0, 5),
      status: "Gözləmədə",
    };

    const updatedApps = [...applications, newApp];
    setApplications(updatedApps);
  };

  const handleApproveApplication = (appId: string) => {
    const application = applications.find((a) => a.id === appId);
    if (!application) return;

    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: "Təsdiqləndi" } : app))
    );

    setCourses((prev) =>
      prev.map((c) =>
        c.id === application.courseId ? { ...c, isEnrolled: true, progress: 0 } : c
      )
    );
  };

  const handleRejectApplication = (appId: string) => {
    const application = applications.find((a) => a.id === appId);
    if (!application) return;

    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: "Rədd edilib" } : app))
    );

    setCourses((prev) =>
      prev.map((c) =>
        c.id === application.courseId ? { ...c, isEnrolled: false } : c
      )
    );
  };

  const handleRequestEnroll = (courseId: string) => {
    if (!currentUser) {
      alert("Zəhmət olmasa təlimə yazılmaq üçün əvvəlcə portala giriş edin!");
      return;
    }
    setEnrollModalCourseId(courseId);
  };

  // Toggle checklist lesson progress update
  const handleToggleLessonCompleteness = (courseId: string, lessonId: number) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (course.id === courseId) {
          const updatedSyllabus = course.syllabus.map((l) =>
            l.id === lessonId ? { ...l, completed: !l.completed } : l
          );
          const completedCount = updatedSyllabus.filter((s) => s.completed).length;
          const totalCount = updatedSyllabus.length;
          const percentage = Math.round((completedCount / totalCount) * 100) || 0;
          const finalProgress = Math.min(percentage, 100);

          return {
            ...course,
            syllabus: updatedSyllabus,
            progress: finalProgress,
          };
        }
        return course;
      })
    );
  };

  // Save student course unique notes
  const handleSaveCourseNotes = (courseId: string, newNotes: string) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (course.id === courseId) {
          return { ...course, notes: newNotes };
        }
        return course;
      })
    );
  };

  // Handle dynamic dynamic exam certificate generation
  const handleGenerateCertificate = (courseName: string, score: number, type: "Uğur Sertifikatı" | "İştirak Sertifikatı") => {
    // Check if certificate has already been generated
    const exists = certificates.some((c) => c.courseName === courseName);
    if (exists) return;

    const newId = `ATİM-2026-EX${Math.floor(100 + Math.random() * 900)}`;
    const newCert: Certificate = {
      id: newId,
      userName: currentUser ? currentUser.fullName : "Həsən Ağazadə",
      courseName,
      score,
      type,
      issueDate: "14 İyun 2026",
      verified: true,
      qrCodeValue: `https://atim.edu.az/verify?id=${newId}`
    };

    setCertificates((prev) => [newCert, ...prev]);
  };

  // Handle modal view trigger
  const handleOpenCourseDetails = (courseId: string) => {
    const courseObj = courses.find((c) => c.id === courseId);
    if (courseObj) {
      setSelectedCourseDetail(courseObj);
    }
  };

  const handleLaunchExamFromCourse = (category: string, courseName: string) => {
    setActiveTab("exam");
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminAuthInput === "admin123") { // Admin panel üçün təyin edilən şifrə
      setIsAdminAuthenticated(true);
      setAdminAuthInput("");
    } else {
      alert("Yanlış şifrə!");
    }
  };

  return (
    <div className={`min-h-screen font-sans ${darkMode ? "bg-[#080d1a] text-slate-100" : "bg-slate-50 text-slate-900"} transition-colors duration-200 flex flex-col`}>
      {/* Dynamic Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLogin={() => setShowLoginModal(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "catalog" && (
              <Catalog
                courses={courses}
                onEnroll={handleRequestEnroll}
                onSelectCourse={handleOpenCourseDetails}
                darkMode={darkMode}
                setActiveTab={setActiveTab}
                currentUser={currentUser}
                applications={applications}
              />
            )}

            {activeTab === "verify" && (
              <Verification
                certificates={certificates}
                darkMode={darkMode}
              />
            )}
            
            {/* New Student Section */}
            {activeTab === "student-section" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8" // Add spacing between components
              >
                <Workspace
                  courses={courses}
                  onToggleLesson={handleToggleLessonCompleteness}
                  onSaveNotes={handleSaveCourseNotes}
                  onGoToExam={handleLaunchExamFromCourse}
                  darkMode={darkMode}
                />
                <Exam
                  enrolledCourses={courses.filter((c) => c.isEnrolled)}
                  onGenerateCertificate={handleGenerateCertificate}
                  darkMode={darkMode}
                />
              </motion.div>
            )}

            {/* New Corporate Section */}
            {activeTab === "corporate-section" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8" // Add spacing between components
              >
                <Corporate initialEmployees={CORPORATE_INITIAL_EMPLOYEES} courses={courses} darkMode={darkMode} />
                <Mentorship mentors={mentors} onUpdateMentors={handleUpdateMentors} darkMode={darkMode} />
                <Career vacancies={SEEDED_JOBS} darkMode={darkMode} />
              </motion.div>
            )}

            {activeTab === "admin" && (
              !isAdminAuthenticated ? (
                <div className="max-w-md mx-auto mt-20 p-8 rounded-3xl border border-slate-800 bg-[#0b1226] text-center space-y-6">
                  <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto">
                    <Shield className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold">Admin Girişi</h2>
                    <p className="text-xs text-slate-400">Bu bölməyə daxil olmaq üçün inzibatçı şifrəsini daxil edin.</p>
                  </div>
                  <form onSubmit={handleAdminAuth} className="space-y-4">
                    <input
                      type="password"
                      placeholder="Admin şifrəsi"
                      value={adminAuthInput}
                      onChange={(e) => setAdminAuthInput(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all"
                    >
                      Giriş Et
                    </button>
                  </form>
                </div>
              ) : (
                <AdminPanel
                  users={users}
                  onCreateUser={handleCreateUser}
                  onDeleteUser={handleDeleteUser}
                  onResetPassword={handleResetPassword}
                  onSetPassword={handleUpdatePassword}
                  mentors={mentors}
                  onUpdateMentors={handleUpdateMentors} // Keep this, it's for admin panel
                  darkMode={darkMode}
                  currentUser={currentUser || { username: 'admin', fullName: 'Sistem Admin', role: 'admin' }}
                  courses={courses}
                  onCreateCourse={handleCreateCourse}
                  onUpdateCourse={handleUpdateCourse}
                  onDeleteCourse={handleDeleteCourse}
                  applications={applications}
                  onApproveApplication={handleApproveApplication}
                  onRejectApplication={handleRejectApplication}
                />
              )
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Login Modal Overlay */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md p-4">
              <Login 
                users={users} 
                onLoginSuccess={handleLoginSuccess} 
                onUpdateUserPassword={handleUpdatePassword} 
                darkMode={darkMode} 
              />
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-6 right-6 text-white hover:text-slate-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Course Detail Modal Drawer */}
      <AnimatePresence>
        {selectedCourseDetail && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-2xl p-6 rounded-3xl border ${
                darkMode ? "bg-[#0b1226] border-slate-805 text-slate-100" : "bg-white border-slate-300 text-slate-900"
              } max-h-[90vh] overflow-y-auto space-y-6 relative`}
            >
              <button
                id="close-details-drawer-modal"
                onClick={() => setSelectedCourseDetail(null)}
                className="absolute top-4 right-4 text-xs font-bold bg-[#1e294b] hover:bg-[#253569] text-blue-400 rounded-lg px-2.5 py-1.5 transition-all"
              >
                Geri Keç [X]
              </button>

              {/* Course Detail Core Metadata */}
              <div className="space-y-2 pt-4">
                <span className="text-[10px] bg-blue-600/10 text-[#00bfff] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  {selectedCourseDetail.category} Təlim Proqramı
                </span>
                <h2 className="text-xl md:text-2xl font-extrabold select-text tracking-tight">{selectedCourseDetail.title}</h2>
                <p className="text-xs text-slate-400 italic">
                  Təlimçi konsultant: <strong className="text-slate-350">{selectedCourseDetail.trainer}</strong> ({selectedCourseDetail.trainerRole})
                </p>
              </div>

              {/* Course Long Description details */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Proqram haqqında ümumi rəy:</span>
                <p className="text-xs leading-relaxed text-slate-400 select-text">
                  {selectedCourseDetail.longDescription}
                </p>
              </div>

              {/* Syllabus items */}
              <div className="space-y-4 pt-2 border-t border-slate-500/10">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Dərslər və mövzular ({selectedCourseDetail.syllabus.length})</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedCourseDetail.syllabus.map((lesson) => (
                    <div key={lesson.id} className="p-3 bg-slate-500/5 rounded-xl border border-slate-500/10 flex items-start space-x-2">
                      <div className="w-5 h-5 rounded bg-blue-600/10 text-blue-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                        {lesson.id}
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-200">{lesson.title}</div>
                        <span className="text-[10px] text-slate-500 font-mono">{lesson.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills to gain */}
              <div className="space-y-2 border-t border-slate-500/10 pt-4">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest block">Mənimsəniləcək Bacarıqlar:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedCourseDetail.skillsOutcome.map((skill, idx) => (
                    <span key={idx} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer pricing and CTA inside details popup */}
              <div className="border-t border-slate-500/10 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Proqram Ödənişi</span>
                  <span className="text-lg font-extrabold text-[#0066cc] font-sans">{selectedCourseDetail.price} AZN</span>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedCourseDetail(null)}
                    className="px-4 py-2 rounded-xl text-xs bg-slate-800 text-slate-350 hover:bg-slate-705 font-bold transition-all"
                  >
                    Bağla
                  </button>

                  {selectedCourseDetail.isEnrolled ? (
                    <button
                      disabled
                      className="px-5 py-2 rounded-xl text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 font-bold flex items-center space-x-1"
                    >
                      <span>Artıq Qoşulub</span>
                    </button>
                  ) : (
                    <button
                      id={`modal-enroll-submit-${selectedCourseDetail.id}`}
                      onClick={() => {
                        handleRequestEnroll(selectedCourseDetail.id);
                        setSelectedCourseDetail(null);
                      }}
                      className="px-5 py-2 rounded-xl text-xs text-white bg-blue-600 hover:bg-blue-700 font-extrabold shadow-md shadow-blue-500/10 transition-all font-sans"
                    >
                      Dərsə Fiziki Müraciət Göndər
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Centered Modern Course Enrollment Request Motivation Modal */}
      <AnimatePresence>
        {enrollModalCourseId && (
          (() => {
            const course = courses.find((c) => c.id === enrollModalCourseId);
            if (!course) return null;
            return (
              <div id="course-enroll-modal-overlay" className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className={`w-full max-w-lg p-6 sm:p-8 rounded-3xl border ${
                    darkMode ? "bg-[#0b1022] border-[#222f5a] text-slate-100" : "bg-white border-slate-200 text-slate-900"
                  } shadow-2xl space-y-6 relative overflow-hidden`}
                >
                  <button
                    onClick={() => setEnrollModalCourseId(null)}
                    className="absolute top-4 right-4 text-slate-450 hover:text-slate-250 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="space-y-2">
                    <span className="text-[10px] bg-blue-600/10 text-[#00bfff] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Təlimə Müraciət Formu</span>
                    <h3 className="text-lg font-extrabold tracking-tight">"{course.title}" müraciəti</h3>
                    <p className="text-xs text-slate-400">Təlim müraciətinizi doldurun. Sistem inzibatçısı (Staff) müraciəti təsdiqlədikdən sonra dərslərə keçid əldə edəcəksiniz. Dərslərimiz tamamilə yerində keçəcəkdir.</p>
                  </div>

                  {/* Mandate warning Box requested by user */}
                  <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-orange-500 font-extrabold">
                      <AlertCircle className="w-4 h-4 text-orange-500 animate-pulse" />
                      <span>FİZİKİ (ƏYANİ) DƏRSLƏR MƏCBURİYYƏTİ</span>
                    </div>
                    <p className="text-slate-350 leading-relaxed text-[11px]">
                      Diqqət! Bu təlimin dərsləri <strong>tam olaraq fiziki olaraq (yerindəcə, korpusumuzda əyani)</strong> keçiriləcəkdir. Onlayn və ya uzaqdan iştirak forması mövcud deyil. Sinif şəraitində əyani iştirak etməyi təsdiqləyirsinizsə müraciət edin.
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const motivation = (form.elements.namedItem("motivation") as HTMLTextAreaElement).value.trim();
                      const confirmCheck = (form.elements.namedItem("confirmCheck") as HTMLInputElement).checked;
                      
                      if (!motivation) {
                        alert("Xahiş olunur müraciət mətnini daxil edin.");
                        return;
                      }
                      if (!confirmCheck) {
                        alert("Təlimin fiziki olaraq keçiriləcəyini təsdiqləməlisiniz.");
                        return;
                      }

                      handleEnrollCourse(course.id, motivation);
                      setEnrollModalCourseId(null);
                      alert("Təbrik edirik! Təlim müraciətiniz uğurla göndərildi. Staff panelində müraciətiniz gözləmədədir.");
                    }}
                    className="space-y-4 text-left"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Müraciət səbəbiniz və ya Motivasiya məktubu (Məcburidir):
                      </label>
                      <textarea
                        name="motivation"
                        rows={4}
                        placeholder="Zəhmət olmasa bu təlimə niyə qoşulmaq istədiyiniz, təcrübəniz və hədəfləriniz barədə qısa müraciət yazın (Staff tərəfindən oxunacaq)..."
                        className={`w-full p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                          darkMode ? "bg-[#121f45] border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"
                        }`}
                        required
                      />
                    </div>

                    <div className="flex items-start space-x-2.5">
                      <input
                        type="checkbox"
                        name="confirmCheck"
                        id="confirmCheck"
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-800 h-4 w-4 shrink-0"
                        required
                      />
                      <label htmlFor="confirmCheck" className="text-[11px] text-slate-350 leading-snug cursor-pointer font-medium select-none">
                        Mən dərslərin yalnız və yalnız <strong>fiziki olaraq yerində (onlayn olmadan)</strong> baş tutacağını tam başqa düşür və bu şərti qəbul edirəm.
                      </label>
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10"
                      >
                        Müraciəti Göndər
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnrollModalCourseId(null)}
                        className={`px-4 py-2.5 font-bold text-xs rounded-xl border transition-all ${
                          darkMode ? "border-slate-800 text-slate-400 hover:bg-slate-800" : "border-slate-300 text-slate-705 hover:bg-slate-50"
                        }`}
                      >
                        Ləğv et
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            );
          })()
        )}
      </AnimatePresence>

      {/* Interactive Floater AI Chatbot */}
      <AIChatBot darkMode={darkMode} />

      {/* Subtle brand footer */}
      <footer className={`py-6 border-t text-center text-xs text-slate-500 mt-8 ${
        darkMode ? "bg-[#040811] border-slate-800" : "bg-white border-slate-105"
      }`}>
        <p>© 2026 ATİM (Skills, Training &amp; Certification Ecosystem). Bütün hüquqlar SOCAR və ATİM çərçivəsində qorunur.</p>
        <p className="text-[10px] font-mono text-slate-600 mt-1">Sistem rəqəmsallıq səviyyəsi: Canlı Ekosistem v3.5</p>
      </footer>
    </div>
  );
}
