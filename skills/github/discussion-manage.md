---
name: github/discussion-manage
description: 在 GitHub Discussions 中发起讨论、推动对齐、收口结论
triggers: 需要讨论产品方向、技术方案、需求优先级，或任何没有明确答案需要团队对齐的话题时
---

## 选择正确的 Category

| 场景 | Category |
|------|----------|
| 创意、灵感、未成形的想法 | Ideas & Brainstorming |
| 需求讨论、用户故事、优先级 | Requirements |
| 功能边界、MVP 取舍、产品定义 | Product Decisions |
| 技术方案、架构选型 | Architecture & Design |
| 开发中的跨模块协调 | Dev Discussions |
| 版本发布公告 | Releases（仅维护者） |
| 迭代复盘 | Retrospectives |
| 具体问题求解 | Q&A |

## 获取 Category ID

```bash
gh api graphql -f query='
query {
  repository(owner: "songsjun", name: "StudyBuddy") {
    discussionCategories(first: 20) {
      nodes { id name }
    }
  }
}'
```

## 创建 Discussion

```bash
REPO_ID="R_kgDORq56_g"
CATEGORY_ID="<从上方查询获取>"

gh api graphql -f query='
mutation {
  createDiscussion(input: {
    repositoryId: "'$REPO_ID'"
    categoryId: "'$CATEGORY_ID'"
    title: "[RFC] 课程推荐算法方案选择"
    body: "## 背景\n...\n## 问题\n...\n## 我的初步想法\n..."
  }) {
    discussion { url }
  }
}'
```

## 标题前缀约定

| 前缀 | 含义 |
|------|------|
| `[RFC]` | 征求意见，期待团队反馈 |
| `[decision]` | 需要明确决策，不能无限讨论 |
| `[spike]` | 探索性研究，结论开放 |
| `[v2.0]` | 关联特定版本的讨论 |
| `[retro]` | 复盘 |

## @mention 通知成员

在 Discussion body 或 comment 中直接使用 `@username`：
```bash
gh api graphql -f query='
mutation {
  addDiscussionComment(input: {
    discussionId: "<discussion-id>"
    body: "@username 这个方案需要你从安全角度确认一下，48h 内回复。"
  }) {
    comment { id }
  }
}'
```

## 收口讨论

当讨论达成共识后：
1. 在 Discussion 顶部 comment 总结结论
2. 执行收口动作（见下表）
3. 关闭 Discussion

```bash
gh api graphql -f query='
mutation {
  closeDiscussion(input: {
    discussionId: "<discussion-id>"
  }) { discussion { id } }
}'
```

**收口动作对照**：

| 讨论类型 | 结论去向 |
|---------|---------|
| 技术决策 | 写 ADR 到 `docs/adr/`，Discussion 贴链接 |
| 产品功能定义 | 更新 Wiki，创建 Issue 执行 |
| 无结论的探索 | 总结现状，注明 `no-decision`，关闭 |
| 需求优先级 | 更新 Milestone，调整 Issue 优先级 |

## 注意

- 发起人有责任推动收口，不能让讨论自然死亡
- 不要用 Discussion 记录可执行任务，那是 Issue 的职责
- Q&A 类型支持标记 Answered，用完记得标记
