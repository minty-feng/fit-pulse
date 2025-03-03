
# 体重管理全栈项目文档

## 一、技术栈
- **前端**: React + Ant Design (service.ts 实现)
- **后端**: Django + DRF (Django REST Framework)
- **数据库**: SQLite (开发)/PostgreSQL (生产)

## 二、后端项目搭建

### 1. 项目初始化
```bash
# 创建项目目录
django-admin startproject config .
django-admin startapp weight

# 安装依赖
echo "django==4.2.7
djangorestframework==3.14.0
django-cors-headers==4.3.0" > requirements.txt
pip install -r requirements.txt
```

### 2. 目录结构
```bash
weight_manager/
├── config/                 # 项目配置
│   ├── settings.py        # 核心配置
│   └── urls.py            # 主路由
├── weight/                # 应用模块
│   ├── models.py          # 数据模型
│   ├── views.py           # 业务逻辑
│   ├── serializers.py     # 数据序列化
│   └── urls.py            # 应用路由
├── manage.py              # 项目管理
└── db.sqlite3             # 数据库文件
```

### 3. 核心配置文件

**config/settings.py**
```python
# 基础配置
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# 应用注册
INSTALLED_APPS = [
    'rest_framework',
    'corsheaders',
    'weight.apps.WeightConfig'
]

# 中间件
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ...其他中间件
]

# 跨域配置
CORS_ALLOW_ALL_ORIGINS = True  # 开发环境临时设置

# 国际化
LANGUAGE_CODE = 'zh-hans'
TIME_ZONE = 'Asia/Shanghai'
USE_TZ = False
```

## 三、业务逻辑实现

### 1. 数据模型 (weight/models.py)
```python
from django.db import models

class WeightRecord(models.Model):
    date = models.DateField(verbose_name="记录日期")
    weight = models.DecimalField(max_digits=5, decimal_places=1, verbose_name="体重")
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        verbose_name = "体重记录"
```

### 2. 序列化器 (weight/serializers.py)
```python
from rest_framework import serializers
from .models import WeightRecord

class WeightRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightRecord
        fields = '__all__'
        read_only_fields = ['submitted_at', 'updated_at']

    def validate_weight(self, value):
        return round(float(value), 1)  # 强制保留1位小数
```

### 3. 视图逻辑 (weight/views.py)
```python
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import WeightRecord
from .serializers import WeightRecordSerializer
from django.core.paginator import Paginator

class WeightRecordsView(APIView):
    """记录分页查询"""
    def get(self, request):
        page = int(request.query_params.get('page', 1))
        size = int(request.query_params.get('size', 10))
        
        records = WeightRecord.objects.all()
        paginator = Paginator(records, size)
        page_obj = paginator.get_page(page)
        
        serializer = WeightRecordSerializer(page_obj, many=True)
        return Response({
            "code": 0,
            "data": {
                "list": serializer.data,
                "total": paginator.count
            }
        })

class CreateUpdateDeleteView(APIView):
    """增删改统一入口"""
    def post(self, request, action):
        # 创建记录
        if action == 'create':
            serializer = WeightRecordSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({"code": 0, "data": serializer.data})
            return Response({"code": 1, "msg": serializer.errors}, status=400)
            
        # 更新记录    
        elif action == 'update':
            record_id = request.data.get('update_id')
            new_weight = request.data.get('new_weight')
            try:
                record = WeightRecord.objects.get(id=record_id)
                record.weight = round(float(new_weight), 1)
                record.save()
                return Response({"code": 0})
            except (WeightRecord.DoesNotExist, ValueError):
                return Response({"code": 1, "msg": "记录不存在或参数错误"}, status=400)
            
        # 删除记录    
        elif action == 'delete':
            record_id = request.data.get('del_id')
            try:
                record = WeightRecord.objects.get(id=record_id)
                record.delete()
                return Response({"code": 0})
            except WeightRecord.DoesNotExist:
                return Response({"code": 1, "msg": "记录不存在"}, status=404)
```

### 4. 路由配置

**config/urls.py (主路由)**
```python
from django.urls import path, include

urlpatterns = [
    path('api/', include('weight.urls')),
]
```

