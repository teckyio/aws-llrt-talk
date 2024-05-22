import * as cdk from 'aws-cdk-lib';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class HelloWorldStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const node = new nodejs.NodejsFunction(this, `${id}-NodeJsHandler`, {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      entry: './lambda/hello-world/index.ts',
      handler: 'handler',
    });

    const deno = new lambda.DockerImageFunction(this, `${id}-DenoHandler`, {
      code: lambda.DockerImageCode.fromImageAsset('./lambda/hello-world'),
    })

    const bun = new nodejs.NodejsFunction(this, `${id}-BunHandler`, {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      entry: './lambda/hello-world/index.ts',
      handler: 'handler',
      layers: [
        new lambda.LayerVersion(this, `${id}-BunLayer`, {
          code: lambda.Code.fromAsset('./layer/bun'),
        }),
      ]
    });
    (bun.node.defaultChild as lambda.CfnFunction).addPropertyOverride('Runtime', lambda.Runtime.PROVIDED_AL2023.name);

    const llrt = new nodejs.NodejsFunction(this, `${id}-LLRTHandler`, {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      entry: './lambda/hello-world/index.ts',
      handler: 'handler',
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
      }
    });
    (llrt.node.defaultChild as lambda.CfnFunction).addPropertyOverride('Runtime', lambda.Runtime.PROVIDED_AL2023.name);

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
