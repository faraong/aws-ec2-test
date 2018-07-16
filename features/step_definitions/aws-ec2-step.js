'use strict';

var {Then, When} = require('cucumber');
var {expect} = require('chai');
const assert = require('assert');

When(/^I create an AWS EC2 instance named "([^"]*)"$/, function (instanceName, callback) {
    // Check whether AWS credentials exist
    //assert.notEqual(this.ec2.secretAccessKey, undefined, "AWS Credential is missing");

    var params = {
        ImageId: 'ami-39f8215b', // amazon linux 2 AMI in ap-southeast-2
        InstanceType: 't2.micro',
        KeyName: 'mykeypair',
        MinCount: 1,
        MaxCount: 1,
    };
    var world = this;
    // world.instanceId = 'i-033b3c970f39ea399';
    // callback();
    this.ec2.runInstances(params, function (err, data) {
        if (err) callback(err);
        else {
            world.instanceId = data.Instances[0].InstanceId.toString();

            var tagParams = {
                Resources: [world.instanceId],
                Tags: [
                    {
                        Key: 'Name',
                        Value: instanceName
                    }
                ]
            };
            world.ec2.createTags(tagParams, function (err, data) {
                if (err) callback(err);
                else callback();
            });
        }
    });
});

// we set a timeout of 30 seconds here as instance creation may take longer than 5 seconds (default)
Then(/^I should see a working instance$/, {timeout: 30000}, function (callback) {
    var params = {
        InstanceIds: [
            this.instanceId
        ],
    };

    let attemptsLeft = 30;
    const delayBetweenRequests = 1000;
    var world = this;

    function check() {
        world.ec2.describeInstances(params, function (err, data) {
            if (err) callback(err);
            else {
                var state = data.Reservations[0].Instances[0].State.Name;
                if (state === 'running') callback();
                else {
                    attemptsLeft -= 1;
                    if (!attemptsLeft) assert.fail("Timed out waiting for instance to transition to running");
                    setTimeout(check, delayBetweenRequests);
                }
            }
        });
    }

    check();
});

Then(/^I should delete the instance$/, function (callback) {
    var params = {
        InstanceIds: [
            this.instanceId
        ]
    };
    var world = this;
    this.ec2.terminateInstances(params, function (err, data) {
        if (err) callback(err)
        else {
            assert.equal(data.TerminatingInstances[0].InstanceId, world.instanceId);
            callback();
        }
    });
});
