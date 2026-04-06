# ShelfLife Phase 1 集成测试与收尾计划

## Summary (总结)
为完成 ShelfLife 小程序 Phase 1 剩余工作（集成测试与 Bug 修复），本项目通过代码审查（Code Review）对前端交互、云函数逻辑以及配置文件进行了全面排查。本计划输出了针对现有代码隐患的修复方案和手动测试清单，以确保 Phase 1 能够顺利收尾并完成代码提交。

## Current State Analysis (当前状态分析)
- **开发进度**：目前 Phase 1 已完成前端界面（index/add/detail/profile）、工具类（date/cloud）和云函数（login/item* 系列）的基础代码编写。
- **单元测试**：`tests/date.test.js` 的单元测试通过（13/13 passed）。
- **发现的隐患与 Bug（Code Review 结果）**：
  1. **资源文件缺失**：`app.json` 的 tabBar 配置和 `pages/index/index.wxml` 的空状态占位图中，引用了 `assets/icons/` 目录下的多张图片（如 `empty.png`, `list.png`, `user.png` 等），但项目中并未包含 `assets` 目录，会导致 tabBar 无法正常渲染、图片报 404 错误。
  2. **全局状态与云函数返回值不匹配**：`app.js` 的 `_login` 成功回调中尝试读取 `res.result.userInfo`，但 `login` 云函数实际仅返回了 `{ code, openid }`，导致 `app.globalData.userInfo` 为 `undefined`。
  3. **废弃的 API 使用**：`pages/profile/profile.wxml` 使用了 `<button open-type="getUserInfo">` 获取用户信息，该接口已被微信废弃，目前仅返回匿名信息（"微信用户"及默认灰头像）。
  4. **配置错误**：`app.json` 的 `requiredPrivateInfos` 中声明了 `"chooseImage"`，但该接口不属于需要声明的地理位置等隐私接口，可能会在微信开发者工具中引发编译警告。

## Proposed Changes (提议的修改)
1. **修复资源文件缺失**：
   - 在 `miniprogram/` 下创建 `assets/icons/` 目录。
   - 补充基础的图标占位文件或修改代码逻辑避免 404（建议暂时提供占位图文件 `empty.png`, `list.png`, `list-active.png`, `user.png`, `user-active.png`）。
2. **修复用户信息与登录逻辑**：
   - `app.js`：移除对 `res.result.userInfo` 的依赖赋值。
   - `pages/profile`：建议重构为符合最新微信规范的“头像昵称填写”能力，或者仅作为基础的静态占位显示。
3. **清理无效配置**：
   - 编辑 `miniprogram/app.json`，移除 `requiredPrivateInfos` 字段中的 `"chooseImage"`。
4. **更新项目管理文档 (`docs/project-management.md`)**：
   - 将上述 Bug 登记至 `Bug & 问题跟踪` 列表，并标记修复状态。
   - 细化 `Phase 1 集成测试` 清单，以便开发者在微信开发者工具中对照手动验证。
   - 将 Phase 1 状态更新为完成准备，提醒进行最终的 `git push`。

## Assumptions & Decisions (假设与决策)
- **假设**：AI 助手无法直接在本地唤起微信小程序模拟器进行真机/UI级别的端到端自动化测试，因此采用“静态代码审查 + 输出手动测试清单”的策略。
- **决策**：对于微信用户信息获取 API 废弃的问题，为了保证 MVP 的快速闭环，计划先将 `<button>` 替换为常规提示，或引入基础的 `chooseAvatar` 机制，具体视代码修改复杂度而定，以不阻碍 Phase 1 验收为原则。

## Verification Steps (验证步骤)
后续执行此计划后的验收步骤：
1. **编译检查**：在微信开发者工具中编译项目，确认 Console 无任何资源 404 报错和 `requiredPrivateInfos` 警告。
2. **文档检查**：查看 `docs/project-management.md`，确认 Bug 已被记录并勾选，集成测试清单已更新。
3. **手动走查（需开发者执行）**：
   - 微信登录流程（确认云数据库 `users` 集合有数据写入）。
   - 物品增删改查全流程（确认 `items` 集合有数据，且含有对应的 `_openid`）。
   - 确认首页临期/过期筛选逻辑和 UI 颜色展示正确。