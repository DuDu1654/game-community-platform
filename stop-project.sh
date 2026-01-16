#!/bin/bash

# 游戏社区平台一键停止脚本

echo "=========================================="
echo "🛑 游戏社区平台 - 一键停止脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 停止Node.js进程
stop_node_processes() {
    echo -e "${BLUE}🛑 停止Node.js进程...${NC}"
    
    # 停止前端（5173端口）
    echo -e "${YELLOW}停止前端服务器（5173端口）...${NC}"
    taskkill //F //IM node.exe 2>/dev/null | grep -v "INFO"
    
    # 等待
    sleep 2
    echo -e "${GREEN}✅ Node.js进程已停止${NC}"
}

# 停止Docker容器
stop_docker_containers() {
    echo -e "${BLUE}🐳 停止Docker容器...${NC}"
    
    if docker --version 2>/dev/null; then
        if [ -f "docker/docker-compose.yml" ]; then
            echo -e "${YELLOW}停止PostgreSQL和Redis容器...${NC}"
            docker-compose -f docker/docker-compose.yml down
            echo -e "${GREEN}✅ Docker容器已停止${NC}"
        fi
    fi
}

# 停止MySQL（可选）
stop_mysql() {
    read -p "是否停止MySQL服务？(y/n): " stop_mysql
    if [ "$stop_mysql" = "y" ]; then
        echo -e "${BLUE}🛑 停止MySQL服务...${NC}"
        net stop MySQL80
        echo -e "${GREEN}✅ MySQL已停止${NC}"
    else
        echo -e "${YELLOW}⚠️  MySQL保持运行${NC}"
    fi
}

# 显示停止结果
show_stop_result() {
    echo ""
    echo "=========================================="
    echo -e "${GREEN}🎉 所有服务已停止！${NC}"
    echo "=========================================="
    echo ""
    echo -e "${YELLOW}📋 已停止的服务:${NC}"
    echo "  1. 前端服务器 (5173端口)"
    echo "  2. 后端服务器 (3000端口)"
    echo "  3. Docker容器 (如已启动)"
    echo ""
    echo -e "${GREEN}💤 现在可以安全关闭电脑了${NC}"
    echo ""
    echo "=========================================="
}

# 主函数
main() {
    stop_node_processes
    stop_docker_containers
    stop_mysql
    show_stop_result
    
    # 等待用户确认
    read -p "按Enter键退出..."
}

# 运行主函数
mains