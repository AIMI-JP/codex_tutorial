import {
  allClear,
  applyPercent,
  backspace,
  calculate,
  clearEntry,
  createInitialState,
  inputDecimal,
  inputDigit,
  setOperator,
  toggleSign,
  type Operator
} from "./calculator";
import "./styles.css";

type ButtonConfig = {
  label: string;
  action: string;
  ariaLabel?: string;
};

const BUTTONS: ButtonConfig[] = [
  { label: "AC", action: "all-clear" },
  { label: "C", action: "clear-entry" },
  { label: "%", action: "percent", ariaLabel: "percent" },
  { label: "÷", action: "operator", ariaLabel: "divide" },
  { label: "7", action: "digit" },
  { label: "8", action: "digit" },
  { label: "9", action: "digit" },
  { label: "×", action: "operator", ariaLabel: "multiply" },
  { label: "4", action: "digit" },
  { label: "5", action: "digit" },
  { label: "6", action: "digit" },
  { label: "-", action: "operator", ariaLabel: "minus" },
  { label: "1", action: "digit" },
  { label: "2", action: "digit" },
  { label: "3", action: "digit" },
  { label: "+", action: "operator", ariaLabel: "plus" },
  { label: "+/-", action: "toggle-sign", ariaLabel: "toggle sign" },
  { label: "0", action: "digit" },
  { label: ".", action: "decimal", ariaLabel: "decimal point" },
  { label: "=", action: "equals", ariaLabel: "equals" }
];

let detachKeyboardHandler: (() => void) | null = null;

export function initApp(rootElement?: HTMLElement): void {
  const root = rootElement ?? document.querySelector<HTMLElement>("#app");
  if (!root) {
    return;
  }

  root.innerHTML = `
    <main class="calculator">
      <section class="display" aria-live="polite">
        <div class="expression" data-testid="expression-display"></div>
        <div class="main-display" data-testid="main-display">0</div>
      </section>
      <section class="keypad" data-testid="keypad"></section>
    </main>
  `;

  const keypad = root.querySelector<HTMLElement>('[data-testid="keypad"]');
  const expressionDisplay = root.querySelector<HTMLElement>('[data-testid="expression-display"]');
  const mainDisplay = root.querySelector<HTMLElement>('[data-testid="main-display"]');
  if (!keypad || !expressionDisplay || !mainDisplay) {
    return;
  }
  const ensuredKeypad = keypad;
  const ensuredExpressionDisplay = expressionDisplay;
  const ensuredMainDisplay = mainDisplay;

  for (const config of BUTTONS) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = config.label;
    button.dataset.action = config.action;
    button.dataset.value = config.label;
    if (config.ariaLabel) {
      button.setAttribute("aria-label", config.ariaLabel);
    }
    if (config.label === "=") {
      button.className = "is-equals";
    }
    ensuredKeypad.appendChild(button);
  }

  let state = createInitialState();
  render();

  ensuredKeypad.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }
    applyInput(target.dataset.action ?? "", target.dataset.value ?? "");
  });

  if (detachKeyboardHandler) {
    detachKeyboardHandler();
  }

  const handler = (event: KeyboardEvent): void => {
    if (event.isComposing) {
      return;
    }

    if (event.key >= "0" && event.key <= "9") {
      applyInput("digit", event.key);
      return;
    }

    if (event.key === ".") {
      applyInput("decimal", ".");
      return;
    }

    if (event.key === "+" || event.key === "-") {
      applyInput("operator", event.key);
      return;
    }

    if (event.key === "*") {
      applyInput("operator", "×");
      return;
    }

    if (event.key === "/") {
      applyInput("operator", "÷");
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      applyInput("equals", "=");
      return;
    }

    if (event.key === "Escape") {
      applyInput("all-clear", "AC");
      return;
    }

    if (event.key === "Backspace") {
      applyInput("backspace", "Backspace");
    }
  };

  window.addEventListener("keydown", handler);
  detachKeyboardHandler = () => window.removeEventListener("keydown", handler);

  function applyInput(action: string, value: string): void {
    switch (action) {
      case "digit":
        state = inputDigit(state, value);
        break;
      case "decimal":
        state = inputDecimal(state);
        break;
      case "operator":
        state = setOperator(state, value as Operator);
        break;
      case "equals":
        state = calculate(state);
        break;
      case "toggle-sign":
        state = toggleSign(state);
        break;
      case "percent":
        state = applyPercent(state);
        break;
      case "clear-entry":
        state = clearEntry(state);
        break;
      case "all-clear":
        state = allClear(state);
        break;
      case "backspace":
        state = backspace(state);
        break;
      default:
        return;
    }
    render();
  }

  function render(): void {
    ensuredExpressionDisplay.textContent = state.expression;
    ensuredMainDisplay.textContent = state.displayValue;

    const buttons = ensuredKeypad.querySelectorAll<HTMLButtonElement>("button");
    for (const button of buttons) {
      const canUse = !state.isError || button.dataset.action === "all-clear";
      button.disabled = !canUse;
    }
  }
}

if (typeof document !== "undefined") {
  initApp();
}
