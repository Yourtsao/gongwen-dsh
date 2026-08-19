# gongwen-dsh — 智能公文写作（DeepSeek Harness 插件）

面向办公室文秘岗位的 AI 公文写作插件，覆盖 38 类常用公文文种（请示、报告、总结、讲话稿、纪要、通知、函、意见、通报、批复、决定、方案、计划、述职、调研、党课、简报、致辞、主持词、贺信、倡议、申请、检讨、制度等）。

## 特点

- **0 知识库**：全部写作知识通过在线 API 调取，插件包内无任何知识文件
- **GB/T 9704 格式规范**：标题写法、开头结尾、常用句式、排比对仗、版式参数
- **防杜撰机制**：缺失信息一律〔待补〕标注，绝不编造
- **三档计费**（服务端强制执行）：
  - 免费：注册送 **10 次 / 7 天**
  - 按次：**2 元/次**
  - 包年：**399 元/年** 无限使用；首批终身名额 10 个（399 元），当前剩余 6 个

## 安装

```bash
openclaw skills install @yourtsao/gongwen-dsh
# 或 DSH 插件安装：将本目录作为插件加载
```

## 使用

1. 用户提供邮箱 → 运行 `node scripts/register.mjs register --email <邮箱>` 发验证码
2. `node scripts/register.mjs verify --email <邮箱> --code <验证码>` 完成注册（送 10 次免费额度）
3. 说"写一份请示/通知/总结……"，自动走 `/consume` → `/search` 在线取骨架生成

## 付款

微信扫码支付（二维码图片由网关 `/api/pay/qrcode` 实时生成）：
- `2元/次`：plan=per_call
- `399元/年`：plan=yearly
- 终身名额：先到先得（剩 6 个）

## 目录结构

```
gongwen-dsh/
├── package.json            # DSH 插件声明（dsh.bundle.patch）
├── cordis.patch.yml        # 插件挂载层
├── dsh/index.js            # 插件 Host（系统提示注入 + 注册引导）
├── skills/gongwen-writting/
│   ├── SKILL.md            # 技能本体（0 知识库）
│   └── config.json         # GATEWAY_URL / USER_TOKEN（注册后写入）
└── scripts/register.mjs    # 注册/验证码/状态查询
```

## 许可

MIT License。知识库内容著作权归作者所有，仅在线调取，禁止转存传播。
