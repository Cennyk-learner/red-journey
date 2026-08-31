# 脱敏与发布说明

本仓库可公开至 GitHub。提交前请确认以下内容。

## 不应进入仓库的内容

| 类型 | 处理方式 |
|------|----------|
| 本机绝对路径 | 脚本统一使用 `scripts/_paths.py` + 环境变量 |
| `.env`、API 密钥、令牌 | 已加入 `.gitignore` |
| 原始未处理成员单人照 | 放在 `scripts/seed/member-photos/`（已 gitignore） |
| 仓库外 `../素材/` 文件夹 | 不纳入 git，仅本地导入用 |
| `.next/`、`node_modules/` | 已 gitignore |

## 环境变量

| 变量 | 默认值 | 用途 |
|------|--------|------|
| `RED_JOURNEY_ASSETS` | `../素材` | 实拍原图目录 |
| `RED_JOURNEY_MEMBER_PHOTOS` | `scripts/seed/member-photos` | 成员头像导入源 |

## 可公开的内容

- 团队姓名、角色：与已发布的微信公众号报道一致
- `public/team/avatars/`：已裁剪的团队展示头像
- 景点数据、媒体链接：公开宣传用途

## 提交前自检

```bash
# 检查是否还有本机路径
rg "Users\\\\|Desktop\\\\|\\.cursor" --glob '!node_modules' --glob '!.next'

# 确认无密钥
rg "(api[_-]?key|secret|token|password)" -i --glob '!node_modules'
```

## 图片版权

部分城市/景点图来自 Wikimedia Commons（CC BY-SA），详见 `src/data/cities.ts` 注释。实拍图版权归实践团队所有。
