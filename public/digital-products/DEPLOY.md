# 数字产品销售落地页 - 部署说明

## 快速部署（localtunnel 方案）

### 1. 启动本地 HTTP 服务
```bash
cd projects/digital-products/landing-page
npx http-server -p 8080 -c-1 --cors
```

### 2. 创建公网隧道
```bash
npx localtunnel --port 8080
```

隧道创建后会返回类似 `https://xxxxxx.loca.lt` 的公网 URL。
**注意**：首次访问需要点击 `Click to Continue` 按钮（localtunnel 反滥用机制）。

### 3. 访问落地页
将 localtunnel 返回的 URL 分享给用户即可。

---

## GitHub Pages 部署方案（推荐用于长期运营）

### 前提条件
- 安装 Git: https://git-scm.com/download/win
- 拥有 GitHub 账号: https://github.com

### 步骤

```bash
# 1. 进入 landing-page 目录
cd projects/digital-products/landing-page

# 2. 初始化 Git 仓库
git init
git add .
git commit -m "财神数字产品商店"

# 3. 在 GitHub 创建仓库（例如：digital-products-store）

# 4. 推送代码
git remote add origin https://github.com/YOUR_USERNAME/digital-products-store.git
git branch -M main
git push -u origin main

# 5. 在 GitHub 仓库 Settings > Pages 中启用 GitHub Pages
#    Source 选择 main 分支，根目录 /
```

部署成功后会得到 `https://YOUR_USERNAME.github.io/digital-products-store/` 的公网地址。

---

## 文件结构

```
landing-page/
├── index.html              # 销售落地页
├── downloads/              # 产品下载文件
│   ├── AI-Prompt-Bible-v1.pdf
│   ├── business-plan-template.pdf
│   ├── content-calendar-template.pdf
│   ├── ai-money-guide-2026.pdf
│   └── one-person-bundle.zip  # 全套打包
```

---

## 支付方式说明

当前版本采用「直接下载」模式，适合作为产品展示和试用。
如需接入支付，推荐以下方案：

1. **微信/支付宝收款码**：在页面中嵌入收款码图片，用户扫码支付后手动发送产品
2. **面包多/爱发电**：国内数字商品支付平台，自动发货
3. **Stripe/Paddle**：国际用户支付方案
4. **Gumroad/Lemon Squeezy**：数字产品一站式销售平台，自动处理支付+交付

---

## 当前公网地址（localtunnel）

本地启动服务后，使用 localtunnel 获取临时公网地址。
每次启动会生成新的 URL。
