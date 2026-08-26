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
let toastTimer;

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
  document.querySelectorAll("[data-screen]").forEach((button) => {
    const selected = button.dataset.screen === name;
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.panel !== name;
  });
  if (focusPanel) {
    document.querySelector(`[data-panel="${name}"] h2`)?.focus({ preventScroll: true });
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
  };
  document.querySelectorAll("[data-demo-action]").forEach((button) => {
    button.addEventListener("click", () => showToast(messages[button.dataset.demoAction]));
  });

  document.querySelector("[data-support]").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const supported = button.dataset.supported === "true";
    button.dataset.supported = String(!supported);
    button.textContent = supported ? "지원하기" : "지원 취소";
    button.className = supported ? "primary-button support-button" : "secondary-button support-button";
    showToast(supported ? "데모 지원을 취소했습니다." : "데모 지원 상태로 바뀌었습니다. 실제로 저장되지는 않습니다.");
  });
}

setupNavigation();
renderCalendar();
renderAllSchedule();
setupDialog();
setupDemoActions();
