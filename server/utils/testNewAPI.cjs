// server/utils/testNewAPI.cjs - 测试新的lunar-javascript API实现

const { testLunarBaziCalculation } = require("./lunarBazi.ts");

/**
 * 测试API调用（模拟前端请求）
 */
async function testAPICall() {
  console.log("=== 测试新的API实现 ===");

  const testCases = [
    { year: 2025, month: 8, day: 19, hour: 14, gender: "男" },
    { year: 1974, month: 4, day: 26, hour: 10, gender: "女" },
    { year: 1995, month: 6, day: 15, hour: 0, gender: "男" }, // 时辰未知
  ];

  for (const testCase of testCases) {
    console.log(
      `\n--- 测试案例: ${testCase.year}-${testCase.month}-${testCase.day} ${testCase.hour}时 ${testCase.gender} ---`
    );

    try {
      // 模拟POST请求到API
      const response = await fetch("http://localhost:3000/api/pai-pan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testCase),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("API响应成功:");
        console.log("- ID:", data.id);
        console.log("- 八字:", data.bazi);
        console.log("- 大运数量:", data.daYun?.length || 0);
        console.log("- 十神:", data.shiShen);
        console.log("- 藏干:", data.cangGan);
      } else {
        console.log("API响应失败:", response.status, response.statusText);
        const errorText = await response.text();
        console.log("错误信息:", errorText);
      }
    } catch (error) {
      console.error("请求失败:", error.message);
    }
  }
}

/**
 * 测试直接函数调用
 */
function testDirectCall() {
  console.log("\n=== 测试直接函数调用 ===");

  const testCases = [
    { year: 2025, month: 8, day: 19, hour: 14, gender: "男" },
    { year: 1974, month: 4, day: 26, hour: 10, gender: "女" },
    { year: 1995, month: 6, day: 15, hour: 0, gender: "男" },
  ];

  try {
    // 由于是 .cjs 文件，需要特殊处理 ES module 导入
    console.log("直接函数调用测试需要在ES模块环境中运行");
    console.log("建议通过API测试来验证功能");
  } catch (error) {
    console.error("直接调用测试失败:", error);
  }
}

// 检查服务器是否运行
async function checkServerStatus() {
  try {
    const response = await fetch("http://localhost:3000/api/pai-pan", {
      method: "GET",
    });
    console.log("服务器状态检查:", response.status);
    return true;
  } catch (error) {
    console.log("服务器未运行或不可访问:", error.message);
    return false;
  }
}

// 执行测试
async function runTests() {
  console.log("开始测试lunar-javascript新实现...\n");

  // 检查服务器状态
  const serverRunning = await checkServerStatus();

  if (serverRunning) {
    await testAPICall();
  } else {
    console.log("请确保开发服务器正在运行：pnpm dev");
  }

  testDirectCall();
}

// 运行测试
runTests().catch(console.error);
