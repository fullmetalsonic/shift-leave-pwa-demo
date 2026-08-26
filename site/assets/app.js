const DEMO_YEAR = 2026;
const DEMO_MONTH = 7;
const selectedInitialDate = "2026-08-26";

const syntheticEntries = {
  "2026-08-03": "종일 휴가",
  "2026-08-08": "안전교육",
  "2026-08-18": "주간 대근",
  "2026-08-24": "현장 지원",
  "2026-08-26": "야간 근무",
};

const shiftPattern = ["주", "주", "휴", "휴", "야", "야", "휴", "휴"];
const shiftDetails = {
  주: { label: "주간 07:00–19:00", tone: "day" },
  야: { label: "야간 19:00–익일 07:00", tone: "night" },
  휴: { label: "휴무", tone: "off" },
};

let selectedDate = selectedInitialDate;
let selectedCoverageDate = "2026-08-26";
let toastTimer;

const coverageRecords = {
  "2026-08-26": [
    { kind: "leave", name: "김하늘" },
    { kind: "substitute", name: "박바다" },
  ],
  "2026-08-27": [{ kind: "leave", name: "이도윤" }],
  "2026-08-29": [
    { kind: "leave", name: "최새봄" },
    { kind: "substitute", name: "오누리" },
  ],
};

const coverageMissing = {
  "2026-08-27": 1,
  "2026-08-29": 1,
};

const coverageTeamPairs = [
  { day: "B", night: "D" },
  { day: "A", night: "C" },
  { day: "D", night: "B" },
  { day: "C", night: "A" },
];

function shiftForDay(day) {
  return shiftPattern[(day + 3) % shiftPattern.length];
}

function formatKoreanDate(key) {
  const date = new Date(`${key}T00:00:00+09:00`);
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 3200);
}

function selectScreen(name, focusPanel = true) {
  const targetPanel = document.querySelector(`[data-panel="${name}"]`);
  const targetGroup = targetPanel?.dataset.panelGroup ?? name;
  document.querySelectorAll("[data-screen]").forEach((button) => {
    const selected = (button.dataset.navGroup ?? button.dataset.screen) === targetGroup;
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
    if (selected && targetPanel) button.setAttribute("aria-controls", targetPanel.id);
  });
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.panel !== name;
  });
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.view === name));
  });
  if (focusPanel) {
    targetPanel?.querySelector("h2")?.focus({ preventScroll: true });
  }
}

function setupNavigation() {
  const tabs = [...document.querySelectorAll("[data-screen]")];
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectScreen(tab.dataset.screen, false));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      tabs[nextIndex].focus();
      tabs[nextIndex].click();
    });
  });
}

function setupViewSwitches() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => selectScreen(button.dataset.view, false));
  });
}

function coverageDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function coverageTeamsAt(index) {
  return coverageTeamPairs[Math.floor(index / 2) % coverageTeamPairs.length];
}

function coveragePersonMarkup(entry) {
  const label = entry.kind === "leave" ? "휴가" : "대근";
  return `<span class="coverage-person ${entry.kind}"><b>${label}</b>${entry.name}</span>`;
}

function updateCoverageDetail(key, index) {
  const entries = coverageRecords[key] ?? [];
  const leaves = entries.filter((entry) => entry.kind === "leave");
  const substitutes = entries.filter((entry) => entry.kind === "substitute");
  const missing = coverageMissing[key] ?? 0;
  const teams = coverageTeamsAt(index);
  const [, month, day] = key.split("-");

  document.querySelector("#coverage-detail-title").textContent = `${month}/${day}`;
  document.querySelector("#coverage-detail-teams").textContent = `주간 ${teams.day}조 · 야간 ${teams.night}조`;
  document.querySelector("#coverage-leave-count").textContent = `휴가자 ${leaves.length}명`;
  document.querySelector("#coverage-substitute-count").textContent = `대근자 ${substitutes.length}명`;
  document.querySelector("#coverage-leave-people").innerHTML = leaves.length
    ? leaves.map(coveragePersonMarkup).join("")
    : '<span class="coverage-none">없음</span>';
  document.querySelector("#coverage-substitute-people").innerHTML = substitutes.length
    ? substitutes.map(coveragePersonMarkup).join("")
    : '<span class="coverage-none">없음</span>';

  const missingElement = document.querySelector("#coverage-detail-missing");
  missingElement.hidden = missing === 0;
  missingElement.textContent = missing ? `미충원 ${missing}명 · 대근 등록이 필요합니다.` : "";
}

