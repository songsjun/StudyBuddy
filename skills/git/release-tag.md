---
name: git/release-tag
description: 创建语义化版本 Tag 并发布 GitHub Release
triggers: 确认合并所有计划功能、CI 通过、准备发布新版本时
---

## 前置检查

```bash
git checkout main && git pull origin main
# 确认 CI 状态
gh run list --limit 5
# 确认没有未合并的计划 PR
gh pr list --state open
```

只有 main 分支 CI 全绿、无遗漏 PR 时才继续。

## 确定版本号

查看最近的 Tag：
```bash
git tag --sort=-version:refname | head -5
```

按 Semantic Versioning 决定新版本号：
- 有破坏性变更（Breaking Change）→ Major 升（`v1.x.x` → `v2.0.0`）
- 新增功能，向后兼容 → Minor 升（`v1.2.x` → `v1.3.0`）
- 仅 Bug 修复 → Patch 升（`v1.2.3` → `v1.2.4`）

## 生成 Release Notes 草稿

```bash
# 查看自上个 Tag 以来的提交
git log v1.2.0..HEAD --oneline
```

按 `doc/release-notes` 模板整理内容。

## 创建 Tag 并发布

```bash
git tag v1.3.0
git push origin v1.3.0
```

创建 GitHub Release：
```bash
gh release create v1.3.0 \
  --title "v1.3.0" \
  --notes-file /tmp/release-notes.md
```

## 发布后

1. 在 GitHub Wiki 的 Release History 页追加本次版本记录
2. 在 Discussions → Announcements 发布公告（重要版本）

## 注意

- Hotfix 同样走完整流程，不跳过 Review，紧急时降为 1 人 Review
- Pre-release 版本使用 `v1.3.0-beta.1` 格式，`gh release create` 加 `--prerelease` flag
- 不要删除已发布的 Tag，出错时发新的补丁版本
