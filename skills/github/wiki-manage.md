---
name: github/wiki-manage
description: 读写 GitHub Wiki，管理产品文档和用户说明
triggers: 需要更新产品说明、用户手册、发布历史、或任何面向非开发者的文档时
---

## Wiki vs docs/ 的边界

| 内容 | 位置 |
|------|------|
| 用户手册、功能说明、使用教程 | **Wiki** |
| 部署指南、配置说明 | **Wiki** |
| 发布历史（Release Notes） | **Wiki** |
| 架构设计、ADR、API 文档 | **`docs/`**（随代码版本管理） |

## 读取 Wiki

GitHub Wiki 是独立的 Git 仓库，克隆后本地编辑：

```bash
git clone https://github.com/songsjun/StudyBuddy.wiki.git /tmp/studybuddy-wiki
```

查看现有页面：
```bash
ls /tmp/studybuddy-wiki/
```

## 写入 Wiki

```bash
cd /tmp/studybuddy-wiki

# 编辑或新建页面（文件名即页面名，空格用 - 替代）
# 例：Home.md, Release-History.md, User-Guide.md

git add .
git commit -m "更新：添加 v1.3.0 用户手册"
git push origin master
```

## Wiki 页面命名约定

| 页面 | 文件名 |
|------|--------|
| 首页 | `Home.md` |
| 发布历史 | `Release-History.md` |
| 用户指南 | `User-Guide.md` |
| 快速开始 | `Getting-Started.md` |
| 部署说明 | `Deployment.md` |
| 常见问题 | `FAQ.md` |

## Release History 页面格式

```markdown
## v1.3.0 (2024-03-01)
[发布公告链接]

### 新功能
- 课程收藏功能

### 修复
- 课程页加载超时问题

---

## v1.2.0 (2024-01-15)
...
```

## 注意

- Wiki 的 Git 历史独立于主仓库，不受分支保护规则约束，需要自律
- 不要在 Wiki 里放开发决策或架构内容，那些放 `docs/` 以便代码 Review 联动
- Wiki 面向用户，写作时假设读者不懂技术细节
