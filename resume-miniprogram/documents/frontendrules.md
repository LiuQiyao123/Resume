# AI定制简历小程序前端设计规范

## 1. 设计语言与视觉风格

### 1.1 设计理念

- **专业简洁**：采用干净、专业的界面设计，传达简历工具的正式性与可靠性
- **功能导向**：所有UI元素明确指引用户完成简历创建和优化流程
- **轻量愉悦**：保持视觉元素轻盈，减轻求职压力，提升使用体验

### 1.2 视觉基调

- **现代扁平化**：采用符合微信生态的扁平化设计，减少不必要的装饰和阴影
- **卡片式布局**：重要内容以卡片形式呈现，清晰划分功能区域
- **微交互细节**：适度加入动效和反馈，提升用户体验，但不过度装饰
- **空间利用**：合理利用留白，避免界面拥挤，创造舒适视觉体验

### 1.3 品牌识别

- **Logo使用规范**：
  - 主页顶部居中展示完整Logo
  - 内页顶部左侧使用小型Logo
  - 最小尺寸不低于60rpx×60rpx，确保清晰可辨
- **品牌标识一致性**：
  - 所有页面保持品牌视觉一致性
  - 图标、按钮、交互元素风格统一

## 2. 色彩系统

### 2.1 主色调

- **主色**：`#3E78FD`（专业蓝）
  - 使用场景：主要按钮、关键操作、重点强调
  - 色值变体：
    - 浅色：`#D2E1FF`（背景、不可点击状态）
    - 深色：`#2D5CD7`（悬停、按下状态）

- **辅助色**：`#4ECDC4`（清新青绿）
  - 使用场景：次要强调、进度指示、成功状态
  - 色值变体：
    - 浅色：`#DFFAF8`（背景、标签）
    - 深色：`#35ADA5`（悬停、按下状态）

### 2.2 功能色彩

- **成功/新增**：`#36B37E`（绿色）
  - 使用场景：成功提示、新增内容标记
  - 色值变体：
    - 浅色：`#E3F8EF`（背景）
    - 深色：`#298267`（文本）

- **警告/修改**：`#FFAB00`（橙色）
  - 使用场景：警告提示、修改内容标记
  - 色值变体：
    - 浅色：`#FFF7E6`（背景）
    - 深色：`#D68D00`（文本）

- **错误/删除**：`#FF5630`（红色）
  - 使用场景：错误提示、删除内容标记
  - 色值变体：
    - 浅色：`#FFEBE6`（背景）
    - 深色：`#DE350B`（文本）

- **链接/强调**：`#0065FF`（深蓝色）
  - 使用场景：链接文本、强调内容
  - 色值变体：
    - 悬停状态：`#0055D6`

### 2.3 中性色

- **文本主色**：`#333333`（深灰）
  - 使用场景：主要文本内容、标题

- **文本次色**：`#666666`（中灰）
  - 使用场景：次要文本内容、描述文字

- **文本提示**：`#999999`（浅灰）
  - 使用场景：提示性文本、占位符

- **分割线/边框**：`#E5E5E5`（极浅灰）
  - 使用场景：分隔线、边框、输入框边框

- **背景色**：`#F8F9FA`（近白色）
  - 使用场景：页面背景、列表背景

- **卡片背景**：`#FFFFFF`（纯白色）
  - 使用场景：卡片和模块背景

### 2.4 状态色彩变化

- **按钮状态色变化**：
  - 普通态：原色 100%
  - 悬停态：原色 85% + 黑色 15%
  - 按下态：原色 70% + 黑色 30%
  - 禁用态：原色 25% + 白色 75%

- **交互元素状态**：
  - 选中状态：主色填充或边框
  - 未选中状态：灰色或透明
  - 禁用状态：浅灰色填充，灰色文字

### 2.5 色彩无障碍

- **对比度要求**：
  - 文本与背景对比度不低于4.5:1
  - 大字体（18pt以上）对比度不低于3:1
  - 重要信息不仅以颜色区分，同时使用形状、文本等辅助识别

