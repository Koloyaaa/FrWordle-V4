# 1. 进入项目目录
cd "c:\Users\70495\Desktop\Git Repositories\FrWordles\FrWordle - V4\FrWordle-V4"

# 2. 配置 Git 用户信息
git config --global user.name "Koloyaaa"
git config --global user.email "yakamozzz@sjtu.edu.cn"

# 3. 检查并移除现有的远程仓库
if (git remote | Select-String -Pattern "^origin$") {
    git remote remove origin
}

# 4. 添加 HTTPS 方式的远程仓库
git remote add origin https://github.com/Koloyaaa/FrWordle-V4.git

# 5. 先拉取远程仓库的文件（避免冲突）
git pull origin main --allow-unrelated-histories

# 6. 添加所有文件到暂存区
git add .

# 7. 检查是否有更改需要提交
if (git status --porcelain) {
    git commit -m "概述
代码清理与重构。

新增文件列表
- 无

修改文件列表
- css.css - 删除重复的.key-active定义，优化CSS结构
- index.html - 移除难度按钮和旧词典脚本引用
- js.js - 重写词典加载逻辑，使用JSON格式和fetch API

删除文件列表
- 无"
}

# 8. 推送到远程仓库
git push -u origin main
