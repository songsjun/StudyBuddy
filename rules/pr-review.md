# PR 与 Code Review 规范

## PR 合并的硬性条件

缺一不可：
1. CI 全部通过（测试、lint、构建）
2. 至少 1 位成员 Approve（作者不能 approve 自己）
3. 所有 Review 意见已 resolved
4. 无合并冲突

## PR 标题格式

```
[type] 简短描述
```

type：`feat` / `fix` / `docs` / `refactor` / `test` / `chore`

示例：`[feat] 添加课程收藏功能`

## PR 描述要包含

```markdown
## 做了什么
（简要说明变更内容）

## 为什么这样做
（背景、决策原因，关联 Discussion 或 Issue）

## 如何测试
（测试步骤，或说明 CI 已覆盖）

Closes #issue-number
```

## 作为 Reviewer 的行为准则

**响应时间**：收到 Review 请求后 **48 小时内** 完成（见 `async-collab.md`）

**标注意见级别**，让作者知道该怎么处理：
- `[blocking]` 必须修改，否则不 approve
- `[suggestion]` 建议，作者自行决定
- `[question]` 纯粹提问，不要求改动

**Review 关注点**：逻辑正确性、边界情况、安全性、可维护性。
不要纠结代码风格（交给 linter），不要强制推行个人偏好。

## 作为 PR 作者的行为准则

- PR 要小而聚焦，大功能拆多个 PR
- 复杂变更附截图或测试结果
- 对每条 blocking 意见逐一回复和处理，不要静默修改后直接 resolve
- 有分歧时在 PR 里讨论，达不成共识升级到 Discussion

## 合并方式

统一使用 **Squash and Merge**，保持 main 分支历史整洁。