### 2.6 渐变使用

- **主色渐变**：`linear-gradient(135deg, #3E78FD 0%, #6199FF 100%)`
  - 使用场景：强调按钮、头部背景

- **辅助色渐变**：`linear-gradient(135deg, #4ECDC4 0%, #33BBB3 100%)`
  - 使用场景：次要按钮、特殊卡片背景

## 3. 排版与字体

### 3.1 字体系统

- **中文字体**：微信默认字体（系统字体）
  - 备选字体：PingFang SC, Hiragino Sans GB, Microsoft YaHei

- **英文/数字字体**：SF Pro, Roboto（根据系统自动选择）
  - 备选字体：Helvetica Neue, Arial

- **字体调用顺序**：
  ```css
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro", "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
  ```

### 3.2 字号规范

- **大标题**：36rpx，字重500或600
  - 使用场景：页面主标题，重要信息标题

- **中标题**：32rpx，字重500
  - 使用场景：卡片标题，分区标题

- **小标题**：28rpx，字重500
  - 使用场景：列表标题，分组标题

- **正文内容**：28rpx，字重400
  - 使用场景：主要内容文本

- **辅助文本**：24rpx，字重400
  - 使用场景：描述文本，标签文本

- **注释文本**：20rpx，字重400
  - 使用场景：脚注，补充说明

### 3.3 行高与间距

- **标题行高**：1.4倍字号
  - 大标题：50rpx
  - 中标题：45rpx
  - 小标题：39rpx

- **正文行高**：1.5倍字号
  - 正文内容：42rpx
  - 辅助文本：36rpx
  - 注释文本：30rpx

- **段落间距**：
  - 相同层级段落：28rpx
  - 不同层级段落：40rpx

- **文本组间距**：
  - 标题与内容间：20rpx
  - 相关内容组间：20rpx
  - 不相关内容组间：40rpx

### 3.4 文本样式

- **对齐方式**：
  - 标题：左对齐（特殊情况居中）
  - 正文：左对齐
  - 导航/标签：居中对齐
  - 数字金额：右对齐

- **强调样式**：
  - 粗体：font-weight: 500/600
  - 高亮：主色文字或背景
  - 下划线：用于链接和特殊强调

- **文本截断**：
  - 单行截断：
    ```css
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    ```
  - 多行截断（2行）：
    ```css
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    ```

## 4. 组件库设计

### 4.1 基础组件

#### 4.1.1 按钮

- **主要按钮**：
  - 样式：
    ```css
    {
      background-color: #3E78FD;
      color: #FFFFFF;
      border-radius: 10rpx;
      font-size: 28rpx;
      font-weight: 500;
      height: 88rpx;
      line-height: 88rpx;
      padding: 0 30rpx;
      text-align: center;
    }
    ```
  - 悬停状态：`background-color: #2D5CD7;`
  - 点击状态：`background-color: #1F4CBD;`
  - 禁用状态：`background-color: #A6C1FE; opacity: 0.5;`

- **次要按钮**：
  - 样式：
    ```css
    {
      background-color: #FFFFFF;
      color: #3E78FD;
      border: 2rpx solid #3E78FD;
      border-radius: 10rpx;
      font-size: 28rpx;
      font-weight: 400;
      height: 88rpx;
      line-height: 84rpx; /* 减去边框 */
      padding: 0 30rpx;
      text-align: center;
    }
    ```
  - 悬停状态：`background-color: #F0F5FF;`
  - 点击状态：`background-color: #E6EEFF;`
  - 禁用状态：`color: #A6C1FE; border-color: #A6C1FE; opacity: 0.5;`

- **文本按钮**：
  - 样式：
    ```css
    {
      background-color: transparent;
      color: #3E78FD;
      font-size: 28rpx;
      padding: 20rpx 0;
      text-align: center;
    }
    ```
  - 悬停状态：`text-decoration: underline;`
  - 禁用状态：`color: #A6C1FE; opacity: 0.5;`

