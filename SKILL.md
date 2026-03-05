# SKILL.md

## 目的
- この文書は「作業手順テンプレート」を集約する。
- 恒常ルールは `AGENTS.md`、仕様の正本は `docs/SPECIFICATION.md` を参照する。

## 1. Windows アプリ開発環境セットアップ

### 1.1 前提
- OS: Windows 10/11
- Node.js: `v24.x`
- npm: Node 同梱版

### 1.2 必須ツール
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

### 1.3 依存インストール
```bash
npm install
npm --prefix apps/windows install
```

### 1.4 動作確認
```bash
npm run dev:windows
npm run test:windows
npm run typecheck:windows
npm run tauri:dev:windows
```

### 1.5 トラブルシュート
- `link.exe` / `cl.exe` が見つからない:
  - C++ Build Tools 未導入、または開発者コマンドプロンプト未使用。
- `tauri` コマンドが見つからない:
  - `npm --prefix apps/windows install` を再実行。
- `icons/icon.ico` / `icons/icon.png` が見つからない:
  - `apps/windows/src-tauri/icons/` に必要アイコンを配置。

## 2. 品質ゲート実行レシピ

### 2.1 Windows フロント（TypeScript）
```bash
npm --prefix apps/windows run lint
npm --prefix apps/windows run test
npm --prefix apps/windows run typecheck
```

### 2.2 Tauri（Rust）
```bash
cd apps/windows/src-tauri
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-targets --all-features
```

### 2.3 Web アプリ（必要時）
```bash
npm --prefix apps/web run test
npm --prefix apps/web run typecheck
```

## 3. 手動 E2E チェック（MVP 電卓）

### 3.1 前提
1. `npm install` 済み
2. `npm run dev` でアプリ起動
3. ブラウザで `http://127.0.0.1:5173/` を開く

### 3.2 主要シナリオ
1. `2 + 3 =` で `5`
2. `5 × 6 =` で `30`
3. `9 ÷ 0 =` で `Error`、`AC` 以外操作不可
4. `AC` で `0` に戻る
5. `1 . 2 . 3` で `1.23`
6. `12 + 3 = + 4 =` で `19`

### 3.3 キーボードシナリオ
1. `4 * 5 Enter` で `20`（`* -> ×`）
2. `9 Escape` で `0`（`Escape -> AC`）
3. `123 Backspace` で `12`

## 4. TDD 実装の進め方（実行手順）

### 4.1 1タスクの最小単位
1. Red: 失敗するテストを先に追加
2. Green: 最小実装で通す
3. Refactor: テストグリーンを維持したまま整理

### 4.2 推奨着手順
1. テスト基盤を先に整える
2. 単体テストで計算ロジックを固める
3. UI を結合テスト駆動で接続する
4. 回帰ケースと受け入れ基準を固定する

## 5. Docker 開発手順（Web/品質ゲート）

### 5.1 前提
1. Docker / Docker Compose が利用可能であること
2. リポジトリルート（`codex_tutorial`）でコマンド実行すること

### 5.2 Web 開発サーバ起動
```bash
docker compose run --rm node-setup
docker compose up --build web-dev
```

### 5.3 TypeScript 品質ゲート（Docker内）
```bash
docker compose run --rm node-setup
docker compose run --rm node-check npm --prefix apps/web run test
docker compose run --rm node-check npm --prefix apps/web run typecheck
docker compose run --rm node-check npm --prefix apps/windows run test
docker compose run --rm node-check npm --prefix apps/windows run typecheck
```

### 5.4 Rust 品質ゲート（Docker内, 任意）
```bash
docker compose build rust-check
docker compose run --rm rust-check cargo fmt --all -- --check
docker compose run --rm rust-check cargo clippy --all-targets --all-features -- -D warnings
docker compose run --rm rust-check cargo test --all-targets --all-features
```

### 5.5 注意点
- `tauri dev` / `tauri build`（Windows向け）は Docker 対象外とし、ホスト Windows 環境で実行する。
- Node依存は `node-setup` サービスで明示的に導入する（`npm ci`）。
