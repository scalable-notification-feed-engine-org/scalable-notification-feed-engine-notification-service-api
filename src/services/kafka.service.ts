import {consumer} from "../config/kafka.config";

export const connectKafka = async () =>{
    try {
        await consumer.connect();
        console.log('✅ Kafka Consumer Connected');

        await consumer.subscribe({
            topic: 'activity.created',
            fromBeginning: true
        });

    }catch(err){
        console.log('❌ kafka connection failed: ' + err);
    }
};

export const disconnectKafka = async () =>{

        await consumer.disconnect();
        console.log('🚫 Kafka Disconnected');

};