- **图标按钮**：
  - 仅图标样式：
    ```css
    {
      width: 80rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    ```
  - 图标+文字样式：
    ```css
    {
      display: flex;
      align-items: center;
      font-size: 28rpx;
    }
    .icon {
      margin-right: 10rpx;
      width: 32rpx;
      height: 32rpx;
    }
    ```

#### 4.1.2 输入框

- **单行输入**：
  - 样式：
    ```css
    {
      border-bottom: 2rpx solid #E5E5E5;
      padding: 20rpx 0;
      font-size: 28rpx;
      width: 100%;
    }
    ```
  - 聚焦状态：`border-bottom: 2rpx solid #3E78FD;`
  - 错误状态：`border-bottom: 2rpx solid #FF5630;`
  - 禁用状态：`opacity: 0.5; background-color: #F8F9FA;`

- **多行输入**：
  - 样式：
    ```css
    {
      border: 2rpx solid #E5E5E5;
      border-radius: 10rpx;
      padding: 20rpx;
      font-size: 28rpx;
      width: 100%;
      min-height: 180rpx;
    }
    ```
  - 状态变化同单行输入

- **带标签输入框**：
  - 样式：
    ```css
    .input-group {
      margin-bottom: 30rpx;
    }
    .input-label {
      display: block;
      font-size: 24rpx;
      color: #666666;
      margin-bottom: 10rpx;
    }
    ```

- **搜索输入框**：
  - 样式：
    ```css
    {
      background-color: #F8F9FA;
      border-radius: 32rpx;
      padding: 10rpx 20rpx 10rpx 60rpx;
      position: relative;
    }
    .search-icon {
      position: absolute;
      left: 20rpx;
      top: 50%;
      transform: translateY(-50%);
      width: 28rpx;
      height: 28rpx;
    }
    ```

#### 4.1.3 卡片

- **基础卡片**：
  - 样式：
    ```css
    {
      background-color: #FFFFFF;
      border-radius: 16rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
      padding: 30rpx;
      margin-bottom: 24rpx;
    }
    ```

- **功能卡片**：
  - 样式：
    ```css
    {
      background-color: #FFFFFF;
      border-radius: 16rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
      padding: 30rpx;
      margin-bottom: 24rpx;
    }
    .card-title {
      font-size: 32rpx;
      font-weight: 500;
      margin-bottom: 20rpx;
      color: #333333;
    }
    .card-content {
      font-size: 28rpx;
      color: #666666;
    }
    ```

- **可点击卡片**：
  - 样式扩展：
    ```css
    {
      position: relative;
      padding-right: 60rpx; /* 为箭头留空间 */
    }
    .card-arrow {
      position: absolute;
      right: 30rpx;
      top: 50%;
      transform: translateY(-50%);
      width: 16rpx;
      height: 28rpx;
      color: #999999;
    }
    ```
  - 点击态：`box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.08);`

#### 4.1.4 标签

- **基础标签**：
  - 样式：
    ```css
    {
      background-color: #F0F5FF;
      color: #3E78FD;
      border-radius: 8rpx;
      padding: 6rpx 16rpx;
      font-size: 24rpx;
      display: inline-block;
      margin-right: 16rpx;
      margin-bottom: 16rpx;
    }
    ```

- **状态标签**：
  - 成功：
    ```css
    {
      background-color: #E3F8EF;
      color: #36B37E;
    }
    ```
  - 警告：
    ```css
    {
      background-color: #FFF7E6;
      color: #FFAB00;
    }
    ```
  - 错误：
    ```css
    {
      background-color: #FFEBE6;
      color: #FF5630;
    }
    ```

- **可选择标签**：
  - 未选中：基础标签样式
  - 选中：
    ```css
    {
      background-color: #3E78FD;
      color: #FFFFFF;
    }
    ```

#### 4.1.5 弹窗

