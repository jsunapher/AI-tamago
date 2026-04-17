const http = require("http");
const { exec } = require("child_process");
const path = require("path");

const PORT = 4000;
const HOST = "0.0.0.0";
const PROJECT_ROOT = path.resolve(__dirname, "..");
const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN || "";
const GIT_PULL_TIMEOUT_MS = 20000;

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function runGitPull(callback) {
  exec(
    "git pull",
    {
      cwd: PROJECT_ROOT,
      timeout: GIT_PULL_TIMEOUT_MS,
      env: {
        ...process.env,
        GIT_TERMINAL_PROMPT: "0"
      }
    },
    (error, stdout, stderr) => {
    if (error) {
      callback({
        success: false,
        message: "git pull 执行失败",
        error: error.message,
        stdout,
        stderr
      });
      return;
    }

    callback({
      success: true,
      message: "git pull 执行成功",
      stdout,
      stderr
    });
    }
  );
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, { ok: true, service: "webhook-backend" });
    return;
  }

  if (req.method === "POST" && req.url === "/webhook/pull") {
    if (WEBHOOK_TOKEN) {
      const token = req.headers["x-webhook-token"];
      if (token !== WEBHOOK_TOKEN) {
        sendJson(res, 401, { success: false, message: "token 无效" });
        return;
      }
    }

    runGitPull((result) => {
      sendJson(res, result.success ? 200 : 500, result);
    });
    return;
  }

  sendJson(res, 404, { success: false, message: "接口不存在" });
});

server.listen(PORT, HOST, () => {
  console.log(`Webhook 服务已启动: http://${HOST}:${PORT}`);
  console.log(`项目根目录: ${PROJECT_ROOT}`);
});
