# Windows アプリ開発環境セットアップ

## 前提
- OS: Windows 10/11
- Node.js: `v24.x`
- npm: Node 同梱版

## 必須ツール
1. Rust toolchain
```bash
winget install Rustlang.Rustup
rustup default stable
```

2. Microsoft C++ Build Tools（MSVC）
- Visual Studio Installer で `Desktop development with C++` を有効化

3. WebView2 Runtime（未導入時）
```bash
winget install Microsoft.EdgeWebView2Runtime
```

## 依存インストール
```bash
npm install
npm --prefix apps/windows install
```

## 動作確認
```bash
npm run dev:windows
npm run test:windows
npm run typecheck:windows
npm run tauri:dev:windows
```

## トラブルシュート
- `link.exe` / `cl.exe` が見つからない:
  - C++ Build Tools 未導入、または開発者コマンドプロンプト未使用
- `tauri` コマンドが見つからない:
  - `npm --prefix apps/windows install` を再実行
- `icons/icon.ico` / `icons/icon.png` が見つからない:
  - `apps/windows/src-tauri/icons/` に必要アイコンを配置
