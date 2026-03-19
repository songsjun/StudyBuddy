---
name: git/commit
description: 按项目规范暂存并提交代码变更
triggers: 完成一个逻辑单元的代码修改，需要提交时
---

## 步骤

### 1. 确认当前状态
```bash
git status
git diff
```
确认变更范围与预期一致，没有意外文件被修改。

### 2. 暂存文件
按文件名明确暂存，不使用 `git add .` 或 `git add -A`：
```bash
git add src/foo.ts src/bar.ts
```
排除：`.env`、日志文件、临时文件、与本次变更无关的文件。

### 3. 检查暂存内容
```bash
git diff --staged
```
确认暂存内容与提交意图匹配。

### 4. 提交
```
<type>: <简短描述（50字符以内）>

[可选正文：解释为什么，而不是做了什么]
[可选：Closes #issue-number]
```

type 取值：
- `feat` 新功能
- `fix` Bug 修复
- `docs` 文档
- `refactor` 重构（不改变行为）
- `test` 测试
- `chore` 构建、依赖、配置

```bash
git commit -m "feat: 添加用户收藏课程功能

支持最多收藏 100 门课程，超出时提示用户。
Closes #23"
```

## 判断标准

**一次提交只做一件事。** 如果 commit message 需要用"and"连接，说明应该拆成两次提交。

**正文写"为什么"，不写"做了什么"。** 代码本身能说明做了什么，读者需要知道的是决策原因。

## 注意

- 提交前确认没有遗留调试代码（`console.log`、`debugger`、临时注释）
- 不提交包含密钥、token、密码的文件
- 如果 pre-commit hook 失败，修复问题后重新提交，不要用 `--no-verify` 绕过