**weight/urls.py (应用路由)**
```python
from django.urls import path
from . import views

urlpatterns = [
    path('weight/records', views.WeightRecordsView.as_view()),
    path('weight/create', views.CreateUpdateDeleteView.as_view(), {'action': 'create'}),
    path('weight/update', views.CreateUpdateDeleteView.as_view(), {'action': 'update'}),
    path('weight/delete', views.CreateUpdateDeleteView.as_view(), {'action': 'delete'}),
]
```

## 四、数据库操作
```bash
# 生成迁移文件
python manage.py makemigrations

# 执行迁移
python manage.py migrate

# 创建管理员（可选）
python manage.py createsuperuser
```

## 五、接口测试

### 1. 启动服务
```bash
python manage.py runserver
```

### 2. 接口验证
```bash
# 创建记录
curl -X POST http://localhost:8000/api/weight/create \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-05-20", "weight": 65.5}'

# 分页查询
curl "http://localhost:8000/api/weight/records?page=1&size=10"

# 更新记录（替换:record_id）
curl -X POST http://localhost:8000/api/weight/update \
  -H "Content-Type: application/json" \
  -d '{"update_id": 1, "new_weight": 66.0}'

# 删除记录（替换:record_id）
curl -X POST http://localhost:8000/api/weight/delete \
  -H "Content-Type: application/json" \
  -d '{"del_id": 1}'
```

### 3. 响应格式示例
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 1,
        "date": "2024-05-20",
        "weight": "66.0",
        "submitted_at": "2024-05-20T08:00:00Z",
        "updated_at": "2024-05-20T08:30:00Z"
      }
    ],
    "total": 1
  }
}
```

## 六、前后端对接

### 1. 字段对应关系
| 前端字段 | 后端字段    | 说明                |
|----------|------------|--------------------|
| id       | id         | 记录唯一标识         |
| date     | date       | 日期(YYYY-MM-DD)   |
| weight   | weight     | 体重(保留1位小数)   |
| del_id   | del_id     | 删除操作ID参数       |
| update_id| update_id  | 更新操作ID参数       |

### 2. 错误处理规范
```python
# 成功响应
{"code": 0, "data": ...}

# 业务错误
{
  "code": 1, 
  "msg": "错误描述"
}

# HTTP状态码
400 - 参数错误
404 - 资源不存在
500 - 服务器内部错误
```

## 七、生产部署建议

1. **数据库升级**
```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'mydatabase',
        'USER': 'mydbuser',
        'PASSWORD': 'mypassword',
        'HOST': 'db.example.com',
        'PORT': '5432',
    }
}
```

2. **安全配置**
```python
# 关闭调试模式
DEBUG = False

# 设置允许的域名
ALLOWED_HOSTS = ['your-domain.com']

# 配置CSRF信任源
CSRF_TRUSTED_ORIGINS = ['https://your-domain.com']

# 严格的CORS策略
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
]
```

3. **性能优化**
- 添加缓存机制
- 启用Gzip压缩
- 配置数据库连接池
- 实现异步任务处理

## 八、常见问题排查

### 1. 跨域问题
**现象**：前端请求被浏览器拦截  
**解决**：
- 确认已添加 `corsheaders` 到中间件
- 检查 `CORS_ALLOW_ALL_ORIGINS` 或 `CORS_ALLOWED_ORIGINS` 配置
- 确保响应头包含 `Access-Control-Allow-Origin`

### 2. 小数精度丢失
**现象**：体重值显示异常  
**解决**：
- 验证序列化器的 `validate_weight` 方法
- 确保数据库字段类型为 `DecimalField`
- 前端提交前使用 `toFixed(1)` 处理

### 3. 分页参数失效
**现象**：返回所有记录  
**解决**：
- 检查请求URL是否包含 `page` 和 `size` 参数
- 验证视图中的 `paginator` 实现
- 确认数据库中有足够多的测试数据

---

本文档涵盖了从项目初始化到生产部署的完整流程，配合前端 service.ts 可实现体重管理系统的全功能开发。建议结合官方文档进行扩展开发，并建立完善的单元测试体系保证代码质量。