#!/bin/bash

echo "--- 检查环境 ---"
echo ""
# echo "# 检查pm2"
# pm2 -ls
# echo ""
echo "# 检查nodemon"
echo "USER      PID"
ps -ef | grep nodemon
echo ""
echo "# 检查端口占用"
echo "## 3100"
lsof -i:3100
echo "## 5700"
lsof -i:5700
echo ""
echo "(如果遇到端口已占用等报错，请kill以上进程后重试)"
echo "--- 检查完毕 ---"