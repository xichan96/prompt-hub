# Prompt Hub

提示词管理中心，专注于提示词的编辑、版本管理和分发。

## 功能特性

- AI 辅助提示词编辑
- 提示词版本管理（草稿、已发布、已归档）
- 配置中心功能，支持按需加载
- Namespace 隔离，一个 namespace 表示一个技能提示词的集合，Agent 可按需加载提示词

## 技术栈

### 后端
- Go 1.24+
- Gin Web 框架
- GORM ORM
- Wire 依赖注入
- MySQL 数据库
- Swagger API 文档

### 前端
- React 19
- TypeScript
- Vite
- Ant Design
- Zustand 状态管理

## 快速开始

### 环境要求
- Go 1.24+
- Node.js 18+
- MySQL 5.7+

### 后端启动

1. 配置数据库连接（修改 `internal/config/setting.go`）
2. 启动服务：
```bash
go run cmd/app/main.go
```

服务默认运行在 `http://localhost:8088`

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端默认运行在 `http://localhost:3000`

### 默认账号
- 用户名：`admin`
- 密码：`adminadmin`

## API 文档

启动后端服务后，访问 `http://localhost:8088/swagger/index.html` 查看 API 文档。

## 项目结构

```
├── cmd/app/          # 应用入口
├── internal/         # 内部模块
│   ├── app/         # 业务应用层
│   ├── appdto/      # 数据传输对象
│   ├── config/      # 配置
│   ├── di/          # 依赖注入
│   ├── infra/       # 基础设施层
│   │   ├── model/   # 数据模型
│   │   └── persist/ # 持久层
│   └── pkg/         # 内部工具包
├── frontend/         # 前端项目
└── pkg/              # 公共包
```