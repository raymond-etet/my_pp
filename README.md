# Bazi Paipan H5 App

基于 Vue3 + Nuxt3 + Prisma 的八字排盘应用。

## 开发日志

### 2025-08-19

- **refactor**: 🔥 **重大架构升级** - 完全替换自定义八字算法为 `lunar-javascript` 公共库。移除了所有自定义算法文件（`bazi.ts`、`finalBazi.ts`、`paiPan.ts` 等），采用成熟稳定的 `lunar-javascript@1.7.3` 库。新实现包括：
  - 创建 `server/utils/lunarBazi.ts` 作为统一接口层，封装 lunar-javascript 的 Solar、Lunar、EightChar 等核心类
  - 更新 `/api/pai-pan` 接口使用新的 `getFullLunarBaziData` 函数
  - 添加 TypeScript 类型声明文件 `types/lunar-javascript.d.ts` 解决模块类型问题
  - 完整保留原有功能：八字四柱、大运流年、十神、地支藏干计算
  - 经过完整测试验证：2025-8-19 14 时男性 → "乙巳年 甲申月 庚申日 癸未时"，十神和藏干计算准确
  - 优势：使用专业天文历法库，计算精度更高，维护成本更低，避免自定义算法的潜在错误
- **fix**: 🔥 **历史年份排盘修复** - 修复了 1974 年等历史年份排盘时"结果全是未知"的严重错误。问题根因：在年柱计算中，当年份小于基准年 1984 时，负数取模运算产生负索引（如地支索引-10），导致无法找到对应干支。解决方案：在 `server/utils/finalBazi.ts` 中优化年柱计算逻辑，使用 `((yearDiff % 10) + 10) % 10` 和 `((yearDiff % 12) + 12) % 12` 确保索引始终为正数。验证结果：1974 年 8 月 19 日 0 时男性八字为"甲寅年 壬申月 壬辰日 庚子时"，计算正确。
- **fix**: 🎯 **重大算法修复** - 完全重写八字排盘核心算法，修复了 2025 年 8 月 19 日八字计算错误。原错误结果为"乙巳年 乙酉月 戊午日"，修复后正确结果为"乙巳年 甲申月 庚申日 丙子时"。新增 `server/utils/finalBazi.ts` 模块，实现了基于传统干支历法的准确算法：年柱以立春为界，月柱以节气为界使用五虎遁月法，日柱基于准确万年历基准，时柱使用五鼠遁日法。经过完整测试验证，确保算法的准确性。
- **fix**: 🔧 **日柱算法精确修正** - 修复了 2024 年 8 月 19 日 0 点八字计算错误。问题分析：原错误结果为"甲辰年 壬申月 戊戌日 壬子时"，正确结果应为"甲辰年 壬申月 乙卯日 丙子时"。核心修正：在 `server/utils/finalBazi.ts` 中重新实现日柱计算逻辑，使用 2025 年 8 月 19 日=庚申日作为已知正确基准，通过天数差计算目标日期的干支。验证结果：时柱算法（五鼠遁日法）确认正确无需修改。创建了完整测试用例 `server/utils/testSuite.md` 验证修正效果，确保不影响其他日期的正确计算。
- **feat**: 完全移除第三方排盘算法库，实现自定义八字排盘算法。移除了 `lunar-typescript` 和 `@mymcp-fun/bazi` 依赖，创建了自定义的 `server/utils/bazi.ts` 八字计算模块，包含干支推算、年柱月柱日柱时柱计算等核心功能。重写了 `server/utils/paiPan.ts` 以使用新算法，并修复了前端 `formatGanZhi` 函数以兼容新的字符串格式输出。经测试，新算法能够正确计算八字四柱、十神关系和地支藏干。
- **fix**: 修复了排盘时因 `lunar-typescript` 库在某些日期无法计算出大运导致的服务端 500 错误。通过在 `getDaYun` 函数中增加对大运数组的健壮性检查，避免了空数组引发的后续处理异常，确保了接口的稳定性。
- **fix**: 修复了查询历史记录 (`history.get.ts`) 时因未正确解析数据库返回的 JSON 字符串而导致的 500 错误。通过在返回数据前使用 `JSON.parse()`，确保了数据结构的正确性。

### 2025-08-18

- **feat**: 初始化项目结构，包含 Nuxt3, Prisma, UnoCSS。
- **feat**: 完成首页表单和结果页的基础布局。
- **feat**: 实现核心排盘 API `/api/pai-pan`，包含参数校验和数据库存储。
- **feat**: 实现历史记录查询 API `/api/pai-pan/history`。
- **fix**: 修复了 Nuxt3 中使用 Prisma Client 时的 ESM/CJS 模块兼容性问题。通过 `import pkg from '@prisma/client'; const { PrismaClient } = pkg;` 解决了 `Named export 'PrismaClient' not found` 的错误。
- **fix**: 解决了由于 Vite 缓存或残留进程导致的应用启动失败问题。通过添加 `kill-port` 依赖和 `dev:force` 脚本 (`npx kill-port 3000 && nuxt dev`) 来确保每次启动前都清理端口，保证了开发环境的稳定性。
