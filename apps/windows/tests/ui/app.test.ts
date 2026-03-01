import { beforeEach, describe, expect, it } from "vitest";
import { initWindowsApp } from "../../src/main";

describe("windows app", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("renders shell", () => {
    initWindowsApp();
    expect(document.querySelector("h1")?.textContent).toContain("Windows Calculator App");
  });
});
