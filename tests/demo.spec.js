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

test("공개 데모의 4개 주 메뉴와 내부 보기는 설명·키보드·모바일·접근성 기준을 지킨다", async ({ page }, testInfo) => {
  const externalRequests = observeExternalRequests(page);
  await page.goto("./");

  await expect(page).toHaveTitle("교대근무 휴가·대근 공개 데모");
  await expect(page.getByText("데모 모드 · 외부 연결 없음")).toBeVisible();
  await expect(page.getByRole("tab")).toHaveCount(4);

  async function checkPanel(name, guideName) {
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
      `${name} 화면 가로 넘침`,
    ).toBe(false);
    expect((await new AxeBuilder({ page }).analyze()).violations, `${name} axe`).toEqual([]);
  }

  await page.getByRole("tab", { name: "근무표" }).click();
  await checkPanel("personal", "내 근무표 화면 안내");
  await page.getByRole("button", { name: "전체 근무표" }).click();
  await checkPanel("all", "전체근무 화면 안내");

  await page.getByRole("tab", { name: "휴가·대근" }).click();
  await checkPanel("coverage", "휴가·대근 월간 현황 화면 안내");
  await expect(page.locator("#coverage-calendar").getByText("김하늘")).toBeVisible();
  await expect(page.locator("#coverage-calendar").getByText("박바다")).toBeVisible();
  if (!process.env.DEMO_BASE_URL) {
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      window.scrollTo(0, 0);
    });
    await page.screenshot({
      path: `docs/images/demo-${testInfo.project.name.startsWith("mobile") ? "mobile" : "desktop"}.png`,
      fullPage: true,
    });
  }
  await page.getByRole("button", { name: "대근 등록·지원", exact: true }).click();
  await checkPanel("staffing", "대근 화면 안내");

  await page.getByRole("tab", { name: "일정" }).click();
  await checkPanel("schedule", "일정 화면 안내");
  await page.getByRole("tab", { name: "더보기" }).click();
  await checkPanel("more", "더보기 화면 안내");

  await page.getByRole("tab", { name: "근무표" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "휴가·대근" })).toHaveAttribute("aria-selected", "true");
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

test("월간 현황은 이름·근무조·미충원을 보여 주고 대근 등록은 합성 상태만 토글한다", async ({ page }) => {
  const externalRequests = observeExternalRequests(page);
  await page.goto("./");
  await page.getByRole("tab", { name: "휴가·대근" }).click();
  await page.getByRole("button", { name: /8월 27일, 주간.*휴가 이도윤.*미충원 1명/ }).click();
  await expect(page.locator("#coverage-detail-teams")).toContainText(/주간 [A-D]조 · 야간 [A-D]조/);
  await expect(page.locator("#coverage-leave-people")).toContainText("이도윤");
  await expect(page.locator("#coverage-detail-missing")).toContainText("미충원 1명");

  await page.getByRole("button", { name: "대근 등록·지원", exact: true }).click();
  const support = page.getByRole("button", { name: "대근 등록", exact: true });
  await support.click();
  await expect(page.getByRole("button", { name: "등록 취소" })).toBeVisible();
  await expect(page.locator("#toast")).toContainText("실제로 저장되지는 않습니다");
  await page.getByRole("button", { name: "등록 취소" }).click();
  await expect(page.getByRole("button", { name: "대근 등록", exact: true })).toBeVisible();
  expect(externalRequests).toEqual([]);
});

test("상세 설명서는 목적·입력·역할·오류·한계를 제공한다", async ({ page }) => {
  const externalRequests = observeExternalRequests(page);
  await page.goto("./guide.html");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("상세 사용설명서");
  for (const heading of ["공통 사용법", "내 근무표", "전체근무", "휴가·대근 월간 현황", "대근 등록·지원", "일정·공지", "역할별 작업 차이", "오류·정정·복구", "안전·정확도 한계"]) {
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
