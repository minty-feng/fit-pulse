// src/features/blog/api/types.ts
export interface BlogPost {
    id: string
    title: string
    content: string
    author_id: string
    created_at: string
    updated_at?: string
    views?: number
    cover_image?: string
    summary?: string  // 客户端生成的字段
  }