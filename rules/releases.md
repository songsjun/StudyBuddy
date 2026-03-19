# 版本发布规范

## 版本号规则（Semantic Versioning）

```
v主版本.次版本.补丁版本
```

- **主版本（Major）**：不兼容的破坏性变更
- **次版本（Minor）**：新增功能，向后兼容
- **补丁（Patch）**：Bug 修复，向后兼容

示例：`v1.2.3`，预发布：`v1.2.3-beta.1`

## 发布流程

1. **确认 main 分支状态**
   - 所有计划功能的 PR 已合并
   - CI 全部通过

2. **创建 Release Tag**
   ```bash
   git tag v1.2.0
   git push origin v1.2.0
   ```

3. **在 GitHub 创建 Release**
   - 基于 Tag 创建 GitHub Release
   - 填写 Release Notes（见下方格式）

4. **更新 Wiki**
   - 在 Wiki 的 Release Notes 页面追加本次版本说明
   - 更新受影响的用户文档页面

5. **发布通知**（可选）
   - 在 GitHub Discussions 发布公告帖

## Release Notes 格式

```markdown
## v1.2.0 (2024-01-15)

### 新功能
- 添加课程收藏功能 (#12)
- 支持批量导入题目 (#18)

### Bug 修复
- 修复作业提交超时问题 (#21)

### 破坏性变更
（如有，必须在此说明迁移方式）
```

## Hotfix 流程

线上紧急 Bug：
1. 从 `main` 创建 `fix/issue-number-description` 分支
2. 修复后正常走 PR + Review 流程（紧急时可降为 1 人 Review）
3. 合并后立即发布补丁版本（如 `v1.2.1`）
