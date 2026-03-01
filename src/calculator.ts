import type { CalculatorState, Operator } from "./types";

const MAX_INPUT_DIGITS = 12;

export function createInitialState(): CalculatorState {
  return {
    displayValue: "0",
    previousValue: null,
    operator: null,
    expression: "",
    isError: false,
    isResultShown: false,
    waitingForNextOperand: false,
    lastOperator: null,
    lastOperand: null
  };
}

function normalizeZero(value: string): string {
  if (value === "-0") {
    return "0";
  }
  return value;
}

function countDigits(value: string): number {
  return value.replace("-", "").replace(".", "").length;
}

function formatForExpression(value: string): string {
  return normalizeZero(value);
}

function formatResult(value: number): string {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  const normalized = Object.is(value, -0) ? 0 : Number.parseFloat(value.toPrecision(12));
  if (!Number.isFinite(normalized)) {
    return "Error";
  }

  const abs = Math.abs(normalized);
  if (abs >= 1e12 || (abs > 0 && abs < 1e-9)) {
    return normalized.toExponential(11).replace(/\.?0+e/, "e").replace("e+", "e");
  }

  return normalized.toString();
}

function blockOnError(state: CalculatorState): boolean {
  return state.isError;
}

function compute(lhsRaw: string, operator: Operator, rhsRaw: string): string {
  const lhs = Number(lhsRaw);
  const rhs = Number(rhsRaw);

  let result: number;
  switch (operator) {
    case "+":
      result = lhs + rhs;
      break;
    case "-":
      result = lhs - rhs;
      break;
    case "×":
      result = lhs * rhs;
      break;
    case "÷":
      result = lhs / rhs;
      break;
  }

  return formatResult(result);
}

function toErrorState(state: CalculatorState): CalculatorState {
  return {
    ...state,
    displayValue: "Error",
    isError: true,
    isResultShown: true,
    waitingForNextOperand: false
  };
}

export function inputDigit(state: CalculatorState, digit: string): CalculatorState {
  if (blockOnError(state)) {
    return state;
  }

  if (!/^\d$/.test(digit)) {
    return state;
  }

  if (state.waitingForNextOperand || (state.isResultShown && state.operator === null)) {
    return {
      ...state,
      displayValue: digit,
      waitingForNextOperand: false,
      isResultShown: false,
      expression: state.operator ? state.expression : ""
    };
  }

  if (state.displayValue === "0") {
    return { ...state, displayValue: digit };
  }

  if (state.displayValue === "-0") {
    return { ...state, displayValue: `-${digit}` };
  }

  if (countDigits(state.displayValue) >= MAX_INPUT_DIGITS) {
    return state;
  }

  return {
    ...state,
    displayValue: `${state.displayValue}${digit}`
  };
}

export function inputDecimal(state: CalculatorState): CalculatorState {
  if (blockOnError(state)) {
    return state;
  }

  if (state.waitingForNextOperand || (state.isResultShown && state.operator === null)) {
    return {
      ...state,
      displayValue: "0.",
      waitingForNextOperand: false,
      isResultShown: false,
      expression: state.operator ? state.expression : ""
    };
  }

  if (state.displayValue.includes(".")) {
    return state;
  }

  return {
    ...state,
    displayValue: `${state.displayValue}.`
  };
}

export function setOperator(state: CalculatorState, nextOperator: Operator): CalculatorState {
  if (blockOnError(state)) {
    return state;
  }

  if (state.operator && state.waitingForNextOperand) {
    return {
      ...state,
      operator: nextOperator,
      expression: `${formatForExpression(state.previousValue ?? state.displayValue)} ${nextOperator}`,
      isResultShown: false
    };
  }

  if (state.operator && !state.waitingForNextOperand && state.previousValue !== null) {
    const computed = compute(state.previousValue, state.operator, state.displayValue);
    if (computed === "Error") {
      return toErrorState(state);
    }

    return {
      ...state,
      displayValue: computed,
      previousValue: computed,
      operator: nextOperator,
      expression: `${computed} ${nextOperator}`,
      waitingForNextOperand: true,
      isResultShown: false
    };
  }

  const baseValue = state.displayValue;
  return {
    ...state,
    previousValue: baseValue,
    operator: nextOperator,
    expression: `${formatForExpression(baseValue)} ${nextOperator}`,
    waitingForNextOperand: true,
    isResultShown: false
  };
}

export function calculate(state: CalculatorState): CalculatorState {
  if (blockOnError(state)) {
    return state;
  }

  if (state.operator && state.previousValue !== null) {
    const rhs = state.waitingForNextOperand ? state.previousValue : state.displayValue;
    const result = compute(state.previousValue, state.operator, rhs);
    if (result === "Error") {
      return toErrorState(state);
    }

    return {
      ...state,
      displayValue: result,
      previousValue: null,
      operator: null,
      expression: `${formatForExpression(state.previousValue)} ${state.operator} ${formatForExpression(rhs)} =`,
      isResultShown: true,
      waitingForNextOperand: false,
      lastOperator: state.operator,
      lastOperand: rhs
    };
  }

  if (state.isResultShown && state.lastOperator && state.lastOperand !== null) {
    const result = compute(state.displayValue, state.lastOperator, state.lastOperand);
    if (result === "Error") {
      return toErrorState(state);
    }

    return {
      ...state,
      displayValue: result,
      expression: `${formatForExpression(state.displayValue)} ${state.lastOperator} ${formatForExpression(state.lastOperand)} =`,
      isResultShown: true
    };
  }

  return {
    ...state,
    isResultShown: true
  };
}

export function clearEntry(state: CalculatorState): CalculatorState {
  if (blockOnError(state)) {
    return state;
  }

  return {
    ...state,
    displayValue: "0",
    isResultShown: false
  };
}

export function allClear(_: CalculatorState): CalculatorState {
  return createInitialState();
}

export function toggleSign(state: CalculatorState): CalculatorState {
  if (blockOnError(state)) {
    return state;
  }

  if (state.displayValue === "0") {
    return state;
  }

  if (state.displayValue.startsWith("-")) {
    return {
      ...state,
      displayValue: normalizeZero(state.displayValue.slice(1))
    };
  }

  return {
    ...state,
    displayValue: `-${state.displayValue}`
  };
}

export function applyPercent(state: CalculatorState): CalculatorState {
  if (blockOnError(state)) {
    return state;
  }

  const value = Number(state.displayValue) / 100;
  const formatted = formatResult(value);
  if (formatted === "Error") {
    return toErrorState(state);
  }

  return {
    ...state,
    displayValue: formatted,
    waitingForNextOperand: false
  };
}

export function backspace(state: CalculatorState): CalculatorState {
  if (blockOnError(state) || state.isResultShown || state.waitingForNextOperand) {
    return state;
  }

  if (state.displayValue.length <= 1) {
    return { ...state, displayValue: "0" };
  }

  const truncated = state.displayValue.slice(0, -1);
  if (truncated === "" || truncated === "-") {
    return { ...state, displayValue: "0" };
  }

  return {
    ...state,
    displayValue: truncated
  };
}

export type { CalculatorState, Operator };
