import React, { useState } from "react";
import { User, Mentor, Course, CourseApplication } from "../types";
import { 
  UserPlus, Users, CheckCircle, AlertCircle, Shield, Sparkles, Key, 
  AlertTriangle, Trash2, RotateCcw, Edit3, UserCheck, HelpCircle, Plus,
  BookOpen, Edit, FileText, Settings, X, GraduationCap, DollarSign, Clock, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdminPanelProps {
  users: User[];
  onCreateUser: (username: string, fullName: string, role: "admin" | "student" | "corporate") => boolean;
  onDeleteUser: (username: string) => boolean;
  onResetPassword: (username: string) => void;
  onSetPassword: (username: string, passwordInput: string) => void;
  mentors: Mentor[];
  onUpdateMentors: (updated: Mentor[]) => void;
  darkMode: boolean;
  currentUser: User;
  courses: Course[];
  onCreateCourse: (course: Course) => void;
  onUpdateCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  applications?: CourseApplication[];
  onApproveApplication?: (appId: string) => void;
  onRejectApplication?: (appId: string) => void;
}

type AdminSection = "users" | "mentors" | "courses" | "applications";

export default function AdminPanel({ 
  users, 
  onCreateUser, 
  onDeleteUser, 
  onResetPassword, 
  onSetPassword, 
  mentors, 
  onUpdateMentors, 
  darkMode,
  currentUser,
  courses,
  onCreateCourse,
  onUpdateCourse,
  onDeleteCourse,
  applications = [],
  onApproveApplication = () => {},
  onRejectApplication = () => {}
}: AdminPanelProps) {
  // Navigation tabs for Admin Panel
  const isSuperAdmin = currentUser.role === "admin";
  
  const [activeAdminSec, setActiveAdminSec] = useState<AdminSection>(
    isSuperAdmin ? "users" : "courses"
  );

  // Reusable Sandbox-friendly Custom Confirmation Dialog Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // User tab local states
  const [newUsername, setNewUsername] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "student" | "corporate">("student");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Manual password modification states
  const [editingUserPass, setEditingUserPass] = useState<string | null>(null);
  const [customPasswordValue, setCustomPasswordValue] = useState("");

  // Mentor creation local states
  const [mName, setMName] = useState("");
  const [mRole, setMRole] = useState("");
  const [mCompany, setMCompany] = useState("");
  const [mCategory, setMCategory] = useState("HSE");
  const [mRate, setMRate] = useState(30);
  const [mExp, setMExp] = useState("");
  const [mentorMessage, setMentorMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New Course creation / editing local states
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [cTitle, setCTitle] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cCategory, setCCategory] = useState("HSE");
  const [cLevel, setCLevel] = useState<"Başlanğıc" | "Orta" | "Yüksək">("Orta");
  const [cDuration, setCDuration] = useState("16 saat / 2 Gün");
  const [cTrainer, setCTrainer] = useState("");
  const [cTrainerRole, setCTrainerRole] = useState("");
  const [cPrice, setCPrice] = useState(150);
  const [cType, setCType] = useState<"Onlayn" | "Əyani" | "Hibrid">("Hibrid");
  const [cCertType, setCCertType] = useState("ATİM Peşəkar Sertifikat");
  const [cSkills, setCSkills] = useState("");
  const [cSyllabusText, setCSyllabusText] = useState("");
  const [courseMessage, setCourseMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Course Form Edit pre-filler
  const handleEditCourseClick = (course: Course) => {
    setEditingCourse(course);
    setCTitle(course.title);
    setCDesc(course.description);
    setCCategory(course.category);
    setCLevel(course.level || "Orta");
    setCDuration(course.duration);
    setCTrainer(course.trainer);
    setCTrainerRole(course.trainerRole);
    setCPrice(course.price);
    setCType(course.type || "Hibrid");
    setCCertType(course.certificateType);
    setCSkills(course.skillsOutcome ? course.skillsOutcome.join(", ") : "");
    setCSyllabusText(course.syllabus ? course.syllabus.map((s) => s.title).join(", ") : "");
  };

  const handleCancelEditCourse = () => {
    setEditingCourse(null);
    setCTitle("");
    setCDesc("");
    setCCategory("HSE");
    setCLevel("Orta");
    setCDuration("16 saat / 2 Gün");
    setCTrainer("");
    setCTrainerRole("");
    setCPrice(150);
    setCType("Hibrid");
    setCCertType("ATİM Peşəkar Sertifikat");
    setCSkills("");
    setCSyllabusText("");
    setCourseMessage(null);
  };

  // Course form submit
  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCourseMessage(null);

    const titleVal = cTitle.trim();
    const descVal = cDesc.trim();
    const trainerVal = cTrainer.trim();
    const trainerRoleVal = cTrainerRole.trim();

    if (!titleVal || !descVal || !trainerVal || !trainerRoleVal) {
      setCourseMessage({ type: "error", text: "Zəhmət olmasa bütün vacib xanaları doldurun." });
      return;
    }

    const syllabusLessons = cSyllabusText.trim()
      ? cSyllabusText.split(",").map((t, idx) => ({
          id: idx + 1,
          title: t.trim(),
          duration: "2 dərslik modul",
          completed: false
        }))
      : [
          { id: 1, title: `${titleVal} Giriş dərsi`, duration: "4 saat", completed: false },
          { id: 2, title: `${titleVal} Təcrübi seminar`, duration: "4 saat", completed: false }
        ];

    const skills = cSkills.trim()
      ? cSkills.split(",").map((s) => s.trim())
      : ["Mövzu üzrə peşəkar biliklər", "HSE sertifikasiyasına hazırlıq"];

    if (editingCourse) {
      const updated: Course = {
        ...editingCourse,
        title: titleVal,
        description: descVal,
        category: cCategory,
        level: cLevel,
        duration: cDuration,
        trainer: trainerVal,
        trainerRole: trainerRoleVal,
        price: Number(cPrice),
        type: cType,
        certificateType: cCertType,
        skillsOutcome: skills,
        lessonsCount: syllabusLessons.length,
        syllabus: syllabusLessons
      };
      onUpdateCourse(updated);
      setCourseMessage({ type: "success", text: `"${titleVal}" təlimi uğurla yeniləndi!` });
      handleCancelEditCourse();
    } else {
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        title: titleVal,
        description: descVal,
        category: cCategory,
        level: cLevel,
        duration: cDuration,
        lessonsCount: syllabusLessons.length,
        rating: 5.0,
        reviewsCount: 0,
        trainer: trainerVal,
        trainerRole: trainerRoleVal,
        price: Number(cPrice),
        type: cType,
        certificateType: cCertType,
        skillsOutcome: skills,
        syllabus: syllabusLessons,
        progress: 0,
        isEnrolled: false
      };
      onCreateCourse(newCourse);
      setCourseMessage({ type: "success", text: `"${titleVal}" adlı yeni təlim uğurla yaradıldı.` });
      handleCancelEditCourse();
    }
  };

  // User form submit
  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const sanitUsername = newUsername.trim().toLowerCase();
    const sanitFullName = newFullName.trim();

    if (!sanitUsername) {
      setMessage({ type: "error", text: "İstifadəçi adı boş ola bilməz." });
      return;
    }

    if (!/^[a-z0-9_]+$/.test(sanitUsername)) {
      setMessage({ type: "error", text: "İstifadəçi adı yalnız kiçik ingilis hərfləri, rəqəm və alt xətt (_) işarəsindən ibarət olmalıdır." });
      return;
    }

    if (!sanitFullName) {
      setMessage({ type: "error", text: "Ad və Soyad qeyd edilməlidir." });
      return;
    }

    const success = onCreateUser(sanitUsername, sanitFullName, newRole);
    if (success) {
      setMessage({
        type: "success",
        text: `"${sanitUsername}" istifadəçi adı ilə yeni hesab uğurla yaradıldı! Şifrəsiz qeydə alındı. İlk girişdə yeni şifrə yaradacaq.`
      });
      setNewUsername("");
      setNewFullName("");
      setNewRole("student");
    } else {
      setMessage({
        type: "error",
        text: `"${sanitUsername}" istifadəçi adı artıq mövcuddur! Fərqli bir ad seçin.`
      });
    }
  };

  // Delete User handler
  const handleDeleteUserClick = (username: string) => {
    if (username === currentUser.username) {
      triggerConfirm("Silmək Mümkün Deyil", "Öz aktiv inzibatçı (Admin) hesabınızı silə bilməzsiniz!", () => {});
      return;
    }

    triggerConfirm(
      "Hesabı Sil",
      `"${username}" istifadəçi hesabını sistemdən tamamilə silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz!`,
      () => {
        const ok = onDeleteUser(username);
        if (ok) {
          setMessage({ type: "success", text: `"${username}" istifadəçisi uğurla silindi.` });
        } else {
          setMessage({ type: "error", text: "İstifadəçini silmək mümkün olmadı." });
        }
      }
    );
  };

  // Reset password to prompt/first login status
  const handleResetPasswordClick = (username: string) => {
    triggerConfirm(
      "Şifrə Sıfırla",
      `"${username}" istifadəçisinin şifrəsini sıfırlamaq istəyirsiniz? Şifrə silinəcək və növbəti girişdə tamamilə yeni şifrə qurmaq tələbi gələcək.`,
      () => {
        onResetPassword(username);
        setMessage({
          type: "success",
          text: `"${username}" istifadəçisinin şifrəsi uğurla sıfırlandı. O növbəti girişdə yeni şifrə təyin edə biləcək.`
        });
      }
    );
  };

  // Commit manual custom password change
  const handleSaveCustomPassword = (username: string) => {
    if (customPasswordValue.length < 4) {
      triggerConfirm("Səhv Şifrə", "Şifrə ən azı 4 simvoldan ibarət olmalıdır.", () => {});
      return;
    }
    onSetPassword(username, customPasswordValue);
    setEditingUserPass(null);
    setCustomPasswordValue("");
    setMessage({
      type: "success",
      text: `"${username}" istifadəçisinin şifrəsi əl ilə yeniləndi: "${customPasswordValue}"`
    });
  };

  // Mentor deletion handler
  const handleDeleteMentorClick = (mentorId: string, mentorName: string) => {
    triggerConfirm(
      "Mentoru Sil",
      `"${mentorName}" adlı mentoru sistem heyətindən silmək istədiyinizə əminsiniz?`,
      () => {
        const updated = mentors.filter((m) => m.id !== mentorId);
        onUpdateMentors(updated);
        setMentorMessage({
          type: "success",
          text: `"${mentorName}" adlı mentor verilənlər bazasından uğurla silindi.`
        });
      }
    );
  };

  // Add new mentor handler
  const handleMentorAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMentorMessage(null);

    if (!mName || !mRole || !mCompany || !mExp) {
      setMentorMessage({ type: "error", text: "Zəhmət olmasa bütün vacib xanaları doldurun." });
      return;
    }

    const newMentor: Mentor = {
      id: `m-${Date.now()}`,
      name: mName,
      role: mRole,
      company: mCompany,
      category: mCategory,
      rating: 5.0,
      reviewsCount: 1,
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200", // professional placeholder
      hourlyRate: mRate,
      experience: mExp,
      availableHours: ["Həftəiçi 19:00 - 21:00", "Şənbə 10:00 - 15:00"]
    };

    onUpdateMentors([...mentors, newMentor]);
    setMName("");
    setMRole("");
    setMCompany("");
    setMExp("");
    setMentorMessage({
      type: "success",
      text: `Yeni expert "${mName}" uğurla mentor siyahısına əlavə edildi!`
    });
  };

  // Delete Course Handler
  const handleDeleteCourseClick = (courseId: string, courseTitle: string) => {
    triggerConfirm(
      "Təlimi Sil",
      `"${courseTitle}" dərsi və ona dair bütün daxili mövzular sistemdən birdəfəlik silinəcək. Şagirdlərin ondan gedişatları silinə bilər. Davam edilsin?`,
      () => {
        onDeleteCourse(courseId);
        setCourseMessage({
          type: "success",
          text: `"${courseTitle}" təlim kursu uğurla silindi.`
        });
      }
    );
  };

  // Stat metrics
  const totalUsers = users.length;
  const pendingPassword = users.filter((u) => !u.password).length;
  const activePassword = users.filter((u) => u.password).length;

  return (
    <div className="space-y-8 select-none">
      {/* Visual SaaS Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${
        darkMode ? "bg-gradient-to-r from-[#0b1226] to-[#121f45] border-slate-800" : "bg-gradient-to-r from-blue-50/20 to-indigo-50/10 border-slate-100"
      }`}>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-[#00bfff]">
            <Shield className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">ATİM CƏNUB KORPUSU</span>
          </div>
          <h2 className="text-2xl font-sans font-extrabold tracking-tight">Sistem İdarəetmə Konsolu</h2>
          <p className="text-slate-400 text-xs max-w-2xl">
            Sistem administratoru olaraq platformada yeni istifadəçi hesabları yarada, təlim dərsləri (“Təlimlər” hissəsi) tərtib edib redaktə edə, şifrələri sıfırlaya və professional mentor heyətini tənzimləyə bilərsiniz.
          </p>
        </div>

        {/* Section select buttons */}
        <div className="flex flex-wrap gap-1 bg-slate-500/10 p-1 rounded-xl shrink-0">
          {isSuperAdmin && (
            <button
              onClick={() => setActiveAdminSec("users")}
              className={`px-3 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 ${
                activeAdminSec === "users"
                  ? darkMode
                    ? "bg-[#1e294b] text-[#00bfff] shadow-sm"
                    : "bg-white text-blue-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-250"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Hesablar ({users.length})</span>
            </button>
          )}
          
          <button
            onClick={() => setActiveAdminSec("courses")}
            className={`px-3 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 ${
              activeAdminSec === "courses"
                ? darkMode
                  ? "bg-[#1e294b] text-[#00bfff] shadow-sm"
                  : "bg-white text-blue-600 shadow-sm"
                : "text-slate-400 hover:text-slate-250"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Təlimlər ({courses.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminSec("mentors")}
            className={`px-3 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 ${
              activeAdminSec === "mentors"
                ? darkMode
                  ? "bg-[#1e294b] text-[#00bfff] shadow-sm"
                  : "bg-white text-blue-600 shadow-sm"
                : "text-slate-400 hover:text-slate-250"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Mentorlar ({mentors.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminSec("applications")}
            className={`px-3 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 ${
              activeAdminSec === "applications"
                ? darkMode
                  ? "bg-[#1e294b] text-[#00bfff] shadow-sm"
                  : "bg-white text-blue-600 shadow-sm"
                : "text-slate-400 hover:text-slate-250"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span>Müraciətlər ({applications.filter(a => a.status === "Gözləmədə").length})</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* USERS MANAGEMENT SECTION */}
        {activeAdminSec === "users" && isSuperAdmin && (
          <motion.div
            key="sec-users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Highlights Metrics Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-5 rounded-2xl border ${darkMode ? "bg-slate-500/5 border-slate-800" : "bg-white border-slate-150 shadow-sm"} flex items-center space-x-4`}>
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold font-mono">{totalUsers}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Ümumi Hesab Sayı</div>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border ${darkMode ? "bg-slate-500/5 border-slate-800" : "bg-white border-slate-150 shadow-sm"} flex items-center space-x-4`}>
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                  <Key className="w-6 h-6 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold font-mono">{pendingPassword}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Şifrə Gözləyən (İlk Giriş)</div>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border ${darkMode ? "bg-slate-500/5 border-slate-800" : "bg-white border-slate-150 shadow-sm"} flex items-center space-x-4`}>
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold font-mono">{activePassword}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Şifrəsi Aktiv Hesablar</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - User Creation Form */}
              <div className={`lg:col-span-1 p-6 rounded-2xl border ${
                darkMode ? "bg-[#0d1730] border-slate-800" : "bg-white border-slate-150 shadow-sm"
              } h-fit space-y-6`}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                  <UserPlus className="w-4.5 h-4.5 text-[#00bfff]" />
                  <span>Yeni Hesab Qeydiyyatı</span>
                </h3>

                <form onSubmit={handleUserSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">İstifadəçi adı (Username)</label>
                    <input
                      id="admin-new-username-input"
                      type="text"
                      placeholder="məsələn: anar_qasimov (kiçik hərflərlə)"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className={`w-full p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono ${
                        darkMode ? "bg-[#121f45] border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                      required
                    />
                    <span className="text-[9px] text-slate-555 block">Şifrə tələb olunmur! Bu adı daxil edib ilk giriş dərhal başlayacaq.</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Ad və Soyad (Full Name)</label>
                    <input
                      id="admin-new-fullname-input"
                      type="text"
                      placeholder="məsələn: Anar Qasımov"
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      className={`w-full p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                        darkMode ? "bg-[#121f45] border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Hesabın Rolu (Authorization)</label>
                    <select
                      id="admin-role-selector"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className={`w-full p-2.5 rounded-xl text-xs font-bold focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                        darkMode ? "bg-[#121f45] border-slate-300 text-slate-350" : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <option value="student">Tələbə / Mütəxəssis (Student)</option>
                      <option value="worker">İşçi (Worker)</option>
                      <option value="corporate">Korporativ Partnyor (Corporate)</option>
                      <option value="co-admin">Köməkçi Administrator (Co-Admin)</option>
                      <option value="admin">Sistem Administratoru (Admin)</option>
                    </select>
                  </div>

                  {/* Alert info box */}
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-[11px] leading-relaxed text-amber-500/90 flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>Şifrə avtomatik quraşdırılmır. İstifadəçi portala ilk daxil olanda özü təhlükəsiz şifrəsini müəyyən edəcək.</span>
                  </div>

                  {/* Message Alert */}
                  <AnimatePresence>
                    {message && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className={`p-3 rounded-xl text-xs border ${
                          message.type === "success" 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        }`}
                      >
                        <p>{message.text}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    id="admin-create-user-submit-btn"
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center space-x-1"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>İstifadəçini Uğurla Qeyd Et</span>
                  </button>
                </form>
              </div>

              {/* Right Column - Existing User Directory */}
              <div className={`lg:col-span-2 p-6 rounded-2xl border ${
                darkMode ? "bg-[#0d1730] border-slate-800" : "bg-white border-slate-105 shadow-sm"
              } space-y-6`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                    <Users className="w-4.5 h-4.5 text-blue-500" />
                    <span>Sistem İstifadəçi Reyestri ({users.length})</span>
                  </h3>
                  <span className="text-[10px] bg-slate-500/10 text-slate-450 font-mono px-2.5 py-1 rounded-lg">Bazanın növü: LocalEngine</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={`border-b ${darkMode ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-500"} font-bold text-[10px] uppercase tracking-wider`}>
                        <th className="pb-3 pl-2">İstifadəçi Adı</th>
                        <th className="pb-3">Ad və Soyad</th>
                        <th className="pb-3">Rol</th>
                        <th className="pb-3">Şifrə Statusu</th>
                        <th className="pb-3 text-center">İdarəetmə əməliyyatları</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-500/5">
                      {users.map((u) => (
                        <tr key={u.username} className={`hover:bg-slate-500/5 transition-colors ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                          <td className="py-3.5 pl-2 font-mono font-bold text-blue-400">
                            @{u.username}
                          </td>
                          <td className="py-3.5 font-medium">{u.fullName}</td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                              u.role === "admin" 
                                  ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                                  : u.role === "corporate"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}>
                              {u.role === "admin" ? "Admin" : u.role === "corporate" ? "Partnyor" : "Tələbə"}
                            </span>
                          </td>
                          <td className="py-3.5">
                            {editingUserPass === u.username ? (
                              <div className="flex items-center space-x-1.5">
                                <input
                                  type="text"
                                  placeholder="Yeni şifrə"
                                  value={customPasswordValue}
                                  onChange={(e) => setCustomPasswordValue(e.target.value)}
                                  className={`p-1.5 rounded-lg text-[10px] font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none w-24 ${
                                    darkMode ? "bg-slate-800 text-slate-200 border-slate-700" : "bg-slate-50 text-slate-800 border-slate-300"
                                  }`}
                                />
                                <button
                                  onClick={() => handleSaveCustomPassword(u.username)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] px-1.5 py-1 font-bold shrink-0"
                                >
                                  Yadda saxla
                                </button>
                                <button
                                  onClick={() => setEditingUserPass(null)}
                                  className="bg-slate-500 hover:bg-slate-600 text-white rounded text-[9px] px-1.5 py-1 font-bold"
                                >
                                  X
                                </button>
                              </div>
                            ) : u.password ? (
                              <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                <span className="font-mono text-[10px]">Təyin edilib</span>
                              </span>
                            ) : (
                              <span className="flex items-center space-x-1 text-amber-500 font-bold animate-pulse">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span>Şifrə Gözləyir</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {/* Change password button */}
                              <button
                                onClick={() => {
                                  setEditingUserPass(u.username);
                                  setCustomPasswordValue(u.password || "");
                                }}
                                className={`p-1.5 rounded-lg transition-colors flex items-center space-x-0.5 text-xs font-semibold ${
                                  darkMode ? "text-blue-400 hover:bg-[#121f45]" : "text-blue-600 hover:bg-slate-50"
                                }`}
                                title="Şifrəni Əllə Dəyiş"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Şifrəni Dəyiş</span>
                              </button>

                              {/* Reset password status to clean */}
                              {u.password && (
                                <button
                                  onClick={() => handleResetPasswordClick(u.username)}
                                  className={`p-1.5 rounded-lg transition-colors flex items-center space-x-0.5 text-xs font-semibold ${
                                    darkMode ? "text-amber-400 hover:bg-amber-500/10" : "text-amber-700 hover:bg-amber-50"
                                  }`}
                                  title="Şifrəni Sıfırla (İlk Giriş Durumu)"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Sıfırla</span>
                                </button>
                              )}

                              {/* Delete button (cannot delete themselves) */}
                              {u.username !== currentUser.username ? (
                                <button
                                  onClick={() => handleDeleteUserClick(u.username)}
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/15 transition-colors flex items-center space-x-0.5 text-xs font-semibold"
                                  title="İstifadəçini Portaldan Sil"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Sil</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-500 italic font-medium">Siz (Aktiv)</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* COURSES / TRAINING MANAGEMENT SECTION */}
        {activeAdminSec === "courses" && (
          <motion.div
            key="sec-courses"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Creator/Editor Form for Course with Full Input elements */}
              <div className={`lg:col-span-1 p-6 rounded-2xl border ${
                darkMode ? "bg-[#0d1730] border-slate-800" : "bg-white border-slate-150 shadow-sm"
              } h-fit space-y-5`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                    <GraduationCap className="w-4.5 h-4.5 text-[#00bfff]" />
                    <span>{editingCourse ? "Təlimi Redaktə Et" : "Yeni Təlim Kursu Yarat"}</span>
                  </h3>
                  {editingCourse && (
                    <button
                      onClick={handleCancelEditCourse}
                      className="text-xs text-rose-450 hover:underline flex items-center space-x-0.5"
                    >
                      <X className="w-3 h-3" />
                      <span>İmtina</span>
                    </button>
                  )}
                </div>

                <form onSubmit={handleCourseSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Kursun Adı (Başlıq)</label>
                    <input
                      type="text"
                      placeholder="Məsələn: OSHA Beynəlxalq HƏMƏ Standartı"
                      value={cTitle}
                      onChange={(e) => setCTitle(e.target.value)}
                      className={`w-full p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                        darkMode ? "bg-[#121f45] border-slate-800 text-slate-100" : "bg-slate-55 border-slate-200 text-slate-800"
                      }`}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Kursun Qısa İzahatı</label>
                    <textarea
                      placeholder="Təlimin məzmunu və hədəfləri haqqında ətraflı məlumat..."
                      rows={2}
                      value={cDesc}
                      onChange={(e) => setCDesc(e.target.value)}
                      className={`w-full p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                        darkMode ? "bg-[#121f45] border-slate-800 text-slate-100" : "bg-slate-55 border-slate-200 text-slate-800"
                      }`}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Kateqoriya</label>
                      <select
                        value={cCategory}
                        onChange={(e) => setCCategory(e.target.value)}
                        className={`w-full p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-bold ${
                          darkMode ? "bg-[#121f45] border-slate-800 text-slate-300" : "bg-slate-55 border-slate-200 text-slate-705"
                        }`}
                      >
                        <option value="HSE">HSE (Təhlükəsizlik)</option>
                        <option value="DÖVLƏT">Dövlət Normativləri</option>
                        <option value="İT / DATA">İT / Data Elmləri</option>
                        <option value="LOGİSTİKA">Logistika və Təchizat</option>
                        <option value="MANAGEMENT">Menecment & İdarəçilik</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Çətinlik Səviyyəsi</label>
                      <select
                        value={cLevel}
                        onChange={(e) => setCLevel(e.target.value as any)}
                        className={`w-full p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-bold ${
                          darkMode ? "bg-[#121f45] border-slate-800 text-slate-300" : "bg-slate-55 border-slate-200 text-slate-705"
                        }`}
                      >
                        <option value="Başlanğıc">Başlanğıc (Basic)</option>
                        <option value="Orta">Orta (Intermediate)</option>
                        <option value="Yüksək">Yüksək (Advanced)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Müddət (Saat / Gün)</label>
                      <input
                        type="text"
                        placeholder="Məsələn: 12 saat / 2 Gün"
                        value={cDuration}
                        onChange={(e) => setCDuration(e.target.value)}
                        className={`w-full p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                          darkMode ? "bg-[#121f45] border-slate-800 text-slate-100" : "bg-slate-55 border-slate-200 text-slate-800"
                        }`}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Qiymət (AZN)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Məsələn: 180"
                        value={cPrice}
                        onChange={(e) => setCPrice(Number(e.target.value))}
                        className={`w-full p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                          darkMode ? "bg-[#121f45] border-slate-800 text-slate-100" : "bg-slate-55 border-slate-200 text-slate-800"
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Tipoloji Biçim</label>
                      <select
                        value={cType}
                        onChange={(e) => setCType(e.target.value as any)}
                        className={`w-full p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-bold ${
                          darkMode ? "bg-[#121f45] border-slate-800 text-slate-300" : "bg-slate-55 border-slate-200 text-slate-705"
                        }`}
                      >
                        <option value="Hibrid">Hibrid (Müxtəlif)</option>
                        <option value="Əyani">Əyani (Sinifdə)</option>
                        <option value="Onlayn">Onlayn (Veblər)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Sertifikat Növü</label>
                      <input
                        type="text"
                        placeholder="Məsələn: Beynəlxalq Sertifikat"
                        value={cCertType}
                        onChange={(e) => setCCertType(e.target.value)}
                        className={`w-full p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                          darkMode ? "bg-[#121f45] border-slate-800 text-slate-100" : "bg-slate-55 border-slate-200 text-slate-800"
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Təlimçi (Ad Soyad)</label>
                      <input
                        type="text"
                        placeholder="Məsələn: Tofiq Həsənov"
                        value={cTrainer}
                        onChange={(e) => setCTrainer(e.target.value)}
                        className={`w-full p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                          darkMode ? "bg-[#121f45] border-slate-800 text-slate-100" : "bg-slate-55 border-slate-200 text-slate-800"
                        }`}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Təlimçinin Vəzifəsi</label>
                      <input
                        type="text"
                        placeholder="Məsələn: Beynəlxalq HSE Baş Müfəttişi"
                        value={cTrainerRole}
                        onChange={(e) => setCTrainerRole(e.target.value)}
                        className={`w-full p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                          darkMode ? "bg-[#121f45] border-slate-800 text-slate-100" : "bg-slate-55 border-slate-200 text-slate-800"
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block flex justify-between">
                      <span>Aşılanacaq Bacarıqlar</span>
                      <span className="text-[8px] text-slate-500 font-normal">Vergüllə ayırın</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Risk Assessment, PPE, OSHA Tələbləri"
                      value={cSkills}
                      onChange={(e) => setCSkills(e.target.value)}
                      className={`w-full p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                        darkMode ? "bg-[#121f45] border-slate-800 text-slate-100" : "bg-slate-55 border-slate-200 text-slate-800"
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block flex justify-between">
                      <span>Dərs Mövzuları / Sillabus</span>
                      <span className="text-[8px] text-slate-500 font-normal">Mövzuları vergüllə ayırın</span>
                    </label>
                    <textarea
                      placeholder="Məsələn: Giriş və qanunvericilik, Risk analizi, Təcrübi seminar"
                      rows={2}
                      value={cSyllabusText}
                      onChange={(e) => setCSyllabusText(e.target.value)}
                      className={`w-full p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                        darkMode ? "bg-[#121f45] border-slate-800 text-slate-100" : "bg-slate-55 border-slate-200 text-slate-800"
                      }`}
                    />
                  </div>

                  <AnimatePresence>
                    {courseMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className={`p-3 rounded-xl text-xs border ${
                          courseMessage.type === "success" 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        }`}
                      >
                        <p>{courseMessage.text}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1"
                  >
                    {editingCourse ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{editingCourse ? "Dəyişiklikləri Yadda Saxla" : "Yeni Kursu Qeydiyyata Al"}</span>
                  </button>
                </form>
              </div>

              {/* Right Column - Existing Courses Table */}
              <div className={`lg:col-span-2 p-6 rounded-2xl border ${
                darkMode ? "bg-[#0d1730] border-slate-800" : "bg-white border-slate-105 shadow-sm"
              } space-y-6`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                    <BookOpen className="w-4.5 h-4.5 text-indigo-400" />
                    <span>Akademik Kataloq Reyestri ({courses.length})</span>
                  </h3>
                  <span className="text-[10px] bg-slate-500/10 text-slate-400 font-mono px-2.5 py-1 rounded-lg">Status: Redaktə Aktivdir</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={`border-b ${darkMode ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-500"} font-bold text-[10px] uppercase tracking-wider`}>
                        <th className="pb-3 pl-2">Kursun / Təlimin Adı</th>
                        <th className="pb-3">Kateqoriya</th>
                        <th className="pb-3">Təlimçi</th>
                        <th className="pb-3">Müddət / Mövzu</th>
                        <th className="pb-3">Qiymət</th>
                        <th className="pb-3 text-center">İdarə et</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-500/5">
                      {courses.map((c) => (
                        <tr key={c.id} className={`hover:bg-slate-500/5 transition-colors ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                          <td className="py-3.5 pl-2 max-w-[190px]">
                            <div>
                              <div className="font-bold text-slate-205 dark:text-slate-100 hover:text-blue-400 transition-colors cursor-pointer">{c.title}</div>
                              <div className="text-[9px] text-[#00bfff] font-mono leading-none mt-0.5 uppercase">{c.certificateType}</div>
                            </div>
                          </td>
                          <td className="py-3.5">
                            <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-blue-600/10 text-blue-400">
                              {c.category}
                            </span>
                          </td>
                          <td className="py-3.5 font-medium max-w-[120px] truncate" title={`${c.trainer} - ${c.trainerRole}`}>
                            {c.trainer}
                          </td>
                          <td className="py-3.5 font-mono text-[10px] text-slate-400">
                            <div>{c.duration}</div>
                            <div className="text-[9px] text-slate-500">{c.lessonsCount || (c.syllabus ? c.syllabus.length : 0)} mövzu</div>
                          </td>
                          <td className="py-3.5 font-mono font-extrabold text-amber-500">
                            {c.price} AZN
                          </td>
                          <td className="py-3.5 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {/* Edit click */}
                              <button
                                onClick={() => handleEditCourseClick(c)}
                                className={`p-1.5 rounded-lg transition-colors flex items-center space-x-0.5 text-xs font-semibold ${
                                  darkMode ? "text-[#00bfff] hover:bg-blue-900/20" : "text-blue-600 hover:bg-slate-50"
                                }`}
                                title="Kursu canlandır və dəyiş"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Düzəliş</span>
                              </button>

                              {/* Delete click */}
                              <button
                                onClick={() => handleDeleteCourseClick(c.id, c.title)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/15 transition-colors flex items-center space-x-0.5 text-xs font-semibold"
                                title="Kursu birdəfəlik sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Sil</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* MENTORS MANAGEMENT SECTION */}
        {activeAdminSec === "mentors" && (
          <motion.div
            key="sec-mentors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Creator form for a new mentor */}
              <div className={`lg:col-span-1 p-6 rounded-2xl border ${
                darkMode ? "bg-[#0d1730] border-slate-800" : "bg-white border-slate-150 shadow-sm"
              } h-fit space-y-6`}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                  <UserPlus className="w-4.5 h-4.5 text-[#00bfff]" />
                  <span>Yeni Mentor Qeydiyyatı</span>
                </h3>

                <form onSubmit={handleMentorAddSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Ad və Soyad</label>
                    <input
                      type="text"
                      placeholder="Məsələn: Orxan Qarayev"
                      value={mName}
                      onChange={(e) => setMName(e.target.value)}
                      className={`w-full p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                        darkMode ? "bg-[#121f45] border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Vəzifə / Rol</label>
                    <input
                      type="text"
                      placeholder="Məsələn: Lead Safety Specialist"
                      value={mRole}
                      onChange={(e) => setMRole(e.target.value)}
                      className={`w-full p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                        darkMode ? "bg-[#121f45] border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Şirkət</label>
                    <input
                      type="text"
                      placeholder="Məsələn: SOCAR Downstream"
                      value={mCompany}
                      onChange={(e) => setMCompany(e.target.value)}
                      className={`w-full p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                        darkMode ? "bg-[#121f45] border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Kateqoriya</label>
                      <select
                        value={mCategory}
                        onChange={(e) => setMCategory(e.target.value)}
                        className={`w-full p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                          darkMode ? "bg-[#121f45] border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-705"
                        }`}
                      >
                        <option value="HSE">HSE</option>
                        <option value="IT">IT / Data</option>
                        <option value="Logistika">Logistika</option>
                        <option value="Management">İdarəçilik</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Saatlıq Ödəniş (AZN)</label>
                      <input
                        type="number"
                        min="1"
                        value={mRate}
                        onChange={(e) => setMRate(Number(e.target.value))}
                        className={`w-full p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                          darkMode ? "bg-[#121f45] border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Təcrübə məlumatları</label>
                    <textarea
                      placeholder="Məsələn: 12 il əməyin təhlükəsizliyi üzrə beynəlxalq dərəcəli ekspert..."
                      rows={3}
                      value={mExp}
                      onChange={(e) => setMExp(e.target.value)}
                      className={`w-full p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                        darkMode ? "bg-[#121f45] border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                      required
                    />
                  </div>

                  <AnimatePresence>
                    {mentorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className={`p-3 rounded-xl text-xs border ${
                          mentorMessage.type === "success" 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        }`}
                      >
                        <p>{mentorMessage.text}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    className="w-full bg-[#0066cc] hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Mentoru Siyahıya Əlavə Et</span>
                  </button>
                </form>
              </div>

              {/* Right Column - Mentors Management Directory */}
              <div className={`lg:col-span-2 p-6 rounded-2xl border ${
                darkMode ? "bg-[#0d1730] border-slate-800" : "bg-white border-slate-105 shadow-sm"
              } space-y-6`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                    <HelpCircle className="w-4.5 h-4.5 text-blue-500" />
                    <span>Platforma Aktiv Mentor Resursları ({mentors.length})</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mentors.map((m) => (
                    <div
                      key={m.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between ${
                        darkMode ? "bg-[#121f45]/50 border-slate-800" : "bg-slate-55 border-slate-250 shadow-sm"
                      } space-y-4`}
                    >
                      <div className="flex items-start space-x-3">
                        <img
                          referrerPolicy="no-referrer"
                          src={m.image}
                          alt={m.name}
                          className="w-12 h-12 rounded-full object-cover shrink-0 border border-slate-500/20"
                        />
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-100 dark:text-slate-100 text-slate-850">{m.name}</h4>
                          <span className="text-[10px] text-slate-400 block leading-tight">{m.role}</span>
                          <span className="text-[9px] text-[#00bfff] font-bold uppercase tracking-wide bg-blue-600/10 px-1.5 py-0.5 rounded inline-block mt-0.5">
                            {m.company}
                          </span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 line-clamp-2 italic">
                        "{m.experience}"
                      </p>

                      <div className="border-t border-slate-500/10 pt-3 flex items-center justify-between">
                        <div className="text-left">
                          <span className="text-[9px] text-slate-555 block uppercase font-bold">Saatlıq Tarif</span>
                          <span className="text-xs font-mono font-extrabold text-amber-500">{m.hourlyRate} AZN / saat</span>
                        </div>

                        <button
                          onClick={() => handleDeleteMentorClick(m.id, m.name)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-450 hover:bg-rose-500/20 transition-all flex items-center space-x-1 text-[10px] font-bold"
                          title="Mentoru Siyahıdan İxrac Et"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Kənarlaşdır</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* APPLICATIONS MANAGEMENT SECTION */}
        {activeAdminSec === "applications" && (
          <motion.div
            key="sec-applications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className={`p-6 sm:p-8 rounded-3xl border ${
              darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-150 text-slate-900"
            } shadow`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="space-y-1 text-left">
                  <h3 className="text-base font-extrabold tracking-tight">Fiziki Təlim Müraciətlərinə Nəzarət</h3>
                  <p className="text-xs text-slate-400">
                    Tələbələr tərəfindən göndərilmiş fiziki təlim qeydiyyatı müraciətlərini təsdiqləyin yaxud rədd edin.
                  </p>
                </div>
                <div className="text-xs px-3 py-1.5 rounded-full bg-amber-600/10 text-amber-500 font-bold border border-amber-500/10">
                  Cəmi müraciət: {applications.length}
                </div>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto opacity-40" />
                  <p className="text-xs text-slate-400 font-medium">Hələ ki heç bir təlim müraciəti daxil olmayıb.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-500/10">
                  <table className="w-full text-xs text-left text-slate-350">
                    <thead className={`text-[10px] uppercase font-bold tracking-wider border-b border-slate-500/10 ${
                      darkMode ? "bg-slate-950/80 text-slate-400" : "bg-slate-50 text-slate-600"
                    }`}>
                      <tr>
                        <th className="p-4">Tarix / ID</th>
                        <th className="p-4">Tələbə (İştirakçı)</th>
                        <th className="p-4">Müraciət edilən Təlim</th>
                        <th className="p-4">Müraciət Səbəbi / Motivasiya</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-right">Əməliyyat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-500/10">
                      {applications.map((app) => (
                        <tr key={app.id} className={`${darkMode ? "hover:bg-slate-950/40" : "hover:bg-slate-50/50"} transition-colors`}>
                          <td className="p-4 font-mono text-[10px]">
                            <div className="font-bold text-slate-300">{app.submittedAt}</div>
                            <span className="text-slate-500">{app.id}</span>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-slate-100 dark:text-slate-100 text-slate-800">{app.fullName}</div>
                            <span className="text-slate-450 text-[10px]">@{app.username}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-[#00bfff]">{app.courseTitle}</span>
                          </td>
                          <td className="p-4 max-w-xs break-words whitespace-pre-line text-slate-300 leading-snug">
                            {app.motivation}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              app.status === "Gözləmədə"
                                ? "bg-amber-500/15 text-amber-500 border border-amber-500/10"
                                : app.status === "Təsdiqləndi"
                                  ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/10"
                                  : "bg-rose-500/15 text-rose-500 border border-rose-500/10"
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {app.status === "Gözləmədə" ? (
                              <div className="flex justify-end gap-2 shrink-0">
                                <button
                                  onClick={() => {
                                    triggerConfirm(
                                      "Müraciəti Təsdiqlə",
                                      `"${app.fullName}" iştirakçısının "${app.courseTitle}" təliminə müraciətini təsdiq etmək istəyirsiniz? Təsdiqdən sonra təlim onun Şəxsi kabinetində (Workspace) aktiv olacaqdır.`,
                                      () => onApproveApplication(app.id)
                                    );
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-all flex items-center space-x-1 shadow cursor-pointer"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Təsdiqlə</span>
                                </button>
                                <button
                                  onClick={() => {
                                    triggerConfirm(
                                      "Müraciəti Rədd Et",
                                      `"${app.fullName}" iştirakçısının "${app.courseTitle}" müraciətini rədd etmək istədiyinizə əminsiniz?`,
                                      () => onRejectApplication(app.id)
                                    );
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white font-bold text-[10px] border border-rose-500/20 transition-all flex items-center space-x-1 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Rədd Et</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic font-medium">Baxılıb</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sandbox-Compliant Custom Confirmation Dialog Modal Overlay */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-sm p-6 rounded-2xl border ${
                darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
              } shadow-2xl space-y-4`}
            >
              <div className="flex items-center space-x-3 text-amber-500">
                <AlertTriangle className="w-6 h-6 shrink-0 animate-bounce text-amber-500" />
                <h4 className="text-sm font-extrabold uppercase tracking-wider">{confirmModal.title}</h4>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed">
                {confirmModal.message}
              </p>
              
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-2 rounded-xl transition-all"
                >
                  Bəli, Təsdiqləyirəm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                  className={`flex-1 font-bold text-xs py-2 rounded-xl border transition-all ${
                    darkMode ? "border-slate-800 text-slate-400 hover:bg-slate-800" : "border-slate-300 text-slate-705 hover:bg-slate-50"
                  }`}
                >
                  İmtina Et
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
