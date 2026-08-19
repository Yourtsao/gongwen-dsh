// gongwen-dsh DSH 插件 Host (v1.0.0)
// (c) 2026 Yourtsao  MIT License
//
// 分层：
// - scripts/register.mjs：注册/验证码/状态查询（纯 node）
// - 本文件：插件 Host——安装信息打印 + 配置引导 + 状态提示
//   * apply() 生命周期（ctx.effect 可逆）
//   * systemPrompt section 注入 AI 工作指引
//
// 计费规则（服务端强制执行，客户端只展示）：
//   免费 10 次 / 7 天；付费 2元/次 或 399元/包年；终身名额前 10 个 399 元（剩 6 个）
// 0 知识库：全部知识仅在线 API 调取（/consume + /search），包内无任何知识内容

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SKILL_DIR = path.resolve(__dirname, "..", "skills", "gongwen-writting");
const CONFIG_PATH = path.join(SKILL_DIR, "config.json");

const GONGWEN_GUIDANCE = `本机已安装 gongwen-dsh 插件（智能公文写作，国企38类文种）。
计费规则：① 免费 10 次骨架调用（注册后 7 天内有效）；② 2元/次按次购买；③ 399元/包年无限使用；④ 终身名额前 10 个 399 元（当前剩余 6 个）。
知识库 0 打包：所有写作知识仅通过 https://gongwen-api.xyz 在线调取（/consume 取 token → /search 带 token 获取骨架），本地无任何知识文件。
付款：/api/pay/create 创建订单（plan=yearly|per_call）→ /api/pay/qrcode 返回微信付款二维码图片 → 展示给用户扫码 → /api/pay/status 轮询确认。`;

function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    return {};
  }
}

export async function apply(ctx) {
  // systemPrompt 注入 AI 工作指引
  ctx.systemPrompt.push({ text: GONGWEN_GUIDANCE, position: "prepend" });

  const cfg = readConfig();
  if (!cfg.USER_TOKEN) {
    // 未注册引导（不打日志不弹窗，仅提示）
    ctx.systemPrompt.push({
      text: "⚠️ 公文写作尚未注册：用户首次使用时，向用户索取邮箱，运行 node scripts/register.mjs register --email <邮箱> 发送验证码，再 verify 完成注册（注册即送 10 次免费额度，7 天有效）。",
      position: "prepend",
    });
  }

  return {
    async dispose() {
      // 可逆清理：无持久副作用，无需处理
    },
  };
}

export const name = "gongwen-dsh";
export const version = "1.0.0";
