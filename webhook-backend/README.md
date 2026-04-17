# webhook-backend

用于触发仓库自动 `git pull` 的简易后端服务。

## 启动

```bash
cd webhook-backend
npm start
```

服务会监听 `4000` 端口。

## 接口

- `GET /health`：健康检查
- `POST /webhook/pull`：触发 `git pull`

如果设置了环境变量 `WEBHOOK_TOKEN`，调用 `POST /webhook/pull` 时需要带请求头：

```text
x-webhook-token: <你的token>
```

## curl 示例

```bash
curl -X POST http://127.0.0.1:4000/webhook/pull
```
