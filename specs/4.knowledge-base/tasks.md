# Knowledge Base — 任务清单

## 任务版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始任务 |

## 项目信息

- 项目名: x-workflow
- 架构类型: monorepo
- specs 路径: specs/4.knowledge-base/

## 任务列表

### 功能 1: 知识库 Schema

- [ ] T-001: 创建 `document` 表 schema ~15min
- [ ] T-002: 创建 `document_chunk` 表 schema ~15min
- [ ] T-003: 在 schema/index.ts 导出 ~5min

### 功能 2: tRPC API

- [ ] T-004: 创建 `knowledge.list` procedure ~15min
- [ ] T-005: 创建 `knowledge.upload` procedure（处理文件上传）~30min
- [ ] T-006: 创建 `knowledge.delete` procedure ~15min

### 功能 3: 知识库页面

- [ ] T-007: 创建 `/knowledge` 路由页面，整合 KnowledgeBaseView 组件 ~30min

### 功能 4: 文档表格

- [ ] T-008: 实现文档表格 UI ~15min
- [ ] T-009: 实现搜索过滤功能 ~15min
- [ ] T-010: 实现文档删除功能 ~15min

### 功能 5: 文件上传

- [ ] T-011: 实现拖拽上传区域 UI ~15min
- [ ] T-012: 实现文件选择和上传逻辑 ~15min
- [ ] T-013: 实现文件类型和大小校验 ~15min

### 功能 6: RAG 向量化

- [ ] T-014: 实现文本提取逻辑（PDF/TXT/CSV）~30min
- [ ] T-015: 实现文本分块逻辑 ~15min
- [ ] T-016: 实现向量生成和存储 ~15min
- [ ] T-017: 显示 RAG 参数配置面板 ~15min

## 依赖关系

- T-004~T-006 依赖 T-001~T-003
- T-007 依赖 T-001
- T-008~T-010 依赖 T-007
- T-011~T-013 依赖 T-005
- T-014~T-017 依赖 T-005

## 风险点

- 大文件上传需要处理超时
- PDF 解析可能需要额外库
- 向量存储方案待确定