# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands
* `npm install -g aws-cdk`              ensure that you have latest AWS CDK
 * `cdk init app --language=typescript`  create cdk application 
 * `npm run build`                       compile typescript to js
 * `npm run watch`                       watch for changes and compile
 * `npm run test`                        perform the jest unit tests
 * `cdk deploy`                          deploy this stack to your default AWS account/region
 * `cdk diff`                            compare deployed stack with current state
 * `cdk synth`                           emits the synthesized CloudFormation template


## Prerequisites

- [Node](https://nodejs.org/en/) (version 10.10.0 or above)
- [npm](https://www.npmjs.com)
- [make](http://gnuwin32.sourceforge.net/packages/make.htm) if you are working on Windows

## Installation

Run the below command to install the required dependencies:

```bash
make install
```

## Deployment

- Run the following shell script command with environment and application to create the app stack.
  - First parameter - Enviroment ( Ex: sbx,dev,uat,prod)
  - Second parameter - Stack to be deployed ( Ex: app , db etc..,)

```bash
  sh ./deploy.sh "dev" "app"
```

## Destroy a Stack

Run the below command to destroy the stack

```bash
make destroy-stack
```

## Synthesis the cloudformation template

Run the below command to emits the synthesized CloudFormation template

```bash
make run-synth
```

## Test

To run the unit and integration(snapshot) tests, please run:

```bash
make test
```

## SnapShot Test

To commit to the new snapshot test fix and to test, please run:

```bash
make snapshottestfix
```

## Test-Coverage

To run the tests case, and to get code coverage:

```bash
make test-cov
```

## test ci/cd pipeline 01282022 02182022