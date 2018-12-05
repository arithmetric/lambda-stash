var _ = require('lodash');

exports.process = function(config) {
    console.log('formatCloudwatchLogs');
    return new Promise(function(resolve, reject) {

        var items = [];

        var outer_num = config.data.length

        var count = 0

        for (outer_i = 0; outer_i < outer_num; outer_i++) {

            if (!config.data[outer_i] ||
                !config.data[outer_i].hasOwnProperty('logEvents') ||
                _.isNil(config.data[outer_i].logEvents.length)) {
                return reject('Received unexpected AWS Cloudwatch Logs format:' +
                    JSON.stringify(config.data[outer_i]));
            }

            // Want to add logGroup to each item
            var log_group = config.data[outer_i].logGroup;

            var num = config.data[outer_i].logEvents.length;
            var i;
            var item;
            var parts;
            for (i = 0; i < num; i++) {
                count = count + 1
                item = config.data[outer_i].logEvents[i];

                item.logGroup = log_group;
                item.logType = 'message';

                // Process informaiton lambda logs
                if ( item.message && typeof item.message == 'string') {
                    parts = item.message.match(/^(\w+)/);
                    if (parts && parts[1] === 'START') {
                        item.logType = 'start';
                        parts = item.message.match(/^START RequestId: ([a-z0-9-]+) Version: (\S+)/); // eslint-disable-line max-len
                        if (parts && parts.length === 3) {
                            item.requestId = parts[1];
                            item.lambdaVersion = parts[2];
                        }
                    } else if (parts && parts[1] === 'REPORT') {
                        item.logType = 'report';
                        parts = item.message.match(/^REPORT RequestId: ([a-z0-9-]+)\tDuration: ([0-9.]+) ms\tBilled Duration: ([0-9.]+) ms \tMemory Size: ([0-9.]+) MB\tMax Memory Used: ([0-9.]+)/); // eslint-disable-line max-len
                        if (parts && parts.length === 6) {
                            item.requestId = parts[1];
                            item.duration = parts[2];
                            item.durationBilled = parts[3];
                            item.memConfigured = parts[4];
                            item.memUsed = parts[5];
                        }
                    } else if (parts && parts[1] === 'END') {
                        item.logType = 'end';
                        parts = item.message.match(/^END RequestId: ([a-z0-9-]+)/);
                        if (parts && parts[1]) {
                            item.requestId = parts[1];
                        }
                    } else if (parts && parts[1] == "RequestId" && item.message.indexOf('Process exited')) {
                        item.requestId = parts[1];
                        item.errorMessage = parts.slice(2);
                        item.errorType = 'lambda';
                    } else {
                        parts = item.message.match(/^(.*)\t(.*)\t((.|\n)*)/m);
                        if (parts && parts.length === 5) {
                            item.requestId = parts[2];
                            item.message = parts[3];
                        }
                    }
                }

                if ( item.errorMessage || item.errorType ) {
                    item.logType = 'error';
                }

                if ( item.data && typeof item.data != 'object' ) {
                    item.message = JSON.stringify(item.data);
                    delete item.data;
                }

                if ( ! item.data ) {
                    try {
                        item.data = JSON.parse(item.message);
                        item.logType = 'json';
                        if (item.data.requestId) {
                            item.requestId = item.data.requestId;
                        }
                        delete item.message
                    } catch (e) {
                        // Do Nothing, we are good
                    }
                }

                if ( item.RequestId ) {
                    item.requesstId = item.RequestId;
                    delete item.RequestId;
                }

                if ( item.data ) {
                    // Flatten the data object
                    Object.keys(item.data).forEach(function (k) {
                        item[k] = item.data[k];
                    })
                    delete item.data;
                }




                if (config.dateField && config.dateField !== 'timestamp') {
                    item[config.dateField] = new Date(item.timestamp).toISOString();
                }

                items.push(item);
            }
        }



        console.log("Processed " + count + "/" + items.length + " cloudwatch events")
        config.data = items;
        return resolve(config);

    });
};