// server/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('开始填充数据库...');

  // 1. 创建测试用户
  const users = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        username: `user${i}`,
        email: `user${i}@test.com`,
        password: await hashPassword('password123'),
        bio: `我是测试用户${i}`,
      },
    });
    users.push(user);
    console.log(`创建用户: ${user.username}`);
  }

  // 2. 创建测试帖子
  const posts = [];
  const tags = ['游戏攻略', '新闻资讯', '技术讨论', '玩家交流', '赛事新闻'];
  
  for (let i = 1; i <= 20; i++) {
    const tag = tags[Math.floor(Math.random() * tags.length)];
    const post = await prisma.post.create({
      data: {
        title: `测试帖子标题 ${i}`,
        content: `这是测试帖子内容 ${i}，欢迎大家讨论！`,
        tags: `${tag},测试`,  // MySQL不支持数组，改为逗号分隔的字符串
        authorId: users[Math.floor(Math.random() * users.length)].id,
        viewCount: Math.floor(Math.random() * 1000),
        likeCount: Math.floor(Math.random() * 100),
        commentCount: Math.floor(Math.random() * 50),
      },
    });
    posts.push(post);
    console.log(`创建帖子: ${post.title}`);
  }

  // 3. 创建测试评论
  for (let i = 1; i <= 50; i++) {
    await prisma.comment.create({
      data: {
        content: `这是第 ${i} 条测试评论`,
        postId: posts[Math.floor(Math.random() * posts.length)].id,
        authorId: users[Math.floor(Math.random() * users.length)].id,
        likeCount: Math.floor(Math.random() * 20),
      },
    });
  }

  // 4. 创建测试新闻
  for (let i = 1; i <= 10; i++) {
    await prisma.news.create({
      data: {
        title: `游戏新闻标题 ${i}`,
        content: `这是游戏新闻内容 ${i}，包含最新的游戏资讯和更新信息。`,
        summary: `新闻摘要 ${i}`,
        tags: '新闻,资讯,游戏',  // 改为字符串
        viewCount: Math.floor(Math.random() * 5000),
        isFeatured: i % 3 === 0,
      },
    });
  }

  console.log('数据库填充完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });