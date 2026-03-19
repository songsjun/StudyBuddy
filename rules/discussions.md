# 讨论规范

## 三个工具的分工

| 工具 | 用于 | 不用于 |
|------|------|--------|
| **GitHub Discussions** | 开放性讨论、决策、评审、公告 | 可执行任务 |
| **GitHub Issues** | 具体的功能/Bug/任务单元 | 发散性讨论 |
| **GitHub Wiki** | 沉淀后的结论（用户文档、产品说明） | 过程讨论 |

**流向原则**：Discussion 对齐 → Issue 执行 → Wiki/docs 沉淀结论

---

## Discussion Category 设计

GitHub Discussions 按**话题类型**分类，而不是按版本迭代分类。
用标题前缀（如 `[v2.0]`）在同一 Category 内区分不同迭代，保持分类稳定。

### 第一阶段：启动期（0 到 MVP）

| Category | Emoji | 类型 | 用途 |
|----------|-------|------|------|
| Announcements | 📢 | Announcement | 团队公告、里程碑通知，仅维护者发帖 |
| Ideas & Brainstorming | 💡 | Open discussion | 创意、灵感、还不成型的想法，鼓励发散 |
| Requirements | 📋 | Open discussion | 需求讨论、用户故事、优先级排序 |
| Product Decisions | 🎯 | Open discussion | 产品定义、功能边界、MVP 取舍 |
| Architecture & Design | 🏗️ | Open discussion | 技术方案评审、架构选型、ADR 前置讨论 |
| Q&A | ❓ | Q&A format | 任何问题，支持标记 Answered |

**为什么这几个**：覆盖了从想法到开发启动的完整前期流程，Q&A 作为兜底，Announcements 保证重要信息不淹没。

### 第二阶段：迭代期（持续开发阶段新增）

| Category | Emoji | 类型 | 用途 |
|----------|-------|------|------|
| Dev Discussions | 🔧 | Open discussion | 开发中的设计讨论、实现方案选择、跨模块协调 |
| Releases | 🚀 | Announcement | 版本发布公告、Release Notes，仅维护者发帖 |
| Retrospectives | 🔄 | Open discussion | 迭代复盘、流程改进、经验总结 |

**为什么到迭代期才加**：Dev Discussions 在纯设计期意义不大；Releases 在有发布时才需要；Retrospectives 需要有迭代经验后才有价值。

### 第三阶段：成熟期（有用户后按需新增）

| Category | Emoji | 类型 | 触发条件 |
|----------|-------|------|---------|
| User Feedback | 💬 | Open discussion | 开始有外部用户或内测用户时 |
| Roadmap | 🗺️ | Announcement | 产品路线图需要对外透明时 |

---

## 标题约定：在 Category 内区分迭代

同一 Category 跨多个版本时，用标题前缀标注：

```
[v1.0] 课程模块需求讨论
[v2.0] 课程模块需求讨论 - 新增协作学习功能
[spike] 实时通知方案可行性探索
[RFC] 数据库迁移方案征求意见
```

常用前缀：
- `[vX.Y]` 关联特定版本
- `[RFC]` Request for Comments，正式征求意见
- `[spike]` 探索性研究，不一定产出结论
- `[decision]` 需要明确决策的议题
- `[retro]` 复盘

---

## Discussion 的生命周期

```
发起 → 讨论（48h 内响应）→ 总结结论 → 收口
```

**收口动作**（任选其一或组合）：
- 技术决策 → 写 ADR 到 `docs/adr/`，Discussion 中贴链接后关闭
- 产品功能 → 更新 Wiki，创建 Issue 执行
- 无结论的探索 → 在 Discussion 总结现状，标记 `no-decision`，不强求结论

**避免 Discussion 烂尾**：发起人有责任在讨论沉寂后推动收口，哪怕结论是"暂不处理"。

---

## 全流程中 Discussion 的使用节奏

| 阶段 | Discussion 的主要用途 |
|------|----------------------|
| 创意/探索 | Ideas & Brainstorming 发起，低门槛，鼓励不成熟的想法 |
| 需求定义 | Requirements 讨论用户故事，对齐优先级，产出需求文档草稿 |
| 产品决策 | Product Decisions 确定功能边界，产出 PRD，结论写入 Wiki |
| 技术设计 | Architecture & Design 做方案评审，产出 ADR 写入 docs/ |
| 开发中 | Dev Discussions 处理跨模块协调和设计调整（小的在 PR 里解决） |
| 发布 | Releases 发布公告，Retrospectives 复盘 |
| 下一版本 | 新需求回到 Ideas/Requirements，形成闭环 |

---

## 什么不适合放在 Discussion

- 具体的 Bug → GitHub Issue
- 代码实现的细节问题 → PR comment
- 已有定论的文档 → Wiki 或 docs/
- 私人/敏感信息 → 不放 GitHub