function renderCoverageCalendar() {
  const calendar = document.querySelector("#coverage-calendar");
  const start = new Date(2026, 6, 27);
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    const key = coverageDateKey(date);
    const entries = coverageRecords[key] ?? [];
    const teams = coverageTeamsAt(index);
    const missing = coverageMissing[key] ?? 0;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `coverage-day${date.getMonth() !== DEMO_MONTH ? " outside" : ""}`;
    button.setAttribute("aria-pressed", String(key === selectedCoverageDate));
    button.setAttribute(
      "aria-label",
      `${date.getMonth() + 1}월 ${date.getDate()}일, 주간 ${teams.day}조, 야간 ${teams.night}조${entries.map((entry) => `, ${entry.kind === "leave" ? "휴가" : "대근"} ${entry.name}`).join("")}${missing ? `, 미충원 ${missing}명` : ""}`,
    );
    button.innerHTML = [
      `<span class="coverage-date-number">${date.getDate()}</span>`,
      `<span class="coverage-teams">주 ${teams.day} · 야 ${teams.night}</span>`,
      entries.length ? `<span class="coverage-people">${entries.map(coveragePersonMarkup).join("")}</span>` : "",
      missing ? `<span class="coverage-missing">미충원 ${missing}</span>` : "",
    ].join("");
    button.addEventListener("click", () => {
      selectedCoverageDate = key;
      calendar.querySelectorAll(".coverage-day").forEach((dayButton) => dayButton.setAttribute("aria-pressed", "false"));
      button.setAttribute("aria-pressed", "true");
      updateCoverageDetail(key, index);
    });
    fragment.append(button);
  }

  calendar.replaceChildren(fragment);
  const selectedIndex = Math.round((new Date(`${selectedCoverageDate}T00:00:00`) - start) / 86_400_000);
  updateCoverageDetail(selectedCoverageDate, selectedIndex);
}

function updateSelectedDate() {
  const day = Number(selectedDate.slice(-2));
  const shift = shiftForDay(day);
  const detail = shiftDetails[shift];
  const result = document.querySelector("#selected-shift");
  document.querySelector("#selected-date-title").textContent = formatKoreanDate(selectedDate);
  document.querySelector("#selected-entry").textContent = syntheticEntries[selectedDate] ?? "등록 기록 없음";
  result.className = `shift-result ${detail.tone}`;
  result.querySelector("strong").textContent = detail.label;
  document.querySelector("#dialog-date").value = selectedDate;
}

function renderCalendar() {
  const calendar = document.querySelector("#personal-calendar");
  const firstWeekday = new Date(DEMO_YEAR, DEMO_MONTH, 1).getDay();
  const lastDay = new Date(DEMO_YEAR, DEMO_MONTH + 1, 0).getDate();
  const fragment = document.createDocumentFragment();

  for (let blank = 0; blank < firstWeekday; blank += 1) {
    const placeholder = document.createElement("span");
    placeholder.className = "calendar-blank";
    placeholder.setAttribute("aria-hidden", "true");
    fragment.append(placeholder);
  }

  for (let day = 1; day <= lastDay; day += 1) {
    const key = `2026-08-${String(day).padStart(2, "0")}`;
    const shift = shiftForDay(day);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.setAttribute("aria-pressed", String(key === selectedDate));
    button.setAttribute("aria-label", `${formatKoreanDate(key)}, ${shiftDetails[shift].label}${syntheticEntries[key] ? `, ${syntheticEntries[key]}` : ""}`);
    button.innerHTML = `<span class="date-number">${day}</span><span class="shift-code ${shiftDetails[shift].tone}">${shift}</span>${syntheticEntries[key] ? `<span class="event-dot">${syntheticEntries[key]}</span>` : ""}`;
    button.addEventListener("click", () => {
      selectedDate = key;
      calendar.querySelectorAll(".calendar-day").forEach((dayButton) => dayButton.setAttribute("aria-pressed", "false"));
      button.setAttribute("aria-pressed", "true");
      updateSelectedDate();
    });
    fragment.append(button);
  }
  calendar.replaceChildren(fragment);
  updateSelectedDate();
}

