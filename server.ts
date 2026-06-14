import express from "express";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: Number(process.env.MYSQL_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Initialize Database Tables
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        username VARCHAR(255) PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        password VARCHAR(255),
        createdAt VARCHAR(50)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        type VARCHAR(50),
        target_role VARCHAR(50)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_groups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_by VARCHAR(255)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT,
        sender VARCHAR(255),
        text TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS meetings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type ENUM('online', 'physical') DEFAULT 'physical',
        meeting_link VARCHAR(500),
        location VARCHAR(255),
        start_time DATETIME,
        creator VARCHAR(255)
      )
    `);
    
    // Seed admin if not exists
    const [rows]: any = await pool.query("SELECT * FROM users WHERE username = 'admin'");
    if (rows.length === 0) {
      await pool.query(
        "INSERT INTO users (username, fullName, role, password, createdAt) VALUES (?, ?, ?, ?, ?)",
        ["admin", "Sistem Administratoru", "admin", "admin", new Date().toLocaleDateString("az-AZ")]
      );
    }
    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
}

// Initialize GoogleGenAI client (safe lazy setup)
let aiClient: GoogleGenerativeAI | null = null;
function getAiClient(): GoogleGenerativeAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing! Gemini features will run in mock mode.");
    }
    aiClient = new GoogleGenerativeAI(apiKey || "MOCK_KEY");
  }
  return aiClient;
}

// Helper to get generative model with system instruction
function getGenerativeModelWithSystemInstruction(aiClient: GoogleGenerativeAI, systemInstruction: string) {
  return aiClient.getGenerativeModel({
    model: "gemini-1.5-flash", // Use gemini-1.5-flash
    systemInstruction: systemInstruction,
  });
}
// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Database Routes for Users
app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/users", async (req, res) => {
  const { username, fullName, role, password, createdAt } = req.body;
  try {
    await pool.query(
      "INSERT INTO users (username, fullName, role, password, createdAt) VALUES (?, ?, ?, ?, ?)",
      [username, fullName, role, password || null, createdAt]
    );
    res.status(201).json({ message: "User created" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/users/:username/password", async (req, res) => {
  const { username } = req.params;
  const { password } = req.body;
  try {
    await pool.query("UPDATE users SET password = ? WHERE username = ?", [password, username]);
    res.json({ message: "Password updated" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/users/:username", async (req, res) => {
  const { username } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE username = ?", [username]);
    res.json({ message: "User deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Meetings API
app.get("/api/meetings", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM meetings ORDER BY start_time ASC");
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/meetings", async (req, res) => {
  const { title, type, meeting_link, location, start_time, creator } = req.body;
  try {
    await pool.query(
      "INSERT INTO meetings (title, type, meeting_link, location, start_time, creator) VALUES (?, ?, ?, ?, ?, ?)",
      [title, type, meeting_link, location, start_time, creator]
    );
    res.status(201).json({ message: "Meeting created" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Calendar API
app.get("/api/calendar", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM calendar_events ORDER BY start_time ASC");
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/calendar", async (req, res) => {
  const { title, description, start_time, type, target_role } = req.body;
  try {
    await pool.query(
      "INSERT INTO calendar_events (title, description, start_time, type, target_role) VALUES (?, ?, ?, ?, ?)",
      [title, description, start_time, type, target_role]
    );
    res.status(201).json({ message: "Event created" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Chat API
app.get("/api/chat-groups", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM chat_groups");
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Chat API
app.get("/api/chat-groups", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM chat_groups");
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/chat-groups", async (req, res) => {
  const { name, created_by } = req.body;
  try {
    await pool.query(
      "INSERT INTO chat_groups (name, created_by) VALUES (?, ?)",
      [name, created_by]
    );
    res.status(201).json({ message: "Chat group created" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/chat-messages/:groupId", async (req, res) => {
  const { groupId } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM chat_messages WHERE group_id = ? ORDER BY timestamp ASC", [groupId]);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/chat-messages", async (req, res) => {
  const { group_id, sender, text } = req.body;
  try {
    await pool.query(
      "INSERT INTO chat_messages (group_id, sender, text) VALUES (?, ?, ?)",
      [group_id, sender, text]
    );
    res.status(201).json({ message: "Message sent" });
  } catch (err: any) {
    console.error("Error sending chat message:", err);
    res.status(500).json({ error: err.message });
  }
});

// AI Chat Route
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Sual mətni daxil edilməlidir." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        text: `Salam! ATİM platformunun süni intellekt köməkçisiyəm. Hazırda sistem test rejimindədir və real API açarı təyin edilməyib, lakin mən sənə ATİM-in təlimləri, sertifikatlaşdırma, imtahanlar və mentorluq barədə ətraflı məlumat verə bilərəm. Məsələn, bizdə "Əməyin təhlükəsizliyi (HƏMƏ)", "Logistika və Anbar İdarəedilməsi", "Enerji və Energetika Mühəndisliyi", "Proqramlaşdırma və İT dərsləri" var. Biz həm fərdlərə, həm də şirkətlərə (korporativ partnyorlara) tərcüməli həllər təqdim edirik. Necə kömək edə bilərəm?`
      });
    }

    const ai = getAiClient();
    
    const model = ai.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "Sən ATİM (Skills, Training & Certification Ecosystem) platformasının rəsmi süni intellekt köməkçisisən. İstifadəçilərin suallarına yalnız Azərbaycan dilində cavab ver. Təlim tövsiyələri ver, karyera inkişafı, sertifikatlaşdırma və imtahanlar barədə kömək et. Xoşrəftar, peşəkar, müasir və dolğun məlumat verən köməkçi ol. Cavablarında çox qısa olmamağa, həm də çox sıxıcı olmamağa çalış. Mövzu ATİM, təlimlər, peşəkar inkişaf olmalıdır."
    });

    // Format history for Gemini API
    const chatHistory = history ? history.map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model', // Ensure roles are 'user' or 'model'
      parts: [{ text: h.text }] // Use h.text as per Message interface
    })) : [];

    const requestContents = [...chatHistory, { role: "user", parts: [{ text: message }] }];

    const result = await model.generateContent({ contents: requestContents });
    const response = await result.response;

    res.json({ text: response.text() });
  } catch (error: any) {
    console.error("Gemini API Error in /api/chat:", error);
    res.status(500).json({ error: error.message || "Süni İntellektlə əlaqə zamanı xəta yarandı." });
  }
});

// AI Development Plan Route
app.post("/api/development-plan", async (req, res) => {
  try {
    const { name, industry, currentRole, targetRole, skills, duration } = req.body;
    
    const prompt = `YENİ FƏRDİ İNKİŞAF PLANI TƏLƏBİ:
