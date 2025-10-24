<code_start project_name=小凯工业设计官网 filename=README.md title=项目说明文档 entrypoint=false runnable=false project_final_file=true>
# 小凯工业设计有限公司官方网站

## 项目简介
这是一个响应式企业官网，展示小凯工业设计有限公司的专业服务、经验优势和联系方式。

## 功能特点
- 响应式设计，支持各种设备
- 现代化UI界面
- 平滑滚动导航
- 表单提交到GitHub仓库

## 技术栈
- HTML5 + CSS3 + JavaScript
- TailwindCSS框架
- Font Awesome图标库
- GitHub API集成

## 部署说明

### 1. 准备工作
- GitHub用户名
- GitHub个人访问令牌（需要repo权限）
- 私有仓库 `date`

### 2. 配置步骤

#### 第一步：更新GitHub配置信息
在 `index.html` 文件中找到以下代码并替换：
```javascript
// 在表单提交函数中替换
'https://api.github.com/repos/[您的用户名]/date/contents/'

// 在GitHub API调用中替换
'Authorization': 'Bearer [您的个人令牌]'
```

#### 第二步：创建GitHub仓库
1. 在GitHub上创建名为 `date` 的私有仓库
2. 生成个人访问令牌（需要repo权限）

#### 第三步：上传文件
将所有文件上传到GitHub仓库的根目录。

#### 第四步：访问网站
通过 `https://[您的用户名].github.io/date/` 访问网站。

## 表单提交配置
表单提交功能需要以下配置：

1. **GitHub用户名**：替换所有 `[您的用户名]` 占位符
2. **个人令牌**：替换所有 `[您的个人令牌]` 占位符
3. **仓库名称**：确保仓库名为 `date`

## 文件结构
```
├── index.html          # 主页面
├── github-submit.js    # GitHub API处理
├── style.css           # 样式文件
└── README.md           # 说明文档
```

## 注意事项
- 确保GitHub仓库为私有
- 个人令牌需要足够的权限
- 文件名会自动添加时间戳避免重复

## 技术支持
如有问题，请联系：18570081859
```

## 代码说明

我为您创建了一个完整的企业业务介绍网站，具有以下特点：

### 主要功能模块
1. **响应式导航栏** - 左侧显示手机号，中间为导航菜单，右侧为咨询按钮
2. **首页Hero区域** - 突出显示公司名称和10年经验优势
3. **关于我们** - 展示公司简介和专业团队
4. **服务项目** - 详细展示8大核心业务
5. **经验优势** - 强调10年专业经验
6. **立即咨询表单** - 支持提交到GitHub仓库

### 技术实现亮点
- 使用TailwindCSS实现现代化UI设计
- 响应式布局，支持各种屏幕尺寸
- 平滑滚动和动画效果提升用户体验
- 完整的GitHub API集成，实现表单数据自动保存

### 使用前配置
在使用前，您需要：
1. 将 `index.html` 和 `github-submit.js` 中的所有 `[您的用户名]` 替换为您的GitHub用户名
2. 将所有 `[您的个人令牌]` 替换为您的GitHub个人访问令牌
3. 确保您拥有名为 `date` 的私有仓库

网站设计美观大方，功能完整，能够很好地展示小凯工业设计有限公司的专业形象和服务能力