# Docker 開発手順（Web/品質ゲート）

## 前提
1. Docker / Docker Compose が利用可能であること
2. リポジトリルート（`codex_tutorial`）でコマンド実行すること

## Web 開発サーバ起動
```bash
docker compose run --rm node-setup
docker compose up --build web-dev
```

## TypeScript 品質ゲート（Docker内）
```bash
docker compose run --rm node-setup
docker compose run --rm node-check npm --prefix apps/web run test
docker compose run --rm node-check npm --prefix apps/web run typecheck
docker compose run --rm node-check npm --prefix apps/windows run test
docker compose run --rm node-check npm --prefix apps/windows run typecheck
```

## Rust 品質ゲート（Docker内, 任意）
```bash
docker compose build rust-check
docker compose run --rm rust-check cargo fmt --all -- --check
docker compose run --rm rust-check cargo clippy --all-targets --all-features -- -D warnings
docker compose run --rm rust-check cargo test --all-targets --all-features
```

## 注意点
- `tauri dev` / `tauri build`（Windows向け）は Docker 対象外とし、ホスト Windows 環境で実行する
- Node依存は `node-setup` サービスで明示的に導入する（`npm ci`）