- **确认弹窗**：
  - 样式：
    ```css
    .modal-mask {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.6);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-container {
      width: 560rpx;
      background-color: #FFFFFF;
      border-radius: 16rpx;
      overflow: hidden;
    }
    .modal-title {
      font-size: 32rpx;
      font-weight: 500;
      padding: 30rpx;
      text-align: center;
      border-bottom: 2rpx solid #E5E5E5;
    }
    .modal-content {
      padding: 40rpx 30rpx;
      font-size: 28rpx;
      color: #666666;
      max-height: 600rpx;
      overflow-y: auto;
    }
    .modal-footer {
      display: flex;
      border-top: 2rpx solid #E5E5E5;
    }
    .modal-btn {
      flex: 1;
      height: 100rpx;
      line-height: 100rpx;
      text-align: center;
      font-size: 32rpx;
    }
    .modal-cancel {
      color: #666666;
      border-right: 2rpx solid #E5E5E5;
    }
    .modal-confirm {
      color: #3E78FD;
      font-weight: 500;
    }
    ```

- **提示弹窗**：
  - 样式：
    ```css
    .toast {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgba(0, 0, 0, 0.7);
      color: #FFFFFF;
      padding: 20rpx 40rpx;
      border-radius: 8rpx;
      font-size: 28rpx;
      z-index: 1001;
    }
    ```

- **底部操作弹窗**：
  - 样式：
    ```css
    .action-sheet {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #FFFFFF;
      border-radius: 20rpx 20rpx 0 0;
      padding-bottom: env(safe-area-inset-bottom);
      z-index: 1000;
      transform: translateY(100%);
      transition: transform 0.3s;
    }
    .action-sheet.show {
      transform: translateY(0);
    }
    .action-item {
      height: 100rpx;
      line-height: 100rpx;
      text-align: center;
      font-size: 32rpx;
      color: #333333;
      border-bottom: 2rpx solid #E5E5E5;
    }
    .action-cancel {
      height: 100rpx;
      line-height: 100rpx;
      text-align: center;
      font-size: 32rpx;
      color: #666666;
      margin-top: 16rpx;
    }
    ```

### 4.2 业务组件

#### 4.2.1 聊天气泡

- **AI消息气泡**：
  - 样式：
    ```css
    .chat-item {
      display: flex;
      margin-bottom: 30rpx;
    }
    .ai-message {
      justify-content: flex-start;
    }
    .ai-avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: 20rpx;
      flex-shrink: 0;
    }
    .ai-bubble {
      background-color: #F0F5FF;
      border-radius: 0 20rpx 20rpx 20rpx;
      padding: 20rpx;
      max-width: 70%;
      font-size: 28rpx;
      color: #333333;
    }
    .ai-thinking {
      background-color: #F8F9FA;
      border-radius: 0 20rpx 20rpx 20rpx;
      padding: 20rpx;
      max-width: 70%;
      font-size: 24rpx;
      color: #999999;
    }
    ```

- **用户消息气泡**：
  - 样式：
    ```css
    .user-message {
      justify-content: flex-end;
    }
    .user-bubble {
      background-color: #3E78FD;
      border-radius: 20rpx 0 20rpx 20rpx;
      padding: 20rpx;
      max-width: 70%;
      font-size: 28rpx;
      color: #FFFFFF;
    }
    .user-voice {
      background-color: #3E78FD;
      border-radius: 35rpx;
      padding: 16rpx 30rpx;
      display: flex;
      align-items: center;
      min-width: 120rpx;
    }
    .voice-icon {
      width: 32rpx;
      height: 32rpx;
      margin-right: 10rpx;
    }
    .voice-duration {
      color: #FFFFFF;
      font-size: 28rpx;
    }
    ```

- **思考过程展示**：
  - 样式：
    ```css
    .thinking-container {
      padding: 16rpx;
      background-color: #F8F9FA;
      border-radius: 12rpx;
      margin-top: 20rpx;
      font-size: 24rpx;
      color: #666666;
      font-family: monospace;
    }
    .thinking-text {
      white-space: pre-wrap;
      word-break: break-all;
    }
    .typing-cursor {
      display: inline-block;
      width: 8rpx;
      height: 24rpx;
      background-color: #666666;
      animation: blink 1s infinite;
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    ```

