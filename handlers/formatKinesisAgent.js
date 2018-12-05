exports.process = function(config) {
    console.log('formatKinesisAgent');
    return new Promise(function(resolve, reject) {

        var items = [];
        var need_timestamp = [];
        var push_item = true
        var records = config.data.split(/\n/);
        // Skip the last one which is emptynod
        var num = records.length - 1;
        var i;
        var item;
        var tmpstr;
        for (i = 0; i < num; i++) {
            item_str = records[i];
            item = JSON.parse(item_str);
            item.logType = 'json';
            push_item = true

            try {
                temp_data = JSON.parse(item.data);
                item.data = temp_data;
            } catch (err) {
                // console.log("WARN: Failed to JSON Parse data " + err, ":::", item.data);

                try {
                    // Try to remove unqoted embedded "
                    temp_data = item.data;
                    temp_data = temp_data.replace(/[^{}:,](\\?["'])[,:]?[^{}:,"]/g, ' ');
                    item.data = JSON.parse(temp_data);
                } catch (err) {
                    item.message = item.data;
                    item.logType = 'message';
                    delete item.data;
                    item.conversionerror = "Failed to convert to JSON reason: " + err;
                }
            }

            if ( item.data ) {
                // Flatten the data object
                Object.keys(item.data).forEach(function (k) {
                    item[k] = item.data[k];
                })
                delete item.data;
            }
            
            if ( config.dateField ) {
                try {
                    if (item.timestamp && config.dateField !== 'timestamp') {
                        item[config.dateField] = new Date(item.timestamp).toISOString();
                    } else if (item.datetime) {
                        var dt = item.datetime
                        dt = dt.replace(/-/g, '/')
                        if ( dt.startsWith('1') ) {
                            dt = '20' + dt
                        }
                        item.datetime = dt
                        item[config.dateField] = new Date(item.datetime).toISOString();
                    } else if (item.timeMillis && config.dateField !== 'timeMillis') {
                        item[config.dateField] = new Date(item.timeMillis).toISOString();
                    } else {
                        push_item = false
                    }
                } catch (e) {
                    console.log("WARN: failed to convert date reason", e)
                    console.log("WARN: converting date Item", item)
                    push_item(false)
                }

                if ( push_item ) {
                    config.prevTimestamp = item[config.dateField];
                } else if ( 'prevTimestamp' in config ) {
                    push_item = true
                    // This will at least get us close to the time event
                    prev = new Date(config.prevTimestamp);
                    prev.setMilliseconds(prev.getMilliseconds() + 1);
                    item[config.dateField] = prev;
                    item.timestamperror = "timestamp missing, calculated from previous timestamp plus 1ms";
                }

                if (need_timestamp.length > 0) {
                    if ( 'prevTimestamp' in config ) {
                        //    Items with missing timestamps at the beginning, count backwards
                        var future_time = config.prevTimestamp
                        for (j = 0; j < need_timestamp.length; j++) {
                            miss_item = need_timestamp[j]
                            future_time.setMilliseconds(future_time.getMilliseconds() - 1)
                            miss_item[config.dateField] = future_time
                            items.push(miss_item)
                        }
                        need_timestamp = []
                    }
                }

            }

            if ( push_item ) {
                items.push(item);
            }
        }
        if ( need_timestamp.length > 0 ) {
            console.log("ERROR: Not one log message had a timestamp, skipping all", need_timestamp.length)
        }

        config.data = items;
        return resolve(config);
        
    });
};