// server/scripts/benchmark.js
import autocannon from "autocannon";
import { writeFileSync } from "fs";

// 基准测试配置
const baseUrl = "http://localhost:3000";

const scenarios = [
  {
    name: "健康检查端点",
    url: `${baseUrl}/health`,
    method: "GET",
    connections: 10,
    duration: 10,
  },
  {
    name: "获取帖子列表",
    url: `${baseUrl}/api/posts`,
    method: "GET",
    connections: 20,
    duration: 15,
  },
  {
    name: "用户登录压力测试",
    url: `${baseUrl}/api/auth/login`,
    method: "POST",
    connections: 5,
    duration: 10,
    body: JSON.stringify({
      username: "testuser",
      password: "password123",
    }),
    headers: {
      "Content-Type": "application/json",
    },
  },
];

async function runBenchmark() {
  const results = [];

  for (const scenario of scenarios) {
    console.log(`\n🚀 测试场景: ${scenario.name}`);

    const result = await autocannon({
      url: scenario.url,
      method: scenario.method,
      connections: scenario.connections,
      duration: scenario.duration,
      body: scenario.body,
      headers: scenario.headers,
    });

    results.push({
      scenario: scenario.name,
      ...result,
    });

    console.log(`✅ 完成: ${scenario.name}`);
    console.log(`   请求/秒: ${result.requests.average}`);
    console.log(`   延迟(ms): ${result.latency.average}`);
    console.log(`   错误率: ${result.errors}`);
  }

  // 保存结果
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `benchmark-${timestamp}.json`;
  writeFileSync(filename, JSON.stringify(results, null, 2));

  console.log(`\n📊 基准测试结果已保存到: ${filename}`);
}

runBenchmark().catch(console.error);
