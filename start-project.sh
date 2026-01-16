#!/bin/bash

# 游戏社区平台一键启动脚本
# 用于Git Bash环境
# 作者：[你的名字]
# 创建时间：$(date)

echo "=========================================="
echo "🎮 游戏社区平台 - 一键启动脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目路径
PROJECT_ROOT="/d/Game-community-platform/game-community-platform"
SERVER_DIR="$PROJECT_ROOT/server"
CLIENT_DIR="$PROJECT_ROOT/client"

# 检查目录是否存在
check_directories() {
    echo -e "${BLUE}🔍 检查项目目录...${NC}"
    if [ ! -d "$SERVER_DIR" ]; then
        echo -e "${RED}❌ 找不到server目录: $SERVER_DIR${NC}"
        exit 1
    fi
    if [ ! -d "$CLIENT_DIR" ]; then
        echo -e "${RED}❌ 找不到client目录: $CLIENT_DIR${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ 项目目录检查通过${NC}"
}

# 检查端口占用
check_ports() {
    echo -e "${BLUE}🔍 检查端口占用...${NC}"
    
    # 检查3000端口（后端）
    if netstat -ano | grep -q ":3000.*LISTEN"; then
        echo -e "${YELLOW}⚠️  端口3000已被占用（后端）${NC}"
        read -p "是否强制停止占用3000端口的进程？(y/n): " kill_3000
        if [ "$kill_3000" = "y" ]; then
            PID=$(netstat -ano | grep ":3000.*LISTEN" | awk '{print $5}' | head -1)
            taskkill //F //PID $PID
            echo -e "${GREEN}✅ 已停止进程: $PID${NC}"
            sleep 2
        fi
    fi
    
    # 检查5173端口（前端）
    if netstat -ano | grep -q ":5173.*LISTEN"; then
        echo -e "${YELLOW}⚠️  端口5173已被占用（前端）${NC}"
        read -p "是否强制停止占用5173端口的进程？(y/n): " kill_5173
        if [ "$kill_5173" = "y" ]; then
            PID=$(netstat -ano | grep ":5173.*LISTEN" | awk '{print $5}' | head -1)
            taskkill //F //PID $PID
            echo -e "${GREEN}✅ 已停止进程: $PID${NC}"
            sleep 2
        fi
    fi
    
    echo -e "${GREEN}✅ 端口检查完成${NC}"
}

# 启动MySQL
start_mysql() {
    echo -e "${BLUE}🔧 启动MySQL服务...${NC}"
    
    # 检查MySQL是否已运行
    if sc query MySQL80 | grep -q "RUNNING"; then
        echo -e "${GREEN}✅ MySQL已在运行${NC}"
    else
        echo -e "${YELLOW}⏳ 正在启动MySQL...${NC}"
        
        # 尝试以管理员权限启动
        if net start MySQL80 2>/dev/null; then
            echo -e "${GREEN}✅ MySQL启动成功${NC}"
        else
            echo -e "${RED}❌ MySQL启动失败${NC}"
            echo -e "${YELLOW}请手动以管理员身份运行: net start MySQL80${NC}"
            read -p "是否继续？(y/n): " continue_without_mysql
            if [ "$continue_without_mysql" != "y" ]; then
                exit 1
            fi
        fi
    fi
}

# 启动Docker服务（如果使用）
start_docker() {
    echo -e "${BLUE}🐳 检查Docker服务...${NC}"
    
    if docker --version 2>/dev/null; then
        echo -e "${GREEN}✅ Docker已安装${NC}"
        
        # 检查Docker是否运行
        if docker ps 2>/dev/null; then
            echo -e "${GREEN}✅ Docker已在运行${NC}"
            
            # 启动PostgreSQL和Redis（如果需要）
            if [ -f "docker/docker-compose.yml" ]; then
                echo -e "${BLUE}🐳 启动Docker容器（PostgreSQL + Redis）...${NC}"
                docker-compose -f docker/docker-compose.yml up -d postgres redis
                echo -e "${GREEN}✅ Docker容器启动完成${NC}"
            else
                echo -e "${YELLOW}⚠️  未找到docker-compose.yml文件${NC}"
            fi
        else
            echo -e "${RED}❌ Docker未运行${NC}"
            echo -e "${YELLOW}请手动启动Docker Desktop${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Docker未安装，跳过容器启动${NC}"
    fi
}

