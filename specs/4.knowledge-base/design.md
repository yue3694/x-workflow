# Knowledge Base — 技术设计

## 设计版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始设计 |

## 项目架构

- 架构类型: monorepo
- 涉及层: 前端 (Next.js) + 后端 (tRPC + 文件系统)

## 功能模块设计

### 模块 1: 文档表格

**涉及层及关键设计:**

- **前端**: 表格展示文档列表，支持排序
- **后端**: tRPC `knowledge.list` 获取用户文档

### 模块 2: 搜索过滤

**涉及层及关键设计:**

- **前端**: 输入框 `onChange` 触发过滤，使用 `filter()` 本地过滤
- 过滤条件：`name` 包含搜索词 或 `type` 包含搜索词

### 模块 3: 文件上传

**涉及层及关键设计:**

- **前端**: Drag and Drop 区域 + file input
- **后端**: tRPC `knowledge.upload` 接收文件
- 文件存储：保存到 `{uploadsDir}/{userId}/{documentId}/{filename}`
- 白名单类型：`application/pdf`, `text/plain`, `text/csv`, `application/epub+zip`

### 模块 4: RAG 向量化

**涉及层及关键设计:**

- **前端**: 上传成功后显示向量化状态
- **后端**:
  1. 提取文本内容（PDF.js / 原生读取）
  2. 文本分块（固定 512 tokens）
  3. 生成嵌入向量（使用 text-embedding-05 或简单 hash）
  4. 存储到 `document_chunk` 表

## 接口契约

| 接口 | 方法 | 说明 |
| ---- | ---- | ---- |
| `knowledge.list` | tRPC query | 获取文档列表 |
| `knowledge.upload` | tRPC mutation | 上传文档（multipart） |
| `knowledge.delete` | tRPC mutation | 删除文档 |
| `knowledge.download` | tRPC query | 获取下载 URL |

## 数据模型

### Document 表

```typescript
// packages/db/src/schema/knowledge.ts
document: {
  id: text primaryKey
  userId: text references user.id
  name: text
  size: text // "4.2 MB"
  mimeType: text
  status: text // 'uploading' | 'processing' | 'ready' | 'error'
  chunkCount: integer
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Document Chunk 表（向量数据）

```typescript
documentChunk: {
  id: text primaryKey
  documentId: text references document.id
  content: text // 分块文本
  chunkIndex: integer
  embedding: text // JSON array of numbers (简化版)
  createdAt: timestamp
}
```

### 索引

```typescript
index("document_userId_idx").on(document.userId)
index("documentChunk_documentId_idx").on(documentChunk.documentId)
```

## 安全考虑

- 文件类型白名单校验
- 文件大小限制（最大 50MB）
- 用户只能操作自己的文档
- 上传路径按 userId 隔离

## 技术决策

| 决策           | 选项                      | 理由                           |
| -------------- | ------------------------- | ------------------------------ |
| 文件存储       | 本地文件系统              | 简单实现，可后续迁移到 S3      |
| 向量生成       | 简化 hash（生产用 embedding API） | 脚手架阶段简化       |
| 文本提取       | 原生读取 + PDF.js         | 支持主要格式                   |
| 分块策略       | 固定 512 tokens           | 简单可控                       |