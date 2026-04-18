import {createClient} from "redis";
import * as process from "node:process";

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
    console.log('Redis Client Error', err)
})

export const connectRedis = async () => {
    if(!redisClient.isOpen) {
        await redisClient.connect();
        console.log(' Redis Connected Successfully');
    }
}

export default redisClient;