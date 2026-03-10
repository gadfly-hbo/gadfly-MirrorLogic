# GitHub 代码推送：填坑复盘与标准操作手册 (SOP)

## 一、 灾难复盘 (为什么之前一直失败？)

在昨天向 GitHub 推送代码时，我们遇到了极其顽固的网络和认证双重阻击，主要经历了以下几个深坑：

1. **第一重坑：本地网络 SSL 握手失败 (`SSL/TLS connection failed`)**
   - **症状**：挂载了本地节点工具（如 Clash 7890 端口），但浏览器能上 GitHub，Git 命令却死死卡住。
   - **原因**：Windows 自带的 `schannel` (安全通道) 或 `OpenSSL` 在处理命令行流量时，如果未显式告诉 Git 走 7890 端口代理，它会直接走运营商直连，导致被墙；同时，代理节点频繁的 TLS 握手特征可能会被阻断，出现 `unexpected eof while reading`。

2. **第二重坑：凭据管理器冲突与设备授权假象**
   - **症状**：浏览器里虽然弹出了授权成功的界面 (Device Activation Congrats)，但底层 Git 命令行依然没有获取到真正的传输令牌。

3. **第三重坑：Fine-grained Token 授权范围过窄 (`403 Forbidden`)**
   - **症状**：换成了最新的细粒度 Token (Fine-grained PAT)，结果遭遇 403 拒绝访问。
   - **原因**：在生成该 Token 时，默认对 Repository 的 `Contents` 选项只有 "Read" (只读) 权限，没有开启 "Read and write" 权限，导致能够拉取却无法推送。

---

## 二、 成功破局路径 (标准操作手册 SOP)

结合您的网络环境，请在以后开设新项目并需要推送至 GitHub 时，**彻底放弃常规的 `git push` 和弹窗登录**，直接按照以下“暴力且100%成功”的方法操作。

### 第一步：准备好你的万能钥匙 (生成 Classic Token)
*不要使用 Beta 版的细粒度 Token，直接使用经典版。*
1. 登录 GitHub，点击右上角头像 -> `Settings` -> 左下角 `Developer settings` -> `Personal access tokens` -> **`Tokens (classic)`**。
2. 点击 `Generate new token (classic)`。
3. 名字随便起，有效期可以选永不过期 (No expiration) 或 1 年。
4. **最关键的一步**：在权限复选框中，直接勾选整个 **`repo`** 大项（包含所有读写权限）。
5. 点击生成，并**妥善保存这串以 `ghp_` 开头的字符串**。

### 第二步：配置 Git 网络通道 (告诉 Git 走代理)
打开命令行窗口，进入您的项目目录，执行以下命令（假设您的本地代理是 7890 端口，若为别的请替换）：

```powershell
# 1. 关闭 SSL 严格校验（防止代理节点证书报错）
git config --global http.sslVerify false
git config --global https.sslVerify false

# 2. 强制 Git 的流量走本地代理软件
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890
```

*提示：如果要在系统层面取消代理，可以随时运行 `git config --global --unset http.proxy`。*

### 第三步：使用免密 URL 进行极速推送 (终极杀招)
不要等待控制台弹窗，直接把生成的 Token 嵌在代码仓库地址里，这是针对各种奇怪鉴权环境最稳妥的方式。

```powershell
# 1. 替换原本的 Origin 地址为携带 Token 的地址
# 格式：https://<你的ghp_Token>@github.com/<你的用户名>/<仓库名>.git

git remote set-url origin https://ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX@github.com/gadfly-hbo/gadfly-MirrorLogic.git

# 2. 直接推送！(由于 URL 里带了密码，系统不会再弹窗打断，直接连接)
git push -u origin main
```

> **最佳实践总结：** 未来任何新项目，只要网络报错，**设代理由端口 + 关 SSL + 嵌 Token 的 URL** 这三招组合拳即可当场秒杀所有的推送障碍。