#### 4.2.2 简历修改对比组件

- **修改高亮样式**：
  - 新增：
    ```css
    .highlight-add {
      text-decoration: underline;
      text-decoration-color: #36B37E;
      text-decoration-thickness: 2rpx;
      background-color: rgba(54, 179, 126, 0.1);
    }
    ```
  - 修改：
    ```css
    .highlight-modify-old {
      text-decoration: line-through;
      text-decoration-color: #999999;
      text-decoration-thickness: 2rpx;
      color: #999999;
    }
    .highlight-modify-new {
      text-decoration: underline;
      text-decoration-color: #36B37E;
      text-decoration-thickness: 2rpx;
      background-color: rgba(54, 179, 126, 0.1);
    }
    ```
  - 删除：
    ```css
    .highlight-delete {
      text-decoration: line-through;
      text-decoration-color: #FF5630;
      text-decoration-thickness: 2rpx;
      color: #999999;
    }
    ```

- **对比视图**：
  - 样式：
    ```css
    .compare-container {
      border: 2rpx solid #E5E5E5;
      border-radius: 16rpx;
      overflow: hidden;
      margin-bottom: 40rpx;
    }
    .compare-header {
      display: flex;
      background-color: #F8F9FA;
      border-bottom: 2rpx solid #E5E5E5;
    }
    .compare-title {
      flex: 1;
      text-align: center;
      padding: 20rpx;
      font-size: 28rpx;
      font-weight: 500;
    }
    .compare-divider {
      width: 2rpx;
      background-color: #E5E5E5;
    }
    .compare-content {
      display: flex;
    }
    .compare-column {
      flex: 1;
      padding: 20rpx;
      font-size: 28rpx;
      min-height: 200rpx;
    }
    .compare-section {
      margin-bottom: 30rpx;
    }
    .section-title {
      font-weight: 500;
      margin-bottom: 16rpx;
      color: #333333;
    }
    .section-content {
      color: #666666;
      line-height: 1.5;
    }
    ```

- **修改理由注释**：
  - 样式：
    ```css
    .reason-container {
      margin-top: 16rpx;
      padding: 16rpx;
      background-color: #FFF7E6;
      border-radius: 8rpx;
      font-size: 24rpx;
      color: #996600;
    }
    .reason-title {
      font-weight: 500;
      margin-bottom: 8rpx;
    }
    ```

#### 4.2.3 模板展示组件

- **模板卡片**：
  - 样式：
    ```css
    .template-card {
      position: relative;
      width: 330rpx;
      margin-bottom: 30rpx;
      border-radius: 16rpx;
      overflow: hidden;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    }
    .template-image {
      width: 100%;
      height: 460rpx;
      background-color: #F8F9FA;
    }
    .template-info {
      padding: 20rpx;
      background-color: #FFFFFF;
    }
    .template-name {
      font-size: 28rpx;
      font-weight: 500;
      color: #333333;
      margin-bottom: 12rpx;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .template-tag {
      position: absolute;
      top: 16rpx;
      right: 16rpx;
      padding: 6rpx 16rpx;
      border-radius: 8rpx;
      font-size: 24rpx;
    }
    .template-free {
      background-color: #E3F8EF;
      color: #36B37E;
    }
    .template-paid {
      background-color: #FFF7E6;
      color: #FFAB00;
    }
    .template-price {
      font-size: 24rpx;
      color: #666666;
      display: flex;
      align-items: center;
    }
    .price-icon {
      width: 24rpx;
      height: 24rpx;
      margin-right: 6rpx;
    }
    ```

