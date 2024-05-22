import { Handler } from 'aws-lambda';

export const handler: Handler = async (event, context) => {
    console.log('Hello world');
    return context.logStreamName;
};