# Docker導入計画（方針 + 実行タスク統合版）

## 1. 目的
- WSL環境への直接インストールを減らし、プロジェクト単位で依存を分離する。
- 既存の公式イメージを優先し、追加パッケージは最小限にする。
- 新規端末でも Docker で開発・検証を素早く開始できる状態を作る。

## 2. 現状の依存整理
- Node.js / npm
  - `apps/web`: `vite`, `vitest`, `typescript`, `jsdom`
  - `apps/windows`: TypeScript側の `vite`, `vitest`, `typescript`
- Rust
  - `apps/windows/src-tauri`: `tauri` クレート（Edition 2021）

## 3. スコープ
### 3.1 対象（優先）
- `apps/web` の `dev` / `test` / `typecheck`
- `apps/windows` の TypeScript品質ゲート（`test` / `typecheck`）
- `apps/windows/src-tauri` の `cargo fmt` / `cargo clippy` / `cargo test`（必要に応じて）

### 3.2 対象外（当面）
- `apps/windows` の `tauri dev` / `tauri build`
- 理由: Windows固有依存（MSVC, WebView2等）があり、LinuxベースDockerだけで完結しないため

## 4. 構成方針
### 4.1 比較
- 単一コンテナ（Node+Rust+Tauri依存集約）
  - 利点: 管理対象が少ない
  - 欠点: イメージ肥大化、ビルド遅延、最小追加方針に反する
- 複数コンテナ（役割分離）
  - 利点: 軽量、再利用しやすい、変更影響が局所化
  - 欠点: compose定義が増える

### 4.2 採用
- 複数コンテナ構成を採用する。
- ベースイメージは公式を利用する。
  - Node系: `node:24-bookworm-slim@sha256:...`
  - Rust系: `rust:1.88-bookworm@sha256:...`
- 追加APTは原則なし。必要時のみ対象サービスに限定して追加する。

## 5. 想定サービス（docker compose）
### 5.1 `node-setup`（都度実行）
- 用途: Node依存導入（`npm ci`）
- 実行: `docker compose run --rm node-setup`

### 5.2 `web-dev`
- 用途: `apps/web` の開発サーバ
- ポート: `5173:5173`
- 実行: `npm --prefix apps/web run dev -- --host 0.0.0.0 --port 5173`

### 5.3 `node-check`
- 用途: TypeScript側の `test` / `typecheck`
- 実行例:
  - `docker compose run --rm node-check npm --prefix apps/web run test`
  - `docker compose run --rm node-check npm --prefix apps/windows run typecheck`

### 5.4 `rust-check`（任意）
- 用途: Rust側の `fmt` / `clippy` / `test`
- 実行例:
  - `docker compose run --rm rust-check cargo fmt --all -- --check`
- 注意:
  - Tauri由来のLinuxシステム依存が必要なら、このサービス専用Dockerfileにのみ最小追加

## 6. 実行順チェックリスト

### Phase 1: スコープ確定
- [x] P1-1: 本ドキュメントを正本として運用開始
- [x] P1-2: TauriのWindows実行/ビルドはホスト実行である旨を `SKILL.md` に明記

### Phase 2: 依存固定
- [ ] P2-1: `latest` 指定依存の固定化方針を決定
- [ ] P2-2: lockfileを更新し、再現性を担保
- [x] P2-3: Docker内の依存導入は `npm ci` を原則とする方針を明記

### Phase 3: Docker定義作成
- [x] P3-1: Node用 `Dockerfile` 作成（`node:24-bookworm-slim`, `web-dev`/`node-check` で共用）
- [x] P3-2: `docker-compose.yml` 作成（`web-dev`, `node-check`, `rust-check`）
- [x] P3-3: `.dockerignore` 作成
- [x] P3-4: bind mount + named volume（`node_modules`）を設定
- [x] P3-5: Node系サービスを非rootユーザーで実行
- [x] P3-6: Node系ベースイメージをdigest固定
- [x] P3-7: Rust系ベースイメージをdigest固定

### Phase 4: 品質ゲート統合
- [x] P4-1: Docker経由 `test` / `typecheck` コマンドを定義
- [ ] P4-2: Rust品質ゲート（`fmt/clippy/test`）を必要範囲でDocker化
- [ ] P4-3: CIとローカルの実行コマンドを一致させる

### Phase 5: 検証
- [ ] P5-1: クリーン環境想定で `docker compose up` 動作確認
- [ ] P5-2: `apps/web` の `test` / `typecheck` が通ることを確認
- [ ] P5-3: 必要に応じて `rust-check` の `fmt/clippy/test` を確認

### Phase 6: 文書反映
- [x] P6-1: `SKILL.md` にDocker利用手順を追記
- [ ] P6-2: 手動E2E文書と矛盾がないことを確認

## 7. 完了条件（DoD）
- [ ] D1: Docker導入済み端末で `git clone` 後に `apps/web` を起動できる
- [ ] D2: `apps/web` の `test` / `typecheck` がDocker内で通る
- [ ] D3: 必要範囲の `apps/windows` 品質ゲート（TS/Rust）がDocker経由で再現可能（`rust-check` を採用した場合）
- [ ] D4: 手順が文書のみで再現可能
