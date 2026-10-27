/* StudyHub local app logic. No frameworks or external libraries required. */
"use strict";

const SUBJECTS = {
  "Mathematics": { icon:"∑", chapters:[
    "Real Numbers","Polynomials","Pair of Linear Equations in Two Variables","Quadratic Equations",
    "Arithmetic Progressions","Triangles","Coordinate Geometry","Introduction to Trigonometry",
    "Some Applications of Trigonometry","Circles","Areas Related to Circles","Surface Areas and Volumes",
    "Statistics","Probability"
  ]},
  "Science": { icon:"⚗", chapters:[
    "Chemical Reactions and Equations","Acids, Bases and Salts","Metals and Non-metals","Carbon and its Compounds",
    "Life Processes","Control and Coordination","How do Organisms Reproduce?","Heredity",
    "Light: Reflection and Refraction","The Human Eye and the Colourful World","Electricity",
    "Magnetic Effects of Electric Current","Our Environment"
  ]},
  "Social Science": { icon:"◎", chapters:[
    "The Rise of Nationalism in Europe","Nationalism in India","The Making of a Global World",
    "The Age of Industrialisation","Print Culture and the Modern World","Resources and Development",
    "Forest and Wildlife Resources","Water Resources","Agriculture","Minerals and Energy Resources",
    "Manufacturing Industries","Lifelines of National Economy","Power Sharing","Federalism",
    "Gender, Religion and Caste","Political Parties","Outcomes of Democracy","Development",
    "Sectors of the Indian Economy","Money and Credit","Globalisation and the Indian Economy","Consumer Rights"
  ]},
  "English": { icon:"Aa", chapters:[
    "A Letter to God","Nelson Mandela: Long Walk to Freedom","Two Stories about Flying","From the Diary of Anne Frank",
    "Glimpses of India","Mijbil the Otter","Madam Rides the Bus","The Sermon at Benares","The Proposal",
    "Dust of Snow","Fire and Ice","A Tiger in the Zoo","How to Tell Wild Animals","The Ball Poem","Amanda!",
    "The Trees","Fog","The Tale of Custard the Dragon","For Anne Gregory","A Triumph of Surgery",
    "The Thief’s Story","The Midnight Visitor","A Question of Trust","Footprints without Feet",
    "The Making of a Scientist","The Necklace","Bholi","The Book That Saved the Earth"
  ]},
  "Hindi A": { icon:"अ", chapters:[
    "सूरदास के पद","राम-लक्ष्मण-परशुराम संवाद","साखी","पद","मनुष्यता","पर्वत प्रदेश में पावस","तोप",
    "कर चले हम फ़िदा","आत्मत्राण","नेताजी का चश्मा","बालगोबिन भगत","लखनवी अंदाज़",
    "मानवीय करुणा की दिव्य चमक","एक कहानी यह भी","स्त्री शिक्षा के विरोधी कुतर्कों का खंडन",
    "नौबतखाने में इबादत","संस्कृति","माता का आँचल","जॉर्ज पंचम की नाक","एही ठैयाँ झुलनी हेरानी हो रामा!","मैं क्यों लिखता हूँ"
  ]},
  "AI (417)": { icon:"AI", chapters:[
    "Communication Skills-II","Self-management Skills-II","ICT Skills-II","Entrepreneurial Skills-II",
    "Green Skills-II","Introduction to AI","AI Project Cycle","Advanced Python","Data Science",
    "Computer Vision","Natural Language Processing","Evaluation","AI Ethics and Responsible AI"
  ]}
};

const DEFAULT_STATE = {
  version: 2,
  completed: {},
  tasks: [],
  notes: {},
  tests: [],
  examScores: { preboard:{}, board:{} },
  examTargets: {preboard:90, board:95},
  settings: { theme:"dark", preboardDate:"2026-11-16", boardDate:"2027-02-15", dailyTarget:"5", studentName:"Abhijnan", assistantStyle:"gentle" }
};
const STORE_KEY = "studyhub-minimal-v1";
let state = loadState();
let activeQuiz = null;
const $ = id => document.getElementById(id);
const subjectNames = Object.keys(SUBJECTS);

