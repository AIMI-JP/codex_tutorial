import { beforeEach, describe, expect, it } from "vitest";
import { initApp } from "../../src/main";

describe("app ui", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("renders display and keypad", () => {
    initApp();

    const expression = document.querySelector('[data-testid="expression-display"]');
    const main = document.querySelector('[data-testid="main-display"]');
    const buttons = document.querySelectorAll("button[data-action]");

    expect(expression?.textContent).toBe("");
    expect(main?.textContent).toBe("0");
    expect(buttons.length).toBe(20);
  });

  it("calculates by click input", () => {
    initApp();

    clickByText("2");
    clickByText("+");
    clickByText("3");
    clickByText("=");

    expect(display()).toBe("5");
  });

  it("supports keyboard operator normalization and enter", () => {
    initApp();

    key("4");
    key("*");
    key("5");
    key("Enter");

    expect(display()).toBe("20");
  });

  it("blocks all keys except AC while error", () => {
    initApp();

    clickByText("9");
    clickByText("÷");
    clickByText("0");
    clickByText("=");
    expect(display()).toBe("Error");

    clickByText("1");
    expect(display()).toBe("Error");

    clickByText("AC");
    expect(display()).toBe("0");
  });

  it("maps Escape to AC", () => {
    initApp();

    clickByText("9");
    key("Escape");
    expect(display()).toBe("0");
  });
});

function clickByText(text: string): void {
  const button = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
    (node) => node.textContent === text
  );
  if (!button) {
    throw new Error(`button not found: ${text}`);
  }
  button.click();
}

function display(): string {
  const node = document.querySelector('[data-testid="main-display"]');
  return node?.textContent ?? "";
}

function key(key: string): void {
  window.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
}
