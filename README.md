
### **完整全栈方案：React + Next.js + Netlify + RESTful API + Supabase**



#### **一、架构设计**
1. **前端**：
   - **框架**: Next.js (支持 SSG/SSR)
   - **状态管理**: React Context + SWR（数据缓存）
   - **UI 库**: 可选 MUI 或 Tailwind CSS
2. **后端**：
   - **API**: Netlify Functions（Node.js）
   - **数据库**: Supabase PostgreSQL
   - **认证**: Supabase Auth（JWT）
3. **部署**：
   - **托管**: Netlify（自动部署、全球 CDN）
   - **Serverless 函数**: Netlify Functions
4. **核心原则**：
   - **高可复用性**：通过环境变量和抽象层解耦前后端
   - **严格 RESTful 规范**：资源命名、HTTP 方法、状态码
   - **安全性**：CSRF Token、速率限制、行级权限控制（RLS）

---

#### **一、项目初始化**

##### 1. 创建 Next.js 项目
```bash
npx create-next-app@latest fit-pulse --typescript
cd fit-pulse
```

##### 2. 安装核心依赖
```bash
npm install @supabase/supabase-js swr @heroicons/react react-chartjs-2 chart.js
npm install -D @types/node @netlify/plugin-nextjs
```

##### 3. 初始化项目结构
```bash
mkdir -p \
  src/{components,features/{auth,weights,blog},lib/{api,config,supabase}} \
  netlify/{functions,_middlewares} \
  supabase/migrations
```

---

#### **、Supabase 配置**

