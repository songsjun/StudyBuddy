# 仓库结构规范

## 内容放在哪里？

| 内容类型 | 位置 | 说明 |
|---------|------|------|
| 用户手册、产品说明、功能介绍、部署指南 | **GitHub Wiki** | 面向用户和非开发者 |
| 架构设计、API 文档、技术决策（ADR） | `docs/` | 面向开发者，随代码版本管理 |
| 团队行为规则 | `rules/` | 本目录 |
| AI Agent 共享记忆 | `memory/` | Agent 跨会话共享状态 |
| 可复用 AI Skills | `skills/` | Agent 可调用的技能脚本 |
| 需求讨论、产品决策、开放性问题 | **GitHub Discussions** | 过程记录，不进代码库 |
| 具体任务、Bug、功能开发单元 | **GitHub Issues** | 可执行的工作单元 |

## docs/ 目录约定

```
docs/
  adr/          # Architecture Decision Records（技术决策记录）
  api/          # API 接口文档
  design/       # 架构图、模块设计
```

ADR 文件命名：`adr/001-选择数据库.md`，内容包含：背景、决策、理由、后果。

## 什么不放进代码库

- 临时笔记、草稿 → 本地或个人 Notion
- 实时讨论记录 → GitHub Discussions
- 用户反馈、运营数据 → Wiki 或外部工具
