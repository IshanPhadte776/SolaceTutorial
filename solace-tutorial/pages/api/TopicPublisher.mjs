import solace from 'solclientjs';

export default class TopicPublisher {
    constructor(topicName) {
        this.session = null;
        this.topicName = topicName;
    }

    // Other methods and properties of the TopicPublisher class

    // Logger
    log(line) {
        var now = new Date();
        var time = [('0' + now.getHours()).slice(-2), ('0' + now.getMinutes()).slice(-2),
            ('0' + now.getSeconds()).slice(-2)];
        var timestamp = '[' + time.join(':') + '] ';
        console.log(timestamp + line);
    }

    run(argv) {
        this.connect(argv);
    }

    connect(argv) {
        if (this.session !== null) {
            this.log('Already connected and ready to publish.');
            return;
        }

        // Extract params
        // if (argv.length < (2 + 3)) { // expecting 3 real arguments
        //     this.log('Cannot connect: expecting all arguments' +
        //         ' <protocol://host[:port]> <client-username>@<message-vpn> <client-password>.\n' +
        //         'Available protocols are ws://, wss://, http://, https://, tcp://, tcps://');
            
        // }


        const hosturl = 'ws://localhost:8008';
        const username = 'admin';
        const vpn = 'default';
        const pass = 'admin';
        
        //const hosturl = argv.slice(2)[0];
        this.log('Connecting to Solace PubSub+ Event Broker using url: ' + hosturl);
        const usernamevpn = argv.slice(3)[0];
        //const username = usernamevpn.split('@')[0];
        this.log('Client username: ' + username);
        //const vpn = usernamevpn.split('@')[1];
        this.log('Solace PubSub+ Event Broker VPN name: ' + vpn);
        //const pass = argv.slice(4)[0];
        
        // Create session
        try {
            this.session = solace.SolclientFactory.createSession({
                url: hosturl,
                vpnName: vpn,
                userName: username,
                password: pass,
            });
        } catch (error) {
            this.log(error.toString());
        }
        
        // Define session event listeners
        this.session.on(solace.SessionEventCode.UP_NOTICE, (sessionEvent) => {
            this.log('=== Successfully connected and ready to publish messages. ===');
            this.publish();
            //this.exit();
        });
        this.session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (sessionEvent) => {
            this.log('Connection failed to the message router: ' + sessionEvent.infoStr +
                ' - check correct parameter values and connectivity!');
        });
        // this.session.on(solace.SessionEventCode.DISCONNECTED, (sessionEvent) => {
        //     this.log('Disconnected.');
        //     if (this.session !== null) {
        //         this.session.dispose();
        //         this.session = null;
        //     }
        // });
        
        // Connect the session
        try {
            this.session.connect();
        } catch (error) {
            this.log(error.toString());
        }
    }

    // Publishes one message
    publish() {
        if (this.session !== null) {
            const messageText = 'Sample Message';
            const message = solace.SolclientFactory.createMessage();
            message.setDestination(solace.SolclientFactory.createTopicDestination(this.topicName));
            message.setBinaryAttachment(messageText);
            message.setDeliveryMode(solace.MessageDeliveryModeType.DIRECT);
            this.log('Publishing message "' + messageText + '" to topic "' + this.topicName + '"...');
            try {
                this.session.send(message);
                this.log('Message published.');
            } catch (error) {
                this.log(error.toString());
            }
        } else {
            this.log('Cannot publish because not connected to Solace PubSub+ Event Broker.');
        }
    }

    // exit() {
    //     this.disconnect();
    //     setTimeout(() => {
    //         //process.exit();
    //     }, 1000); // wait for 1 second to finish
    // }

    // Gracefully disconnects from Solace PubSub+ Event Broker
    // disconnect() {
    //     this.log('Disconnecting from Solace PubSub+ Event Broker...');
    //     if (this.session !== null) {
    //         try {
    //             this.session.disconnect();
    //         } catch (error) {
    //             this.log(error.toString());
    //         }
    //     } else {
    //         this.log('Not connected to Solace PubSub+ Event Broker.');
    //     }
    // }
}
