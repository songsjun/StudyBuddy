# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 开始工作前必读

1. 读 `rules/README.md`，根据当前任务按需加载对应规则文件
2. 读 `memory/` 目录，了解项目共享上下文
3. 不要一次性加载所有规则，按需查阅

## 仓库结构

```
rules/      # 团队行为规则（从 rules/README.md 开始）
docs/       # 开发文档（架构设计、ADR、API 文档）
memory/     # AI Agent 跨会话共享记忆
skills/     # 可复用 AI Skills
.github/    # PR 模板、CI 配置
```

## 核心约束

- 代码变更必须通过 PR，不直接 push `main`
- CI 通过 + 至少 1 个 Approve 才能合并
- 影响架构和产品方向的决策需人类确认，不自行决定

## 记忆管理

- 重要的项目上下文、技术决策写入 `memory/` 供团队 Agent 共享
- 临时会话状态不写入 `memory/`
