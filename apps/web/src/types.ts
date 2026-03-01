export type Operator = "+" | "-" | "×" | "÷";

export interface CalculatorState {
  displayValue: string;
  previousValue: string | null;
  operator: Operator | null;
  expression: string;
  isError: boolean;
  isResultShown: boolean;
  waitingForNextOperand: boolean;
  lastOperator: Operator | null;
  lastOperand: string | null;
}
