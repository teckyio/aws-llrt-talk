import { DynamoDBClient, QueryCommand } from "npm:@aws-sdk/client-dynamodb";
import { BedrockRuntimeClient, InvokeModelCommand } from "npm:@aws-sdk/client-bedrock-runtime";
import { format } from "npm:date-fns";
import { TextDecoder } from "node:util";

// Environment variables for DynamoDB and Bedrock configuration
const TABLE_NAME = Deno.env.get("DYNAMODB_TABLE_NAME") || "";
const REGION = Deno.env.get("AWS_BEDROCK_REGIOM") || "us-east-1"; // Claude 3 isn't available in most regions
const MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0";

// Function to read the latest sentences from DynamoDB
const getLatestSentenceFromDynamoDB = async (): Promise<string> => {
  const client = new DynamoDBClient();

  const command = new QueryCommand({
    TableName: TABLE_NAME,
    Limit: 1, // Adjust this based on how you determine the latest record
    KeyConditions: {
        date: {
            ComparisonOperator: "EQ",
            AttributeValueList: [{ S: format(new Date(), "yyyy-MM-dd") }], // today in YYYY-MM-DD format
        },
    },
    ScanIndexForward: false, // Sort descending to get the latest record
  });

  const response = await client.send(command);
  const items = response.Items;

  if (items && items.length > 0) {
    // Assuming the sentence is stored in an attribute named "sentence"
    const latestItem = items[0];
    const sentence = latestItem.sentence.S; // Adjust based on your attribute names and types
    return sentence!;
  }

  throw new Error("No sentences found in the DynamoDB table.");
};

// Function to invoke the Bedrock Runtime model
const invokeModel = async (prompt: string): Promise<string> => {
  const client = new BedrockRuntimeClient({ region: REGION });

  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: prompt }],
      },
    ],
  };

  const command = new InvokeModelCommand({
    contentType: "application/json",
    body: JSON.stringify(payload),
    modelId: MODEL_ID,
  });

  const apiResponse = await client.send(command);

  const decodedResponseBody = new TextDecoder().decode(apiResponse.body);
  const responseBody = JSON.parse(decodedResponseBody);
  return responseBody.content[0].text;
};

// Main function to read the latest sentence and determine if it will rain
export const determineRain = async () => {
  try {
    const latestSentence = await getLatestSentenceFromDynamoDB();
    console.log("Latest sentence from DynamoDB:", latestSentence);

    const prompt = `Based on the following sentence, determine the weather condition and return only one of the following options: "no rain", "light rain", "showers", "rain", "thunderstorms". Choose the most serious conditions if there are multiple predictions. Do not explain. Return only the answer. Sentence: "${latestSentence}"`;
    const result = await invokeModel(prompt);
    console.log("Model response:", result);

    // Here, you can further process the result to handle the response as needed
    const validResponses = ["no rain", "light rain", "showers", "rain", "thunderstorms"];
    const finalAnswer = validResponses.find((response) => result.includes(response))
    if (finalAnswer) {
      console.log(`Weather condition: ${finalAnswer}`);
    } else {
      console.log("Unexpected model response.");
    }
  } catch (error) {
    console.error("Error determining rain:", error);
  }
};

determineRain()