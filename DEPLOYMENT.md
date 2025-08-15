# 部署指南

这个端到端加密聊天室可以部署在多个平台上。以下是详细的部署步骤。

## 📁 项目结构

```
e2ee-chat/
├── server.js          # 服务端代码
├── package.json       # 依赖和脚本
├── vercel.json       # Vercel 配置
├── railway.toml      # Railway 配置
├── .gitignore        # Git 忽略文件
└── public/
    └── index.html    # 前端页面
```

## 🚀 Vercel 部署

### 方法一：通过 GitHub（推荐）

1. **准备 Git 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/e2ee-chat.git
   git push -u origin main
   ```

2. **在 Vercel 部署**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 连接 GitHub 并选择你的仓库
   - Vercel 会自动检测到 `vercel.json` 配置
   - 点击 "Deploy"

### 方法二：通过 Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录并部署**
   ```bash
   vercel login
   vercel --prod
   ```

### Vercel 配置说明

- `vercel.json` 已配置好 Node.js 环境
- 自动处理 Socket.IO 的 WebSocket 连接
- 支持自定义域名和 HTTPS

## 🚄 Railway 部署

### 方法一：通过 GitHub（推荐）

1. **准备 Git 仓库**（如上）

2. **在 Railway 部署**
   - 访问 [railway.app](https://railway.app)
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 连接 GitHub 并选择你的仓库
   - Railway 会自动检测到 `railway.toml` 配置
   - 点击 "Deploy"

### 方法二：通过 Railway CLI

1. **安装 Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **登录并部署**
   ```bash
   railway login
   railway init
   railway up
   ```

### Railway 配置说明

- `railway.toml` 已配置好启动命令
- 自动分配域名和端口
- 支持环境变量和数据持久化

## 🔧 环境变量

两个平台都支持以下环境变量（可选）：

- `PORT`: 服务器端口（平台自动设置）
- `NODE_ENV`: 运行环境（建议设为 production）

## 📝 部署后验证

1. **访问部署的 URL**
2. **测试功能**：
   - 创建房间
   - 加入房间
   - 发送消息
   - 检查端到端加密是否正常工作

## 🌐 自定义域名

### Vercel
- 在项目设置中添加自定义域名
- 配置 DNS 记录指向 Vercel

### Railway
- 在项目设置中添加自定义域名
- 配置 DNS 记录指向 Railway

## 🔒 HTTPS 支持

两个平台都自动提供 HTTPS：
- Vercel: 自动 SSL 证书
- Railway: 自动 SSL 证书

这对于 Web Crypto API 是必需的。

## 📊 监控和日志

### Vercel
- 在控制台查看函数日志
- 使用 Vercel Analytics（可选）

### Railway
- 在控制台查看应用日志
- 内置监控面板

## 🚨 注意事项

1. **数据持久化**: `data.json` 文件在重启后可能丢失，建议使用数据库
2. **WebSocket 支持**: 两个平台都支持 Socket.IO 的 WebSocket 连接
3. **冷启动**: 免费计划可能有冷启动延迟
4. **内存限制**: 注意平台的内存限制

## 🛠 故障排除

### 常见问题

1. **Socket.IO 连接失败**
   - 确保 HTTPS 启用
   - 检查 CORS 配置

2. **部署失败**
   - 检查 Node.js 版本 (>=18.0.0)
   - 确认所有依赖已安装

3. **加密功能异常**
   - 确保使用 HTTPS
   - 检查浏览器对 Web Crypto API 的支持

### 日志调试

```bash
# Vercel
vercel logs

# Railway
railway logs
```

## 🎉 完成！

部署成功后，你就有了一个完全功能的端到端加密聊天室！

- **Vercel**: 适合静态站点和无服务器函数
- **Railway**: 适合长期运行的应用程序

选择最适合你需求的平台即可。
