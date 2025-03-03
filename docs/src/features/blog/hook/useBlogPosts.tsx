// src/features/blog/hooks/useBlogPosts.ts
import useSWR from 'swr'
import { BlogPost } from '../api/types'

type UseBlogPostsOptions = {
  limit?: number
  offset?: number
  orderBy?: 'created_at' | 'views'
  ascending?: boolean
}

export const useBlogPosts = (options: UseBlogPostsOptions = {}) => {
  const { limit = 6, offset = 0, orderBy = 'created_at', ascending = false } = options

  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
    order_by: orderBy,
    ascending: ascending.toString()
  })

  const { data, error, mutate, isValidating } = useSWR<BlogPost[]>(
    `/api/blog?${params}`,
    async (url) => {
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch blog posts')
      const rawData = await res.json()
      
      return rawData.map((post: any) => ({
        ...post,
        // 转换 Supabase 时间格式
        created_at: new Date(post.created_at).toISOString(),
        // 生成摘要
        summary: post.content.substring(0, 100).replace(/#{1,6}\s?/g, '') + '...'
      }))
    },
    {
      revalidateOnFocus: false,
      errorRetryCount: 2
    }
  )

  return {
    posts: data || [],
    isLoading: !error && !data,
    isError: error,
    isValidating,
    mutate
  }
}