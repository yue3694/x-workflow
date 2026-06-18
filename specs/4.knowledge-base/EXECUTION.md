# Knowledge Base — 执行计划

## 目标描述

实现知识库文档管理功能，支持文件上传、搜索过滤、RAG 向量化（简化版）。用户可以上传文档，系统自动进行文本提取和向量化处理。

## 原子任务列表

### 阶段 1: 数据库 Schema (T-001 ~ T-003)

- [ ] **T-001**: 创建 `packages/db/src/schema/knowledge.ts`
  - 定义 `document` 表：id, userId, name, size, mimeType, status, chunkCount, createdAt, updatedAt
  - 定义 `documentChunk` 表：id, documentId, content, chunkIndex, embedding, createdAt
  - 添加索引：document_userId_idx, documentChunk_documentId_idx
  - 文件路径: `packages/db/src/schema/knowledge.ts`

- [ ] **T-002**: 在 `packages/db/src/schema/index.ts` 导出 knowledge schema
  - 文件路径: `packages/db/src/schema/index.ts`

- [ ] **T-003**: 运行 `pnpm db:push` 推送 schema 到数据库
  - 验证表创建成功

### 阶段 2: tRPC API (T-004 ~ T-006)

- [ ] **T-004**: 创建 `packages/api/src/routers/knowledge.ts`
  - 实现 `knowledge.list` - 获取用户文档列表
  - 使用 `protectedProcedure`
  - 返回字段：id, name, size, mimeType, status, chunkCount, createdAt
  - 文件路径: `packages/api/src/routers/knowledge.ts`

- [ ] **T-005**: 实现 `knowledge.upload` procedure
  - 接收 multipart/form-data
  - 白名单校验：application/pdf, text/plain, text/csv, application/epub+zip
  - 文件大小校验：最大 50MB
  - 保存到 `{uploadsDir}/{userId}/{documentId}/{filename}`
  - 创建 document 记录
  - 调用 RAG pipeline 进行文本提取和向量化
  - 文件路径: `packages/api/src/routers/knowledge.ts`

- [ ] **T-006**: 实现 `knowledge.delete` procedure
  - 删除文件物理文件
  - 删除 document_chunk 记录
  - 删除 document 记录
  - 文件路径: `packages/api/src/routers/knowledge.ts`

- [ ] **T-007**: 在 `packages/api/src/routers/index.ts` 注册 knowledge router
  - 文件路径: `packages/api/src/routers/index.ts`

- [ ] **T-008**: 创建 `packages/api/src/utils/rag.ts`
  - 文本提取：PDF (基础解析), TXT, CSV
  - 文本分块：固定 512 字符
  - 向量生成：简化版 hash（存储 content hash）
  - 文件路径: `packages/api/src/utils/rag.ts`

### 阶段 3: 前端页面 (T-009 ~ T-016)

- [ ] **T-009**: 创建 `apps/web/src/app/knowledge/page.tsx`
  - 页面路由：/knowledge
  - 使用 shadcn/ui Card 组件
  - 文件路径: `apps/web/src/app/knowledge/page.tsx`

- [ ] **T-010**: 创建 `apps/web/src/components/knowledge/knowledge-base-view.tsx`
  - 整合文档表格、搜索过滤、拖拽上传
  - 文件路径: `apps/web/src/components/knowledge/knowledge-base-view.tsx`

- [ ] **T-011**: 创建 `apps/web/src/components/knowledge/document-table.tsx`
  - 表格展示：名称、类型、大小、状态、块数、上传时间
  - 支持按名称和类型过滤
  - 文件路径: `apps/web/src/components/knowledge/document-table.tsx`

- [ ] **T-012**: 创建 `apps/web/src/components/knowledge/drag-drop-upload.tsx`
  - 拖拽上传区域
  - 文件类型和大小校验 UI
  - 文件路径: `apps/web/src/components/knowledge/drag-drop-upload.tsx`

- [ ] **T-013**: 创建 `apps/web/src/components/knowledge/rag-config-panel.tsx`
  - 显示 RAG 参数：向量模型、分块大小
  - 文件路径: `apps/web/src/components/knowledge/rag-config-panel.tsx`

### 阶段 4: 类型安全和验证

- [ ] **T-014**: 运行 `pnpm check-types` 验证类型正确性

- [ ] **T-015**: 手动测试验证
  - 启动 `pnpm dev`
  - 测试上传、列表、删除功能

## 技术方案

### 数据模型
```
document {
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

documentChunk {
  id: text primaryKey
  documentId: text references document.id
  content: text
  chunkIndex: integer
  embedding: text // JSON array (简化版存储)
  createdAt: timestamp
}
```

### API 设计
| 接口 | 类型 | 说明 |
|------|------|------|
| knowledge.list | query | 获取用户文档列表 |
| knowledge.upload | mutation | 上传文档 (multipart) |
| knowledge.delete | mutation | 删除文档及向量 |

### 文件存储
- 路径：`{uploadsDir}/{userId}/{documentId}/{filename}`
- uploadsDir 通过环境变量配置

## 安全影响评估

| 安全点 | 评估 | 措施 |
|--------|------|------|
| 文件类型 | 中风险 | 白名单 MIME type 校验 |
| 文件大小 | 中风险 | 50MB 限制校验 |
| 用户隔离 | 高风险 | userId 路由隔离，只能操作自己的文档 |
| 输入校验 | 高风险 | zod schema 校验所有输入 |

## 潜在风险

1. **PDF 解析复杂性**：简化版 PDF 解析可能无法处理所有 PDF 格式
   - 缓解：显示 error 状态，用户可重试或使用 TXT 格式

2. **大文件上传超时**：50MB 文件上传可能超时
   - 缓解：后端无超时配置，前端显示 loading 状态

3. **向量存储**：简化版使用 hash 代替真实 embedding
   - 缓解：设计可扩展，后续可接入真实 embedding API

## 依赖关系

- T-004 ~ T-008 依赖 T-001 ~ T-003 (Schema 完成)
- T-009 ~ T-013 依赖 T-004 ~ T-006 (API 完成)
- T-014 依赖所有代码完成