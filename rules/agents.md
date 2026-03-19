# AI Agent 协作规范

## Agent 的定位

Agent 是团队成员，享有和人类成员相同的协作权限，但需遵守相同的规则——包括 PR 流程、Review 要求、分支规范。Agent 不绕过任何人工约束。

## 共享资源

| 位置 | 用途 |
|------|------|
| `memory/` | Agent 跨会话的共享记忆，团队所有 Agent 可读写 |
| `skills/` | 可复用的 Skill 脚本，按需加载，避免重复实现 |
| `rules/` | Agent 必须遵守的行为规则（即本目录） |

## memory/ 使用规范

- 文件命名清晰描述内容：`project-decisions.md`、`api-conventions.md`
- 每个文件有 frontmatter 说明类型和用途
- 内容过时时及时更新或删除，不要堆砌
- 不写临时状态（当前会话进度），只写跨会话有用的信息

## skills/ 使用规范

- 一个文件对应一个技能，职责单一
- 包含：用途描述、触发条件、使用示例
- 修改 Skill 文件需走 PR + Review（因为影响所有 Agent）

## Agent 参与开发的规则

1. **读规则先**：开始工作前读 `rules/README.md`，按需加载相关规则文件
2. **不自行决策**：影响架构或产品方向的决策需在 Discussion 中由人类确认
3. **PR 照常提**：Agent 产出的代码变更同样通过 PR 提交，不直接 push main
4. **标注 AI 生成**：PR 描述中注明由 AI Agent 生成，方便 Reviewer 重点关注
5. **记录决策**：在 `memory/` 中记录重要的上下文，让下一个 Agent 快速接手

## 人类 Review AI 产出的重点

- 逻辑正确性（AI 有时会自信地犯错）
- 安全性（权限、数据校验、注入风险）
- 是否引入了不必要的复杂度
