最后是项目的配置文件，确保代码可以正常运行。

<code_start project_name=GitHub数据提交系统 filename=README.md title=项目说明文档 entrypoint=false runnable=false project_final_file=true>
# GitHub数据提交系统

一个美观、响应式的Web应用，允许用户通过简单的表单提交数据，并自动将数据保存到指定的GitHub仓库中。

## 功能特点

- 🎨 **现代化UI设计** - 采用渐变背景、圆角卡片和流畅动画
- 📱 **完全响应式** - 适配各种屏幕尺寸
- 💾 **双重存储** - 同时保存到GitHub和本地存储
- 📊 **实时统计** - 显示今日提交数和总提交数
- ⏰ **历史记录** - 完整的提交历史表格展示
- 🔒 **数据验证** - 实时验证电话号码格式
- ⚡ **快速响应** - 优化的用户体验和错误处理

## 部署说明

### 1. 配置GitHub信息

在 `script.js` 文件中修改以下配置信息：

```javascript
const GITHUB_CONFIG = {
    token: 'ghp_your_actual_token_here',  // 替换为您的GitHub个人访问令牌
    owner: 'your_username',                 // 替换为您的GitHub用户名
    repo: 'your_repo_name',                  // 替换为您的仓库名称
    filePath: 'data/submissions.json'        // 数据存储路径
};
```

### 2. 获取GitHub个人访问令牌

1. 登录GitHub，进入 Settings → Developer settings → Personal access tokens
2. 点击 Generate new token
3. 选择 repo 权限
4. 复制生成的token并替换配置文件中的值

### 3. 准备GitHub仓库

1. 创建一个新的GitHub仓库
2. 确保仓库是公开的（或token有私有仓库权限）

### 4. 部署到GitHub Pages

1. 将代码上传到GitHub仓库
2. 进入仓库 Settings → Pages
3. 选择 Source 为 GitHub Actions
4. 系统将自动部署到 `https://your_username.github.io/your_repo_name`

## 文件结构

```
├── index.html          # 主页面
├── script.js           # 核心逻辑
└── README.md          # 说明文档
```

## 使用说明

1. 用户在表单中输入姓名和电话号码
2. 系统实时验证输入格式
3. 点击提交后，数据将：
   - 保存到GitHub仓库的指定JSON文件中
   - 存储到浏览器本地存储
   - 更新实时统计信息
4. 用户可在历史记录中查看所有提交

## 技术栈

- HTML5 + CSS3 + JavaScript (ES6+)
- TailwindCSS (CDN)
- Font Awesome图标库
- GitHub REST API

## 安全提示

- 不要在公开仓库中硬编码GitHub token
- 建议使用环境变量或服务器端代理处理敏感信息
- 生产环境应考虑添加CSRF保护

## 浏览器支持

支持所有现代浏览器：
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 许可证

MIT License
<code_end>
