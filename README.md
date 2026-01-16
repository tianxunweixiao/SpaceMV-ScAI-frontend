# **SpaceMV-ScAI Frontend: 星座智能管理平台客户端**
<div align="center">

[![License](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/tianxunweixiao/SpaceMV-ScAI-Frontend)

[![Webpack](https://img.shields.io/badge/Build-Webpack-8DD6F9?logo=webpack&logoColor=black)](https://webpack.js.org/)
[![WebGL](https://img.shields.io/badge/Graphics-WebGL-990000?logo=webgl&logoColor=white)](https://www.khronos.org/webgl/)
[![Jest](https://img.shields.io/badge/Test-Jest-C21325?logo=jest&logoColor=white)](https://jestjs.io/)
[![Cypress](https://img.shields.io/badge/E2E-Cypress-17202C?logo=cypress&logoColor=white)](https://www.cypress.io/)

[**简体中文**](./README.md) | [**English**](./README_EN.md)
</div>

<img width="2564" height="1536" alt="Gemini_Generated_Image_7urlyp7urlyp7url" src="https://github.com/user-attachments/assets/b018204f-a95b-4f39-a104-1fda4432462f" />

[SpaceMV-ScAI](https://github.com/tianxunweixiao/SpaceMV-ScAI/tree/main)是由成都天巡微小卫星科技有限责任公司研发的一款星座智能管理平台，旨在解决当前商业航天领域星座规模急剧扩大带来的运控复杂性难题。

平台采用面向Agent的架构设计，当前开源版本聚焦于构建高精度的轨道仿真计算引擎与数据交互底座。目前已支持光学遥感卫星全天候、全地域的目标区域覆盖仿真与资源调度，为未来引入智能体进行自动化任务编排奠定了坚实的算力与数据基础。`SpaceMV-ScAI Frontend` 是`SpaceMV-ScAI`平台的前端应用，旨在为用户提供直观、高性能的卫星轨道可视化与交互体验。

本项目基于开源项目 [KeepTrack.Space](https://github.com/thkruz/keeptrack.space) 进行二次开发，在保留其强大的 WebGL 3D 渲染能力和高性能计算引擎的基础上，深度集成了 SpaceMV-ScAI Backend 后端服务和 ClickHouse 数据库，实现了完整的星座智能管理解决方案。

平台采用现代 Web 技术栈构建，基于 WebGL 实现高性能的 3D 渲染。核心应用仅 7MB，可在 2 秒内加载完成，为用户提供流畅的交互体验。

`SpaceMV-ScAI Frontend` 作为平台的核心用户界面组件，承载了数据可视化、用户交互、仿真结果展示及 API 接口调用等关键职能，与 `SpaceMV-ScAI Backend` 紧密协作，共同构建了完整的星座仿真与管理生态系统。

## **📖 目录**

* [核心模块](#-核心模块)
* [技术架构](#-技术架构)
* [功能特性](#-功能特性)
* [快速开始](#-快速开始)
* [使用说明](#-使用说明)
* [故障排除](#-故障排除)
* [贡献指南](#-贡献指南)
* [许可证](#-许可证)
* [联系方式](#-联系方式)
* [待办事项](#-待办事项)

## **🧩 核心模块**

SpaceMV-ScAI Frontend 采用插件化架构，由以下核心模块组成：

| 模块 | 目录 | 说明 |
| :---- | :---- | :---- |
| **单例管理器** | src/singletons/ | 核心管理类，包括相机控制、目录管理、时间管理、UI管理、WebGL渲染器等 |
| **插件系统** | src/plugins/ | 功能插件，包括卫星管理、传感器管理、分析工具等 |
| **绘制管理器** | src/singletons/draw-manager/ | 3D对象绘制，包括地球、卫星等 |
| **Web Workers** | src/webworker/ | 后台计算线程，负责卫星位置计算、轨道更新等密集型计算任务 |
| **静态工具** | src/static/ | 通用工具函数，包括目录加载、搜索、轨道计算、坐标转换等 |
| **认证服务** | src/auth/ | 用户认证服务，负责登录、登出和会话管理 |
| **目录数据** | src/catalogs/ | 静态目录数据，包括星座、国家等 |
| **设置管理** | src/settings/ | 应用设置管理，包括颜色方案、插件配置、预设等 |
| **国际化** | src/locales/ | 多语言支持，包括中文、英文、德文、法文、日文、韩文、俄文、乌克兰文等 |
| **工具库** | src/lib/ | 通用工具函数，包括动画效果、颜色处理、数据转换等 |

## **🏗 技术架构**

### **目录结构**

SpaceMV-ScAI Frontend/  
├── src/                      # 🎨 源代码目录  
│   ├── main.ts              # 应用入口文件  
│   ├── keeptrack.ts         # 核心应用逻辑  
│   ├── container.ts         # 容器管理  
│   ├── auth/                # 认证服务  
│   ├── catalogs/            # 静态目录数据（星座、国家等）  
│   ├── lib/                 # 工具库  
│   ├── locales/             # 多语言支持  
│   ├── plugins/             # 功能插件系统  
│   ├── settings/            # 设置管理  
│   ├── singletons/          # 单例管理器  
│   │   ├── draw-manager/    # 绘制管理器  
│   │   ├── color-schemes/   # 颜色方案  
│   │   └── catalog-manager/ # 目录管理器  
│   ├── static/              # 静态工具函数  
│   ├── types/               # TypeScript 类型定义  
│   └── webworker/           # Web Workers（后台计算线程）  
│  
├── build/                    # 🔨 构建脚本  
│   ├── build-manager.ts     # 构建管理器  
│   ├── webpack-manager.ts   # Webpack 配置  
│   ├── set-env.ts           # 环境配置  
│   └── lib/                 # 构建工具库  
│  
├── docs/                     # 📚 用户手册  
│   ├── images/              # 功能截图  
│   ├── source/              # 文档源文件  
│   ├── app_*.md             # 功能模块文档  
│   ├── base_*.md            # 基础功能文档  
│   └── appendix_*.md        # 附录文档  
│  
├── public/                   # 📁 静态资源  
│   ├── css/                 # 样式文件  
│   ├── img/                 # 图片资源  
│   ├── audio/               # 音效文件  
│   ├── data/                # 数据文件  
│   └── flags/               # 国旗图标  
│  
├── auth/                     # 🔐 认证相关  
│   └── callback.html        # 认证回调页面  
│  
├── package.json             # 项目配置与依赖  
├── tsconfig.json            # TypeScript 配置  
├── babel.config.cjs         # Babel 配置  
├── jest.config.js           # Jest 测试配置  
├── .env.example             # 环境配置示例文件  
└── .prettierrc              # Prettier 代码格式化配置

### **技术栈**

| 领域 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **开发语言** | **TypeScript** | 类型安全的 JavaScript 超集 |
| **构建工具** | **Rspack** | 高性能的模块打包工具 |
| | **Webpack** | 模块打包与构建（通过 webpack-manager.ts 配置） |
| | **Babel** | JavaScript/TypeScript 代码转换 |
| **图形渲染** | **WebGL** | 高性能 3D 图形渲染 |
| | **WebGL OBJ Loader** | 3D 模型加载器 |
| **UI 框架** | **Materialize CSS** | 响应式 UI 组件库 |
| | **Material Icons** | 图标库 |
| | **Flag Icons** | 国旗图标 |
| **数据可视化** | **ECharts** | 交互式图表绘制 |
| | **ECharts GL** | 3D 数据可视化 |
| **国际化** | **i18next** | 国际化框架 |
| | **i18next Browser Language Detector** | 浏览器语言检测 |
| **测试框架** | **Jest** | 单元测试框架 |
| | **Cypress** | 端到端测试框架 |
| | **Testing Library** | DOM 测试工具 |
| **代码质量** | **ESLint** | 代码检查工具 |
| | **Prettier** | 代码格式化工具 |
| | **Husky** | Git 钩子管理 |
| **工具组件** | **ootk** | 轨道计算工具库 |
| | **gl-matrix** | 矩阵运算库 |
| | **numeric** | 数值计算库 |
| | **file-saver** | 文件保存工具 |
| | **uuid** | UUID 生成器 |
| | **draggabilly** | 拖拽功能库 |
| **后端集成** | **FastAPI** | 与 SpaceMV-ScAI Backend 的 RESTful API 通信 |
| | **环境变量配置** | 通过 .env 文件配置后端服务地址 |
| **数据存储** | **ClickHouse** | 通过后端 API 访问的高性能时序数据库 |

### **系统集成架构**

SpaceMV-ScAI Frontend 与 SpaceMV-ScAI Backend 构成了完整的星座仿真与管理平台：

* **前端（SpaceMV-ScAI Frontend）**: 负责用户界面、数据可视化、交互控制和 3D 渲染
* **后端（SpaceMV-ScAI Backend）**: 提供 API 服务、仿真计算、数据处理和业务逻辑
* **数据库（ClickHouse）**: 存储卫星数据、仿真结果和用户信息

前端通过 RESTful API 与后端通信，后端负责与 ClickHouse 数据库交互，实现数据的持久化存储和高效查询。

### **数据流向**

graph TD  
    A[用户操作] -->|交互事件| B[插件系统]  
    B -->|调用管理器| C[单例管理器]  
    C -->|Fetch API| D[SpaceMV-ScAI Backend API]  
    D -->|返回数据| C  
    C -->|更新状态| E[Web Workers]  
    E -->|计算结果| F[绘制管理器]  
    F -->|渲染画面| G[WebGL Canvas]  
    C -->|更新UI| B

## **✨ 功能特性**

### **1. 插件化架构**

* 🔌 **插件系统**: 采用模块化插件架构，支持灵活的功能扩展
* 📦 **丰富插件**: 包含多个功能插件，涵盖卫星管理、传感器管理、分析工具等

### **2. 核心渲染引擎**

* 🌍 **3D 地球渲染**: 高精度的地球模型，支持纹理贴图、云层、光照效果
* 🛰️ **卫星可视化**: 实时渲染卫星位置、轨道轨迹及运动状态
* 🌌 **星空背景**: 动态星空背景，增强视觉沉浸感
* ⚡ **高性能渲染**: 支持同时渲染大量空间对象，保持流畅帧率

### **3. Web Workers 后台计算**

* 📊 **位置计算**: 实时计算卫星在轨道上的精确位置
* 🔄 **轨道更新**: 动态更新轨道轨迹，支持卫星机动模拟
* 💾 **数据管理**: 高效的卫星数据索引与查询机制
* 🧮 **轨道计算**: 使用 ootk 库进行精确的轨道力学计算

### **4. 用户交互功能**

* 🎯 **对象选择**: 点击选择卫星或其他空间目标
* 📈 **信息展示**: 显示选定对象的详细参数和状态信息
* 🎮 **交互控制**: 支持鼠标、键盘
* 🌐 **视图控制**: 缩放、旋转、平移等 3D 视图操作
* 🎨 **颜色方案**: 支持多种颜色方案

### **5. 数据可视化**

* 📊 **图表展示**: 使用 ECharts 展示轨道参数等数据
* 🗺️ **地图集成**: 支持瓦片地图和自定义地图服务
* 📦 **数据导出**: 支持导出仿真结果
* 📉 **分析图表**: 包括 ECF/ECI 坐标图等

### **6. 后端集成**

* 🔌 **API 通信**: 通过 Fetch API 与 SpaceMV-ScAI Backend 进行数据交互
* 🛰️ **卫星数据**: 从后端获取卫星 TLE 数据和详细信息
* 🌟 **星座管理**: 支持从后端获取和管理星座配置
* 👤 **用户认证**: 集成认证服务，支持用户登录和会话管理

### **7. 多语言支持**

* 🌍 **国际化**: 支持 8 种语言（中文、英文、德文、法文、日文、韩文、俄文、乌克兰文）
* 🔤 **自动检测**: 自动检测浏览器语言并切换
* 📝 **易于扩展**: 基于i18next框架，易于添加新语言

### **8. 高级功能**

* 📊 **分析工具**: 轨道分析、覆盖性分析、LLM对话
* 🎬 **屏幕录制**: 支持屏幕录制和视频导演模式
* � **截图功能**: 支持截图和图片管理
* 🔍 **搜索功能**: 强大的卫星和对象搜索功能

## **🚀 快速开始**

### **前置条件**

* **Docker** (用于部署 docsify 实现用户手册在线浏览) 
* **Node.js** (推荐 18.x 或更高版本)  
* **npm** 或 **pnpm** 包管理器  
* 现代浏览器（Chrome、Firefox、Edge 等）
* **SpaceMV-ScAI Backend** 后端服务（需要先启动后端服务）
* **ClickHouse** 数据库（由后端服务管理）

### **0. 启动后端服务**

在使用前端之前，需要先启动 SpaceMV-ScAI Backend 后端服务。请参考 [SpaceMV-ScAI Backend README](https://github.com/tianxunweixiao/SpaceMV-ScAI-backend/blob/main/README.md) 进行后端服务的安装和配置。

确保以下后端服务已启动：
* **账户管理服务**: http://localhost:5001
* **仿真服务**: http://localhost:8401
* **ClickHouse 数据库**: 端口 8123 (HTTP) / 9000 (Native)

### **1. 环境准备**

```bash
# 克隆仓库  
git clone https://github.com/tianxunweixiao/SpaceMV-ScAI-frontend.git   
cd SpaceMV-ScAI-frontend

# 安装依赖  
npm i
# 或使用 pnpm
pnpm install
```

### **2. 环境变量配置**

```bash
复制示例文件并修改配置：

cp .env.example .env

编辑 .env 文件，重点配置以下内容：

# API 配置  
API_BASE_URL=http://localhost:8401 # server_backend
API_ACCOUNT_URL=http://localhost:5001 # account_backend

# 在线用户手册
USER_MANUAL_URL=http://localhost:3000

```

### **3. 构建项目**

```bash
# docsify部署
cd docs
docker build -t docs .
docker run -d   --name my-docs \
-p 3000:3000 \
-v $(pwd):/docs \
docs

# 生产环境构建
npm run build

```

### **4. 启动服务**

```bash
# 启动本地开发服务器
npm start

# 服务将在 http://localhost:5544 启动
```

## **📚 使用说明**

### **核心架构**

主页面加载一个全屏的 Canvas 元素，用于显示地球、卫星和星空。UI 元素通过 DOM 层叠在 Canvas 之上。两个 Web Workers（positionCruncher.ts 和 orbitCruncher.ts）负责持续计算卫星位置和更新高亮对象的轨道线。

主渲染循环（drawManager.ts）经过优化以减少内存泄漏并保持高 FPS。这通常通过让函数修改全局变量而不是返回变量，以及使用长函数而不是拆分成多个函数来实现——这是有意为之的。

各个插件和功能模块的使用说明可以参考主页面右上角的在线用户手册。

<img width="2560" height="1440" alt="88ad034a54a84958b8c24d3b3144b7b8" src="https://github.com/user-attachments/assets/c269de40-e4e9-4e9a-a3ff-38130b60f2b6" />

### **数据源**

可参考 <https://api.keeptrack.space/v2/sats> 获取最新的卫星目录。

## **🔧 故障排除**

| 问题 | 可能原因及排查方法 |
| :---- | :---- |
| **构建失败** | 1. 检查 Node.js 版本是否符合要求。 2. 删除 node_modules 和 package-lock.json 后重新安装依赖。 3. 检查 TypeScript 配置是否正确。 |
| **渲染性能差** | 1. 检查浏览器是否支持 WebGL。 2. 减少同时渲染的对象数量。 3. 检查 Web Workers 是否正常工作。 |
| **API 调用失败** | 1. 检查 .env 配置中的 API 地址是否正确。 2. 确认后端服务是否正常运行。 3. 检查浏览器控制台的网络请求日志。 |
| **测试失败** | 1. 确保所有依赖已正确安装。 2. 检查测试环境配置。 3. 查看测试日志获取详细错误信息。 |

## **🤝 贡献指南**

我们非常欢迎社区开发者参与 SpaceMV-ScAI Frontend 的建设！如果您有任何改进建议或发现了 Bug，请遵循以下流程：

1. **Fork 本仓库**：点击右上角的 Fork 按钮将项目复制到您的 GitHub 账户。  
2. **创建分支**：从 main 分支切出一个新分支用于开发。  
   ```bash
   git checkout -b feature/AmazingFeature
   ```  
3. **提交更改**：确保代码风格统一，并撰写清晰的 Commit Message。  
   ```bash
   git commit -m 'feat: Add some AmazingFeature'
   ```  
4. **推送分支**：  
   ```bash
   git push origin feature/AmazingFeature
   ```  
5. **提交 Pull Request**：在 GitHub 上发起 PR，并详细描述您的更改内容。

**开发建议**：

* 遵循 TypeScript 严格模式，确保类型安全。  
* 添加新功能时，请编写相应的单元测试。  
* 修改渲染逻辑时，注意性能优化，避免内存泄漏。  
* 提交代码前运行 `npm run lint` 确保代码风格一致。

## **📄 许可证**

本项目采用 **GNU Affero General Public License v3.0** 许可证。

Copyright (c) 2025 成都天巡微小卫星科技有限公司

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

## **📮 联系方式**

如有任何问题、建议或商务合作需求，请联系项目维护团队。

* **Email**: code@spacemv.com  
* **Issues**: [GitHub Issues](https://github.com/tianxunweixiao/SpaceMV-ScAI-Frontend/issues)

更多信息可关注公司微信公众号：

<img width="106" height="106" alt="image" src="https://github.com/user-attachments/assets/69a02ad0-422c-422a-bf5f-9b7890cf31ab" />

## ✅ 待办事项

- [ ] **引入智能体 (Agent)**: 集成 AI Agent 进行自动化的星座仿真任务编排与调度。
- [ ] **多星座支持**: 增加对导航星座、通信星座的预设支持。
- [ ] **STK 接口增强**: 拓展 API 覆盖范围，支持更细粒度的仿真参数配置
- [ ] **完善文档**: 补充详细的视频教程和 API 接口用例。