- **模板预览**：
  - 样式：
    ```css
    .preview-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.8);
      z-index: 1000;
      display: flex;
      flex-direction: column;
    }
    .preview-header {
      padding: 30rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .preview-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #FFFFFF;
    }
    .preview-close {
      width: 48rpx;
      height: 48rpx;
      color: #FFFFFF;
    }
    .preview-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 60rpx;
    }
    .preview-image {
      width: 100%;
      max-height: 80vh;
      border-radius: 12rpx;
    }
    .preview-pagination {
      padding: 30rpx 0;
      display: flex;
      justify-content: center;
    }
    .page-dot {
      width: 16rpx;
      height: 16rpx;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.3);
      margin: 0 8rpx;
    }
    .page-dot.active {
      background-color: #FFFFFF;
    }
    .preview-footer {
      padding: 30rpx;
      padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
    }
    ```

## 5. 布局系统

### 5.1 基础栅格

- **基准单位**：rpx（响应式像素，相对于750px设计稿）
- **标准间距**：30rpx（基本边距）
- **页面边距**：左右各30rpx
- **栅格系统**：24栅格，计算方式：
  ```
  单栅格宽度 = (750rpx - 左右边距60rpx) / 24 = 28.75rpx
  元素宽度 = 栅格数 × 单栅格宽度
  ```

- **常见栅格尺寸**：
  ```css
  .col-24 { width: 100%; }              /* 满宽 */
  .col-12 { width: 50%; }               /* 1/2宽 */
  .col-8 { width: 33.33%; }             /* 1/3宽 */
  .col-6 { width: 25%; }                /* 1/4宽 */
  .col-4 { width: 16.67%; }             /* 1/6宽 */
  ```

### 5.2 页面布局模式

- **列表页布局**：
  ```css
  .page-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #F8F9FA;
  }
  .page-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background-color: #FFFFFF;
    padding: 0 30rpx;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2rpx solid #E5E5E5;
  }
  .page-content {
    flex: 1;
    padding: 118rpx 30rpx 168rpx;
  }
  .page-footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #FFFFFF;
    padding: 20rpx 30rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    border-top: 2rpx solid #E5E5E5;
    z-index: 99;
  }
  ```

- **详情页布局**：
  ```css
  .detail-header {
    position: relative;
    height: 400rpx;
    overflow: hidden;
  }
  .detail-cover {
    width: 100%;
    height: 100%;
  }
  .detail-back {
    position: absolute;
    left: 30rpx;
    top: 60rpx;
    width: 60rpx;
    height: 60rpx;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
  }
  .detail-content {
    padding: 40rpx 30rpx;
    background-color: #FFFFFF;
    border-radius: 40rpx 40rpx 0 0;
    margin-top: -40rpx;
    position: relative;
    z-index: 2;
  }
  .detail-title {
    font-size: 36rpx;
    font-weight: 600;
    margin-bottom: 30rpx;
  }
  .detail-section {
    margin-bottom: 40rpx;
  }
  .detail-footer {
    padding: 30rpx;
    padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
    background-color: #FFFFFF;
    border-top: 2rpx solid #E5E5E5;
  }
  ```

- **表单页布局**：
  ```css
  .form-container {
    padding: 30rpx;
  }
  .form-group {
    margin-bottom: 40rpx;
  }
  .form-label {
    font-size: 28rpx;
    color: #333333;
    font-weight: 500;
    margin-bottom: 20rpx;
  }
  .form-input {
    border: 2rpx solid #E5E5E5;
    border-radius: 10rpx;
    padding: 20rpx;
    font-size: 28rpx;
    width: 100%;
  }
  .form-textarea {
    border: 2rpx solid #E5E5E5;
    border-radius: 10rpx;
    padding: 20rpx;
    font-size: 28rpx;
    width: 100%;
    min-height: 180rpx;
  }
  .form-footer {
    margin-top: 60rpx;
    padding-bottom: env(safe-area-inset-bottom);
  }
  ```