function loadState() {
  try {
    const savedText = localStorage.getItem(STORE_KEY);
    const saved = savedText ? JSON.parse(savedText) : null;
    if (saved && typeof saved === "object") {
      return {
        ...structuredCloneSafe(DEFAULT_STATE), ...saved,
        settings: normalizeSettings({...DEFAULT_STATE.settings, ...(saved.settings || {})}),
        examScores: normalizeExamScores(saved.examScores),
        examTargets: normalizeExamTargets(saved.examTargets),
        completed: saved.completed && typeof saved.completed === "object" ? saved.completed : {},
        tasks: Array.isArray(saved.tasks) ? saved.tasks : [],
        notes: saved.notes && typeof saved.notes === "object" ? saved.notes : {},
        tests: Array.isArray(saved.tests) ? saved.tests : []
      };
    }
  } catch (error) {
    console.warn("Could not read saved StudyHub data. Starting with defaults.", error);
  }
  return structuredCloneSafe(DEFAULT_STATE);
}
function normalizeSettings(settings) {
  const normalized = {...DEFAULT_STATE.settings, ...(settings || {})};
  if (normalized.theme === "light") normalized.theme = "dark";
  if (!["dark","midnight"].includes(normalized.theme)) normalized.theme = "dark";
  return normalized;
}
function normalizeExamScores(scores) {
  const safe = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {preboard:safe(scores?.preboard), board:safe(scores?.board)};
}
function normalizeExamTargets(targets) {
  const read = (key, fallback) => {
    const value = Number(targets?.[key]);
    return Number.isFinite(value) && value >= 0 && value <= 100 ? value : fallback;
  };
  return {preboard:read("preboard",90), board:read("board",95)};
}
function structuredCloneSafe(value) { return JSON.parse(JSON.stringify(value)); }
function persist(message) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    safeRenderAll();
    if (message) toast(message);
  } catch (error) {
    toast("Could not save. Export your data and check browser storage.");
    console.error(error);
  }
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
}
function allChapters() {
  return subjectNames.flatMap(subject => SUBJECTS[subject].chapters.map(chapter => ({subject, chapter, key:chapterKey(subject, chapter)})));
}
function chapterKey(subject, chapter) { return `${subject}::${chapter}`; }
function subjectStats(subject) {
  const total = SUBJECTS[subject].chapters.length;
  const done = SUBJECTS[subject].chapters.filter(chapter => state.completed[chapterKey(subject, chapter)]).length;
  return {total, done, percent: total ? Math.round(done / total * 100) : 0};
}
function overallStats() {
  const all = allChapters();
  const done = all.filter(item => state.completed[item.key]).length;
  return {total:all.length, done, percent:all.length ? Math.round(done / all.length * 100) : 0};
}
function averageScore() {
  if (!state.tests.length) return null;
  return Math.round(state.tests.reduce((sum, test) => sum + (Number(test.score) / Number(test.total)) * 100, 0) / state.tests.length);
}
function dateLabel(date) {
  if (!date) return "Date not set";
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {day:"numeric", month:"short", year:"numeric"});
}
function countdown(date) {
  if (!date) return "Set a date";
  const target = new Date(`${date}T00:00:00`);
  const today = new Date(); today.setHours(0,0,0,0);
  const delta = Math.ceil((target - today) / 86400000);
  if (delta < 0) return `${Math.abs(delta)} day${Math.abs(delta) === 1 ? "" : "s"} ago`;
  if (delta === 0) return "Today";
  return `${delta} day${delta === 1 ? "" : "s"} left`;
}
function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
}
function toast(message) {
  const node = $("toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove("show"), 2400);
}
function fillSubjectSelect(select, includeAll = false) {
  select.innerHTML = (includeAll ? '<option value="all">All subjects</option>' : "") +
    subjectNames.map(subject => `<option value="${escapeHTML(subject)}">${escapeHTML(subject)}</option>`).join("");
}
function closeNavigation() {
  $("sidebar").classList.remove("open");
  $("sidebarScrim")?.classList.remove("open");
  $("mobileMenu").setAttribute("aria-expanded", "false");
  $("mobileMenu").setAttribute("aria-label", "Open navigation");
}
function openPage(name) {
  document.querySelectorAll(".page").forEach(page => page.classList.toggle("active", page.id === `page-${name}`));
  document.querySelectorAll(".nav-link").forEach(button => button.classList.toggle("active", button.dataset.page === name));
  closeNavigation();
  if (name === "syllabus") renderChapters();
  if (name === "notes") loadSelectedNote();
  window.scrollTo({top:0, behavior:"smooth"});
}
function renderAll() {
  document.documentElement.dataset.theme = state.settings.theme;
  $("themeSelect").value = state.settings.theme;
  if ($("studentName")) $("studentName").value = state.settings.studentName || "";
  if ($("assistantStyle")) $("assistantStyle").value = state.settings.assistantStyle || "gentle";
  $("preboardDate").value = state.settings.preboardDate || "";
  $("boardDate").value = state.settings.boardDate || "";
  $("dailyTarget").value = state.settings.dailyTarget || "5";
  renderDashboard();
  renderTasks();
  renderChapters();
  renderNotesSelectors();
  renderProgress();
  renderExamScores();
}
function safeRenderAll() {
  try {
    renderAll();
    return true;
  } catch (error) {
    console.error("StudyHub could not refresh one of its views.", error);
    toast("A view could not refresh. Your button controls are still active; try refreshing the page.");
    return false;
  }
}

function renderDashboard() {
  const now = new Date();
  const displayName = (state.settings.studentName || "").trim() || "Student";
  $("greeting").textContent = `Welcome back, ${displayName}.`;
  $("assistantHeading").textContent = `${displayName}’s study companion`;
  $("todayLabel").textContent = now.toLocaleDateString(undefined, {weekday:"long", month:"long", day:"numeric"});
  $("preboardCountdown").textContent = countdown(state.settings.preboardDate);
  $("preboardDateLabel").textContent = state.settings.preboardDate ? dateLabel(state.settings.preboardDate) : "Set a date in Settings";
  $("boardCountdown").textContent = countdown(state.settings.boardDate);
  $("boardDateLabel").textContent = state.settings.boardDate ? dateLabel(state.settings.boardDate) : "Set a date in Settings";
  $("preboardOverallPercent").textContent = formatExamPercent(examStats("preboard").percent);
  $("boardOverallPercent").textContent = formatExamPercent(examStats("board").percent);
  $("preboardTargetLabel").textContent = `Target ${formatExamPercent(state.examTargets.preboard)}`;
  $("boardTargetLabel").textContent = `Target ${formatExamPercent(state.examTargets.board)}`;
  const stats = overallStats();
  $("overallPercent").textContent = `${stats.percent}%`;
  $("overallProgressBar").style.width = `${stats.percent}%`;
  $("chapterCountText").textContent = `${stats.done} of ${stats.total} chapters completed`;
  $("remainingCount").textContent = stats.total - stats.done;
  $("testsAttempted").textContent = state.tests.length;
  $("averageScore").textContent = averageScore() === null ? "—" : `${averageScore()}%`;
  $("subjectOverview").innerHTML = subjectNames.map(subject => {
    const s = subjectStats(subject);
    return `<article class="subject-card"><div class="subject-card-top"><h3>${escapeHTML(subject)}</h3><span class="subject-count">${s.percent}%</span></div><div class="subject-count">${s.done} of ${s.total} chapters</div><div class="progress"><span style="width:${s.percent}%"></span></div><button class="button button-outline button-small" data-subject-open="${escapeHTML(subject)}">View chapters</button></article>`;
  }).join("");
  const todays = state.tasks.filter(task => task.date === todayISO());
  const complete = todays.filter(task => task.done).length;
  $("taskProgressText").textContent = todays.length ? `${complete} of ${todays.length} tasks completed today.` : "No tasks planned for today yet.";
  const preview = todays.slice(0,4);
  $("dashboardTasks").innerHTML = preview.length ? preview.map(taskRowHTML).join("") : '<div class="empty-state">No tasks for today. Add a few manageable tasks in your planner.</div>';
  renderWeekBars();
}
function taskRowHTML(task) {
  return `<div class="task-row ${task.done ? "completed" : ""}"><input type="checkbox" data-task-check="${escapeHTML(task.id)}" ${task.done ? "checked" : ""} aria-label="Mark task complete"><div class="task-copy"><b>${escapeHTML(task.title)}</b><small>${escapeHTML(task.subject || "General")} · ${escapeHTML(task.duration || 30)} min · ${escapeHTML(task.date || "No date")}</small></div><button class="task-delete" data-task-delete="${escapeHTML(task.id)}" aria-label="Delete task">×</button></div>`;
}

function renderWeekBars() {
  const today = new Date();
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const days = [];
  let totalMinutes = 0;
  for (let i=0;i<7;i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate()+i);
    const iso = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
    const minutes = state.tasks.filter(task=>task.done && task.date===iso).reduce((sum,task)=>sum+(Number(task.duration)||0),0);
    totalMinutes += minutes;
    days.push({date,iso,minutes});
  }
  const maxMinutes = Math.max(45,...days.map(day=>day.minutes));
  $("weekTotal").textContent = totalMinutes >= 60
    ? `${Math.floor(totalMinutes/60)}h ${totalMinutes%60 ? totalMinutes%60+"m" : ""} studied`.trim()
    : `${totalMinutes} minutes studied`;
  $("weekBars").innerHTML = days.map(day=>{
    const height = day.minutes ? Math.max(6,Math.round(day.minutes/maxMinutes*100)) : 0;
    const label = day.date.toLocaleDateString(undefined,{weekday:"short"});
    return `<div class="week-day ${day.iso===todayISO()?"today":""}" title="${label}: ${day.minutes} minutes">
      <strong>${day.minutes ? day.minutes+"m" : "·"}</strong>
      <span class="week-track"><span class="week-fill" style="height:${height}%"></span></span>
      <small>${label}</small>
    </div>`;
  }).join("");
}
function answerCompanion() {
  const name = (state.settings.studentName || "").trim() || "Student";
  const intent = $("assistantIntent").value;
  const gentle = (state.settings.assistantStyle || "gentle") === "gentle";
  const unfinished = allChapters().filter(item=>!state.completed[item.key]);
  const todayTasks = state.tasks.filter(task=>task.date===todayISO());
  const pending = todayTasks.filter(task=>!task.done);
  const completed = todayTasks.filter(task=>task.done);
  const next = unfinished.find(item=>!pending.some(task=>task.title.includes(item.chapter))) || unfinished[0];
  let message = "";
  if (intent === "next") {
    message = next
      ? `Your next useful step is ${next.chapter} in ${next.subject}. Spend 25 minutes revising the main ideas, then try 5 questions without looking at your notes.`
      : "All tracked chapters are marked complete. Pick one topic you find difficult and test your memory with a short question set.";
    if (pending.length) message += `\n\nYou have ${pending.length} unfinished task${pending.length===1?"":"s"} planned for today. Try completing one before adding another.`;
  } else if (intent === "revise") {
    message = "Use a simple 30-minute revision block: 10 minutes to recall key points from memory, 15 minutes of questions, and 5 minutes to correct mistakes.";
    if (next) message += `\n\nA chapter to use for your next slot: ${next.chapter} (${next.subject}).`;
  } else if (intent === "weak") {
    const lowest = subjectNames.map(subject=>({subject,...subjectStats(subject)})).sort((a,b)=>a.percent-b.percent).slice(0,3);
    message = "Your least-complete subjects right now:\n" + lowest.map(item=>`• ${item.subject}: ${item.percent}% complete, ${item.total-item.done} left`).join("\n");
    if (next) message += `\n\nStart with ${next.chapter}.`;
  } else {
    message = "You do not have to fix the whole syllabus today. Choose one small task, set a 20-minute timer, put your phone aside, and focus only on that task. A small start still counts.";
    if (next) message += `\n\nAn easy place to begin: ${next.chapter} in ${next.subject}.`;
  }
  if (completed.length) message += `\n\nYou have already completed ${completed.length} task${completed.length===1?"":"s"} today. That is progress.`;
  if (!gentle) message = message.replace("Your next useful step is ","Next: ").replace("Try completing one before adding another.","Finish a pending task before adding more.");
  $("assistantReply").textContent = `For ${name}:\n${message}`;
}

