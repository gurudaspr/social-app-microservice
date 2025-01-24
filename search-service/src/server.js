import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import Redis from 'ioredis';
import cors from 'cors';
import helmet from 'helmet';
import errorHandler from './middlewares/errorHandler.js';
import logger from './utils/logger.js';
import { connectRabbitMQ, consumeEvent } from './utils/rabbitmq.js';
import searchRoutes from './routes/search.routes.js';
import { handlePostCreated, handlePostDeleted } from './eventHandlers/search.event.handler.js';

const app = express();
const PORT = process.env.PORT || 3004;

//connect to mongodb
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to mongodb"))
  .catch((e) => logger.error("Mongo connection error", e));

//middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

app.use('/api/search', searchRoutes);

app.use(errorHandler);

async function startServer() {
  try {
    await connectRabbitMQ();

    //consume post.created event
    await consumeEvent('post.created',handlePostCreated);
    await consumeEvent('post.delete',handlePostDeleted);


    app.listen(PORT, () => {
      logger.info(`Search service running on port ${PORT}`);
    });
  }
  catch (error) {
    logger.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
}

startServer();
//unhandled promise rejection

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});