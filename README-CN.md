# Prompt Hub

<p align="center">提示词管理中心，专注于提示词的编辑、版本管理和分发。</p>

<p align="center">
  <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/xichan96/prompt-hub"/>
  <img alt="Github Last Commit" src="https://img.shields.io/github/last-commit/xichan96/prompt-hub"/>
</p>

<p align="center">
  <img src="docs/prompthub.gif" alt="Prompt Hub Demo" width="60%"/>
</p>

<p align="center">
  <a href="#概览">概览</a>
  · <a href="#项目优势">项目优势</a>
  · <a href="#功能特性">功能特性</a>
  · <a href="#技术栈">技术栈</a>
  · <a href="#快速开始">快速开始</a>
</p>

<p align="center">
  简体中文 | <a href="README.md">English</a>
</p>

## 概览

Prompt Hub 把提示词当作“可管理的配置资产”，提供编辑、版本化与分发能力，便于在多 Agent/多服务场景下复用与治理。

## 项目优势

- AI 辅助编辑：用 AI 参与提示词改写、补全与优化，让提示词更可用、更稳定、更易复用
- 类 Nacos 配置中心：把提示词当作“配置”来管理，支持按需加载与集中分发，便于多 Agent/多服务复用
- 版本管理与可追溯：草稿/已发布/已归档的生命周期管理，发布可控、回滚有据、历史可查
- 渐进式披露：通过 Skill 隔离与按需加载，只暴露当前任务需要的提示词，降低噪声与误用风险

## 功能特性

- AI 辅助提示词编辑
- 提示词版本管理（草稿、已发布、已归档）
- 配置中心功能，支持按需加载
- Skill 隔离，一个 Skill 表示一个技能提示词的集合，Agent 可按需加载提示词

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