function renderTasks() {
  const filter = $("taskFilter").value;
  const today = todayISO();
  const tasks = state.tasks.filter(task => {
    if (filter === "today") return task.date === today;
    if (filter === "open") return !task.done;
    if (filter === "done") return task.done;
    return true;
  }).sort((a,b) => (a.date || "").localeCompare(b.date || ""));
  $("plannerTasks").innerHTML = tasks.length ? tasks.map(taskRowHTML).join("") : '<div class="empty-state">No matching tasks. Add a task above to plan your study session.</div>';
}
function renderChapters() {
  const subject = $("subjectFilter").value || "all";
  const status = $("statusFilter").value || "all";
  const query = ($("chapterSearch").value || $("globalSearch").value || "").trim().toLocaleLowerCase();
  const chapters = allChapters().filter(item => {
    const isDone = Boolean(state.completed[item.key]);
    return (subject === "all" || item.subject === subject) &&
      (status === "all" || (status === "done" ? isDone : !isDone)) &&
      (!query || `${item.subject} ${item.chapter}`.toLocaleLowerCase().includes(query));
  });
  $("syllabusHeading").textContent = subject === "all" ? "All subjects" : subject;
  $("syllabusCount").textContent = `${chapters.length} chapters shown`;
  $("chapterList").innerHTML = chapters.length ? chapters.map(item => `
    <label class="chapter-row"><input type="checkbox" data-chapter-check="${escapeHTML(item.key)}" ${state.completed[item.key] ? "checked" : ""}>
    <span class="chapter-copy"><b>${escapeHTML(item.chapter)}</b><small>${escapeHTML(item.subject)}</small></span>
    <span class="status-label">${state.completed[item.key] ? "Completed" : "To do"}</span></label>`).join("") : '<div class="empty-state">No chapters match those filters.</div>';
}
function renderNotesSelectors() {
  const previousSubject = $("notesSubject").value;
  fillSubjectSelect($("notesSubject"));
  if (subjectNames.includes(previousSubject)) $("notesSubject").value = previousSubject;
  const subject = $("notesSubject").value;
  const previousChapter = $("notesChapter").value;
  $("notesChapter").innerHTML = SUBJECTS[subject].chapters.map(chapter => `<option value="${escapeHTML(chapter)}">${escapeHTML(chapter)}</option>`).join("");
  if (SUBJECTS[subject].chapters.includes(previousChapter)) $("notesChapter").value = previousChapter;
  loadSelectedNote();
}
function loadSelectedNote() {
  if (!$("notesSubject").value || !$("notesChapter").value) return;
  const key = chapterKey($("notesSubject").value, $("notesChapter").value);
  $("notesEditor").value = state.notes[key] || "";
  $("notesStatus").textContent = state.notes[key] ? "Saved note loaded." : "No saved notes for this chapter yet.";
}
function renderProgress() {
  $("progressTestCount").textContent = state.tests.length;
  $("progressAverage").textContent = averageScore() === null ? "—" : `${averageScore()}%`;
  $("progressBest").textContent = state.tests.length ? `${Math.max(...state.tests.map(t => Math.round(t.score / t.total * 100)))}%` : "—";
  $("subjectProgressRows").innerHTML = subjectNames.map(subject => {
    const s = subjectStats(subject);
    return `<div class="subject-progress-row"><div class="row"><b>${escapeHTML(subject)}</b><span class="muted">${s.done}/${s.total} · ${s.percent}%</span></div><div class="progress"><span style="width:${s.percent}%"></span></div></div>`;
  }).join("");
  $("testHistory").innerHTML = state.tests.length ? [...state.tests].reverse().map(test => `
    <div class="test-row"><div><b>${escapeHTML(test.name)}</b><small>${escapeHTML(test.date)} · ${test.score}/${test.total} marks</small></div><b>${Math.round(test.score/test.total*100)}%</b></div>`).join("") : '<div class="empty-state">No test results yet. Complete a quiz or record a test result.</div>';
}

