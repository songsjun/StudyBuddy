---
name: github/repo-status
description: 快速获取项目整体健康状态：PR、Issue、Milestone 进展
triggers: 开始工作前了解项目现状、同步项目进度、判断是否可以发布时
---

## 完整状态检查

```bash
echo "=== 待 Review 的 PR ==="
gh pr list --state open --json number,title,author,reviewDecision,createdAt \
  --jq '.[] | "#\(.number) \(.title) by \(.author.login) [\(.reviewDecision // "PENDING")]"'

echo ""
echo "=== 阻塞中的 Issue ==="
gh issue list --label "blocked" --state open \
  --json number,title,assignees \
  --jq '.[] | "#\(.number) \(.title)"'

echo ""
echo "=== 进行中的 Issue ==="
gh issue list --label "in-progress" --state open \
  --json number,title,assignees \
  --jq '.[] | "#\(.number) \(.title) → \(.assignees[].login)"'

echo ""
echo "=== Milestone 进度 ==="
gh api repos/songsjun/StudyBuddy/milestones \
  --jq '.[] | "\(.title): \(.closed_issues)/\(.closed_issues + .open_issues) closed, due \(.due_on // "no date")"'
```

## 发布前专项检查

```bash
echo "=== CI 状态（最近 5 次）==="
gh run list --limit 5 --json status,conclusion,name,createdAt \
  --jq '.[] | "\(.status) \(.conclusion // "") - \(.name)"'

echo ""
echo "=== 未合并的 PR ==="
gh pr list --state open --json number,title \
  --jq 'length | "共 \(.) 个未合并 PR"'
```

## 快速单项查询

```bash
# 查看特定 PR 的 CI 状态
gh pr checks <PR-number>

# 查看某人的待处理 Review
gh pr list --reviewer @me --state open

# 查看无 Assignee 的 open Issue
gh issue list --state open --assignee "" --json number,title
```

## 输出解读

- `APPROVED`：已有足够 Approve，可合并（确认 CI 也通过）
- `CHANGES_REQUESTED`：有 blocking 意见，作者需要处理
- `REVIEW_REQUIRED` / `PENDING`：等待 Review，超 48h 需要 @mention
- Milestone 中有 `blocked` Issue：可能影响发布时间，需要关注
