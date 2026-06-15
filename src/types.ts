export interface Course {
  [x: string]: ReactNode;
  id: string;
  title: string;
  description: string;
  category: string;
  level: "Başlanğıc" | "Orta" | "Yüksək";
  duration: string;
  lessonsCount: number;
  rating: number;
  reviewsCount: number;
  trainer: string;
  trainerRole: string;
  trainerImage?: string;
  price: number;
  type: "Onlayn" | "Əyani" | "Hibrid";
  certificateType: string;
  skillsOutcome: string[];
  syllabus: { id: number; title: string; duration: string; completed?: boolean }[];
  isEnrolled?: boolean;
  progress?: number; // 0 to 100
  notes?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  duration: string;
  type: "video" | "pdf" | "presentation" | "live";
  contentUrl: string;
  summary: string;
}

export interface ExamQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Certificate {
  id: string; // E.g., ATIM-2026-94821
  userName: string;
  courseName: string;
  issueDate: string;
  type: "Uğur Sertifikatı" | "İştirak Sertifikatı";
  score: number;
  verified: boolean;
  qrCodeValue: string;
}

export interface CorporateEmployee {
  id: string;
  name: string;
  email: string;
  department: string;
  complianceStatus: "Tətbiq Edilib" | "Gecikir" | "Növbədə"; // green, red, yellow
  assignedCourses: string[]; // Course IDs
  progress: { [courseId: string]: number };
  certificatesCount: number;
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  category: string;
  rating: number;
  reviewsCount: number;
  image: string;
  hourlyRate: number;
  experience: string;
  availableHours: string[];
}

export interface BookedSession {
  id: string;
  mentorId: string;
  mentorName: string;
  dateTime: string;
  topic: string;
  status: "Təsdiqləndi" | "Gözləmədə" | "Tamamlandı";
}

export interface JobVacancy {
  id: string;
  title: string;
  company: string;
  logo: string;
  category: string;
  location: string;
  salary: string;
  type: "Əyani" | "Uzaqdan" | "Hibrid";
  description: string;
  requirements: string[];
  skillsMatch?: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface User {
  username: string; // unique identifier
  fullName: string;
  role: "admin" | "co-admin" | "student" | "corporate" | "worker";
  password?: string; // empty initially for admin-created users
  createdAt?: string;
}

export interface CourseApplication {
  id: string;
  username: string;
  fullName: string;
  courseId: string;
  courseTitle: string;
  motivation: string;
  submittedAt: string;
  status: "Gözləmədə" | "Təsdiqləndi" | "Rədd edilib";
}
