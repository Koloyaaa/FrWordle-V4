# 1. 进入项目目录
cd c:\Users\70495\Desktop\Git Repositories\FrWordles\FrWordle - V4\FrWordle-V4

# 2. 配置 Git 用户信息
git config --global user.name "Koloyaaa"
git config --global user.email "yakamozzz@sjtu.edu.cn"

# 3. 移除现有的远程仓库
git remote remove origin

# 4. 添加 HTTPS 方式的远程仓库
git remote add origin https://github.com/Koloyaaa/FrWordle-V4.git

# 5. 先拉取远程仓库的文件（避免冲突）
git pull origin main --allow-unrelated-histories

# 6. 添加所有文件到暂存区
git add .

# 7. 提交更改
git commit -m "请输入文本"

# 8. 推送到远程仓库
git push -u origin main