function formatExamPercent(percent) {
  if (percent === null || !Number.isFinite(percent)) return "—";
  return `${Number(percent.toFixed(1))}%`;
}
function examStats(kind, recordsOverride = null) {
  const records = recordsOverride || state.examScores?.[kind] || {};
  let count = 0, obtained = 0, total = 0;
  subjectNames.forEach(subject => {
    const entry = records[subject];
    if (!entry || entry.obtained === "" || entry.obtained === null || entry.obtained === undefined) return;
    const score = Number(entry.obtained), maximum = Number(entry.total);
    if (!Number.isFinite(score) || !Number.isFinite(maximum) || maximum <= 0 || score < 0 || score > maximum) return;
    count++; obtained += score; total += maximum;
  });
  return {count, obtained, total, percent: total > 0 ? obtained / total * 100 : null};
}
function collectExamScoresFromForm(kind) {
  const form = $(kind === "preboard" ? "preboardScoreForm" : "boardScoreForm");
  const records = {};
  form.querySelectorAll("[data-score-subject]").forEach(row => {
    const subject = row.dataset.scoreSubject;
    const obtained = row.querySelector('[data-score-part="obtained"]').value.trim();
    const total = row.querySelector('[data-score-part="total"]').value.trim();
    records[subject] = {obtained, total};
  });
  return records;
}
function paintExamScore(kind, stats) {
  const prefix = kind === "preboard" ? "preboard" : "board";
  const target = Number(state.examTargets?.[kind] ?? (kind === "preboard" ? 90 : 95));
  $(`${prefix}ScorePercent`).textContent = formatExamPercent(stats.percent);
  $(`${prefix}ScoreTargetHint`).textContent = stats.percent === null
    ? `Target goal: ${formatExamPercent(target)}`
    : stats.percent >= target ? `Target ${formatExamPercent(target)} · goal reached` : `Target ${formatExamPercent(target)} · ${(target-stats.percent).toFixed(1)} points to go`;
  $(`${prefix}ScoreSummary`).textContent = stats.count
    ? `${stats.count} of ${subjectNames.length} subjects · ${stats.obtained} / ${stats.total} marks`
    : "No subject marks entered yet.";
}
function updateExamScorePreview(kind) {
  paintExamScore(kind, examStats(kind, collectExamScoresFromForm(kind)));
}
function renderExamScores() {
  ["preboard","board"].forEach(kind => {
    const container = $(`${kind}ScoreFields`);
    if (!container) return;
    const records = state.examScores?.[kind] || {};
    const targetInput = container.parentElement.querySelector("[data-score-target]");
    if (targetInput) targetInput.value = String(state.examTargets?.[kind] ?? (kind === "preboard" ? 90 : 95));
    container.innerHTML = subjectNames.map(subject => {
      const entry = records[subject] || {};
      const obtained = entry.obtained ?? "";
      const maximum = entry.total ?? "80";
      return `<div class="score-subject-row" data-score-subject="${escapeHTML(subject)}">
        <div class="score-subject-name">${escapeHTML(subject)}</div>
        <label>Scored<input type="number" min="0" step="0.5" inputmode="decimal" placeholder="—" aria-label="${escapeHTML(subject)} marks obtained" data-score-kind="${kind}" data-score-part="obtained" value="${escapeHTML(obtained)}"></label>
        <label>Out of<input type="number" min="1" step="0.5" inputmode="decimal" aria-label="${escapeHTML(subject)} maximum marks" data-score-kind="${kind}" data-score-part="total" value="${escapeHTML(maximum)}"></label>
      </div>`;
    }).join("");
    paintExamScore(kind, examStats(kind));
    updateExamScorePreview(kind);
  });
}
function saveExamScores(event, kind) {
  event.preventDefault();
  const records = collectExamScoresFromForm(kind);
  const form = $(kind === "preboard" ? "preboardScoreForm" : "boardScoreForm");
  const target = Number(form.querySelector("[data-score-target]").value);
  if (!Number.isFinite(target) || target < 0 || target > 100) {
    toast("Target percentage must be between 0 and 100.");
    return;
  }
  let entered = 0;
  for (const [subject, entry] of Object.entries(records)) {
    if (entry.obtained === "") continue;
    const score = Number(entry.obtained), maximum = Number(entry.total);
    if (!Number.isFinite(score) || !Number.isFinite(maximum) || maximum <= 0 || score < 0 || score > maximum) {
      toast(`Check ${subject}: marks obtained must be between 0 and the maximum marks.`);
      return;
    }
    entered++;
  }
  state.examTargets[kind] = target;
  state.examScores[kind] = records;
  persist(kind === "preboard" ? "Pre-board marks saved." : "Board marks saved.");
}

function addTask(title, subject, date, duration=30) {
  state.tasks.push({id:crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, title, subject, date, duration, done:false});
}
function exportBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = `studyhub-backup-${todayISO()}.json`; link.click();
  URL.revokeObjectURL(url);
  toast("Backup exported.");
}

const QUIZZES = {
  daily: [
    {q:"Which is the nth term of an arithmetic progression?", options:["a + (n − 1)d","a + nd","n(a + d)"], answer:0, explain:"The nth term is aₙ = a + (n − 1)d."},
    {q:"What is the basic structural and functional unit of life?", options:["Tissue","Cell","Organ"], answer:1, explain:"The cell is the basic unit of life."},
    {q:"Which sector includes agriculture?", options:["Primary","Secondary","Tertiary"], answer:0, explain:"Agriculture is part of the primary sector."}
  ],
  stem: [
    {q:"A quadratic polynomial has degree:", options:["1","2","3"], answer:1, explain:"The highest power of the variable is 2."},
    {q:"The SI unit of electric current is:", options:["Volt","Ampere","Ohm"], answer:1, explain:"Electric current is measured in amperes (A)."},
    {q:"Which gas is commonly released when a metal reacts with a dilute acid?", options:["Hydrogen","Oxygen","Nitrogen"], answer:0, explain:"Many metals react with dilute acids to release hydrogen gas."}
  ],
  aiEnglish: [
    {q:"NLP stands for:", options:["Natural Language Processing","Network Learning Program","Numeric Language Protocol"], answer:0, explain:"NLP helps computers process and work with human language."},
    {q:"Which is the most useful way to revise a prose chapter?", options:["Memorise without understanding","Summarise the main ideas and practise questions","Skip the chapter"], answer:1, explain:"A short summary plus question practice supports understanding and recall."},
    {q:"In the AI project cycle, problem scoping is used to:", options:["Define the problem and goal","Only write code","Publish the final model"], answer:0, explain:"Problem scoping identifies the problem, stakeholders and project goal."}
  ]
};
function startQuiz(name) {
  activeQuiz = {name, questions:QUIZZES[name]};
  $("quizTitle").textContent = ({daily:"Daily practice",stem:"Maths & Science",aiEnglish:"AI & English"})[name];
  $("quizSubtitle").textContent = `${activeQuiz.questions.length} starter questions · Answers are explained after submission.`;
  $("quizArea").innerHTML = activeQuiz.questions.map((q,index) => `
    <article class="question"><h3>${index+1}. ${escapeHTML(q.q)}</h3>
    ${q.options.map((option,optionIndex) => `<label class="answer-option"><input type="radio" name="answer-${index}" value="${optionIndex}"> ${escapeHTML(option)}</label>`).join("")}
    <div class="feedback hidden" id="feedback-${index}"></div></article>`).join("") +
    '<button class="button button-primary" id="submitQuiz">Submit answers</button><div id="quizResult"></div>';
  $("submitQuiz").addEventListener("click", submitQuiz, {once:true});
}
function submitQuiz() {
  if (!activeQuiz) return;
  let score = 0;
  activeQuiz.questions.forEach((q,index) => {
    const chosen = document.querySelector(`input[name="answer-${index}"]:checked`);
    const correct = chosen && Number(chosen.value) === q.answer;
    if (correct) score++;
    const feedback = $(`feedback-${index}`);
    feedback.classList.remove("hidden");
    feedback.innerHTML = `${correct ? "Correct." : `Correct answer: ${escapeHTML(q.options[q.answer])}.`} ${escapeHTML(q.explain)}`;
    document.querySelectorAll(`input[name="answer-${index}"]`).forEach(input => input.disabled = true);
  });
  state.tests.push({name:$("quizTitle").textContent, score, total:activeQuiz.questions.length, date:dateLabel(todayISO())});
  $("quizResult").innerHTML = `<div class="feedback"><b>Your score: ${score}/${activeQuiz.questions.length} (${Math.round(score/activeQuiz.questions.length*100)}%)</b><br>Review each explanation and practise again later.</div>`;
  $("submitQuiz").disabled = true;
  persist("Quiz result saved to your progress.");
}

