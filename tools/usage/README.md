# Morii 站点使用统计接收服务

接收服务统计主动参与的部署站点。部署单独的 Cloudflare Worker，避免把服务端代码放进主题包或博客。

1. 创建一个 D1 数据库，例如 `morii-usage`。在本目录创建 Wrangler 配置，为 `main` 指定 `worker.mjs`，添加 `DB` 绑定并填写数据库名称和 ID。
2. 执行 `npx wrangler d1 execute morii-usage --remote --file=schema.sql` 初始化数据表，再运行 `npx wrangler d1 migrations apply morii-usage --remote`。已有数据库直接执行迁移。设置高熵随机密钥 `MORII_USAGE_SIGNING_KEY` 为 Worker Secret，再部署 Worker。
3. 在维护环境以同一个密钥设置 `MORII_USAGE_SIGNING_KEY`，执行 `node issue-token.cjs <博客正式网址>`，将结果交给自愿参与的站长。令牌仅用于该站点的构建环境。签名密钥只由接收方保管。
4. 将 Worker 的 `/v1/installations` HTTPS 地址放在生产流水线的 `MORII_USAGE_ENDPOINT`，令牌放在私密环境变量 `MORII_USAGE_TOKEN`。`hexo deploy` 完成后会自动上报，其他发布流程可在部署成功后运行 `npx hexo morii:report-usage`。

```json
{
  "name": "morii-usage",
  "main": "worker.mjs",
  "compatibility_date": "2026-11-27",
  "d1_databases": [{
    "binding": "DB",
    "database_name": "morii-usage",
    "database_id": "YOUR_D1_DATABASE_ID"
  }]
}
```

在 Cloudflare 控制台打开 **D1 SQL Database → morii-usage → Console**，执行 `stats.sql` 中的查询。也可在本目录运行 `npx wrangler d1 execute morii-usage --remote --command="$(cat stats.sql)"` 查看累计去重站点数、近 30 天活跃站点数、版本分布，以及按周和按月的新增站点数。周从星期一开始，周与月均按 UTC 划分，只列出有新增记录的时段。

站点按正式网址的主机和子目录做 SHA-256 去重。首次收到新站点时，接收端记录 `first_seen`。重复上报只更新最后上报时间和版本。迁移前的站点继续计入累计站点数，首次上报时间保持未知，并单独显示为 `unknown_first_seen_sites`。

数据表只存站点标识、主题版本、首次和最后上报时间。站点标识在网址已知时可重新计算，应视作去标识化数据。Worker 不提供公开数据查询接口。若站长要求删除，维护者可计算对应站点标识后从 D1 中移除该行。

[Cloudflare D1 部署文档](https://developers.cloudflare.com/d1/get-started/)
