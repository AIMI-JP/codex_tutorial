# SKILL.md

## 目的
- この文書は、分割した Skill へのインデックス。
- 恒常ルールは `AGENTS.md`、仕様の正本は `docs/SPECIFICATION.md` を参照。

## Skill 一覧
1. Windows 開発環境セットアップ  
   - `.agent/skills/windows-setup/SKILL.md`
2. 品質ゲート実行  
   - `.agent/skills/quality-gates/SKILL.md`
3. 手動 E2E（MVP 電卓）  
   - `.agent/skills/manual-e2e/SKILL.md`
4. TDD 実装フロー  
   - `.agent/skills/tdd-workflow/SKILL.md`
5. Docker 開発手順  
   - `.agent/skills/docker-workflow/SKILL.md`

## 運用メモ
- `SKILL.md` は索引のみを保持し、手順本文は各 Skill に集約する。
- エージェントごとの参照先は symlink で統一する（`.codex/skills`, `.claude/skills`）。