function init() {
  fillSubjectSelect($("taskSubject"));
  fillSubjectSelect($("subjectFilter"), true);
  $("taskDate").value = todayISO();
  $("recordDate").value = todayISO();
  document.addEventListener("click", event => {
    const pageButton = event.target.closest("[data-page]");
    if (pageButton) { event.preventDefault(); openPage(pageButton.dataset.page); return; }
    const openButton = event.target.closest("[data-open]");
    if (openButton) { openPage(openButton.dataset.open); return; }
    const subjectButton = event.target.closest("[data-subject-open]");
    if (subjectButton) { $("subjectFilter").value = subjectButton.dataset.subjectOpen; openPage("syllabus"); return; }
    const quizButton = event.target.closest("[data-quiz]");
    if (quizButton) { startQuiz(quizButton.dataset.quiz); return; }
    const noteChoice = event.target.closest("[data-note-subject][data-note-chapter]");
    if (noteChoice) {
      $("guideSubject").value = noteChoice.dataset.noteSubject;
      fillGuideChapters(noteChoice.dataset.noteChapter);
      $("noteChapterResults").querySelectorAll(".note-chapter-result").forEach(button => button.classList.toggle("active", button === noteChoice));
      $("guideContent").scrollIntoView({behavior:"smooth",block:"start"});
      return;
    }
    const deleteButton = event.target.closest("[data-task-delete]");
    if (deleteButton) {
      state.tasks = state.tasks.filter(task => task.id !== deleteButton.dataset.taskDelete);
      persist("Task deleted."); return;
    }
  });
  document.addEventListener("change", event => {
    const check = event.target.closest("[data-task-check]");
    if (check) {
      const task = state.tasks.find(item => item.id === check.dataset.taskCheck);
      if (task) { task.done = check.checked; persist(task.done ? "Task completed." : "Task reopened."); }
      return;
    }
    const chapter = event.target.closest("[data-chapter-check]");
    if (chapter) {
      state.completed[chapter.dataset.chapterCheck] = chapter.checked;
      persist(chapter.checked ? "Chapter marked complete." : "Chapter marked as not complete.");
    }
  });
  $("mobileMenu").addEventListener("click", () => {
    const isOpen = $("sidebar").classList.toggle("open");
    $("sidebarScrim")?.classList.toggle("open", isOpen);
    $("mobileMenu").setAttribute("aria-expanded", String(isOpen));
    $("mobileMenu").setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });
  $("sidebarScrim")?.addEventListener("click", closeNavigation);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeNavigation();
  });
  $("themeToggle").addEventListener("click", () => {
    state.settings.theme = state.settings.theme === "dark" ? "midnight" : "dark";
    persist(state.settings.theme === "dark" ? "Pure black theme enabled." : "Soft charcoal theme enabled.");
  });
  $("themeSelect").addEventListener("change", () => {
    state.settings.theme = $("themeSelect").value;
    document.documentElement.dataset.theme = state.settings.theme;
  });
  $("settingsForm").addEventListener("submit", event => {
    event.preventDefault();
    state.settings.preboardDate = $("preboardDate").value;
    state.settings.boardDate = $("boardDate").value;
    state.settings.dailyTarget = $("dailyTarget").value;
    state.settings.studentName = ($("studentName").value.trim() || "Student").slice(0, 40);
    state.settings.assistantStyle = $("assistantStyle").value;
    state.settings.theme = $("themeSelect").value;
    persist("Settings saved.");
  });
  $("taskForm").addEventListener("submit", event => {
    event.preventDefault();
    addTask($("taskName").value.trim(), $("taskSubject").value, $("taskDate").value, Number($("taskDuration").value));
    $("taskName").value = "";
    persist("Study task added.");
  });
  $("suggestTasks").addEventListener("click", () => {
    const unfinished = allChapters().filter(item => !state.completed[item.key]).slice(0,3);
    if (!unfinished.length) { toast("All tracked chapters are marked complete."); return; }
    unfinished.forEach(item => addTask(`Study: ${item.chapter}`, item.subject, todayISO(), 45));
    persist("Added three suggested chapter tasks.");
  });
  $("taskFilter").addEventListener("change", renderTasks);
  $("chapterSearch").addEventListener("input", renderChapters);
  $("globalSearch").addEventListener("input", () => {
    $("chapterSearch").value = $("globalSearch").value;
    openPage("syllabus"); renderChapters();
  });
  $("subjectFilter").addEventListener("change", renderChapters);
  $("statusFilter").addEventListener("change", renderChapters);
  $("markVisible").addEventListener("click", () => {
    const visible = [...$("chapterList").querySelectorAll("[data-chapter-check]")];
    visible.forEach(input => state.completed[input.dataset.chapterCheck] = true);
    persist(`Marked ${visible.length} visible chapters complete.`);
  });
  $("notesSubject").addEventListener("change", renderNotesSelectors);
  $("notesChapter").addEventListener("change", loadSelectedNote);
  $("saveNotes").addEventListener("click", () => {
    const key = chapterKey($("notesSubject").value, $("notesChapter").value);
    state.notes[key] = $("notesEditor").value;
    persist("Notes saved.");
    $("notesStatus").textContent = "Saved just now in this browser.";
  });
  $("insertNotesTemplate").addEventListener("click", () => {
    if ($("notesEditor").value.trim() && !confirm("Replace the current editor text with the template? Save your existing note first if needed.")) return;
    $("notesEditor").value = "MAIN IDEA\n\nKEY FACTS / FORMULAS\n\nEXAMPLES / DIAGRAMS\n\nMISTAKES TO AVOID\n\nQUESTIONS TO REVISE\n";
  });
  $("preboardScoreForm").addEventListener("submit", event => saveExamScores(event, "preboard"));
  $("boardScoreForm").addEventListener("submit", event => saveExamScores(event, "board"));
  document.querySelectorAll("[data-score-target]").forEach(input => input.addEventListener("input", () => {
    const kind = input.dataset.scoreTarget;
    const value = Number(input.value);
    $(`${kind}ScoreTargetHint`).textContent = input.value !== "" && Number.isFinite(value) && value >= 0 && value <= 100 ? `Target goal: ${formatExamPercent(value)}` : "Enter a target from 0% to 100%.";
  }));
  document.addEventListener("input", event => {
    const scoreInput = event.target.closest("[data-score-kind]");
    if (scoreInput) updateExamScorePreview(scoreInput.dataset.scoreKind);
    if (event.target.id === "noteSearch") renderNoteChapterResults(event.target.value);
  });
  $("recordTestForm").addEventListener("submit", event => {
    event.preventDefault();
    const score = Number($("recordScore").value), total = Number($("recordTotal").value);
    if (total <= 0 || score < 0 || score > total) { toast("Enter a score between 0 and the total marks."); return; }
    state.tests.push({name:$("recordName").value.trim(), score, total, date:dateLabel($("recordDate").value)});
    $("recordName").value = ""; $("recordScore").value = "";
    persist("Test result recorded.");
  });
  $("clearTestHistory").addEventListener("click", () => {
    if (confirm("Delete all saved test results? This cannot be undone unless you have a backup.")) { state.tests = []; persist("Test history cleared."); }
  });
  $("resetChapters").addEventListener("click", () => {
    if (confirm("Clear all chapter completion checkmarks? Notes and tasks will remain.")) { state.completed = {}; persist("Chapter progress reset."); }
  });
  $("exportData").addEventListener("click", exportBackup);
  $("askCompanion").addEventListener("click", answerCompanion);
  // Wire controls before the first render so a display bug cannot disable every button.
  safeRenderAll();
}
init();

