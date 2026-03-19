# 分支与提交规范

## 分支保护规则（需在 GitHub 仓库设置中配置）

`main` 分支受保护：
- 禁止直接 push
- 必须通过 PR 合并
- 合并前 CI 必须全部通过
- 至少需要 1 个 Approve

## 分支命名

```
feat/short-description        # 新功能
fix/issue-number-description  # Bug 修复，关联 Issue 号
docs/what-you-documenting     # 文档更新
refactor/module-name          # 重构
test/what-you-are-testing     # 补充测试
chore/task-description        # 构建、依赖、配置等杂项
```

从 `main` 创建分支，完成后通过 PR 合并回 `main`。

## Commit Message 格式

```
<type>: <简短描述>

[可选：详细说明]
[可选：Closes #issue-number]
```

type 取值：`feat` / `fix` / `docs` / `refactor` / `test` / `chore`

示例：
```
feat: 添加用户登录功能

支持邮箱+密码登录，JWT token 有效期 7 天。
Closes #12
```

## 开发节奏建议

- 保持分支短命（理想 1-3 天内完成并合并）
- 长期分支每天 rebase main 避免大冲突
- 一个分支只做一件事
- 合并以后删除/归档分支