Adı: ${name || 'İstifadəçi'}
Sahə/Sektor: ${industry || 'Ümumi'}
Hazırkı Vəzifə: ${currentRole || 'İlkin səviyyə mütəxəssis'}
Hədəflənən Vəzifə: ${targetRole || 'Baş mütəxəssis / Rəhbər'}
Mövcud Bacarıqlar: ${skills || 'Təməl biliklər'}
Planın Müddəti: ${duration || '3 ay'}

Xahiş edirəm bu şəxs üçün olduqca ətraflı, addım-addım fərdi peşəkar inkişaf planı (İndividual Development Plan) hazırla.
Plan aşağıdakı bölmələrdən ibarət olmalıdır və mütləq Azərbaycan dilində yazılmalıdır:
1. GİRİŞ və STRATEJİ HƏDƏF (Sahənin gələcək inkişaf perspektivləri)
2. QAZANILMALI OLAN BACARIQLAR (Texniki və Liderlik/Yumşaq bacarıqlar)
3. ATİM TƏLİM TÖVSİYƏLƏRİ (Platformamızda tövsiyə olunan uyğun sahə kursları)
4. AYLAR ÜZRƏ PANDEMİK ADDIM-ADDIM YOL XƏRİTƏSİ (${duration || '3 ay'}-lıq cədvəl formatında)
5. SERTİFİKATLAŞDIRMA VƏ QİYMƏTLƏNDİRİLMƏ (Nailiyyəti necə ölçəcək)
6. MENTORLUQ VƏ TƏCRÜBƏ (Gələcək karyera məsləhətləri)

