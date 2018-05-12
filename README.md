# Lambda Stash

[![npm version](https://badge.fury.io/js/lambda-stash.svg)](https://www.npmjs.com/package/lambda-stash)
[![Travis CI test status](https://travis-ci.org/arithmetric/lambda-stash.svg?branch=master)](https://travis-ci.org/arithmetric/lambda-stash)
[![Coverage Status](https://coveralls.io/repos/github/arithmetric/lambda-stash/badge.svg?branch=master)](https://coveralls.io/github/arithmetric/lambda-stash?branch=master)

`lambda-stash` is an AWS Lambda script for shipping data from S3 or other cloud
data sources to data stores, like Elasticsearch.

## Features

- Supported input formats: AWS Cloudfront access logs, AWS Cloudtrail API logs,
AWS CloudWatch logs, AWS Config change logs, AWS Elastic Load Balancer access
logs, and other formats by implementing a custom handler.

- Supported output formats: JSON, plain text key-value pairs.

- Supported shipping methods: Elasticsearch (includes signing for AWS domains),
HTTP/S POST, TCP socket.

## Set Up

1. Set up a Lambda deployment package that includes `lambda-stash` and a script
with your configuration. See the example included (under `example/`) and the
configuration documentation below to get started.

2. Use the AWS Management Console to create a Lambda function using the Node.js
6.10 runtime. Upload your package, configure it with event sources as desired
(S3 buckets or CloudWatch logs). Be sure the Lambda function has an IAM role
with any necessary permissions, like getting data from an S3 bucket or accessing
an AWS Elasticsearch domain.

3. Check CloudWatch Logs, where a Log Group should be created once the Lambda
script runs the first time. Review the logs to make sure the script finishes
successfully within the time allowed. You can set up a CloudWatch Alarm to be
notified if an error occurs and to track for how long the function is running.
The elasticsearch client timeout default is 30 seconds. You can set
config.elasticsearch.requestTimeout to milliseconds or 'Infinity'.

## Configuration

`lambda-stash` is intended to be implemented by a script that provides the
configuration, such as what processors to use for specific events.

See the included example in `example/` and the handlers documentation below for
details on how to implement the handlers.

## Handlers

### convertString

Converts an array of objects to key-value strings with the format:
`prefix key1="value1" key2="value2" ... suffix`

**Inputs**:

- `config.data` should be an array of data objects.
- `config.string.prefix` (optional) is a string to add at the beginning of each
output string.
- `config.string.suffix` (optional) is a string to add at the end of each output
string.

**Outputs**:

- `config.data` is transformed to a string with the result of the handler.

### decodeBase64

Decodes a Base64 encoded string.

**Inputs**:

- `config.data` should be a string in Base64 format.

**Outputs**:

- `config.data` is transformed to a buffer with the decoded data.

### decompressGzip

Decompresses gzipped data.

**Inputs**:

- `config.data` should be a buffer in gzip format.

**Outputs**:

- `config.data` is transformed to a string with the decompressed data.

### formatCloudfront

Processes parsed data from Cloudfront access logs and normalizes it in key-value
objects.

Raw Cloudfront access log files in S3 should be processed with `decompressGzip`
and `parseTabs` before using this format handler.

**Inputs**:

- `config.data` should be an array of log records, each of which is an array of
field values.

- `config.dateField` (optional) is the key name in the output that should
contain the log's date time value (combined from the date and time fields).

**Outputs**:

- `config.data` is transformed to an array of objects with log data.

### formatCloudtrail

Processes parsed data from Cloudtrail logs and normalizes it in key-value
objects.

Raw Cloudtrail access log files in S3 should be processed with `decompressGzip`
and `parseJson` before using this format handler.

**Inputs**:

- `config.data` should have a `Records` property that is an array of objects
for each log item.

- `config.dateField` (optional) is the key name in the output that should
contain the log's date time value.

**Outputs**:

- `config.data` is transformed to an array of objects with log data.

### formatCloudwatchLogs

Processes parsed data from CloudWatch logs and normalizes it in key-value
objects. Includes handling for Lambda function start, end, and report logs.

This handler is meant to be used with data provided through a CloudWatch Logs
subscription event, which is automatically processed with `decodeBase64`,
`decompressGzip`, and `parseJson`.

**Inputs**:

- `config.data` should have a `logEvents` property that is an array of objects
for each log item.

- `config.dateField` (optional) is the key name in the output that should
contain the log's date time value.

**Outputs**:

- `config.data` is transformed to an array of objects with log data.

### formatConfig

Processes parsed data from AWS Config logs and normalizes it in key-value
objects.

Raw Config log files in S3 should be processed with `decompressGzip`
and `parseJson` before using this format handler.

**Inputs**:

- `config.data` should have a `configurationItems` property that is an array of
objects for each log item.

- `config.dateField` (optional) is the key name in the output that should
contain the log's date time value.

**Outputs**:

- `config.data` is transformed to an array of objects with log data.

### formatELBv1

Processes parsed data from AWS Elastic Load Balancer (ELB) Classic Load Balancer
(ELB version 1) logs and normalizes it in key-value objects.

Raw ELB log files in S3 should be processed with `parseSpaces` before using this
format handler.

**Inputs**:

- `config.data` should be an array (one item per log record) of arrays (one item
per record field).

- `config.dateField` (optional) is the key name in the output that should
contain the log's date time value.

**Outputs**:

- `config.data` is transformed to an array of objects with log data.

### formatELBv2

Processes parsed data from AWS Elastic Load Balancer (ELB) Application Load
Balancer (ELB version 2) logs and normalizes it in key-value objects.

Raw ELB log files in S3 should be processed with `parseSpaces` before using this
format handler.

**Inputs**:

- `config.data` should be an array (one item per log record) of arrays (one item
per record field).

- `config.dateField` (optional) is the key name in the output that should
contain the log's date time value.

**Outputs**:

- `config.data` is transformed to an array of objects with log data.

### getS3Object

Fetches an object from S3.

**Inputs**:

- `config.S3.srcBucket` is the S3 bucket name for the object to fetch.

- `config.S3.srcKey` is the S3 key name for the object to fetch.

**Outputs**:

- `config.data` is set to the buffer with the S3 object data.

### outputJsonLines

Transforms output data into a series of JSON strings delimited by a newline.
This output format is compatible with the
[Loggly HTTP/S bulk endpoint](https://www.loggly.com/docs/http-bulk-endpoint/).

**Inputs**:

- `config.data` is an array of objects with log data.

**Outputs**:

- `config.data` is transformed into JSON strings delimited by newlines.

### parseCsv

Parses CSV data into an array of records, each of which is an array of column
values.

**Inputs**:

- `config.data` is a string with CSV data.

**Outputs**:

- `config.data` is transformed into an array of records, each of which is an
array of strings with column values.

### parseJson

Parses a JSON string into its equivalent JavaScript object.

**Inputs**:

- `config.data` is a JSON string.

**Outputs**:

- `config.data` is the equivalent JavaScript object.

### parseTabs

Parses tab separated value data into an array of records, each of which is an
array of column values.

**Inputs**:

- `config.data` is a string with tab separated data.

**Outputs**:

- `config.data` is transformed into an array of records, each of which is an
array of strings with column values.

### shipElasticsearch

Ships the data to an Elasticsearch index. The Elasticsearch `_index` and `_type`
values are configurable, and support for the AWS Elasticsearch request signing
process is provided.

**Inputs**:

- `config.data` is an array of objects with log data.

- `config.elasticsearch.host` is an HTTP/S URL to the Elasticsearch domain to
which to send data.

- `config.elasticsearch.index` is a string with the `_index` value to add to log
objects.

- `config.elasticsearch.type` is a string with the `_type` value to add to log
objects.

- `config.elasticsearch.useAWS` should be set to `true` to connect with an AWS
Elasticsearch domain and automatically sign requests for AWS.

- `config.elasticsearch.region` is the AWS region where the AWS Elasticsearch
domain is hosted.

- `config.elasticsearch.accessKey` (optional) is the AWS access key to use for
signing the request. If an access key and secret key are not provided, the
environment credentials are used instead (i.e. the IAM role under which the
Lambda function is running).

- `config.elasticsearch.secretKey` (optional) is the AWS secret key to use for
signing the request.

- `config.elasticsearch.maxChunkSize` (optional) is the maximum number of log
items to ship in one request. By default, set to 1000.

- `config.elasticsearch.requestTimeout` (optional) is the Elasticsearch client
timeout in milliseconds or can be set to `Infinity` for no timeout. The
Elasticsearch client's default is 30000 (30 seconds).

### shipHttp

Ships the data to an HTTP/S endpoint.

**Inputs**:

- `config.data` is the string data to ship. An alternate key can be configured.

- `config.http.url` is an HTTP/S URL to which to send data.

- `config.http.keyData` (optional) is the key name in the `config` object of the
data to ship. By default, set to `data`.

### shipTcp

Ships the data to a TCP service.

**Inputs**:

- `config.data` is the string data to ship. An alternate key can be configured.

- `config.tcp.host` is a hostname to which to open a TCP socket.

- `config.tcp.port` is a port on which to open the socket.

- `config.tcp.keyData` (optional) is the key name in the `config` object of the
data to ship. By default, set to `data`.

## Recipes

### Ship Cloudtrail logs to AWS Elasticsearch

The following script can be used to ship Cloudtrail logs from S3 to an AWS
Elasticsearch instance.

```
var shipper = require('lambda-stash');
var config = {
  elasticsearch: {
    host: 'https://search-test-es-abcdef...',
    region: 'us-east-1',
    useAWS: true
  },
  mappings: [
    {
      bucket: 'my-cloudtrail-logs',
      processors: [
        'decompressGzip',
        'parseJson',
        'formatCloudtrail',
        'shipElasticsearch'
      ],
      elasticsearch: {
        index: 'logs',
        type: 'cloudtrail'
      },
      dateField: 'date'
    }
  ]
};
shipper.handler(config, event, context, callback);
```
