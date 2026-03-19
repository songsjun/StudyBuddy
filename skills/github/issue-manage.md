---
name: github/issue-manage
description: 创建和管理 GitHub Issues，跟踪任务状态
triggers: 需要记录 Bug、功能任务、文档更新、或任何需要跟踪的工作单元时
---

## 创建 Issue

```bash
gh issue create \
  --title "修复课程页面加载超时" \
  --body "$(cat <<'EOF'
## 问题描述
课程详情页在网络较慢时（3G）加载超过 10 秒无响应提示。

## 复现步骤
1. Chrome DevTools → Network → 切换 Slow 3G
2. 进入任意课程详情页
3. 观察到加载超过 10s 无 loading 状态

## 期望行为
3s 内显示 loading 状态，10s 超时后提示错误并支持重试。

## 环境
- 版本：v1.2.1
- 浏览器：Chrome 120
EOF
)" \
  --label "bug" \
  --assignee "@me" \
  --milestone "v1.3.0"
```

## 常用 Label

| Label | 用途 |
|-------|------|
| `bug` | 功能不符合预期 |
| `feature` | 新功能 |
| `docs` | 文档 |
| `blocked` | 被外部因素阻塞，需要关注 |
| `in-progress` | 正在处理 |
| `urgent` | 线上故障，需要优先处理 |

## 更新 Issue 状态

开始处理：
```bash
gh issue edit 42 --add-label "in-progress"
# 同时将自己设为 Assignee（如果还没有）
gh issue edit 42 --add-assignee "@me"
```

遇到阻塞：
```bash
gh issue edit 42 --add-label "blocked"
# 在 Issue 中留言说明阻塞原因和等待什么
gh issue comment 42 --body "阻塞原因：等待 @username 确认 API 格式。预计 2 日内解除。"
```

## 关闭 Issue

PR 合并后自动关闭（PR body 中写 `Closes #42`）。

手动关闭：
```bash
gh issue close 42 --comment "已在 v1.3.0 中修复，见 PR #55"
```

## Issue 质量标准

- 标题能让不了解上下文的人看懂问题是什么
- Bug 类 Issue 必须包含复现步骤
- Feature 类 Issue 说明用户价值（为什么要做），不只是实现描述
- Issue 足够小：理想 1-3 天内可完成，大任务先拆分