- **对话页布局**：
  ```css
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #F8F9FA;
  }
  .chat-header {
    padding: 0 30rpx;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #FFFFFF;
    border-bottom: 2rpx solid #E5E5E5;
    position: relative;
  }
  .chat-title {
    font-size: 32rpx;
    font-weight: 500;
  }
  .chat-back {
    position: absolute;
    left: 30rpx;
    top: 50%;
    transform: translateY(-50%);
    font-size: 32rpx;
  }
  .chat-content {
    flex: 1;
    padding: 30rpx;
    overflow-y: auto;
  }
  .chat-input-container {
    background-color: #FFFFFF;
    border-top: 2rpx solid #E5E5E5;
    padding: 20rpx 30rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    display: flex;
    align-items: center;
  }
  .chat-input {
    flex: 1;
    height: 72rpx;
    background-color: #F8F9FA;
    border-radius: 36rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
  }
  .chat-send {
    width: 72rpx;
    height: 72rpx;
    border-radius: 36rpx;
    background-color: #3E78FD;
    margin-left: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
  }
  .chat-voice {
    width: 40rpx;
    height: 40rpx;
    margin-right: 20rpx;
    color: #999999;
  }
  ```

### 5.3 自适应策略

- **屏幕尺寸适配**：
  - 使用rpx单位：750rpx对应设计稿宽度，自动适配不同屏幕宽度
  - 关键元素使用flex布局，确保弹性伸缩
  - 图片使用`mode="widthFix"`或`mode="aspectFill"`确保比例正确

- **安全区域适配**：
  - 底部操作区域添加安全区域适配：
    ```css
    padding-bottom: calc(常规内边距 + env(safe-area-inset-bottom));
    ```
  - 顶部状态栏适配：
    ```css
    padding-top: calc(常规内边距 + env(safe-area-inset-top));
    ```
  - 特殊机型适配：
    ```css
    @media screen and (width: 375px) and (height: 812px),
           screen and (width: 414px) and (height: 896px) {
      /* iPhone X及以上机型特殊处理 */
    }
    ```

- **屏幕方向适配**：
  - 主要为竖屏模式设计
  - 关键布局使用百分比和视口单位：
    ```css
    width: 100%;
    max-height: 80vh;
    ```

- **内容溢出处理**：
  - 文本溢出：使用前面定义的文本截断样式
  - 容器溢出：
    ```css
    .scroll-container {
      overflow-y: auto;
      -webkit-overflow-scrolling: touch; /* iOS滚动流畅 */
      max-height: 70vh;
    }
    ```

### 5.4 响应式布局技巧

- **弹性间距**：
  ```css
  .adaptive-spacing {
    padding: calc(20rpx + 2vw);
    margin-bottom: calc(16rpx + 1vh);
  }
  ```

- **最小/最大尺寸限制**：
  ```css
  .adaptive-element {
    width: 100%;
    max-width: 600rpx;
    min-width: 300rpx;
  }
  ```

- **关键内容优先**：
  ```css
  @media screen and (max-height: 700px) {
    .secondary-content {
      display: none;
    }
    .primary-content {
      max-height: 60vh;
    }
  }
  ```

## 6. 交互设计规范

### 6.1 基础交互反馈

- **点击反馈**：
  - 按钮点击态：背景色加深15-30%
  - 列表项点击态：背景色变为`#F0F5FF`
  - 图标点击态：透明度降低至0.7

- **焦点状态**：
  - 输入框聚焦：边框变为主色`#3E78FD`
  - 可选项聚焦：添加细微阴影或边框

- **禁用状态**：
  - 禁用元素透明度：0.5
  - 禁用按钮：禁用事件触发、视觉明显区分

### 6.2 手势交互

- **滑动操作**：
  - 列表项左滑：显示删除/编辑等操作
    ```css
    .swipe-action-container {
      position: relative;
      overflow: hidden;
    }
    .swipe-content {
      transition: transform 0.3s;
    }
    .swipe-actions {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      display: flex;
    }
    .swipe-action-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 160rpx;
      height: 100%;
      color: #FFFFFF;
      font-size: 28rpx;
    }
    .swipe-action-edit {
      background-color: #3E78FD;
    }
    .swipe-action-delete {
      background-color: #FF5630;
    }
    ```
  
  - 下拉刷新：
    ```css
    .pull-refresh {
      padding-top: 80rpx;
      position: relative;
    }
    .refresh-indicator {
      position: absolute;
      top: 20rpx;
      left: 50%;
      transform: translateX(-50%);
      font-size: 24rpx;
      color: #999999;
      display: flex;
      align-items: center;
    }
    .refresh-icon {
      width: 32rpx;
      height: 32rpx;
      margin-right: 10rpx;
      animation: rotate 1s linear infinite;
    }
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    ```

