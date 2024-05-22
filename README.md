# AWS Lambda Runtimes Comparison: Node.js vs Bun vs Deno.js vs LLRT

## Table of Contents

1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Lambda Functions](#lambda-functions)
4. [Deployment with AWS CDK](#deployment-with-aws-cdk)
5. [Getting Started](#getting-started)
6. [Results and Analysis](#results-and-analysis)
7. [License](#license)

## Introduction

This project aims to compare the performance and ease of use of four JavaScript runtimes: Node.js, Bun, Deno.js, and LLRT (Latest JavaScript Runtime from AWS Labs). We achieve this by implementing three common Lambda functions:

1. **Hello World**: A simple benchmarking function to measure cold start and execution times.
2. **Weather Extraction**: A Lambda function with Gen AI according to today's weather forecast stored in DynamoDB, extracts rainy forecast from the forecast, and return the result.

All Lambda functions are deployed using the AWS Cloud Development Kit (CDK) to ensure replicability and ease of deployment.

## Project Structure

The project is organized as follows:

```
aws-lambda-runtimes-comparison/
│
├── bin/
│   └── benchmark.ts
├── lib/
│   ├── hello-world-stack.ts
│   ├── dynamodb-bedrock-stack.ts
├── layer/
│   ├── bun/
│   ├── llrt/
├── lambda/
│   ├── hello-world/
│   ├── dynamodb-bedrock/
├── cdk.json
├── LICENSE
└── README.md
```

## Lambda Functions

### Hello World Benchmarking

A simple "Hello World" Lambda function used for benchmarking the cold start and execution times of different runtimes. We tried our best to share the same implementation across each runtime (Node.js, Bun, Deno.js, LLRT) for comparability.

### Forecast Extraction

This Lambda function with Gen AI based on weather forecast stored in DynamoDB. It also added the `date-fns` package. It performs the following steps:
1. Fetches today weather forecast from DynamoDB.
2. Extracts rainy forecast from the text through AWS Bedrock Claude 3.
3. Return the result.

## Deployment with AWS CDK

The project uses AWS CDK to define and deploy the infrastructure. Each Lambda function is defined in a separate stack, making it easy to manage and deploy individually.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js
- AWS CLI
- AWS CDK

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/teckyio/aws-lambda-runtimes-comparison.git
cd aws-lambda-runtimes-comparison/cdk
pnpm install 
```

### Binaries

You may download the binaries for the runtimes from the following links:

* Bun - https://github.com/oven-sh/bun/tree/main
* LLRT - https://github.com/awslabs/llrt 

Download and replace the runtime located in ./layer/bun and ./layer/llrt if necessary.

### Deployment

Deploy the CDK stacks to your AWS account:

```bash
cdk bootstrap
cdk deploy --all
```

### Running the Benchmarks

Invoke the Lambda functions to collect benchmarking data:

```bash
time aws lambda invoke --no-cli-pager --function-name (function name created by cdk) /dev/null
```

## Results and Analysis

After running the benchmarks, analyze the results to compare the performance of each runtime. Key metrics to consider include cold start times, execution times, and memory usage.

## License

This project is licensed under the MIT License. See the LICENSE file for details.