# FrWordle V4

![FrWordle Logo](image/icon.png)

**FrWordle** 是一款基于经典 Wordle 游戏玩法的法语单词猜谜游戏。玩家需要在 6 次机会内猜出一个法语单词，通过颜色提示了解每个字母的位置和存在情况。

## 🌟 特性

- 🇫🇷 **纯法语体验**：支持法语特有的重音符号（é, è, ê, à, â, ä, î, ï, ô, ö, ù, û, ü, ÿ, æ, œ, ç）
- 🎯 **多难度级别**：从初级到高级，适合不同水平的法语学习者
- 📱 **响应式设计**：完美适配桌面和移动设备
- 🎨 **现代界面**：简洁优雅的用户界面
- 📚 **丰富词库**：包含超过 37 万个经过筛选的法语单词

## 🎮 游戏规则

1. 猜出一个 5 个字母的法语单词
2. 每次猜测后，字母方块会显示颜色提示：
   - 🔵 **蓝色**：字母正确且位置正确
   - 🔴 **红色**：字母存在但位置不正确
   - 🟣 **紫色**：字母是正确但使用了不同的重音符号
   - ⚪ **灰色**：字母不存在于目标单词中
3. 在 6 次机会内猜出目标单词即可获胜

## 🛠️ 技术栈

- **HTML5**：语义化标记
- **CSS3**：现代样式和布局
- **JavaScript (ES6+)**：游戏逻辑和交互
- **Python**：词典处理和数据过滤

## 📁 项目结构

```
FrWordle-V4/
├── index.html          # 主页面
├── css.css            # 样式文件
├── js.js              # 游戏逻辑
├── dictionary.csv     # 原始词典（过滤后）
├── dictionary.json    # JSON 格式的词典
├── dictionary_filtered.csv  # 过滤后的 CSV 词典
├── filter_dictionary.py     # 词典过滤脚本
├── prepare_dictionary.py    # 词典准备脚本
├── gitUpdateCode.ps1        # Git 更新脚本
├── image/
│   └── icon.png             # 网站图标
├── LICENSE                  # MIT 许可证
└── README.md                # 项目说明
```

## 🚀 快速开始

### 在浏览器中运行

1. 下载或克隆本项目
2. 打开 `index.html` 文件
3. 开始游戏！

### 本地开发

1. 克隆项目：
   ```bash
   git clone https://github.com/Koloyaaa/FrWordle-V4.git
   cd FrWordle-V4
   ```

2. 运行本地服务器（可选）：
   ```bash
   # 使用 Python
   python -m http.server 8000
   
   # 或使用 Node.js
   npx serve
   ```

3. 在浏览器中访问 `http://localhost:8000`

## 📝 词典处理

项目包含完整的词典处理脚本，可以生成和过滤法语词典：

### 准备词典

运行 `prepare_dictionary.py` 脚本：

```bash
python prepare_dictionary.py
```

该脚本会：
1. 从 `dictionary.csv` 中过滤出合规的法语单词
2. 将过滤后的单词转换为 JSON 格式
3. 生成 `dictionary.json` 文件

### 词典过滤规则

- 只包含法文拉丁字母（包括重音符号）
- 排除缩写词（全大写或包含大写字母序列的单词）
- 排除数字、连字符、空格等特殊字符

## 🎨 自定义

### 修改主题颜色

在 `css.css` 文件中修改主色调变量：

```css
:root {
    --primary-color: #5b3e7e;  /* 修改此值 */
}
```

### 添加新词典

1. 将词典文件放在 `js/frdic/` 目录下
2. 在 `js.js` 中的 `LEVELS` 对象中添加新的难度级别

## 📊 项目统计

- **词库大小**：372,142 个单词
- **过滤前**：374,457 个单词
- **过滤后**：372,142 个合规单词
- **删除**：2,315 个不合规单词

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📧 联系方式

- **开发者**：Koloyaaa (DornGames)
- **邮箱**：dorngames@163.com
- **官网**：https://dorngames.gamer.gd

## 🙏 致谢

- Wordle 游戏的原始概念
- 法语词典数据来源
- 所有用户的支持和反馈

---

**© 2026 FrWordle · Koloyaaa (DornGames) · Tous droits réservés**
