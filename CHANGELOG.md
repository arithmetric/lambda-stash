# Change Log for lambda-stash

## 4.0.0 [2020/07/01]

- Fixing parsing of Cloudwatch Logs streamed to Lambda.
- Updating dependencies to resolve security warnings.
- Dropping support for Node.js v6.

## 3.0.0 [2019/08/06]

- Adding support for the S3 access log format.
- Dropping support for Node.js v4.

## 2.0.0 [2018/05/23]

- Adding support for ELB Classic Load Balancer (elbv1) and Application Load
Balancer (elbv2) log formats.
- Adding Elasticsearch requestTimeout configuration.
- Fixing http-aws-es dependency.

## 1.1.0 [2017/01/20]

- Allowing custom handlers to be provided through the configuration script.

## 1.0.2 [2016/06/21]

- Improving test coverage.

## 1.0.1 [2016/06/19]

- Fixing parsing of CloudWatch Log messages.
- Fixing name of formatCloudtrail.spec.js test file.

## 1.0.0 [2016/06/18]

- Initial release of lambda-stash.