function renderAllSchedule() {
  const rows = [
    ["A조", ["휴", "야", "야", "휴", "휴", "주", "주"]],
    ["B조", ["주", "주", "휴", "휴", "야", "야", "휴"]],
    ["C조", ["야", "휴", "휴", "주", "주", "휴", "휴"]],
    ["D조", ["휴", "휴", "주", "주", "휴", "휴", "야"]],
    ["상주", ["주", "주", "주", "주", "주", "휴", "휴"]],
    ["상주A", ["주", "주", "주", "주", "휴", "휴", "휴"]],
    ["상주B", ["주", "주", "주", "주", "주", "휴", "휴"]],
  ];
  const needCells = new Set(["C조-3", "A조-5"]);
  const body = document.querySelector("#all-schedule-body");
  body.innerHTML = rows
    .map(([team, shifts]) => `<tr><th scope="row">${team}</th>${shifts.map((shift, index) => {
      const tone = shiftDetails[shift].tone;
      const hasNeed = needCells.has(`${team}-${index}`);
      return `<td><button type="button" class="schedule-cell-button ${tone}${hasNeed ? " need" : ""}" data-cell-detail="${team} ${index + 24}일 ${shiftDetails[shift].label}">${shift}</button></td>`;
    }).join("")}</tr>`)
    .join("");
  body.querySelectorAll("[data-cell-detail]").forEach((button) => {
    button.addEventListener("click", () => showToast(`${button.dataset.cellDetail} · 합성 일정입니다.`));
  });
}

function setupDialog() {
  const dialog = document.querySelector("#entry-dialog");
  const title = document.querySelector("#dialog-title");
  const description = document.querySelector("#dialog-description");
  const unitLabel = document.querySelector("#dialog-unit-label");
  const unit = document.querySelector("#dialog-unit");

  document.querySelectorAll("[data-open-dialog]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.openDialog;
      const isLeave = type === "leave";
      title.textContent = isLeave ? "휴가 입력" : "근무변경 입력";
      description.textContent = isLeave ? "선택한 날짜에 휴가 예시를 입력합니다." : "선택한 날짜에 근무변경 예시를 입력합니다.";
      unitLabel.firstChild.textContent = isLeave ? "휴가 단위" : "근무 시간";
      unit.innerHTML = isLeave
        ? "<option>종일 1일</option><option>반일 0.5일</option>"
        : "<option>주간 대근 12시간</option><option>야간 대근 12시간</option><option>지원 4시간</option>";
      dialog.showModal();
    });
  });

  document.querySelector("#dialog-save").addEventListener("click", (event) => {
    event.preventDefault();
    dialog.close();
    showToast("데모 저장 예시를 확인했습니다. 서버에는 저장되지 않았습니다.");
  });
}

function setupDemoActions() {
  const messages = {
    save: "일정 저장 예시를 확인했습니다. 서버에는 저장되지 않았습니다.",
    detail: "합성 대근 상세입니다. 실제 근무자 정보는 포함하지 않습니다.",
    backup: "공개 데모에서는 운영 백업 파일을 만들지 않습니다.",
    account: "공개 데모에는 실제 계정이나 비밀번호가 없습니다.",
    month: "공개 데모는 2026년 8월 합성 일정만 제공합니다.",
  };
  document.querySelectorAll("[data-demo-action]").forEach((button) => {
    button.addEventListener("click", () => showToast(messages[button.dataset.demoAction]));
  });

  document.querySelector("[data-support]").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const supported = button.dataset.supported === "true";
    button.dataset.supported = String(!supported);
    button.textContent = supported ? "대근 등록" : "등록 취소";
    button.className = supported ? "primary-button support-button" : "secondary-button support-button";
    showToast(supported ? "데모 대근 등록을 취소했습니다." : "현재 대근자로 표시되는 예시입니다. 실제로 저장되지는 않습니다.");
  });
}

setupNavigation();
setupViewSwitches();
renderCalendar();
renderAllSchedule();
renderCoverageCalendar();
setupDialog();
setupDemoActions();
