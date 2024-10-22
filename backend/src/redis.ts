import { createClient } from 'redis';

const REDIS_KEY = process.env.REDIS_KEY ?? "REDIS_KEY";
const REDIS_DATA_KEY = process.env.REDIS_DATA_KEY ?? "data";

export const client = createClient({
    socket: {
        host: process.env.REDIS_HOST || 'localhost', // Change 'redis' to 'localhost'
        port: parseInt(process.env.REDIS_PORT || '6379', 10)
    }
});

export const connect = () => {
    client.connect().then(() => {
        console.log("Connected to Redis")
    });
    client.on('error', (err: any) => console.log('Redis Client Error', err));
}