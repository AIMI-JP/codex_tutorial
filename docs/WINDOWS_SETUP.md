# Windowsアプリ環境構築（TypeScript + Tauri）

## 1. 前提
- OS: Windows 10/11
- Node.js: `v24.x`（このリポジトリ運用に合わせる）
- npm: Node同梱版

## 2. 必須ツール
1. Rust toolchain をインストール
```bash
winget install Rustlang.Rustup
rustup default stable
```

2. Microsoft C++ Build Tools（MSVC）をインストール
- Visual Studio Installer から `Desktop development with C++` を有効化

3. WebView2 Runtime をインストール（未導入時）
```bash
winget install Microsoft.EdgeWebView2Runtime
```

## 3. 依存インストール
リポジトリルートで実行:
```bash
npm install
npm --prefix apps/windows install
```

## 4. 動作確認
1. Webフロントの確認
```bash
npm run dev:windows
```

2. テスト・型チェック
```bash
npm run test:windows
npm run typecheck:windows
```

3. Tauri起動確認
```bash
npm run tauri:dev:windows
```

## 5. トラブルシュート
- `link.exe` や `cl.exe` が見つからない:
  - C++ Build Tools 未導入、または開発者コマンドプロンプト未使用。
- `tauri` コマンドが見つからない:
  - `apps/windows` の依存未導入。`npm --prefix apps/windows install` を再実行。
- ポート競合:
  - `apps/windows/vite.config.ts` は `1420` 固定。利用中プロセスを停止する。
