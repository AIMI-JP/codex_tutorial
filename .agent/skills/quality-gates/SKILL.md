# 品質ゲート実行

## Windows フロント（TypeScript）
```bash
npm --prefix apps/windows run lint
npm --prefix apps/windows run test
npm --prefix apps/windows run typecheck
```

## Tauri（Rust）
```bash
cd apps/windows/src-tauri
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-targets --all-features
```

## Web アプリ（必要時）
```bash
npm --prefix apps/web run test
npm --prefix apps/web run typecheck
```