# 启动后端服务器
start_backend() {
    echo -e "${BLUE}⚙️  启动后端服务器（端口:3000）...${NC}"
    cd "$SERVER_DIR"
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 安装后端依赖...${NC}"
        npm install
    fi
    
    # 启动后端（在新标签页中）
    echo -e "${GREEN}🚀 启动后端服务...${NC}"
    start bash -c "cd \"$SERVER_DIR\" && echo '后端日志:' && npm run dev"
    
    # 等待后端启动
    echo -e "${YELLOW}⏳ 等待后端启动（5秒）...${NC}"
    sleep 5
    
    # 测试后端连接
    if curl -s http://localhost:3000/health > /dev/null; then
        echo -e "${GREEN}✅ 后端启动成功！${NC}"
    else
        echo -e "${RED}❌ 后端启动失败，请检查${NC}"
    fi
}

# 启动前端服务器
start_frontend() {
    echo -e "${BLUE}🎨 启动前端服务器（端口:5173）...${NC}"
    cd "$CLIENT_DIR"
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 安装前端依赖...${NC}"
        npm install
    fi
    
    # 启动前端（在新标签页中）
    echo -e "${GREEN}🚀 启动前端服务...${NC}"
    start bash -c "cd \"$CLIENT_DIR\" && echo '前端日志:' && npm run dev"
    
    # 等待前端启动
    echo -e "${YELLOW}⏳ 等待前端启动（3秒）...${NC}"
    sleep 3
}

# 启动Prisma Studio（可选）
start_prisma_studio() {
    read -p "是否启动Prisma Studio（数据库管理）？(y/n): " start_prisma
    if [ "$start_prisma" = "y" ]; then
        echo -e "${BLUE}📊 启动Prisma Studio（端口:5555）...${NC}"
        cd "$SERVER_DIR"
        start bash -c "cd \"$SERVER_DIR\" && echo 'Prisma Studio日志:' && npx prisma studio"
        echo -e "${GREEN}✅ Prisma Studio启动中...${NC}"
    fi
}

# 显示启动结果
show_result() {
    echo ""
    echo "=========================================="
    echo -e "${GREEN}🎉 所有服务启动完成！${NC}"
    echo "=========================================="
    echo ""
    echo -e "${BLUE}📊 服务状态:${NC}"
    echo -e "  ✅ 后端API:  ${GREEN}http://localhost:3000${NC}"
    echo -e "  ✅ 前端界面: ${GREEN}http://localhost:5173${NC}"
    echo -e "  ✅ 健康检查: ${GREEN}http://localhost:3000/health${NC}"
    echo -e "  ✅ 数据库测试: ${GREEN}http://localhost:3000/api/test-db${NC}"
    echo ""
    echo -e "${YELLOW}📋 启动的服务:${NC}"
    echo "  1. MySQL数据库 (3306端口)"
    echo "  2. 后端服务器 (3000端口)"
    echo "  3. 前端服务器 (5173端口)"
    [ "$start_prisma" = "y" ] && echo "  4. Prisma Studio (5555端口)"
    
    echo ""
    echo -e "${BLUE}🔧 开发工具:${NC}"
    echo "  • 查看后端日志: 3000端口标签页"
    echo "  • 查看前端日志: 5173端口标签页"
    echo "  • 数据库管理: http://localhost:5555 (如已启动)"
    echo ""
    echo -e "${YELLOW}⚠️  注意:${NC}"
    echo "  • 关闭所有服务: 按Ctrl+C停止每个标签页"
    echo "  • 或运行 stop-project.sh 停止所有服务"
    echo ""
    echo "=========================================="
}

# 主函数
main() {
    echo -e "${GREEN}开始启动游戏社区平台...${NC}"
    echo ""
    
    # 执行步骤
    check_directories
    check_ports
    start_mysql
    start_docker
    start_backend
    start_frontend
    start_prisma_studio
    show_result
}

# 运行主函数
main