/* Prepared chapter notes: reader, personal-note handoff, download and revision task. */

function fallbackChapterNote(subject, chapter) {
  const common = {
    "Mathematics": {
      overview: `${chapter} can be revised by identifying the given information, selecting the matching theorem or formula, showing each step clearly, and checking the final result.`,
      points: ["Write the required formula or theorem before substituting values.", "Show enough working for each step and keep units or signs consistent.", "Check the answer by substitution, estimation, or a second method when possible."],
      practice: `Write the key formula for ${chapter}, solve one textbook example without looking at the solution, and explain why each step works.`
    },
    "Science": {
      overview: `Use this chapter outline for ${chapter}: learn the central scientific idea, connect it to a process or labelled diagram, and practise applying it to a new example.`,
      points: ["Learn the definition and the scientific reason behind it.", "For processes, remember the sequence and what enters or leaves each stage.", "Practise labelled diagrams, units, equations, observations, and reasoning where relevant."],
      practice: `Explain ${chapter} in your own words, draw a labelled diagram if relevant, and answer one “why” and one application question.`
    },
    "Social Science": {
      overview: `Revise ${chapter} by organising the main concepts, people or places, causes, events, and effects into a clear sequence.`,
      points: ["Use accurate key terms, dates, places, and examples from the prescribed text.", "Link causes to developments and consequences rather than memorising isolated facts.", "For map-based topics, practise the exact locations specified by your school syllabus."],
      practice: `Create a short cause–event–impact chart for ${chapter} and write one structured answer using specific examples.`
    },
    "English": {
      overview: `For ${chapter}, focus on the central idea, characters or speaker, key events, tone, and the evidence that supports an interpretation.`,
      points: ["Summarise the text in sequence and distinguish the main idea from details.", "Support character or theme interpretations with a specific moment from the text.", "For literature answers, explain how the evidence supports the point instead of retelling the whole story."],
      practice: `Write a 100–120 word response about the main idea of ${chapter}, using a specific example from the text.`
    },
    "Hindi A": {
      overview: `${chapter} के लिए मुख्य भाव, प्रसंग, भाषा-शैली और लेखक या कवि के संदेश को अपने शब्दों में समझें।`,
      points: ["पाठ या कविता का केंद्रीय भाव स्पष्ट रूप से लिखें।", "उत्तर में प्रसंग, उदाहरण और संदेश का उचित संबंध रखें।", "शब्दार्थ, काव्य-सौंदर्य और पात्रों के व्यवहार को पाठ के अनुसार दोहराएँ।"],
      practice: `${chapter} का सार अपने शब्दों में लिखें और मुख्य संदेश पर एक प्रश्न का उत्तर दें।`
    },
    "AI (417)": {
      overview: `For ${chapter}, connect the core term to a real problem, the data or steps involved, and how you would check the result responsibly.`,
      points: ["Learn the definition and one real-world example.", "Know the sequence of steps and the purpose of each step.", "Explain limitations, evaluation, privacy, fairness, and responsible use where relevant."],
      practice: `Define the main idea in ${chapter}, give one example, and describe how you would evaluate the result.`
    }
  };
  return common[subject] || {overview:`Use this revision outline for ${chapter}.`,points:["Learn the key terms.","Summarise the main idea.","Practise one exam-style question."],practice:`Summarise ${chapter} and attempt one exam-style question.`};
}
function preparedNoteFor(subject, chapter) {
  const subjectNotes = window.STUDY_NOTES && window.STUDY_NOTES[subject];
  if (!subjectNotes) return fallbackChapterNote(subject, chapter);
  let key = chapter;
  if (subject === "AI (417)") key = chapter.replace(/^Employability Skills:\\s*/, "");
  return subjectNotes[key] || fallbackChapterNote(subject, chapter);
}
function visualStepsFor(subject, chapter) {
  const text = `${subject} ${chapter}`.toLowerCase();
  if (subject === "Mathematics") {
    if (/probability/.test(text)) return [["Sample space","List all outcomes"],["Favourable","Count wanted outcomes"],["Formula","P(E)=n(E)/n(S)"],["Check","0 ≤ P(E) ≤ 1"]];
    if (/trigonometry/.test(text)) return [["Angle θ","Choose the angle"],["Sides","Opposite / adjacent"],["Ratio","sin, cos or tan"],["Verify","Check the triangle"]];
    if (/progression|sequence|series/.test(text)) return [["First term a","Start value"],["Difference d","Find the pattern"],["Nth term","aₙ=a+(n−1)d"],["Sum","Use the matching formula"]];
    if (/circle|tangent|area/.test(text)) return [["Given","Mark radius / length"],["Rule","Choose the theorem"],["Substitute","Show each step"],["Units","Check the final area"]];
    if (/quadratic|polynomial|linear/.test(text)) return [["Equation","Arrange the terms"],["Method","Factor or solve"],["Roots","Find the values"],["Verify","Substitute back"]];
    return [["Given values","List what is known"],["Rule","Select a formula"],["Working","Show each step"],["Check","Verify the result"]];
  }
  if (subject === "Science") {
    if (/electricity|magnetic/.test(text)) return [["Source","Cell / supply"],["Current","Charge in a circuit"],["Component","Load / resistance"],["Measure","Use correct units"]];
    if (/environment/.test(text)) return [["Sunlight","Energy source"],["Producer","Plants"],["Consumer","Feeds on others"],["Decomposer","Returns nutrients"]];
    if (/heredity|reproduce/.test(text)) return [["Parents","Genetic information"],["Gametes","Carry alleles"],["Fertilisation","Combine information"],["Offspring","Traits appear"]];
    if (/light:|human eye|colourful/.test(text)) return [["Light ray","Incident ray"],["Surface / lens","Reflect or refract"],["Direction","Angle changes"],["Image","Position / nature"]];
    if (/chemical|acid|metal|carbon/.test(text)) return [["Reactants","Starting substances"],["Condition","Heat / catalyst"],["Change","Reaction occurs"],["Products","Observe and write"]];
    if (/life processes|control|coordination/.test(text)) return [["Input","Stimulus / materials"],["Process","Body system works"],["Transport","Move / coordinate"],["Response","Result / output"]];
    return [["Structure","Identify parts"],["Process","Show the sequence"],["Observation","Record the change"],["Reason","Explain why"]];
  }
  if (subject === "Social Science") {
    if (/resources|water|agriculture|minerals|manufacturing|lifelines|forest/.test(text)) return [["Resource","What / where"],["Use","People and needs"],["Impact","Economy / nature"],["Plan","Sustainable choice"]];
    if (/development|sectors|money|globalisation|consumer/.test(text)) return [["Need","Identify the issue"],["System","People / institutions"],["Effect","Who benefits?"],["Choice","Evidence-based view"]];
    return [["Background","Context and causes"],["Development","Key event / idea"],["People","Actions and choices"],["Impact","Outcome and legacy"]];
  }
  if (subject === "AI (417)") return [["Problem","Define the goal"],["Data","Collect and prepare"],["Model","Train / process"],["Evaluate","Test and improve"]];
  if (subject === "Hindi A") return [["प्रसंग","पाठ का संदर्भ"],["भाव","मुख्य विचार"],["भाषा","शैली / उदाहरण"],["संदेश","निष्कर्ष"]];
  return [["Read","Understand the text"],["Notice","Find useful clues"],["Interpret","Explain meaning"],["Support","Use text evidence"]];
}
function conceptDiagramMarkup(subject, chapter) {
  const steps = visualStepsFor(subject, chapter);
  const key = `${subject} ${chapter}`.toLowerCase();
  if (subject === "Mathematics" && /trigonometry/.test(key)) {
    return `<figure class="concept-visual specific-diagram">
      <svg viewBox="0 0 760 235" role="img" aria-label="Right triangle showing trigonometric sides" xmlns="http://www.w3.org/2000/svg">
        <path d="M95 190 L95 45 L335 190 Z" fill="#0c1a22" stroke="#67e4d0" stroke-width="2.5"/>
        <path d="M95 166 H119 V190" fill="none" stroke="#aeb9cb" stroke-width="1.6"/>
        <text x="78" y="207" fill="#eef5fc" font-size="13">A</text><text x="78" y="36" fill="#eef5fc" font-size="13">B</text><text x="340" y="205" fill="#eef5fc" font-size="13">C</text>
        <text x="110" y="114" fill="#b9c6d6" font-size="12" transform="rotate(-90 110 114)">Opposite</text>
        <text x="193" y="211" fill="#b9c6d6" font-size="12">Adjacent</text><text x="224" y="103" fill="#b9c6d6" font-size="12" transform="rotate(31 224 103)">Hypotenuse</text>
        <path d="M302 190 A33 33 0 0 0 309 171" fill="none" stroke="#a78bfa" stroke-width="2"/>
        <text x="284" y="172" fill="#c6b8ff" font-size="14" font-weight="700">θ</text>
        <line x1="390" y1="38" x2="390" y2="205" stroke="#263644"/>
        <text x="420" y="62" fill="#67e4d0" font-size="11" font-weight="800" letter-spacing="1">RATIOS</text>
        <text x="420" y="100" fill="#f3f6fc" font-size="17" font-weight="700">sin θ = opposite / hypotenuse</text>
        <text x="420" y="137" fill="#f3f6fc" font-size="17" font-weight="700">cos θ = adjacent / hypotenuse</text>
        <text x="420" y="174" fill="#f3f6fc" font-size="17" font-weight="700">tan θ = opposite / adjacent</text>
        <text x="420" y="205" fill="#9ca9ba" font-size="11">SOH · CAH · TOA</text>
      </svg><figcaption>Right-triangle schematic. Identify the chosen angle first, then label opposite, adjacent and hypotenuse before selecting a ratio.</figcaption>
    </figure>`;
  }
  if (subject === "Science" && /electricity/.test(key)) {
    return `<figure class="concept-visual specific-diagram">
      <svg viewBox="0 0 760 230" role="img" aria-label="Simplified closed circuit with a cell, resistor and bulb" xmlns="http://www.w3.org/2000/svg">
        <path d="M112 80 H262 M360 80 H625 V100 M625 151 V176 H112 V136 M112 108 V80" stroke="#67e4d0" stroke-width="2.3" fill="none" stroke-linecap="round"/>
        <rect x="262" y="64" width="98" height="32" rx="4" fill="#111922" stroke="#a78bfa" stroke-width="2"/>
        <path d="M278 80 l8 -8 l8 16 l8 -16 l8 16 l8 -16 l8 8" fill="none" stroke="#c6b8ff" stroke-width="1.8"/>
        <circle cx="625" cy="126" r="25" fill="#111922" stroke="#a78bfa" stroke-width="2"/>
        <path d="M610 111 L640 141 M640 111 L610 141" stroke="#c6b8ff" stroke-width="2"/>
        <path d="M100 110 H124 M105 126 H119" stroke="#f1c27a" stroke-width="3" stroke-linecap="round"/>
        <path d="M180 72 l12 8 l-12 8 M420 72 l12 8 l-12 8 M492 168 l12 8 l-12 8" fill="none" stroke="#67e4d0" stroke-width="1.8"/>
        <text x="80" y="100" fill="#f1c27a" font-size="11" text-anchor="middle">Cell</text>
        <text x="310" y="51" fill="#c6b8ff" font-size="12" text-anchor="middle">Resistor</text>
        <text x="625" y="72" fill="#c6b8ff" font-size="12" text-anchor="middle">Bulb / load</text>
        <text x="300" y="218" fill="#9ca9ba" font-size="11" text-anchor="middle">A closed conducting path lets current flow</text>
      </svg><figcaption>Original circuit schematic for revision. For numerical questions, note the circuit connections first; use V = IR only where the question conditions allow it.</figcaption>
    </figure>`;
  }
  if (subject === "Science" && /environment/.test(key)) {
    return `<figure class="concept-visual specific-diagram">
      <svg viewBox="0 0 760 175" role="img" aria-label="Food chain and nutrient recycling schematic" xmlns="http://www.w3.org/2000/svg">
        <defs><marker id="foodArrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" fill="#67e4d0"/></marker></defs>
        <text x="22" y="22" fill="#67e4d0" font-size="10" font-weight="800" letter-spacing="1.5">ENERGY FLOW</text>
        <g fill="#101821" stroke="#2c3b4e" stroke-width="1.3"><rect x="22" y="45" width="135" height="67" rx="9"/><rect x="212" y="45" width="135" height="67" rx="9"/><rect x="402" y="45" width="135" height="67" rx="9"/><rect x="592" y="45" width="145" height="67" rx="9"/></g>
        <g fill="#f4f7fb" font-size="13" font-weight="700" text-anchor="middle"><text x="89" y="75">Sunlight</text><text x="279" y="75">Producer</text><text x="469" y="75">Consumer</text><text x="664" y="75">Decomposer</text></g>
        <g fill="#a1adbd" font-size="10" text-anchor="middle"><text x="89" y="94">Energy source</text><text x="279" y="94">Green plants</text><text x="469" y="94">Food transfer</text><text x="664" y="94">Recycles nutrients</text></g>
        <g stroke="#67e4d0" stroke-width="1.6" fill="none" marker-end="url(#foodArrow)"><path d="M158 79 H202"/><path d="M348 79 H392"/><path d="M538 79 H582"/></g>
        <text x="380" y="147" fill="#9ca9ba" font-size="11" text-anchor="middle">Energy moves through trophic levels; nutrients are recycled.</text>
      </svg><figcaption>Food-chain schematic. Energy flows in one direction through trophic levels, while decomposers help return nutrients to the environment.</figcaption>
    </figure>`;
  }
  const boxes = steps.map((step,index) => {
    const x = 18 + index * 185;
    return `<g>
      <rect x="${x}" y="36" width="158" height="88" rx="10" fill="${index===3?"#132c2b":"#0e1219"}" stroke="${index===3?"#67e4d0":"#2c3644"}" stroke-width="1.3"/>
      <circle cx="${x+17}" cy="53" r="9" fill="${index===3?"#67e4d0":"#202d3c"}"/>
      <text x="${x+17}" y="56.5" text-anchor="middle" font-size="9" font-weight="800" fill="${index===3?"#06100f":"#a9bacb"}">${index+1}</text>
      <text x="${x+12}" y="78" font-size="12" font-weight="700" fill="#f2f6fc">${escapeHTML(step[0])}</text>
      <text x="${x+12}" y="97" font-size="9.5" fill="#9ca9ba">${escapeHTML(step[1])}</text>
    </g>`;
  }).join("");
  const arrows = [0,1,2].map(index => {
    const x = 176 + index * 185;
    return `<path d="M ${x} 80 H ${x+22}" stroke="#67e4d0" stroke-width="1.6" fill="none" marker-end="url(#studyArrow)"/>`;
  }).join("");
  return `<figure class="concept-visual">
    <svg viewBox="0 0 758 151" role="img" aria-label="Original schematic for ${escapeHTML(chapter)}" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="studyArrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#67e4d0"/></marker></defs>
      ${arrows}${boxes}
      <text x="20" y="20" font-size="9" font-weight="800" letter-spacing="1.5" fill="#67e4d0">VISUAL REVISION MODEL</text>
    </svg>
    <figcaption>Original concept schematic for ${escapeHTML(chapter)}. Use the steps to recall the idea, then draw your own detailed labelled diagram in your notebook when the topic requires one.</figcaption>
  </figure>`;
}
function renderNoteChapterResults(query = "") {
  const target = $("noteChapterResults");
  if (!target) return;
  const chapters = allChapters();
  const needle = String(query || "").trim().toLocaleLowerCase();
  const matches = chapters.filter(item => !needle || `${item.subject} ${item.chapter}`.toLocaleLowerCase().includes(needle));
  const visible = needle ? matches.slice(0,24) : matches.slice(0,12);
  const suffix = needle ? `${matches.length} matching chapter${matches.length===1?"":"s"}` : `Browse all ${chapters.length} tracked chapters · search to filter`;
  target.innerHTML = `<p class="note-library-progress">${escapeHTML(suffix)}${matches.length>visible.length?" · showing first "+visible.length:""}</p>` +
    (visible.length ? visible.map((item,index) => `<button type="button" class="note-chapter-result ${$("guideSubject")?.value===item.subject && $("guideChapter")?.value===item.chapter?"active":""}" data-note-subject="${escapeHTML(item.subject)}" data-note-chapter="${escapeHTML(item.chapter)}">
      <span><strong>${escapeHTML(item.chapter)}</strong><small>${escapeHTML(item.subject)}</small></span><span class="note-number">${String(index+1).padStart(2,"0")} ↗</span>
    </button>`).join("") : '<p class="empty-state">No chapter matched. Try another word.</p>');
}

