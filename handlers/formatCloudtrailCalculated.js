

var ip_pattern = /\d+\.\d+\.\d+\.\d+/;
const dns = require('dns');

function makeAllStrings( item ) {
    Object.keys(item).forEach(function(key) {
        if ( item[key] instanceof Object ) {
            item[key] = JSON.stringify(item[key])
        }
    })
}

function calculated(item) {
    calc = {};

    if ( item.sourceIPAddress ) {
        if ( item.sourceIPAddress.match(ip_pattern) ) {
            calc.sourceIPAddress = item.sourceIPAddress;
        } else {
            calc.sourceFQDN = item.sourceIPAddress
            dns.lookup(item.sourceFQDN, (err, address, family) => {
                if ( ! err ) {
                item.sourceIPAddress = address;
            }
        });
        }
    }

    if ( item.errorCode ) {
        if ( item.errorCode == "AccessDenied" ) {
            calc.access = "Denied";
        } else {
            calc.access = "Error";
        }
    } else {
        calc.access = "Granted";
    }


    if ( item.userIdentity ) {
        if ( item.userIdentity.principalId ) {
            calc.principalId = item.userIdentity.principalId.split(':')[0];
        }
        if (item.userIdentity.type == "AssumedRole") {
            calc.userAccessId = item.userIdentity.arn;
            if (  item.userIdentity.sessionContext && item.userIdentity.sessionContext.sessionIssuer ) {
                calc.userIdentity = item.userIdentity.sessionContext.sessionIssuer.arn;
            }
        } else if (item.userIdentity.type == "IAMUser") {
            calc.userIdentity = item.userIdentity.arn;
            calc.userAccessId = item.userIdentity.arn;
        } else if (item.userIdentity.type == "AWSAccount") {
            calc.userIdentity = item.userIdentity.type + ":" + item.userIdentity.accountId + ":" + calc.principalId;
        } else if (item.userIdentity.type == "SAMLUser") {
            calc.userIdentity = item.userIdentity.type + ":" + item.userIdentity.userName
        } else if (item.userIdentity.type == "AWSService") {
            calc.userIdentity = item.userIdentity.type + ":" + item.userAgent
        } else {
            calc.userIdentity = item.userIdentity.type + ":" + item.userIdentity.accountId + ":" + calc.principalId;
        }
    }

    item['calculated'] = calc;

}

function cleanup(value) {
    if (typeof value == 'string') {
        switch (value.toLowerCase().trim()) {
            case "true":
            case "yes":
                return 'true';
            case "false":
            case "no":
            case null:
                return 'false';
        }
    }
    return value;
}

function traverse(o,func) {
    for (var i in o) {
        if (o[i] !== null ) {
            if ( typeof(o[i])=="object") {
                //going one step down in the object tree!!
                traverse(o[i], func);
            } else {
                o[i] = cleanup(o[i])
            }
        }
    }
}

exports.process = function(config) {
    console.log('formatCloudtrail');
    return new Promise(function(resolve, reject) {

        if (!config.data ||
            !config.data.hasOwnProperty('Records') ||
            (!config.data.Records.length && config.data.Records.length !== 0)) {
            return reject('Received unexpected CloudTrail JSON format:' +
                JSON.stringify(config.data));
        }

        var items = [];
        var num = config.data.Records.length;
        var i;
        var item;
        for (i = 0; i < num; i++) {
            item = config.data.Records[i];
            if (config.dateField && config.dateField !== 'eventTime') {
                item[config.dateField] = item.eventTime;
            }
            if ( item.apiVersion ) {
                item.awsApiVersion = item.apiVersion;
                delete item.apiVersion;
            }
            if ( item.requestParameters ) {
                makeAllStrings(item.requestParameters);
            }
            if ( item.responseElements ) {
                makeAllStrings(item.responseElements);
            }
            traverse(item, cleanup);
            calculated(item);
            items.push(item);
        }

        config.data = items;

        return resolve(config);

    });
};