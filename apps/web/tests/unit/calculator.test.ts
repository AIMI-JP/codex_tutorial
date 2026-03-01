import { describe, expect, it } from "vitest";
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
  toggleSign
} from "../../src/calculator";

describe("calculator", () => {
  it("initial state is zero", () => {
    const state = createInitialState();
    expect(state.displayValue).toBe("0");
    expect(state.previousValue).toBeNull();
    expect(state.operator).toBeNull();
    expect(state.isError).toBe(false);
  });

  it("inputs digits with leading zero normalization", () => {
    let state = createInitialState();
    state = inputDigit(state, "0");
    state = inputDigit(state, "0");
    state = inputDigit(state, "2");
    expect(state.displayValue).toBe("2");
  });

  it("accepts decimal once per operand", () => {
    let state = createInitialState();
    state = inputDigit(state, "1");
    state = inputDecimal(state);
    state = inputDigit(state, "2");
    state = inputDecimal(state);
    state = inputDigit(state, "3");
    expect(state.displayValue).toBe("1.23");
  });

  it("replaces operator on consecutive operator input", () => {
    let state = createInitialState();
    state = inputDigit(state, "8");
    state = setOperator(state, "+");
    state = setOperator(state, "×");
    expect(state.operator).toBe("×");
    expect(state.expression).toBe("8 ×");
  });

  it("calculates basic operations", () => {
    let state = createInitialState();
    state = inputDigit(state, "1");
    state = inputDigit(state, "2");
    state = setOperator(state, "+");
    state = inputDigit(state, "7");
    state = calculate(state);
    expect(state.displayValue).toBe("19");
    expect(state.expression).toBe("12 + 7 =");
  });

  it("supports chained operations with result reuse", () => {
    let state = createInitialState();
    state = inputDigit(state, "1");
    state = inputDigit(state, "2");
    state = setOperator(state, "+");
    state = inputDigit(state, "3");
    state = calculate(state);
    state = setOperator(state, "+");
    state = inputDigit(state, "4");
    state = calculate(state);
    expect(state.displayValue).toBe("19");
  });

  it("repeats last operation on equals", () => {
    let state = createInitialState();
    state = inputDigit(state, "2");
    state = setOperator(state, "+");
    state = inputDigit(state, "3");
    state = calculate(state);
    state = calculate(state);
    expect(state.displayValue).toBe("8");
  });

  it("completes missing right operand with left operand", () => {
    let state = createInitialState();
    state = inputDigit(state, "5");
    state = setOperator(state, "×");
    state = calculate(state);
    expect(state.displayValue).toBe("25");
  });

  it("handles percent as unary conversion", () => {
    let state = createInitialState();
    state = inputDigit(state, "2");
    state = inputDigit(state, "0");
    state = inputDigit(state, "0");
    state = setOperator(state, "+");
    state = inputDigit(state, "1");
    state = inputDigit(state, "0");
    state = applyPercent(state);
    state = calculate(state);
    expect(state.displayValue).toBe("200.1");
  });

  it("toggles sign", () => {
    let state = createInitialState();
    state = inputDigit(state, "7");
    state = toggleSign(state);
    expect(state.displayValue).toBe("-7");
    state = toggleSign(state);
    expect(state.displayValue).toBe("7");
  });

  it("supports C and AC behavior", () => {
    let state = createInitialState();
    state = inputDigit(state, "1");
    state = inputDigit(state, "2");
    state = setOperator(state, "+");
    state = inputDigit(state, "9");
    state = clearEntry(state);
    expect(state.displayValue).toBe("0");
    expect(state.operator).toBe("+");
    state = allClear(state);
    expect(state.displayValue).toBe("0");
    expect(state.operator).toBeNull();
    expect(state.previousValue).toBeNull();
  });

  it("returns Error on divide by zero and only AC can recover", () => {
    let state = createInitialState();
    state = inputDigit(state, "9");
    state = setOperator(state, "÷");
    state = inputDigit(state, "0");
    state = calculate(state);
    expect(state.displayValue).toBe("Error");
    expect(state.isError).toBe(true);

    const blocked = inputDigit(state, "1");
    expect(blocked.displayValue).toBe("Error");

    const recovered = allClear(state);
    expect(recovered.displayValue).toBe("0");
    expect(recovered.isError).toBe(false);
  });

  it("supports backspace for active operand input", () => {
    let state = createInitialState();
    state = inputDigit(state, "1");
    state = inputDigit(state, "2");
    state = inputDigit(state, "3");
    state = backspace(state);
    expect(state.displayValue).toBe("12");
    state = backspace(state);
    state = backspace(state);
    expect(state.displayValue).toBe("0");
  });

  it("ignores backspace just after result display", () => {
    let state = createInitialState();
    state = inputDigit(state, "2");
    state = setOperator(state, "+");
    state = inputDigit(state, "3");
    state = calculate(state);
    state = backspace(state);
    expect(state.displayValue).toBe("5");
  });

  it("accepts operator-first input as using current display value", () => {
    let state = createInitialState();
    state = setOperator(state, "+");
    state = inputDigit(state, "3");
    state = calculate(state);
    expect(state.displayValue).toBe("3");
  });

  it("formats overflowed result as exponential notation", () => {
    let state = createInitialState();
    for (let i = 0; i < 12; i += 1) {
      state = inputDigit(state, "9");
    }
    state = setOperator(state, "×");
    state = inputDigit(state, "9");
    state = calculate(state);

    expect(state.displayValue.includes("e")).toBe(true);
  });
});
