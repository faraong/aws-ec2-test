'use strict';

var {setWorldConstructor} = require('cucumber');
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: 'ap-southeast-2'});

var World = function World() {
    // See: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html
    this.ec2 = new AWS.EC2();
    // For passing the instance ID of the created instance
    this.instanceId = null;
};

setWorldConstructor(World);