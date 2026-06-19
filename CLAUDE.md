# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

可拖动看板（Kanban）Demo，基于 Vue 3 + TypeScript + Vite 构建。核心功能是用 vuedraggable 实现跨列拖拽卡片。

## 常用命令

```sh
npm install          # 安装依赖
npm run dev          # 启动开发服务器（热更新）
npm run build        # 类型检查 + 生产构建
npm run preview      # 预览生产构建
npm run test:unit    # 运行 Vitest 单元测试
npm run type-check   # 仅运行 vue-tsc 类型检查
```

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3 + Composition API (`<script setup>`) | 3.3 |
| 语言 | TypeScript | 5.2 |
| 构建 | Vite + `@vitejs/plugin-vue` + `@vitejs/plugin-vue-jsx` | 4.4 |
| UI 库 | Element Plus | 2.4 |
| 状态管理 | Pinia | 2.1 |
| 路由 | Vue Router (history 模式) | 4.2 |
| 拖拽 | vuedraggable | 4.1 |
| 微前端 | qiankun（主应用宿主） | 2.10 |
| CSS | Less（scoped） | 4.2 |
| 测试 | Vitest + jsdom | 0.34 |
| 工具 | dayjs、xlsx、xlsx-js-style、axios | — |

引入了 `@rollup/plugin-commonjs` 处理混用 CJS/ESM 的依赖（`vite-plugin-require-transform`）。

## 架构概览

```
src/
├── main.ts              # 入口：挂载 Pinia → Element Plus → 自定义指令 → Router → qiankun → 挂载 #app
├── App.vue              # 根组件：<router-view> 包裹 <KeepAlive :include="['ComponentA','ComponentB','test']">
├── router/index.ts      # 两个路由：/ (看板首页) 和 /test
├── app/index.ts         # qiankun 微应用注册配置 [{name:'vueApp1', entry:'localhost:7100', activeRule:'/vueApp1'}]
├── stores/counter.ts    # Pinia 示例 store（模板代码，非业务使用）
├── views/kanban/
│   ├── index.vue        # 看板主页面：5 列拖拽 + 搜索过滤 + 添加卡片
│   └── m-dialog.vue     # 卡片详情弹窗（el-dialog，通过 defineExpose 暴露）
├── components/
│   ├── header/Header.vue  # 顶部：视差图片动效（随鼠标移动）+ Element Plus 搜索框
│   ├── loading/           # 自定义加载组件/指令/服务
│   ├── exportRz.vue       # 导出组件（已注释未使用）
│   └── test.vue           # 测试组件
└── directive/           # 自定义指令（loading 指令 + $loading 全局服务方法）
```

## 关键设计

- **看板数据模型**：`myTodos` 是 `ref` 数组，每列有 `title`、`children`（卡片列表）。每个 `children` 末尾固定有一个 `type: 'add'` 的占位项用于新增卡片。列可拖动和排序依赖 `vuedraggable`。拖拽完成后 `onEnd` 会调用 `reSort` 确保「添加按钮」始终在列末尾。
- **路径别名**：`@` 映射到 `./src`（在 `vite.config.ts` 和 `tsconfig` 中均已配置）。
- **qiankun**：本项目作为主应用，注册了子应用 `vueApp1`（`localhost:7100`），通过 `registerMicroApps` + `start()` 启动。
- **Header 动效**：`Header.vue` 使用 `DOMMatrix` 做多层图片视差效果，监听 `mousemove`/`mouseleave` 事件，鼠标离开时执行回位动画。
- **依赖注意**：`element-plus` 和 `@element-plus/icons-vue` 全局注册在 `main.ts`，同时在 `vite.config.ts` 中通过 `@rollup/plugin-commonjs` 转译混用模块。