Dizaynı gözəl göstərmək üçün cavabını səliqəli Markdown formatında (başlıqlar #, ##, siyahılar -, qalın mətnlər ** ilə) tərtib et.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        text: `# Fərdi İnkişaf Planı (TEST REJİMİ)
Sistem test rejimindədir. Sizin üçün **${targetRole || 'Hədəf vəzifə'}** istiqamətində fərdi inkişaf planı:

## 1. Giriş və Strateji Hədəf
- Sahə: *${industry || 'Müvafiq sahə'}*
- Hazırkı Vəzifə: *${currentRole || 'Təməl'}*
- Hədəf Vəzifə: *${targetRole || 'Baş mürəkkəb mütəxəssis'}*
- İnkişaf müddəti: *${duration || '3 ay'}*

## 2. Qazanılmalı Olan Bacarıqlar
- **Hard Skills (Texniki Bacarıqlar):** Alətlərlə işləmək, beynəlxalq standartlara (HSE, ISO və ya xüsusi İT proqramları) yiyələnmək.
- **Soft Skills (Yumşaq Bacarıqlar):** Layihə idarəetməsi, təqdimat bacarıqları, effektiv komanda işi.

## 3. ATİM Təlim Tövsiyələri
- **Əməyin Təhlükəsizliyi və Sağlamlıq (NEBOSH/HŞƏM standartları dərsi)**
- **Müasir Layihə İdarəetməsi (PMP Agile Metodologiyaları dərsi)**
- **Excel mütəxəssisi və SQL Analitikası dərsi**

## 4. Aylıq Yol Xəritəsi
- **1-ci Ay:** Hədəf sahə üzrə ATİM-də baza kursuna yazılmaq və dərsləri 100% tamamlamaq. Hər həftə təlim qeydləri götürmək.
- **2-ci Ay:** Kurs üzrə imtahana daxil olmaq, keçid balı toplamaq. İştirak etdiyiniz dərsin praktiki tapşırıqlarını hazırlamaq.
- **3-ci Ay:** Mövzu üzrə fərdi mentorluq sessiyası sifariş etmək, ATİM rəqəmsal sertifikatını LinkedIn-də paylaşaraq CV-ni karyera mərkəzində yeniləmək.`
      });
    }

    const ai = getAiClient();
    const model = getGenerativeModelWithSystemInstruction(ai, "Sən peşəkar İnsan Resursları və Karyera İnkişafı üzrə AI Mentorsan.");
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 }
    });
    const response = await result.response;

    res.json({ text: response.text() });
  } catch (error: any) {
    console.error("Gemini API Error in /api/development-plan:", error);
    res.status(500).json({ error: error.message || "Fərdi inkişaf planı hazırlanan zaman xəta yarandı." });
  }
});

// AI Exam Generator Route
app.post("/api/generate-exam", async (req, res) => {
  try {
    const { category, courseName, difficulty } = req.body;
    
    const prompt = `YENİ İMTAHAN SUALLARI TƏLƏBİ:
Kursun adı: ${courseName || category}
Kateqoriya: ${category}
Çətinlik dərəcəsi: ${difficulty || 'Orta'}

Xahiş edirəm bu mövzu üzrə 4 ədəd fərqli, maraqlı test sualı hazırla.
Cavab mütləq Azərbaycan dilində və düzgün JSON formatında olmalıdır. Başqa heç bir mətn və ya izahat daxil etmə, yalnız və yalnız JSON qaytar.
JSON formatı mütləq aşağıdakı kimi olmalıdır (buna tam riayət et):
[
  {
    "id": 1,
    "question": "Sualın mətni?",
    "options": ["A variantı", "B variantı", "C variantı", "D variantı"],
    "correctIndex": 0,
    "explanation": "Niyə bu variant düzgündür izahı"
  }
]
`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        questions: [
          {
            id: 1,
            question: `${courseName || category} sahəsində əsas təhlükəsizlik qaydalarının (Məsuliyyət və Risk menecmenti) tətbiqində birinci növbədə nəyə diqqət yetirilməlidir?`,
            options: [
              "Risk dərəcələrinin müəyyənləşdirilməsi və preventiv tədbirlər",
              "Sənədlərin arxivləşdirilməsi",
              "Şirkət rəhbərinin ezamiyyəti",
              "Heç biri"
            ],
            correctIndex: 0,
            explanation: "Təhlükəsizlikdə ən mühüm mərhələ risklərin əvvəlcədən təyin edilməsi və qarşısının alınmasıdır (preventiv idarəetmə)."
          },
          {
            id: 2,
            question: "Effektiv idarəetmə və komanda inkişafında aşağıdakılardan hansı zərərli sayıla bilər?",
            options: [
              "SMART hədəflər müəyyən etmək",
              "İşçilərə daimi öyrənmə və inkişaf imkanı vermək",
              "Tək tərəfli qərarlar verərək heç bir geribildirimi qəbul etməmək",
              "Davamlı monitorinq aparmaq"
            ],
            correctIndex: 2,
            explanation: "Komandada bir tərəfli və geribildirimsiz yanaşma peşəkar inkişaf mühitini məhv edir."
          },
          {
            id: 3,
            question: `Müasir ${courseName || category} standartlarına görə beynəlxalq sertifikatlaşdırma (məsələn, ISO, ATİM, NEBOSH) niyə vacibdir?`,
            options: [
              "Yalnız rəsmi dövlət sənədi toplamaq üçün",
              "Bilik və bacarıqların qlobal standartlara uyğunluğunu təsdiqləmək və etibarlılığı artırmaq üçün",
              "Şirkət daxili rəqabəti azaltmaq üçün",
              "Kurs müddətini uzatmaq üçün"
            ],
            correctIndex: 1,
            explanation: "Sertifikatlar mütəxəssisin öz sahəsində qlobal standartlara tam cavab verdiyini sənədləşdirir."
          },
          {
            id: 4,
            question: "Davamlı peşəkar inkişaf (Lifelong Learning) prinsipi nəyi ifadə edir?",
            options: [
              "Yalnız bir dəfə universitet bitirib oxumağı dayandırmağı",
              "Hər il yeni bir peşə dəyişməyi",
              "Karyera boyu davamlı olaraq bilik və bacarıqları yeniləməyi və inkişaf etdirməyi",
              "İş saatlarını azaltmağı"
            ],
            correctIndex: 2,
            explanation: "Davamlı inkişaf sürətlə dəyişən qlobal bazarda hər zaman aktual və rəqabətədavamlı qalmağı təmin edir."
          }
        ]
      });
    }

    const ai = getAiClient();
    const model = getGenerativeModelWithSystemInstruction(ai, "Sən imtahan sualları hazırlayan AI mütəxəssisisən."); // Add a system instruction for exam generation
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.6 }
    });

    const response = await result.response;
    try {
      const parsed = JSON.parse(response.text() || "[]");
      res.json({ questions: parsed });
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON. Text was:", response.text());
      res.json({
        questions: [
          {
            id: 1,
            question: `${courseName || category} üzrə fəaliyyətlərin tənzimlənməsi necə aparılır?`,
            options: [
              "Beynəlxalq standartlara və daxili normativlərə uyğun şəkildə",
              "Təsadüfi kor-koranə seçimlərlə",
              "Yalnız şifahi tapşırıqlar əsasında",
              "Monitorinq və yoxlanış olmadan fəaliyyətlə"
            ],
            correctIndex: 0,
            explanation: "Sənayedə fəaliyyətlər hər zaman akkreditə edilmiş standartlara və yoxlanılmış metodologiyaya sadiq qalmalıdır."
          }
        ]
      });
    }
  } catch (error: any) {
    console.error("Gemini API Error in /api/generate-exam:", error);
    res.status(500).json({ error: error.message || "İmtahan sualları yaradılan zaman xəta yarandı." });
  }
});

// AI CV Analyzer Route
app.post("/api/analyze-cv", async (req, res) => {
  try {
    const { cvText, targetRole } = req.body;
    if (!cvText) {
      return res.status(400).json({ error: "CV mətni daxil edilməlidir." });
    }

    const prompt = `YENİ CV ANALİZİ TƏLƏBİ:
Hədəflənən Vəzifə/Sahə: ${targetRole || 'Müvafiq Vakansiya'}
CV Mətni:
"""
${cvText}
"""

Xahiş edirəm daxil edilmiş bu CV mətnini dərindən analiz et.
CV-nin güclü tərəflərini, zəifliklərini təhlil et və ATS (Applicant Tracking System) keçid faizi təxminini tap.
Aşağıdakı bölmələrlə tamamilə Azərbaycan dilində, səliqəli Markdown formatında cavab ver:
1. ATS UYĞUNLUQ REYTİNQİ (0-100% arası faiz qiyməti ilə, aydın və qalın şriftdə əvvəldə qeyd et)
2. GÜCLÜ TƏRƏFLƏR (Təcrübə, təhsil və ya bacarıqların müsbət cəhətləri)
3. ZƏİF TƏRƏFLƏR VƏ SEKTORAL BOŞLUQLAR (Hansı vacib sahələr, beynəlxalq terminlər və ya sertifikatlar əskikdir)
4. PROFESSIONAL TƏKMİLLƏŞDİRMƏ TÖVSİYƏLƏRİ (Struktur, açar sözlər və yazılış tərzi üzrə tövsiyələr)
5. MƏQSƏDYÖNLÜ ATİM KURSLARI (Bacarıq boşluqlarını doldurmaq və CV-ni gücləndirmək üçün hansı ATİM təlimləri kömək edər)

Dizaynı gözəl göstərmək üçün cavabını səliqəli Markdown formatında (başlıqlar #, ##, siyahılar -, qalın mətnlər ** ilə) tərtib et.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        text: `# CV Təhlil Hesabatı (TEST REJİMİ)

## 📊 ATS Uyğunluq Reytinqi: 72%

Hazırda süni intellekt test rejimindədir. Sizin CV-nin hədəflənən **${targetRole || 'Müvafiq vakansiya'}** vəzifəsinə uyğun olaraq təhlili belədir:

### 🟢 Güclü Tərəflər
- İş təcrübəsi xronoloji ardıcıllıqla normal qeyd olunub.
- Təhsil məlumatları aydın əksini tapıb.

### 🔴 Zəif Tərəflər və Sektoral Boşluqlar
- LinkedIn profili linki və digər peşəkar resurslar göstərilməyib.
- Görülən işlərin nəticələri sırf vəzifə öhdəliyi kimi yazılıb, şəxsi nailiyyətlər (rəqəmlər və KPI-lar) əskikdir.
- Beynəlxalq və ya lokal akkreditə olunmuş peşəkar sertifikatlaşdırma məlumatları zəifdir.

### 💡 Professional Təkmilləşdirmə Tövsiyələri
1. **Fəaliyyət fellərindən istifadə edin:** "Məsuliyyət daşıyırdım" əvəzinə "İcra etdim", "Yenidən qurdum", "İdarə etdim" kimi güclü ifadələr işlədin.
2. **Kəmiyyət göstəriciləri əlavə edin:** Məsələn, "Satışı artırdım" yerinə "Satışları 3 ay ərzində 18% artırdım" yazın.
3. **ATİM Sertifikatlarını əlavə edin:** ATİM dərslərini tamamlayıb aldığınız rəqəmsal sertifikatı xüsusi bölməyə yerləşdirin.

### 🎓 Məqsədyönlü ATİM Kursları
- **Agile Layihə İdarəetməsi (PMP əsaslı)**
- **Korporativ Kommunikasiya və Liderlik**`
      });
    }

    const ai = getAiClient();
    const model = getGenerativeModelWithSystemInstruction(ai, "Sən İnsan Resursları üzrə peşəkar ATS Analitiki və CV Audit mütəxəssisisən.");
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 }
    });
    const response = await result.response;

    res.json({ text: response.text() });
  } catch (error: any) {
    console.error("Gemini API Error in /api/analyze-cv:", error);
    res.status(500).json({ error: error.message || "CV analizi zamanı xəta yarandı." });
  }
});

// Vite Middleware implementation
async function startServer() {
  await initDb();

  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