- **长按操作**：
  - 定义长按显示的菜单样式：
    ```css
    .context-menu {
      position: absolute;
      background-color: #FFFFFF;
      border-radius: 10rpx;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
      padding: 10rpx 0;
      z-index: 100;
    }
    .context-menu-item {
      padding: 20rpx 30rpx;
      font-size: 28rpx;
      color: #333333;
    }
    .context-menu-divider {
      height: 2rpx;
      background-color: #E5E5E5;
      margin: 5rpx 0;
    }
    ```

### 6.3 动画与过渡

- **页面转场动画**：
  ```css
  .page-transition {
    animation: slidein 0.3s ease-out;
  }
  @keyframes slidein {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  ```

- **元素显隐动画**：
  ```css
  .fade-in {
    animation: fadein 0.3s ease-out;
  }
  @keyframes fadein {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .fade-out {
    animation: fadeout 0.3s ease-out;
  }
  @keyframes fadeout {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  ```

- **加载动画**：
  ```css
  .loading {
    display: inline-block;
    width: 40rpx;
    height: 40rpx;
    border: 4rpx solid #E5E5E5;
    border-radius: 50%;
    border-top-color: #3E78FD;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  ```

- **列表项动画**：
  ```css
  .list-item {
    animation: slidein-bottom 0.3s ease-out;
    animation-fill-mode: both;
  }
  .list-item:nth-child(1) { animation-delay: 0.05s; }
  .list-item:nth-child(2) { animation-delay: 0.1s; }
  .list-item:nth-child(3) { animation-delay: 0.15s; }
  /* ... */
  @keyframes slidein-bottom {
    from { transform: translateY(30rpx); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  ```

## 7. 前端框架与技术选型

### 7.1 框架基础

- **小程序框架选择**：
  - 基础框架：微信小程序原生框架
    - 优势：性能优良、原生接口支持全面、文档完善
    - 缺点：组件化能力略弱
  
  - 可选框架：
    - Taro：React风格，跨平台能力强
    - uni-app：Vue风格，生态完善
    - mpvue：与Vue.js语法一致

- **选择依据**：
  - 项目规模：中小型，选择原生框架即可
  - 团队技术栈：如团队熟悉React，可考虑Taro
  - 跨平台需求：暂无，优先原生框架提高性能

### 7.2 技术栈详情

- **开发语言**：
  - JavaScript (ES6+)
  - 样式开发：WXSS + LESS预处理器

- **组件管理**：
  - 自定义组件：微信小程序自定义组件系统
  - 组件通信：properties属性、事件、selectComponent方法
  - 组件封装：遵循单一职责原则

- **状态管理**：
  - 小型页面：直接使用页面的data和setData
  - 中型页面：使用微信小程序的globalData
  - 复杂业务：引入Mobx-miniprogram库
    ```javascript
    // store/index.js
    import { observable, action } from 'mobx-miniprogram'
    
    export const store = observable({
      // 状态
      userInfo: null,
      resumeData: null,
      
      // 计算属性
      get hasResume() {
        return this.resumeData !== null
      },
      
      // actions
      updateUserInfo: action(function(info) {
        this.userInfo = info
      }),
      updateResumeData: action(function(data) {
        this.resumeData = data
      })
    })
    ```

- **模块化与构建**：
  - 使用NPM支持：配置project.config.json启用npm模块
  - 构建工具：使用微信开发者工具自带构建
  - 可选工具：gulp自动化任务（编译LESS、压缩代码等）

### 7.3 项目目录结构