function fillGuideChapters(preferredChapter = "") {
  const subject = $("guideSubject").value;
  const chapters = SUBJECTS[subject].chapters;
  const previousChapter = $("guideChapter").value;
  $("guideChapter").innerHTML = chapters.map(chapter =>
    `<option value="${escapeHTML(chapter)}">${escapeHTML(chapter)}</option>`
  ).join("");
  const wanted = preferredChapter || previousChapter;
  if (chapters.includes(wanted)) $("guideChapter").value = wanted;
  renderPreparedGuide();
  renderNoteChapterResults($("noteSearch")?.value || "");
}
function renderPreparedGuide() {
  const subject = $("guideSubject").value;
  const chapter = $("guideChapter").value;
  if (!subject || !chapter) return;
  const note = preparedNoteFor(subject, chapter);
  const all = SUBJECTS[subject].chapters;
  const chapterNumber = all.indexOf(chapter) + 1;
  const points = note.points || [];
  const visual = conceptDiagramMarkup(subject, chapter);
  const remember = points[0] || "Recall the key definitions and explain the idea in your own words.";
  $("guideContent").innerHTML = `
    <p class="guide-label">${escapeHTML(subject)} · Chapter ${chapterNumber} of ${all.length}</p>
    <h3>${escapeHTML(chapter)}</h3>
    <p class="guide-overview">${escapeHTML(note.overview || "")}</p>
    ${visual}
    <h4>Key ideas to remember</h4>
    <ul>${points.map(point => `<li>${escapeHTML(point)}</li>`).join("")}</ul>
    <div class="note-recall-grid">
      <div class="note-recall-card"><strong>CORE IDEA</strong><span>${escapeHTML(note.overview || "Summarise the concept in one sentence.")}</span></div>
      <div class="note-recall-card"><strong>REMEMBER</strong><span>${escapeHTML(remember)}</span></div>
      <div class="note-recall-card"><strong>EXAM PRACTICE</strong><span>${escapeHTML(note.practice || "Try a textbook question and check your reasoning.")}</span></div>
    </div>
    <div class="guide-practice"><strong>Check your understanding</strong><p>${escapeHTML(note.practice || "Summarise this chapter in your own words and attempt textbook questions.")}</p></div>
    <p class="muted small-text">Use the official textbook for full explanations, exact figures and exam-prescribed content. The schematic above is an original memory aid.</p>`;
  renderNoteChapterResults($("noteSearch")?.value || "");
}
function preparedNoteText() {
  const subject = $("guideSubject").value;
  const chapter = $("guideChapter").value;
  const note = preparedNoteFor(subject, chapter);
  if (!note) return `${chapter}\n\nPrepare your own chapter notes here.\n`;
  return [subject + " — " + chapter, "", note.overview || "", "", "VISUAL REVISION MODEL", ...visualStepsFor(subject, chapter).map((step,index) => `${index+1}. ${step[0]}: ${step[1]}`), "", "KEY IDEAS", ...(note.points || []).map(point => "- " + point), "", "PRACTICE", note.practice || ""].join("\n");
}
function initPreparedNotes() {
  if (!$("guideSubject") || !window.STUDY_NOTES) return;
  fillSubjectSelect($("guideSubject"));
  fillGuideChapters();
  renderNoteChapterResults("");
  $("guideSubject").addEventListener("change", () => fillGuideChapters());
  $("guideChapter").addEventListener("change", renderPreparedGuide);
  $("copyGuideToEditor").addEventListener("click", () => {
    const subject = $("guideSubject").value;
    const chapter = $("guideChapter").value;
    const note = preparedNoteFor(subject, chapter);
    if (!note) { toast("No prepared notes found for this chapter."); return; }
    $("notesSubject").value = subject;
    renderNotesSelectors();
    $("notesChapter").value = chapter;
    $("notesEditor").value = [note.overview || "", "KEY IDEAS", ...(note.points || []).map(point => "• " + point), "PRACTICE", note.practice || ""].join("\n\n");
    $("notesStatus").textContent = "Prepared notes copied into the editor. Press Save notes to keep your own copy.";
    toast("Copied to your personal notes editor.");
    $("notesEditor").scrollIntoView({behavior:"smooth",block:"center"});
  });
  $("downloadGuideNote").addEventListener("click", () => {
    const blob = new Blob([preparedNoteText()], {type:"text/plain;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `StudyHub-${$("guideSubject").value.replace(/[^a-z0-9]+/gi,"-")}-notes.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Chapter notes downloaded.");
  });
  $("scheduleGuideRevision").addEventListener("click", () => {
    addTask("Revise: " + $("guideChapter").value, $("guideSubject").value, todayISO(), 20);
    persist("Revision task added to today's planner.");
  });
}
initPreparedNotes();
