import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import personasRouter from './routes/personas.js';
import sandboxRouter from './routes/sandbox.js';
import probeRouter from './routes/probe.js';
import strategyRouter from './routes/strategy.js';
import insightsRouter from './routes/insights.js';
import captureRouter from './routes/capture.js';
import benchmarksRouter from './routes/benchmarks.js';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
    origin: (origin, callback) => {
        // 允许无 origin 的请求（如 curl、移动端等）
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS 策略拒绝来源: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 基础健康检查接口
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: '灵犀镜像 (MirrorLogic) 核心中枢运行正常',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/personas', personasRouter);
app.use('/api/sandbox', sandboxRouter);
app.use('/api/probe', probeRouter);
app.use('/api/strategy', strategyRouter);
app.use('/api/insights', insightsRouter);
app.use('/api/capture', captureRouter);
app.use('/api/benchmarks', benchmarksRouter);

app.listen(PORT, () => {
    console.log(`[服务启动] PLS 中间层已在端口 ${PORT} 启动`);
});