#### 1. 创建 Supabase 项目
1. 访问 [supabase.com](https://supabase.com) 并注册
2. 创建新项目 `fit-pulse-prod`
3. 获取 API 信息：
   ```bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_KEY=your-anon-key
   ```

#### 2. 初始化客户端
```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
)
```

---



### **二、项目结构**
```bash
├── src/
│   ├── components/           # 可复用组件
│   ├── features/              # 业务模块
│   │   ├── auth/              # 认证相关
│   │   ├── weights/           # 体重管理
│   │   └── blog/              # 博客系统
│   ├── lib/
│   │   ├── api/               # API 客户端
│   │   ├── config/            # 环境配置
│   │   └── supabase/          # Supabase 初始化
│   ├── pages/
│   │   ├── api/               # Next.js API Routes（可选）
│   │   ├── dashboard.tsx      # 用户仪表盘
│   │   └── blog/[slug].tsx    # 博客详情页
├── netlify/
│   └── functions/            # Netlify Functions
├── supabase/
│   └── migrations/           # 数据库迁移脚本
├── public/                    # 静态资源
├── .env.local                # 环境变量
└── netlify.toml              # Netlify 配置
```

---

### **三、核心功能实现**

#### **1. 认证系统**
```typescript
// features/auth/hooks/useAuth.ts
import { supabase } from "@/lib/supabase";

export const useAuth = () => {
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { signIn, signOut };
};
```

#### **2. 体重管理**
```typescript
// features/weights/api/weightsApi.ts
export const fetchWeights = async (userId: string) => {
  const { data, error } = await supabase
    .from("weights")
    .select("*")
    .eq("user_id", userId)
    .order("record_date", { ascending: false });

  return { data, error };
};
```

#### **3. 博客系统**
```typescript
// features/blog/api/blogApi.ts
export const fetchBlogPosts = async () => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, title, created_at");

  return { data, error };
};
```

---

### **四、数据库设计（Supabase）**
```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 体重记录表（RLS 已启用）
CREATE TABLE weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL CHECK (weight > 0),
  record_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 博客表
CREATE TABLE blog_posts (
  slug VARCHAR(50) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### **五、RESTful API 规范**
#### **1. 认证接口**
```http
POST /api/auth/login
Content-Type: application/json
{ "email": "user@example.com", "password": "securepassword" }
```

#### **2. 体重接口**
```http
GET /api/weights
Authorization: Bearer <JWT>

PUT /api/weights/:id
Content-Type: application/json
{ "weight": 68.5, "record_date": "2023-10-05" }
```

#### **3. 博客接口**
```http
GET /api/blog
Accept: application/json

GET /api/blog/:slug
```

---

### **六、可复用性设计**
#### **1. 环境变量配置**
```typescript
// lib/config/env.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
```

#### **2. 抽象 API 客户端**
```typescript
// lib/api/client.ts
import axios from "axios";
import { API_BASE } from "@/lib/config/env";

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("sb-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;
```

#### **3. 服务工厂模式**
```typescript
// lib/services/ServiceFactory.ts
interface DataService {
  fetchWeights(): Promise<Weight[]>;
  // 其他方法...
}

export class SupabaseService implements DataService {
  async fetchWeights() {
    return supabase.from("weights").select("*");
  }
}

export class CustomAPIService implements DataService {
  async fetchWeights() {
    return axios.get("/api/weights");
  }
}

// 根据环境变量切换实现
export const getDataService = () => {
  return process.env.USE_CUSTOM_API 
    ? new CustomAPIService() 
    : new SupabaseService();
};
```

---

### **七、部署配置**
#### **1. Netlify 配置**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "out"
  functions = "netlify/function### **Fit-Pulse 全栈项目方案**


#### **0、架构设计**
1. **前端**：
   - **框架**: Next.js (支持 SSG/SSR)
   - **状态管理**: React Context + SWR（数据缓存）
   - **UI 库**: 可选 MUI 或 Tailwind CSS
2. **后端**：
   - **API**: Netlify Functions（Node.js）
   - **数据库**: Supabase PostgreSQL
   - **认证**: Supabase Auth（JWT）
3. **部署**：
   - **托管**: Netlify（自动部署、全球 CDN）
   - **Serverless 函数**: Netlify Functions
4. **核心原则**：
   - **高可复用性**：通过环境变量和抽象层解耦前后端
   - **严格 RESTful 规范**：资源命名、HTTP 方法、状态码
   - **安全性**：CSRF Token、速率限制、行级权限控制（RLS）

---


#### **一、项目初始化**
```bash
# 创建 Next.js 项目
npx create-next-app@latest fit-pulse --typescript
cd fit-pulse

# 安装核心依赖
npm install @supabase/supabase-js swr @headlessui/react @heroicons/react zod
npm install -D @types/node @netlify/plugin-nextjs

# 创建基础目录
mkdir -p src/{components,features,lib/{api,config,supabase},pages}
mkdir -p netlify/functions supabase/migrations

# 初始化 Git
git init
echo ".env*" >> .gitignore
git add .
git commit -m "Initial project structure"
```



#### **二、项目目录结构（优化版）**
```bash
├── src/
│   ├── components/           # 通用组件
│   │   └── Layout/
│   │       ├── Layout.tsx
│   │       └── Navbar.tsx
│   ├── features/             # 业务功能模块
│   │   ├── auth/
│   │   │   ├── components/    # 登录/注册表单
│   │   │   ├── hooks/         # 认证钩子
│   │   │   └── schemas/       # Zod 验证模式
│   │   ├── weights/
│   │   │   ├── api/          # 体重数据接口
│   │   │   ├── components/   # 图表/表单
│   │   │   └── types/        # TypeScript 类型
│   │   └── blog/
│   │       ├── api/
│   │       └── components/
│   ├── lib/
│   │   ├── api/
│   │   │   └── client.ts     # 封装的 API 客户端
│   │   ├── config/
│   │   │   └── env.ts       # 环境变量配置
│   │   └── supabase/
│   │       └── client.ts    # Supabase 初始化
│   ├── pages/
│   │   ├── _app.tsx         # 全局样式/布局
│   │   ├── dashboard.tsx    # 主界面
│   │   └── blog/
│   │       └── [slug].tsx   # 动态博客页面
├── netlify/
│   ├── functions/           # Serverless 函数
│   │   └── weights.ts
│   └── _middlewares/        # 全局中间件
├── supabase/
│   └── migrations/          # 数据库迁移文件
├── public/
│   └── assets/              # 静态资源
├── .env.local               # 本地环境变量
└── netlify.toml             # 部署配置
```





#### **三、核心模块实现**

**1. Supabase 配置**
```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
)
```

**2. 认证系统实现**
```tsx
// src/features/auth/hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => authListener?.subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  return { user, signIn, signOut: supabase.auth.signOut }
}
```

**3. 体重数据接口**
```typescript
// src/features/weights/api/weights.ts
import { supabase } from '@/lib/supabase'
import { WeightEntry } from '../types'

