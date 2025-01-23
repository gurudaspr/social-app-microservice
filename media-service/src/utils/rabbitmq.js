import amqplib from 'amqplib';
import logger from './logger.js';

let connection = null;
let channel = null;

const EXCHANGE_NAME = 'facebook_events';

async function connectRabbitMQ() {
    try {
        connection = await amqplib.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: false });
        logger.info('Connected to RabbitMQ');
        return channel;
    } catch (error) {
        logger.error(`Error connecting to RabbitMQ: ${error.message}`);

    }
}

async function publishEvent(routingKey, message) {
    if (!channel) {
        await connectRabbitMQ();
    }
    channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)));
    logger.info(`Published message to RabbitMQ: ${routingKey}`);
}
async function consumeEvent(routingKey, callback) {
    if (!channel) {
        await connectRabbitMQ();
    }
    const queue = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(queue.queue, EXCHANGE_NAME, routingKey);
    channel.consume(queue.queue, (msg) => {
        if (msg !== null) {
            const content = JSON.parse(msg.content.toString());
            callback(content);
            channel.ack(msg);
        }
    });
    logger.info(`Subscribed  to event : ${routingKey}`);
}

export { connectRabbitMQ, publishEvent ,consumeEvent};