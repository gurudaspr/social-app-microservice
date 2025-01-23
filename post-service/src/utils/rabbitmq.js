import amqplib from 'amqplib';
import logger from './logger.js';

let connection = null;
let channel = null;

const EXCHANGE_NAME = 'facebook_events';

async function connectRabbitMQ(){
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

async function publishEvent (routingKey, message){
    if(!channel){
        await connectRabbitMQ();
    }
    channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)));
    logger.info(`Published message to RabbitMQ: ${routingKey}`);

}
export { connectRabbitMQ , publishEvent };