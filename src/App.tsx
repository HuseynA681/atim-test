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
import About from "./components/About"; // Import the new About component

import { SEEDED_COURSES, SEEDED_MENTORS, CORPORATE_INITIAL_EMPLOYEES, SEEDED_JOBS } from "./data";
import { Course, Certificate, User, Mentor, CourseApplication } from "./types";
import { Star, Clock, Award, BookOpen, AlertCircle, Sparkles, Check, X, Shield, Video, Calendar as CalendarIcon, MessageSquare, Send, Plus, Building, Users, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem("atim_activeTab") || "catalog";
  });
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
  const [meetings, setMeetings] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [chatGroups, setChatGroups] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [adminAuthInput, setAdminAuthInput] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("atim_admin_auth") === "true";
  });
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

  // Load meetings from MySQL on mount
  React.useEffect(() => {
    fetch("/api/meetings")
      .then(res => (res.ok ? res.json() : []))
      .then(data => setMeetings(data))
      .catch(err => console.error("Failed to fetch meetings:", err));
  }, []);

  // Load calendar events from MySQL on mount
  React.useEffect(() => {
    fetch("/api/calendar")
      .then(res => (res.ok ? res.json() : []))
      .then(data => setCalendarEvents(data))
      .catch(err => console.error("Failed to fetch calendar events:", err));
  }, []);

  // Load chat groups from MySQL on mount
  React.useEffect(() => {
    fetch("/api/chat-groups")
      .then(res => (res.ok ? res.json() : []))
      .then(data => setChatGroups(data))
      .catch(err => console.error("Failed to fetch chat groups:", err));
  }, []);

  // Track currently active session
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("atim_loggedInUser");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  }); // Load from localStorage on init

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
    localStorage.setItem("atim_activeTab", activeTab);
  }, [activeTab]);

  React.useEffect(() => {
    localStorage.setItem("atim_admin_auth", String(isAdminAuthenticated));
  }, [isAdminAuthenticated]);

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

  const handleCreateUser = (username: string, fullName: string, role: User["role"]) => {
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
    
    return fetch(`/api/users/${username}`, {
      method: "DELETE"
    }).then(res => {
      if (!res.ok) return false;
      setUsers(prev => prev.filter(u => u.username !== username));
      return true;
    }).catch(() => false);
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

  const handleCreateMeeting = (title: string, type: "online" | "physical") => {
    if (!currentUser) return;
    const meetingData = {
      title,
      type,
      meeting_link: type === "online" ? "https://zoom.us/j/atim-meeting" : null,
      location: type === "physical" ? "ATİM Cənub Korpusu" : null,
      start_time: new Date().toLocaleString("az-AZ"),
      creator: currentUser.username
    };

    fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(meetingData)
    }).then(res => {
      if (res.ok) {
        fetch("/api/meetings").then(r => r.json()).then(data => setMeetings(data));
      }
    });
  };

  // Calendar event creation
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventStartTime, setNewEventStartTime] = useState("");
  const [newEventTargetRole, setNewEventTargetRole] = useState<string>("student");

  const handleCreateCalendarEvent = () => {
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "co-admin")) {
      alert("Bu əməliyyat üçün icazəniz yoxdur.");
      return;
    }
    if (!newEventTitle || !newEventStartTime) {
      alert("Başlıq və Başlama vaxtı boş ola bilməz.");
      return;
    }

    const eventData = {
      title: newEventTitle,
      description: newEventDescription,
      start_time: newEventStartTime,
      type: "event", // Default type for now
      target_role: newEventTargetRole,
    };

    fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData)
    }).then(res => {
      if (res.ok) {
        setShowAddEventModal(false);
        setNewEventTitle("");
        setNewEventDescription("");
        setNewEventStartTime("");
        setNewEventTargetRole("student");
        fetch("/api/calendar").then(r => r.json()).then(data => setCalendarEvents(data));
      } else {
        alert("Tədbir əlavə edilərkən xəta baş verdi.");
      }
    });
  };

  // Chat group and message handling
  const [selectedChatGroupId, setSelectedChatGroupId] = useState<number | null>(null);
  const [newChatMessage, setNewChatMessage] = useState("");
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  React.useEffect(() => {
    if (selectedChatGroupId) {
      fetch(`/api/chat-messages/${selectedChatGroupId}`)
        .then(res => (res.ok ? res.json() : []))
        .then(data => setChatMessages(data))
        .catch(err => console.error("Failed to fetch chat messages:", err));
    } else {
      setChatMessages([]);
    }
  }, [selectedChatGroupId]);

  const handleCreateChatGroup = () => {
    // Logic for creating chat group
  };

  const handleSendChatMessage = () => {
    // Logic for sending chat message
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
            
            {/* Student Section: Shows Workspace/Exam to students, or User Management summary to Admin */}
            {activeTab === "student-section" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {currentUser?.role === "admin" || currentUser?.role === "co-admin" || currentUser?.role === "worker" ? (
                  <div className="p-8 rounded-3xl bg-blue-600/5 border border-blue-500/20 space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold text-slate-100">Tələbə İdarəetmə</h2>
                      {/* Admin/Co-admin can create users */}
                      {(currentUser?.role === "admin" || currentUser?.role === "co-admin") && (
                        <button 
                          onClick={() => setActiveTab("admin")}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> Yeni Tələbə Əlavə Et
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {users.filter(u => u.role === "student").map(student => (
                        <div key={student.username} className="p-4 bg-slate-900/50 rounded-2xl flex justify-between items-center border border-slate-800">
                          <div>
                            <div className="font-bold">{student.fullName}</div>
                            <div className="text-xs text-slate-500">@{student.username}</div>
                          </div>
                          {/* Admin/Co-admin can manage users */}
                          {(currentUser?.role === "admin" || currentUser?.role === "co-admin") && (
                          <button
                            onClick={() => setActiveTab("admin")}
                            className="text-xs text-blue-400 font-bold hover:underline"
                          >
                            Profilə bax / Redaktə et
                          </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : currentUser?.role === "student" ? (
                  <div className="space-y-8">
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
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-500">Bu bölməyə baxmaq üçün tələbə girişi lazımdır.</div>
                )}
              </motion.div>
            )}

            {/* Corporate Section */}
            {activeTab === "corporate-section" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {(currentUser?.role === "admin" || currentUser?.role === "co-admin") && (
                  <div className="p-8 rounded-3xl bg-amber-600/5 border border-amber-500/20 mb-8">
                    <h2 className="text-xl font-bold mb-4">Korporativ Müştəri İdarəetmə</h2>
                    <p className="text-sm text-slate-400">Şirkət hesablarını və işçi siyahılarını buradan idarə edirsiniz.</p>
                  </div>
                )}
                <Corporate initialEmployees={CORPORATE_INITIAL_EMPLOYEES} courses={courses} darkMode={darkMode} />
                <Mentorship mentors={mentors} onUpdateMentors={handleUpdateMentors} darkMode={darkMode} />
              </motion.div>
            )}

            {/* Worker Section: Meetings */}
            {activeTab === "worker-section" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-3xl bg-emerald-600/5 border border-emerald-500/20">
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Video className="w-6 h-6" /> Görüş və Təlim Platforması
                </h2>
                <p className="text-xs text-slate-400 mb-6">İşçi olaraq burada həm fiziki, həm də onlayn görüşlər/təlimlər təyin edə bilərsiniz.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   <button 
                     onClick={() => handleCreateMeeting("Yeni Onlayn Görüş", "online")}
                     className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-left hover:border-blue-500 transition-all group"
                   >
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500 text-blue-500 group-hover:text-white transition-all">
                        <Video className="w-5 h-5" />
                      </div>
                      <span className="font-bold block">Yeni Onlayn Görüş</span>
                      <span className="text-[10px] text-slate-500 italic">Zoom / Teams inteqrasiyası</span>
                   </button>
                   <button 
                     onClick={() => handleCreateMeeting("Yeni Fiziki Təlim", "physical")}
                     className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-left hover:border-emerald-500 transition-all group"
                   >
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500 text-emerald-500 group-hover:text-white transition-all">
                        <Building className="w-5 h-5" />
                      </div>
                      <span className="font-bold block">Yeni Fiziki Təlim</span>
                      <span className="text-[10px] text-slate-500 italic">Məkan: ATİM Cənub Korpusu</span>
                   </button>
                </div>

                {meetings.length > 0 && (
                  <div className="mt-12 space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Aktiv Görüşlər ({meetings.length})</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {meetings.map((m: any) => (
                        <div key={m.id} className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${m.type === 'online' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                              {m.type === 'online' ? <Video className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="font-bold text-sm">{m.title}</div>
                              <div className="text-[10px] text-slate-500">{m.start_time} • {m.creator} tərəfindən</div>
                            </div>
                          </div>
                          <button className="text-[10px] font-bold text-blue-400 hover:underline">Detallar</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Calendar Tab */}
            {activeTab === "calendar" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-3xl bg-blue-900/10 border border-blue-800/20">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black flex items-center gap-3"><CalendarIcon className="w-8 h-8 text-blue-500" /> Ümumi Təqvim</h2>
                  {(currentUser?.role === "admin" || currentUser?.role === "co-admin") && (
                    <button className="bg-blue-600 px-4 py-2 rounded-xl text-xs font-bold">Tədbir Əlavə Et</button>
                  )}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {["B.e", "Ç.a", "Ç", "C.a", "C", "Ş", "B"].map(d => <div key={d} className="text-center text-[10px] font-bold text-slate-500 uppercase py-2">{d}</div>)}
                  {Array.from({ length: 31 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-slate-900/50 border border-slate-800 rounded-xl p-2 hover:border-blue-500 transition-all cursor-pointer relative">
                      <span className="text-[10px] font-mono text-slate-500">{i + 1}</span>
                      {i === 14 && <div className="absolute bottom-2 left-2 right-2 h-1 bg-blue-500 rounded-full"></div>}
                      {calendarEvents.filter((e: any) => new Date(e.start_time).getDate() === i + 1).map((event: any) => (
                        <div key={event.id} className="text-[8px] bg-blue-500/20 text-blue-300 rounded-full px-1 mt-1 truncate">
                          {event.title}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                {calendarEvents.length === 0 && (
                  <div className="text-center py-10 text-slate-500 text-sm">
                    Hələ heç bir təqvim tədbiri yoxdur.
                  </div>
                )}
              </motion.div>
            )}

            {/* Chat Tab */}
            {activeTab === "chat" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[600px]">
                <div className="md:col-span-1 bg-slate-900/50 border border-slate-800 rounded-3xl p-4 overflow-y-auto">
                  <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase">Qruplar</h3>
                    {(currentUser?.role === "admin" || currentUser?.role === "co-admin") && (
                      <button onClick={() => setShowCreateGroupModal(true)} className="text-blue-400 hover:text-blue-300">
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {chatGroups.map((group: any) => (
                      <div 
                        key={group.id} 
                        onClick={() => setSelectedChatGroupId(group.id)}
                        className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer ${selectedChatGroupId === group.id ? "bg-blue-600" : "hover:bg-slate-800"}`}
                      >
                        <Users className="w-4 h-4" /> {group.name}
                      </div>
                    ))}
                    {chatGroups.length === 0 && (
                      <div className="text-xs text-slate-500 text-center py-4">
                        Hələ heç bir qrup yoxdur.
                      </div>
                    )}
                  </div>
                </div>
                <div className="md:col-span-3 bg-slate-900/50 border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-slate-800 font-bold text-sm">
                    {selectedChatGroupId ? chatGroups.find(g => g.id === selectedChatGroupId)?.name : "Qrup Seçin"}
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {chatMessages.map((msg: any) => (
                      <div key={msg.id} className={`flex ${msg.sender === currentUser?.username ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === currentUser?.username
                            ? "bg-blue-600 text-white rounded-tr-none"
                            : "bg-slate-800 text-slate-100 rounded-tl-none"
                        }`}>
                          <span className="font-bold block text-[10px] text-slate-400">{msg.sender}</span>
                          {msg.text}
                          <span className="block text-[8px] text-slate-500 text-right mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-slate-950/50 flex gap-2">
                    <input type="text" placeholder="Mesajınızı yazın..." value={newChatMessage} onChange={(e) => setNewChatMessage(e.target.value)} className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500" />
                    <button onClick={handleSendChatMessage} disabled={!selectedChatGroupId || !newChatMessage.trim()} className="p-2 bg-blue-600 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
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

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddEventModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md p-6 rounded-3xl border ${
                darkMode ? "bg-[#0b1226] border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
              } shadow-2xl space-y-6 relative`}
            >
              <button
                onClick={() => setShowAddEventModal(false)}
                className="absolute top-4 right-4 text-slate-450 hover:text-slate-250 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-extrabold tracking-tight">Yeni Təqvim Tədbiri Əlavə Et</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleCreateCalendarEvent(); }} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Başlıq</label>
                  <input
                    type="text"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className={`w-full p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                      darkMode ? "bg-[#121f45] border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Təsvir</label>
                  <textarea
                    value={newEventDescription}
                    onChange={(e) => setNewEventDescription(e.target.value)}
                    className={`w-full p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                      darkMode ? "bg-[#121f45] border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Başlama Vaxtı</label>
                  <input
                    type="datetime-local"
                    value={newEventStartTime}
                    onChange={(e) => setNewEventStartTime(e.target.value)}
                    className={`w-full p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                      darkMode ? "bg-[#121f45] border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Hədəf Rol</label>
                  <select
                    value={newEventTargetRole}
                    onChange={(e) => setNewEventTargetRole(e.target.value)}
                    className={`w-full p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                      darkMode ? "bg-[#121f45] border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  >
                    <option value="all">Hamı</option>
                    <option value="student">Tələbə</option>
                    <option value="worker">İşçi</option>
                    <option value="corporate">Korporativ</option>
                    <option value="admin">Admin</option>
                    <option value="co-admin">Co-Admin</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all"
                >
                  Tədbiri Yarat
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Chat Group Modal */}
      <AnimatePresence>
        {showCreateGroupModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md p-6 rounded-3xl border ${
                darkMode ? "bg-[#0b1226] border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
              } shadow-2xl space-y-6 relative`}
            >
              <button onClick={() => setShowCreateGroupModal(false)} className="absolute top-4 right-4 text-slate-450 hover:text-slate-250 transition-colors"><X className="w-5 h-5" /></button>
              <h3 className="text-lg font-extrabold tracking-tight">Yeni Müzakirə Qrupu Yarat</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleCreateChatGroup(); }} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Qrup Adı</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className={`w-full p-3 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                      darkMode ? "bg-[#121f45] border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all">Qrup Yarat</button>
              </form>
            </motion.div>
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
