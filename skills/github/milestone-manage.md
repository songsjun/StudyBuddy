---
name: github/milestone-manage
description: 创建和管理 Milestone，跟踪版本发布计划
triggers: 规划新版本、将 Issue 归入版本计划、检查版本发布就绪状态时
---

## 创建 Milestone

```bash
gh api repos/songsjun/StudyBuddy/milestones \
  --method POST \
  --field title="v1.3.0" \
  --field description="课程收藏、推荐算法优化" \
  --field due_on="2024-04-01T00:00:00Z"
```

## 将 Issue 加入 Milestone

```bash
# 先获取 milestone number
gh api repos/songsjun/StudyBuddy/milestones \
  --jq '.[] | "\(.number) \(.title)"'

# 将 Issue 加入 Milestone
gh issue edit 42 --milestone "v1.3.0"
gh issue edit 43 --milestone "v1.3.0"
```

## 检查 Milestone 进度

```bash
gh api repos/songsjun/StudyBuddy/milestones \
  --jq '.[] | {
    title: .title,
    due: .due_on,
    open: .open_issues,
    closed: .closed_issues,
    progress: "\(.closed_issues * 100 / (.open_issues + .closed_issues) | round)%"
  }'
```

## 发布就绪判断

Milestone 可以发布的条件：
1. `open_issues == 0`（所有计划 Issue 已关闭）
2. 无 `blocked` label 的 Issue
3. 所有关联 PR 已合并
4. CI 在 main 分支全部通过

```bash
# 检查 Milestone 下还有多少 open Issue
gh issue list --milestone "v1.3.0" --state open --json number,title \
  --jq 'if length == 0 then "✓ 所有 Issue 已关闭" else "⚠ 还有 \(length) 个未关闭 Issue" end'
```

## Milestone 命名约定

- 正式版本：`v1.3.0`
- 热修复：`v1.2.1`
- 预览版：`v1.3.0-beta`

## 注意

- Milestone 是版本规划工具，不是时间追踪工具，不要追求 due date 精确
- 如果某个 Issue 在版本截止前明显无法完成，及时移出 Milestone 而不是推迟发布
- 关闭 Milestone 时 GitHub 会自动关闭其下所有 open Issue，谨慎操作
