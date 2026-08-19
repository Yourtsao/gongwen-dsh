#!/usr/bin/env node
// 智能公文写作 DSH 插件：注册/状态查询辅助（纯 node，内置 fetch，无三方依赖）
//   node register.mjs register --email <e>          # 发送验证码
//   node register.mjs verify --email <e> --code <c> # 验证码注册，返回 USER_TOKEN
//   node register.mjs status --email <e>            # 查询配额/付费状态
// 用法：config.json 或环境变量 GONGWEN_URL 覆盖网关地址；注册成功把 USER_TOKEN 写入 skills/gongwen-writting/config.json

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.resolve(__dirname, "..", "skills", "gongwen-writting");
const CONFIG_PATH = path.join(SKILL_DIR, "config.json");

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function saveConfig(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), "utf-8");
}

function baseUrl() {
  const cfg = loadConfig();
  return (process.env.GONGWEN_URL || cfg.GATEWAY_URL || "https://gongwen-api.xyz").replace(/\/+$/, "");
}

async function post(url, payload, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = "Bearer " + token;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 30000);
  try {
    const r = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload), signal: ctl.signal });
    const text = await r.text();
    try { return JSON.parse(text); }
    catch { return { code: "BAD_RESPONSE", message: "非JSON响应: " + text.slice(0, 200) }; }
  } catch (e) {
    return { code: "NETWORK_ERROR", message: "请求异常: " + (e && e.message ? e.message : String(e)) };
  } finally { clearTimeout(timer); }
}

async function get(url, token) {
  const headers = {};
  if (token) headers["Authorization"] = "Bearer " + token;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 30000);
  try {
    const r = await fetch(url, { headers, signal: ctl.signal });
    const text = await r.text();
    try { return JSON.parse(text); }
    catch { return { code: "BAD_RESPONSE", message: text.slice(0, 200) }; }
  } catch (e) {
    return { code: "NETWORK_ERROR", message: "请求异常: " + (e && e.message ? e.message : String(e)) };
  } finally { clearTimeout(timer); }
}

const [,, action, ...rest] = process.argv;
const args = {};
for (let i = 0; i < rest.length; i += 2) {
  if (rest[i].startsWith("--")) args[rest[i].slice(2)] = rest[i + 1] || "";
}

async function main() {
  const base = baseUrl();
  const email = String(args.email || "").trim().toLowerCase();
  if (!email) {
    console.log("用法: node register.mjs <register|verify|status> --email xxx@qq.com [--code 123456]");
    return;
  }
  if (action === "register") {
    const r = await post(base + "/register/code", { email });
    console.log(JSON.stringify(r, null, 2));
    if (r.code === "SUCCESS") {
      console.log("验证码已发送，请查收邮箱（可能进垃圾箱）。5分钟内输入：node register.mjs verify --email " + email + " --code <验证码>");
    }
  } else if (action === "verify") {
    const r = await post(base + "/register", { email, code: args.code || "" });
    console.log(JSON.stringify(r, null, 2));
    if (r.code === "SUCCESS" && r.user_token) {
      const cfg = loadConfig();
      cfg.USER_TOKEN = r.user_token;
      cfg.EMAIL = email;
      saveConfig(cfg);
      console.log("✅ 注册成功，USER_TOKEN 已写入 " + CONFIG_PATH);
      console.log("免费额度: 10次/7天（注册即送，自动生效）");
    }
  } else if (action === "status") {
    const cfg = loadConfig();
    const r = await get(base + "/quota?email=" + encodeURIComponent(email), cfg.USER_TOKEN || undefined);
    console.log(JSON.stringify(r, null, 2));
  } else {
    console.log("未知动作: " + action + "（支持 register / verify / status）");
  }
}

main();
