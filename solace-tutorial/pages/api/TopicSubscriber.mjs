/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * Solace Systems Node.js API
 * Publish/Subscribe tutorial - Topic Subscriber
 * Demonstrates subscribing to a topic for direct messages and receiving messages
 */

/*jslint es6 node:true devel:true*/

import solace from 'solclientjs';


export default class TopicSubscriber {
    constructor(solace, topicName) {
        this.solace = solace
        this.session = null;
        this.topicName = topicName;
        this.subscribed = false;

        // Logger
        this.log('\n*** Subscriber to topic "' + this.topicName + '" is ready to connect ***');
    }

    log(line) {
        const now = new Date();
        const time = [
            ('0' + now.getHours()).slice(-2),
            ('0' + now.getMinutes()).slice(-2),
            ('0' + now.getSeconds()).slice(-2)
        ];
        const timestamp = '[' + time.join(':') + '] ';
        console.log(timestamp + line);
    }

    run(argv) {
        this.connect(argv);
    }

    connect(argv) {
        if (this.session !== null) {
            this.log('Already connected and ready to subscribe.');
            return;
        }

        // extract params
        // if (argv.length < (2 + 3)) { // expecting 3 real arguments
        //     this.log('Cannot connect: expecting all arguments' +
        //         ' <protocol://host[:port]> <client-username>@<message-vpn> <client-password>.\n' +
        //         'Available protocols are ws://, wss://, http://, https://, tcp://, tcps://');
        //     process.exit();
        // }

        const hosturl = 'ws://localhost:8008';
        const username = 'admin';
        const vpn = 'default';
        const pass = 'admin';

        //const hosturl = argv.slice(2)[0];
        this.log('Connecting to Solace PubSub+ Event Broker using url: ' + hosturl);

        //const usernamevpn = argv.slice(3)[0];
        //const username = usernamevpn.split('@')[0];
        this.log('Client username: ' + username);

        //const vpn = usernamevpn.split('@')[1];
        this.log('Solace PubSub+ Event Broker VPN name: ' + vpn);

        //const pass = argv.slice(4)[0];
        // create session
        try {
            this.session = this.solace.SolclientFactory.createSession({
                // solace.SessionProperties
                url: hosturl,
                vpnName: vpn,
                userName: username,
                password: pass,
            });
        } catch (error) {
            this.log(error.toString());
        }

        // define session event listeners
        this.session.on(this.solace.SessionEventCode.UP_NOTICE, (sessionEvent) => {
            this.log('=== Successfully connected and ready to subscribe. ===');
            this.subscribe();
        });

        this.session.on(this.solace.SessionEventCode.CONNECT_FAILED_ERROR, (sessionEvent) => {
            this.log('Connection failed to the message router: ' + sessionEvent.infoStr +
                ' - check correct parameter values and connectivity!');
        });

        this.session.on(this.solace.SessionEventCode.DISCONNECTED, (sessionEvent) => {
            this.log('Disconnected.');
            this.subscribed = false;
            if (this.session !== null) {
                this.session.dispose();
                this.session = null;
            }
        });

        this.session.on(this.solace.SessionEventCode.SUBSCRIPTION_ERROR, (sessionEvent) => {
            this.log('Cannot subscribe to topic: ' + sessionEvent.correlationKey);
        });

        this.session.on(this.solace.SessionEventCode.SUBSCRIPTION_OK, (sessionEvent) => {
            if (this.subscribed) {
                this.subscribed = false;
                this.log('Successfully unsubscribed from topic: ' + sessionEvent.correlationKey);
            } else {
                this.subscribed = true;
                this.log('Successfully subscribed to topic: ' + sessionEvent.correlationKey);
                this.log('=== Ready to receive messages. ===');
            }
        });

        // define message event listener
        this.session.on(this.solace.SessionEventCode.MESSAGE, (message) => {
            this.log('Received message: "' + message.getBinaryAttachment() + '", details:\n' +
                message.dump());
        });

        // connect the session
        try {
            this.session.connect();
        } catch (error) {
            this.log(error.toString());
        }
    }

    subscribe() {
        if (this.session !== null) {
            if (this.subscribed) {
                this.log('Already subscribed to "' + this.topicName +
                    '" and ready to receive messages.');
            } else {
                this.log('Subscribing to topic: ' + this.topicName);
                try {
                    this.session.subscribe(
                        this.solace.SolclientFactory.createTopicDestination(this.topicName),
                        true, // generate confirmation when subscription is added successfully
                        this.topicName, // use topic name as correlation key
                        10000 // 10 seconds timeout for this operation
                    );
                } catch (error) {
                    this.log(error.toString());
                }
            }
        } else {
            this.log('Cannot subscribe because not connected to Solace PubSub+ Event Broker.');
        }
    }

    exit() {
        this.unsubscribe();
        this.disconnect();
        setTimeout(() => {
            // process.exit();
        }, 1000); // wait for 1 second to finish
    }

    unsubscribe() {
        if (this.session !== null) {
            if (this.subscribed) {
                this.log('Unsubscribing from topic: ' + this.topicName);
                try {
                    this.session.unsubscribe(
                        this.solace.SolclientFactory.createTopicDestination(this.topicName),
                        true, // generate confirmation when subscription is removed successfully
                        this.topicName, // use topic name as correlation key
                        10000 // 10 seconds timeout for this operation
                    );
                } catch (error) {
                    this.log(error.toString());
                }
            } else {
                this.log('Cannot unsubscribe because not subscribed to the topic "' +
                    this.topicName + '"');
            }
        } else {
            this.log('Cannot unsubscribe because not connected to Solace PubSub+ Event Broker.');
        }
    }

    disconnect() {
        this.log('Disconnecting from Solace PubSub+ Event Broker...');
        if (this.session !== null) {
            try {
                this.session.disconnect();
            } catch (error) {
                this.log(error.toString());
            }
        } else {
            this.log('Not connected to Solace PubSub+ Event Broker.');
        }
    }
}
