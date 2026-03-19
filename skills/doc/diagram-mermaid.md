---
name: doc/diagram-mermaid
description: 用 Mermaid 语法生成架构图、流程图、ER 图
triggers: 需要在 Markdown 文档中描述系统结构、流程、或数据关系时
---

## 嵌入方式

在任何 GitHub Markdown 文件中（包括 Discussion、PR、Wiki、docs/）：

````markdown
```mermaid
{图的内容}
```
````

GitHub 原生渲染 Mermaid，无需额外工具。

---

## 常用图类型

### 流程图（Flowchart）— 描述业务流程、用户操作路径

```mermaid
flowchart TD
    A[用户点击收藏] --> B{已登录?}
    B -- 否 --> C[跳转登录页]
    B -- 是 --> D{收藏数 < 100?}
    D -- 否 --> E[提示已达上限]
    D -- 是 --> F[写入数据库]
    F --> G[更新 UI]
```

### 时序图（Sequence）— 描述系统间的调用关系

```mermaid
sequenceDiagram
    participant U as 用户
    participant FE as 前端
    participant API as 后端 API
    participant DB as 数据库

    U->>FE: 点击收藏
    FE->>API: POST /favorites {courseId}
    API->>DB: INSERT favorites
    DB-->>API: OK
    API-->>FE: 201 Created
    FE-->>U: 显示收藏成功
```

### ER 图（Entity Relationship）— 描述数据模型

```mermaid
erDiagram
    USER {
        int id PK
        string email
        string name
    }
    COURSE {
        int id PK
        string title
        int instructor_id FK
    }
    FAVORITE {
        int user_id FK
        int course_id FK
        datetime created_at
    }
    USER ||--o{ FAVORITE : has
    COURSE ||--o{ FAVORITE : in
```

### 架构图（Flowchart 横向）— 描述系统组件关系

```mermaid
flowchart LR
    subgraph Client
        FE[React 前端]
    end
    subgraph Server
        API[Node.js API]
        Worker[后台任务]
    end
    subgraph Storage
        DB[(PostgreSQL)]
        Cache[(Redis)]
    end

    FE --> API
    API --> DB
    API --> Cache
    Worker --> DB
```

---

## 选择图类型的经验

| 我想表达什么 | 用什么图 |
|-------------|---------|
| 用户操作的步骤和分支 | flowchart |
| 服务/模块之间谁调用谁 | sequence |
| 数据库表结构和关联 | erDiagram |
| 系统整体组件架构 | flowchart LR |
| 状态机（订单状态流转） | stateDiagram-v2 |
| 版本/任务时间线 | gantt |

## 注意

- 图不要追求完整，只展示最关键的 3-5 个元素，细节用文字补充
- 节点名称用用户/业务语言，不用变量名
- 超过 10 个节点的图通常意味着需要拆分成多张图
