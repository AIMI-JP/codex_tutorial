import "./styles.css";

export function initWindowsApp(rootElement?: HTMLElement): void {
  const root = rootElement ?? document.querySelector<HTMLElement>("#app");
  if (!root) {
    return;
  }

  root.innerHTML = `
    <main class="shell">
      <h1>Windows Calculator App</h1>
      <p>実装準備完了。次のタスクで仕様どおりのUIを実装します。</p>
    </main>
  `;
}

if (typeof document !== "undefined") {
  initWindowsApp();
}
