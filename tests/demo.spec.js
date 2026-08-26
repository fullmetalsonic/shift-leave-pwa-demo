import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

function observeExternalRequests(page) {
  const external = [];
  const allowedHost = new URL(
    process.env.DEMO_BASE_URL ?? "http://127.0.0.1:4174",
  ).hostname;
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== allowedHost) {
      external.push(request.url());
    }
  });
  return external;
}

test("공개 데모의 5개 화면은 설명·키보드·모바일·접근성 기준을 지킨다", async ({ page }) => {
  const externalRequests = observeExternalRequests(page);
  await page.goto("./");

  await expect(page).toHaveTitle("교대근무 휴가·대근 공개 데모");
  await expect(page.getByText("데모 모드 · 외부 연결 없음")).toBeVisible();

  const screens = [
    ["내 근무표", "personal", "내 근무표 화면 안내"],
    ["전체근무", "all", "전체근무 화면 안내"],
    ["대근", "staffing", "대근 화면 안내"],
    ["일정", "schedule", "일정 화면 안내"],
    ["더보기", "more", "더보기 화면 안내"],
  ];

  for (const [label, name, guideName] of screens) {
    await page.getByRole("tab", { name: label }).click();
    const panel = page.locator(`[data-panel="${name}"]`);
    await expect(panel).toBeVisible();
    const guide = panel.getByRole("region", { name: guideName });
    await expect(guide).toBeVisible();
    await expect(guide.locator(".screen-purpose")).not.toBeEmpty();
    await expect(guide.locator(".screen-important")).not.toBeEmpty();
    await guide.getByText("이 화면 사용법").click();
    await expect(guide.locator("ol li").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
      `${label} 화면 가로 넘침`,
    ).toBe(false);
    expect((await new AxeBuilder({ page }).analyze()).violations, `${label} axe`).toEqual([]);
  }

  await page.getByRole("tab", { name: "내 근무표" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "전체근무" })).toHaveAttribute("aria-selected", "true");
  expect(externalRequests).toEqual([]);
});

test("날짜 선택과 데모 입력은 상태를 설명하고 서버에 저장하지 않는다", async ({ page }) => {
  const externalRequests = observeExternalRequests(page);
  await page.goto("./");

  await page.getByRole("button", { name: /8월 3일.*종일 휴가/ }).click();
  await expect(page.locator("#selected-entry")).toHaveText("종일 휴가");

  await page.getByRole("button", { name: "휴가 입력" }).click();
  const dialog = page.getByRole("dialog", { name: "휴가 입력" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("날짜")).toHaveValue("2026-08-03");
  await dialog.getByRole("button", { name: "데모 저장" }).click();
  await expect(page.locator("#toast")).toContainText("서버에는 저장되지 않았습니다");
  expect(externalRequests).toEqual([]);
});

test("대근 지원은 합성 상태만 토글한다", async ({ page }) => {
  const externalRequests = observeExternalRequests(page);
  await page.goto("./");
  await page.getByRole("tab", { name: "대근" }).click();
  const support = page.getByRole("button", { name: "지원하기" });
  await support.click();
  await expect(page.getByRole("button", { name: "지원 취소" })).toBeVisible();
  await expect(page.locator("#toast")).toContainText("실제로 저장되지는 않습니다");
  await page.getByRole("button", { name: "지원 취소" }).click();
  await expect(page.getByRole("button", { name: "지원하기" })).toBeVisible();
  expect(externalRequests).toEqual([]);
});

test("상세 설명서는 목적·입력·역할·오류·한계를 제공한다", async ({ page }) => {
  const externalRequests = observeExternalRequests(page);
  await page.goto("./guide.html");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("상세 사용설명서");
  for (const heading of ["공통 사용법", "내 근무표", "전체근무", "대근 수요", "일정·공지", "역할별 작업 차이", "오류·정정·복구", "안전·정확도 한계"]) {
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    ),
  ).toBe(false);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(externalRequests).toEqual([]);
});
