# codex_tutorial

電卓アプリ（MVP）を作るためのモノレポです。  
Web アプリ（`apps/web`）と Windows アプリ（`apps/windows` / Tauri）を含みます。

## 目次
- [リポジトリ構成](#リポジトリ構成)
- [前提](#前提)
- [Docker で使う（推奨）](#docker-で使う推奨)
- [コンテナ内で実装する運用](#コンテナ内で実装する運用)
- [ローカルで使う（補足）](#ローカルで使う補足)
- [主要コマンド](#主要コマンド)
- [ドキュメント](#ドキュメント)

## リポジトリ構成
- `apps/web`: Web 版電卓（TypeScript + Vite + Vitest）
- `apps/windows`: Windows 版電卓（TypeScript + Tauri）
- `apps/windows/src-tauri`: Tauri の Rust 側コード
- `docs/SPECIFICATION.md`: 仕様の正本

## 前提
- Docker / Docker Compose を使えること（推奨運用）
- Windows 向け `tauri dev` / `tauri build` はホスト Windows 環境で実行すること

## Docker で使う（推奨）
リポジトリルートで実行します。

### 1. 依存インストール
```bash
docker compose run --rm node-setup
```

### 2. Web 開発サーバ起動
```bash
docker compose up --build web-dev
```

起動後: `http://127.0.0.1:5173`

### 3. TypeScript 品質ゲート
```bash
docker compose run --rm node-check npm --prefix apps/web run test
docker compose run --rm node-check npm --prefix apps/web run typecheck
docker compose run --rm node-check npm --prefix apps/windows run test
docker compose run --rm node-check npm --prefix apps/windows run typecheck
```

### 4. Rust 品質ゲート（任意）
```bash
docker compose build rust-check
docker compose run --rm rust-check cargo fmt --all -- --check
docker compose run --rm rust-check cargo clippy --all-targets --all-features -- -D warnings
docker compose run --rm rust-check cargo test --all-targets --all-features
```

## コンテナ内で実装する運用
ホストに追加ツールを入れたくない場合は、`web-dev` を常駐させてその中で作業します。

### 1. 初回セットアップ
```bash
docker compose run --rm node-setup
docker compose up --build -d web-dev
```

### 2. 作業シェルに入る
```bash
docker compose exec web-dev bash
```

### 3. コンテナ内で実行する例
```bash
npm --prefix apps/web run test
npm --prefix apps/web run typecheck
npm --prefix apps/windows run test
npm --prefix apps/windows run typecheck
```

### 4. 終了
```bash
docker compose down
```

## ローカルで使う（補足）
Docker を使わない場合の最小コマンドです。

```bash
npm install
npm --prefix apps/web install
npm --prefix apps/windows install
```

## 主要コマンド
ルート `package.json`:

```bash
npm run dev:web
npm run test:web
npm run typecheck:web

npm run dev:windows
npm run test:windows
npm run typecheck:windows

npm run tauri:dev:windows
npm run tauri:build:windows
```

## ドキュメント
- 開発ルール: `AGENTS.md`
- 手順テンプレート: `SKILL.md`
- Docker 計画: `docs/DOCKER_TASKS.md`
- 仕様: `docs/SPECIFICATION.md`
