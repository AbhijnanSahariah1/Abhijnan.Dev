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
  version: 1,
  completed: {},
  tasks: [],
  notes: {},
  tests: [],
  settings: { theme:"light", preboardDate:"2026-11-16", boardDate:"2027-02-15", dailyTarget:"5", studentName:"Abhijnan", assistantStyle:"gentle" }
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
        settings: {...DEFAULT_STATE.settings, ...(saved.settings || {})},
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
function openPage(name) {
  document.querySelectorAll(".page").forEach(page => page.classList.toggle("active", page.id === `page-${name}`));
  document.querySelectorAll(".nav-link").forEach(button => button.classList.toggle("active", button.dataset.page === name));
  $("sidebar").classList.remove("open");
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
  $("mobileMenu").addEventListener("click", () => $("sidebar").classList.toggle("open"));
  $("themeToggle").addEventListener("click", () => {
    state.settings.theme = state.settings.theme === "dark" ? "light" : "dark";
    persist("Theme updated.");
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
function preparedNoteFor(subject, chapter) {
  const subjectNotes = window.STUDY_NOTES && window.STUDY_NOTES[subject];
  if (!subjectNotes) return null;
  let key = chapter;
  if (subject === "AI (417)") key = chapter.replace(/^Employability Skills:\s*/, "");
  return subjectNotes[key] || null;
}
function fillGuideChapters() {
  const subject = $("guideSubject").value;
  const chapters = SUBJECTS[subject].chapters;
  $("guideChapter").innerHTML = chapters.map(chapter =>
    `<option value="${escapeHTML(chapter)}">${escapeHTML(chapter)}</option>`
  ).join("");
  renderPreparedGuide();
}
function renderPreparedGuide() {
  const subject = $("guideSubject").value;
  const chapter = $("guideChapter").value;
  const note = preparedNoteFor(subject, chapter);
  const all = SUBJECTS[subject].chapters;
  const index = all.indexOf(chapter);
  const chapterNumber = index >= 0 ? index + 1 : 0;
  if (!note) {
    $("guideContent").innerHTML = `<p class="guide-label">${escapeHTML(subject)}</p><h3>${escapeHTML(chapter)}</h3><p>Prepared notes for this chapter are not available in the notes file yet. Use your personal notes editor below to save your own notes.</p>`;
    return;
  }
  $("guideContent").innerHTML = `
    <p class="guide-label">${escapeHTML(subject)} · Chapter ${chapterNumber} of ${all.length}</p>
    <h3>${escapeHTML(chapter)}</h3>
    <p class="guide-overview">${escapeHTML(note.overview || "")}</p>
    <h4>Key ideas to remember</h4>
    <ul>${(note.points || []).map(point => `<li>${escapeHTML(point)}</li>`).join("")}</ul>
    <div class="guide-practice"><strong>Check your understanding</strong><p>${escapeHTML(note.practice || "Summarise this chapter in your own words and attempt textbook questions.")}</p></div>`;
}
function preparedNoteText() {
  const subject = $("guideSubject").value;
  const chapter = $("guideChapter").value;
  const note = preparedNoteFor(subject, chapter);
  if (!note) return `${chapter}\n\nPrepare your own chapter notes here.\n`;
  return [subject + " — " + chapter, "", note.overview || "", "", "KEY IDEAS", ...(note.points || []).map(point => "- " + point), "", "PRACTICE", note.practice || ""].join("\n");
}
function initPreparedNotes() {
  if (!$("guideSubject") || !window.STUDY_NOTES) return;
  fillSubjectSelect($("guideSubject"));
  fillGuideChapters();
  $("guideSubject").addEventListener("change", fillGuideChapters);
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
