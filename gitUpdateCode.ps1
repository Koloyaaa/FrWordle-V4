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
已成功创建 README.md 项目文档。

新增文件列表
- README.md - 新增项目文档
  - 项目介绍和特性说明
  - 游戏规则和使用方法
  - 技术栈和项目结构
  - 词典处理指南
  - 贡献指南和联系方式
修改文件列表
- README.md - 更新项目文档（从空文件更新为完整文档）
删除文件列表
- css/all.min.css - 删除（不再使用）
- css/index.css - 删除（不再使用）
- css/tailwind.css - 删除（不再使用）
- js/frdic/BFSUFrancais_1.js - 删除（不再使用）
- js/frdic/BFSUFrancais_2.js - 删除（不再使用）
- js/frdic/BFSUFrancais_3.js - 删除（不再使用）
- js/frdic/BFSUFrancais_4.js - 删除（不再使用）
- js/frdic/BFSUFrancais_5.js - 删除（不再使用）
- js/frdic/Dictionnaire.js - 删除（不再使用）
- js/index.js - 删除（不再使用）"
}

# 8. 推送到远程仓库
git push -u origin main
