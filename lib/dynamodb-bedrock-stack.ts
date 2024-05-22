import * as cdk from 'aws-cdk-lib';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class DynamodbBedrockStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'Table', {
      partitionKey: {
        name: 'date', type: dynamodb.AttributeType.STRING
      },
    });

    const node = new nodejs.NodejsFunction(this, `${id}-NodeJsHandler`, {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      entry: './lambda/dynamodb-bedrock/index.mts',
      handler: 'determineRain',
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
      },
    });

    const deno = new lambda.DockerImageFunction(this, `${id}-DenoHandler`, {
      code: lambda.DockerImageCode.fromImageAsset('./lambda/dynamodb-bedrock'),
    })
    
    const bun = new nodejs.NodejsFunction(this, `${id}-BunHandler`, {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      entry: './lambda/dynamodb-bedrock/index.mts',
      handler: 'determineRain',
      layers: [
        new lambda.LayerVersion(this, `${id}-BunLayer`, {
          code: lambda.Code.fromAsset('./layer/bun'),
        }),
      ],
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
      },
    });
    (bun.node.defaultChild as lambda.CfnFunction).addPropertyOverride('Runtime', lambda.Runtime.PROVIDED_AL2023.name);

    const llrt = new nodejs.NodejsFunction(this, `${id}-LLRTHandler`, {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      entry: './lambda/dynamodb-bedrock/index.mts',
      handler: 'determineRain',
      layers: [
        new lambda.LayerVersion(this, `${id}-LLRTLayer`, {
          code: lambda.Code.fromAsset('./layer/llrt'),
        }),
      ],
      bundling: {
        target: 'es2020',
        format: nodejs.OutputFormat.ESM,
        externalModules: [
          '@aws-sdk',
          '@smithy',
          'uuid',
        ],
      },
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
      },
    });
    (llrt.node.defaultChild as lambda.CfnFunction).addPropertyOverride('Runtime', lambda.Runtime.PROVIDED_AL2023.name);

    table.grantReadWriteData(node);
    table.grantReadWriteData(bun);
    table.grantReadWriteData(llrt);

    node.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*'],
    }));
    bun.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*'],
    }));
    llrt.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*'],
    }));

    new cdk.CfnOutput(this, `${id}-NodeJsHandlerArn`, {
      value: node.functionArn,
    });
    new cdk.CfnOutput(this, `${id}-DenoHandlerArn`, {
      value: deno.functionArn,
    });
    new cdk.CfnOutput(this, `${id}-BunHandlerArn`, {
      value: bun.functionArn,
    });
    new cdk.CfnOutput(this, `${id}-LLRTHandlerArn`, {
      value: llrt.functionArn,
    });
  }
}
