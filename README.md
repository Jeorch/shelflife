# ShelfLife 保质期管家

记录生活中物品的保质期，临期自动提醒，告别过期浪费。

## 技术栈

- **前端**：微信小程序原生（WXML + WXSS + JS）
- **后端**：微信云开发（CloudBase）— 云函数 + 云数据库 + 云存储
- **测试**：Jest（工具函数单元测试）

## 功能进度

### Phase 1 — MVP ✅

- 微信一键登录
- 物品增删改查（名称、分类、生产日期、到期日期、备注）
- 拍照或相册上传物品图片
- 保质期列表，按到期时间升序排列
- 临期（≤7 天）橙色高亮，已过期红色高亮
- 顶部筛选 Tab：全部 / 临期 / 已过期
- 小程序内临期提醒横幅

### Phase 2 — 通知增强 ⏳

- 微信订阅消息推送（定时云函数，每日提醒）
- 数据统计页（过期/临期/正常数量概览）

### Phase 3 — 智能录入 ⏳

- OCR 自动识别保质期日期
- 条形码扫描识别商品（可选）

## 目录结构

```
shelflife/
├── miniprogram/              # 小程序前端
│   ├── pages/
│   │   ├── index/            # 首页：物品列表 + 临期高亮
│   │   ├── add/              # 添加物品
│   │   ├── detail/           # 物品详情 & 编辑
│   │   └── profile/          # 个人中心
│   ├── components/
│   │   ├── item-card/        # 物品卡片组件
│   │   └── status-tag/       # 状态标签（正常/临期/已过期）
│   └── utils/
│       ├── date.js           # 保质期状态计算（getDaysLeft / getItemStatus）
│       └── cloud.js          # 云函数调用统一封装
├── cloudfunctions/           # 云函数（Node.js）
│   ├── login/                # 微信登录
│   ├── itemAdd/              # 添加物品
│   ├── itemUpdate/           # 更新物品
│   ├── itemDelete/           # 删除物品
│   └── itemList/             # 查询列表
├── tests/                    # 单元测试
│   └── date.test.js          # date.js 13 个测试
└── docs/
    └── project-management.md # 任务 & Bug 跟踪
```

## 快速开始

### 前置条件

- 微信开发者工具（最新版）
- 微信小程序开发者账号
- Node.js 18+（用于本地单元测试）

### 配置步骤

1. 克隆仓库
   ```bash
   git clone https://github.com/Jeorch/shelflife.git
   ```
2. 微信开发者工具中导入项目，填入你的 AppID
3. 将 `project.config.json` 中的 `appid` 替换为真实 AppID
4. 点击「云开发」→「开通」，创建云环境，获取环境 ID
5. 将 `miniprogram/app.js` 第 9 行的 `'shelflife-env'` 替换为真实环境 ID
6. 在云数据库中创建集合：`users`、`items`，权限设为「仅创建者可读写」
7. 右键每个云函数目录 → 「上传并部署：云端安装依赖」

### 运行单元测试

```bash
npm install
npm test
```

## 数据模型

### items 集合

| 字段 | 类型 | 说明 |
|------|------|------|
| `_openid` | string | 用户标识（云数据库自动注入） |
| `name` | string | 物品名称（必填） |
| `category` | string | 分类：食品/药品/护肤品/日用品/其他 |
| `image` | string | 云存储 fileID |
| `productionDate` | string | 生产日期（YYYY-MM-DD，选填） |
| `expiryDate` | string | 到期日期（YYYY-MM-DD，必填） |
| `shelfLifeDays` | number | 保质期天数（选填） |
| `note` | string | 备注 |
| `createTime` | date | 创建时间 |
| `updateTime` | date | 更新时间 |

## 状态判断规则

| 状态 | 条件 | 颜色 |
|------|------|------|
| `normal` 正常 | 距到期 > 7 天 | 绿色 |
| `near` 临期 | 距到期 0–7 天 | 橙色 |
| `expired` 已过期 | 已超过到期日 | 红色 |