export const WeightService = {
  async getWeights(userId: string): Promise<WeightEntry[]> {
    const { data, error } = await supabase
      .from('weights')
      .select('*')
      .eq('user_id', userId)
      .order('record_date', { ascending: false })
    
    if (error) throw new Error(error.message)
    return data as WeightEntry[]
  },

  async addEntry(entry: Omit<WeightEntry, 'id'>) {
    const { data, error } = await supabase
      .from('weights')
      .insert([entry])
      .select()
    
    if (error) throw new Error(error.message)
    return data[0] as WeightEntry
  }
}
```
**4. 博客系统**
```typescript
// features/blog/api/blogApi.ts
export const fetchBlogPosts = async () => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, title, created_at");

  return { data, error };
};
```


#### **四、数据库迁移**
```bash
# 创建迁移文件
supabase migration new create_initial_tables

# 应用迁移
supabase migration up
```

**迁移文件示例** (supabase/migrations/20231005000000_create_initial_tables.sql)
```sql
-- 启用扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 体重表（启用RLS）
CREATE TABLE weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL CHECK (weight > 0),
  record_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 博客表
CREATE TABLE blog_posts (
  slug VARCHAR(50) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

-- 启用行级安全
ALTER TABLE weights ENABLE ROW LEVEL SECURITY;

-- 创建访问策略
CREATE POLICY "User access" ON weights
FOR ALL USING (auth.uid() = user_id);
```

#### **五、部署配置**
**1. Netlify 配置**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "out"
  functions = "netlify/functions"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[context.production.environment]
  NEXT_PUBLIC_SUPABASE_URL = "https://your-supabase-url.supabase.co"
  NEXT_PUBLIC_SUPABASE_KEY = "your-anon-key"
```

**2. 生产环境变量**
```bash
# Netlify 环境变量设置
NEXT_PUBLIC_API_BASE=/api
SUPABASE_SERVICE_KEY=your-service-key
```

#### **六、开发工作流**
**1. 本地开发**
```bash
npm run dev

# 启动 Supabase 本地环境
supabase start
```

**2. 测试API端点**
```bash
curl http://localhost:8888/.netlify/functions/weights \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**3. 生产构建检查**
```bash
npm run build && npm run start
```

#### **七、完整功能集成**
**1. 全局布局组件**
```tsx
// src/components/Layout/Layout.tsx
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function Layout({ children }) {
  const { user, signOut } = useAuth()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">FitPulse</h1>
            {user && (
              <button 
                onClick={signOut}
                className="px-4 py-2 text-sm bg-red-100 rounded-lg"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
```

**2. 仪表盘页面**
```tsx
// src/pages/dashboard.tsx
import Layout from '@/components/Layout'
import WeightChart from '@/features/weights/components/Chart'

export default function Dashboard() {
  return (
    <Layout>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">体重追踪</h2>
        <WeightChart />
      </div>
    </Layout>
  )
}
```

#### **八、质量保障**
**1. 添加单元测试**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**示例测试文件**
```typescript
// src/features/auth/tests/login.test.tsx
import { render, screen } from '@testing-library/react'
import LoginForm from '../components/LoginForm'

describe('Login Form', () => {
  it('should display email validation error', async () => {
    render(<LoginForm />)
    
    const emailInput = screen.getByPlaceholderText('Email')
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    
    expect(
      await screen.findByText('请输入有效的邮箱地址')
    ).toBeInTheDocument()
  })
})
```

**2. 添加类型定义**
```typescript
// src/features/weights/types/index.ts
export interface WeightEntry {
  id: string
  user_id: string
  weight: number
  record_date: string
  created_at?: string
}
```

---

### **关键设计原则实现**
1. **环境隔离**  
   ```typescript
   // src/lib/config/env.ts
   export const getConfig = () => ({
     supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
     apiBase: process.env.NEXT_PUBLIC_API_BASE || '/api'
   })
   ```

2. **服务抽象层**  
   ```typescript
   // src/lib/api/client.ts
   import axios from 'axios'
   import { getConfig } from '../config'

   const client = axios.create({
     baseURL: getConfig().apiBase,
     timeout: 10000
   })

   client.interceptors.request.use(config => {
     const token = localStorage.getItem('sb-token')
     if (token) config.headers.Authorization = `Bearer ${token}`
     return config
   })

   export const apiClient = client
   ```

3. **安全中间件**  
   ```typescript
   // netlify/functions/_middlewares/auth.ts
   import type { Handler } from '@netlify/functions'

   export const withAuth = (handler: Handler): Handler => async (event) => {
     const token = event.headers.authorization?.split(' ')[1]
     
     if (!token) {
       return { statusCode: 401, body: 'Unauthorized' }
     }

     // 验证 JWT 有效性
     const { data: user, error } = await supabase.auth.getUser(token)
     
     if (error || !user) {
       return { statusCode: 403, body: 'Invalid token' }
     }

     return handler({
       ...event,
       context: { ...event.context, user }
     })
   }
   ```

---

### **迁移到自定义后端**
1. **切换服务实现**
```typescript
// src/lib/services/DataService.ts
import { WeightEntry } from '@/features/weights/types'

export interface IDataService {
  getWeights: () => Promise<WeightEntry[]>
}

export class SupabaseService implements IDataService {
  async getWeights() {
    const { data } = await supabase.from('weights').select('*')
    return data as WeightEntry[]
  }
}

export class CustomAPIService implements IDataService {
  async getWeights() {
    const response = await apiClient.get('/weights')
    return response.data
  }
}
```

2. **环境变量控制**
```typescript
// src/lib/services/factory.ts
export const createDataService = (): IDataService => {
  return process.env.NEXT_PUBLIC_USE_CUSTOM_API === 'true'
    ? new CustomAPIService()
    : new SupabaseService()
}
```

---

该整合方案完整实现了以下特性：
1. **模块化架构**：业务功能隔离在 features 目录
2. **类型安全**：所有核心数据均有 TS 类型定义
3. **可扩展性**：通过服务抽象层实现后端切换
4. **生产就绪**：包含错误处理、安全中间件、测试配置
5. **完整工作流**：从本地开发到生产部署的全流程覆盖

开发过程中可以按照功能模块逐步实现，每个 feature 包含完整的组件、业务逻辑和数据访问层，确保代码组织清晰且易于维护。s"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[context.production.environment]
  SUPABASE_URL = "your-supabase-url"
  SUPABASE_KEY = "your-supabase-key"
```

#### **2. 本地开发**
```bash
# .env.local
NEXT_PUBLIC_API_BASE=http://localhost:8888/.netlify/functions
NEXT_PUBLIC_SUPABASE_URL=your-local-supabase-url
NEXT_PUBLIC_SUPABASE_KEY=your-local-supabase-key
```

---

### **八、迁移到自建服务**
1. **修改环境变量**：
   ```bash
   NEXT_PUBLIC_API_BASE=https://your-custom-api.com
   ```

2. **实现接口**：
   ```typescript
   // 自定义服务实现
   export class CustomAPIService implements DataService {
     async fetchWeights() {
       const response = await axios.get("/weights");
       return response.data;
     }
   }
   ```

3. **数据迁移**：
   ```bash
   pg_dump -h db.supabase.co -U postgres -d your-db -f backup.sql
   psql -h your-new-db.com -U postgres -d your-db < backup.sql
   ```

---

### **九、安全增强**
#### **1. 行级权限（RLS）**
```sql
-- 体重表权限策略
CREATE POLICY "用户只能访问自己的记录"
ON weights FOR ALL
USING (auth.uid() = user_id);
```

#### **2. CSRF 防护**
```typescript
// Netlify Function 中间件
const validateCSRFToken = (req: NowRequest) => {
  const token = req.headers["x-csrf-token"];
  return token === getTokenFromSession(req.cookies.session);
};
```

#### **3. 速率限制**
```typescript
// netlify/functions/utils/rateLimit.ts
import { RateLimiter } from "rate-limiter-flexible";

const limiter = new RateLimiter({
  points: 10, // 10 请求
  duration: 60, // 每分钟
});

export const applyRateLimit = async (key: string) => {
  try {
    await limiter.consume(key);
  } catch {
    throw new Error("Too many requests");
  }
};
```

---

### **十、完整功能验证清单**
1. **用户系统**：
   - [ ] 邮箱/密码注册登录
   - [ ] JWT 自动续期
   - [ ] 登出功能

2. **体重管理**：
   - [ ] 记录增删改查
   - [ ] 数据可视化图表
   - [ ] 日期范围过滤

3. **博客系统**：
   - [ ] Markdown 内容渲染
   - [ ] 文章分类标签
   - [ ] 评论功能

4. **运维监控**：
   - [ ] Sentry 错误追踪
   - [ ] 数据库备份脚本
   - [ ] 性能监控仪表盘

---

该方案通过以下设计确保高可复用性：
1. **环境驱动配置**：所有服务端点通过环境变量注入  
2. **抽象服务层**：业务组件不直接依赖具体实现  
3. **标准化接口**：严格遵循 OpenAPI 规范  
4. **模块化架构**：功能按领域划分，便于扩展  

开发者可根据需求自由切换 Supabase 或其他后端服务，前端无需修改业务逻辑代码。




=############
以下是创建 Fit-Pulse 项目的完整逐步指南，涵盖从零开始到生产部署的全过程：

---

### **一、项目初始化**

#### 1. 创建 Next.js 项目
```bash
npx create-next-app@latest fit-pulse --typescript
cd fit-pulse
```

#### 2. 安装核心依赖
```bash
npm install @supabase/supabase-js swr @heroicons/react react-chartjs-2 chart.js
npm install -D @types/node @netlify/plugin-nextjs
```

#### 3. 初始化项目结构
```bash
mkdir -p \
  src/{components,features/{auth,weights,blog},lib/{api,config,supabase}} \
  netlify/{functions,_middlewares} \
  supabase/migrations
```

---

### **二、Supabase 配置**

#### 1. 创建 Supabase 项目
1. 访问 [supabase.com](https://supabase.com) 并注册
2. 创建新项目 `fit-pulse-prod`
3. 获取 API 信息：
   ```bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_KEY=your-anon-key
   ```

#### 2. 初始化客户端
```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
)
```

---

### **三、体重监控模块**

#### 1. 数据库迁移
```bash
supabase migration new create_weights_table
```

```sql
-- supabase/migrations/20231006000000_create_weights_table.sql
CREATE TABLE weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  weight DECIMAL(5,2) CHECK (weight > 0),
  body_fat DECIMAL(4,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE weights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User access" ON weights FOR ALL USING (auth.uid() = user_id);
```

#### 2. API 实现
```typescript
// netlify/functions/weights.ts
import { Handler } from '@netlify/functions'
import { supabase } from '../../src/lib/supabase/client'

export const handler: Handler = async (event) => {
  const token = event.headers['authorization']?.split(' ')[1]
  const { data: user } = await supabase.auth.getUser(token || '')

  if (!user) {
    return { statusCode: 401, body: 'Unauthorized' }
  }

  switch (event.httpMethod) {
    case 'GET':
      const { data } = await supabase
        .from('weights')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
      
      return { statusCode: 200, body: JSON.stringify(data) }

    case 'POST':
      const body = JSON.parse(event.body || '{}')
      const { data: newRecord } = await supabase
        .from('weights')
        .insert([{ ...body, user_id: user.user.id }])
      
      return { statusCode: 201, body: JSON.stringify(newRecord) }

    default:
      return { statusCode: 405 }
  }
}
```

---

### **四、博客系统实现**

#### 1. 数据库表结构
```sql
-- supabase/migrations/20231006000001_create_blog_tables.sql
CREATE TABLE blog_posts (
  slug VARCHAR(100) PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users,
  tags VARCHAR(50)[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE POLICY "Public read" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "Author write" ON blog_posts FOR ALL USING (auth.uid() = author_id);
```

#### 2. 前端组件
```tsx
// src/features/blog/components/PostEditor.tsx
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function PostEditor() {
  const [form, setForm] = useState({
    slug: '',
    title: '',
    content: '',
    tags: []
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { data: user } = await supabase.auth.getUser()
    
    const { error } = await supabase
      .from('blog_posts')
      .insert([{ ...form, author_id: user?.id }])
    
    if (error) alert(error.message)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Slug"
        value={form.slug}
        onChange={e => setForm({...form, slug: e.target.value})}
      />
      {/* 其他表单字段 */}
      <button type="submit">发布文章</button>
    </form>
  )
}
```

---

### **五、系统监控集成**

#### 1. 错误监控 (Sentry)
```bash
npm install @sentry/nextjs
```

```javascript
// sentry.config.js
const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig({
  sentry: {
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
  },
})
```

#### 2. 性能监控
```tsx
// src/lib/monitoring/perf.ts
export const trackPerf = (metricName: string, duration: number) => {
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/monitor/perf', {
      method: 'POST',
      body: JSON.stringify({ metricName, duration })
    })
  }
}

// 在关键组件中使用
useEffect(() => {
  const start = performance.now()
  // 组件加载逻辑...
  const end = performance.now()
  trackPerf('ComponentLoadTime', end - start)
}, [])
```

---

### **六、部署到 Netlify**

#### 1. 配置部署文件
```toml
# netlify.toml
[build]
  command = "npm run build && npm run export"
  publish = "out"
  functions = "netlify/functions"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[context.production.environment]
  SUPABASE_URL = "your-supabase-url"
  SUPABASE_KEY = "your-supabase-key"
  SENTRY_DSN = "your-sentry-dsn"
```

#### 2. 部署步骤
1. 将代码推送到 GitHub 仓库
2. 登录 [Netlify](https://app.netlify.com) 
3. 选择 "Import from Git" → 选择仓库
4. 配置环境变量：
   ```bash
   SUPABASE_URL=your-project-url
   SUPABASE_KEY=your-anon-key
   SENTRY_DSN=your-dsn
   ```
5. 触发首次部署

---

### **七、开发工作流程**

#### 1. 本地开发
```bash
# 启动开发服务器
npm run dev

# 启动 Supabase 本地环境
supabase start

# 运行数据库迁移
supabase migration up
```

#### 2. 测试 API 端点
```bash
curl http://localhost:8888/.netlify/functions/weights \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

#### 3. 生产环境检查
```bash
npm run build && npm run start
```

---

### **八、维护与更新**

#### 1. 数据库备份
```bash
pg_dump -h db.supabase.co -U postgres -d your-db | gzip > backup_$(date +%F).sql.gz
```

#### 2. 监控面板访问
1. 访问 `https://your-netlify-url.com/_monitoring`
2. 查看：
   - 实时错误日志
   - API 响应时间
   - 用户活跃度统计

---

通过以上步骤，您将获得一个包含完整功能的生产级应用。该方案具有以下特点：

1. **模块化架构**：功能模块独立开发维护
2. **类型安全**：全栈 TypeScript 支持
3. **自动扩展**：基于 Netlify 的无服务器架构
4. **监控就绪**：开箱即用的运维监控系统
5. **安全加固**：JWT 验证 + 行级权限控制

建议开发顺序：
1. 完成认证系统 → 2. 实现体重模块 → 3. 开发博客系统 → 4. 集成监控功能 → 5. 部署优化