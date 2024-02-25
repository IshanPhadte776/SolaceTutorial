import { useEffect } from 'react';
import solace from 'solclientjs';
import TopicPublisher from './api/TopicPublisher.mjs';



export default function Home() {

  // Specify connection parameters
  const hosturl = 'ws://localhost:8008';
  const username = 'admin';
  const vpn = 'default';
  const password = 'admin';


  useEffect(() => {
    //Create the publisher instance
    // var publisher = new TopicPublisher(solace, 'tutorial/topic');

    // //Run the publisher
    // publisher.run([null, null, hosturl, `${username}@${vpn}`, password]);

        // Initialize factory with the most recent API defaults
    var factoryProps = new solace.SolclientFactoryProperties();
    factoryProps.profile = solace.SolclientFactoryProfiles.version10;
    solace.SolclientFactory.init(factoryProps);

    // enable logging to JavaScript console at WARN level
    // NOTICE: works only with ('solclientjs').debug
    solace.SolclientFactory.setLogLevel(solace.LogLevel.WARN);

    // create the publisher, specifying the name of the subscription topic
    var publisher = new TopicPublisher(solace, 'tutorial/topic');

    // publish message to Solace PubSub+ Event Broker
    publisher.run(process.argv);

    // Cleanup function
    return () => {
      // Gracefully disconnect when component unmounts
      publisher.disconnect();
    };
  }, []); // Empty dependency array ensures this effect runs only once when component mounts

  return (
    <div>
        <h1>Welcome to My Next.js App</h1>
        {/* <TopicSubscriberButton /> */}
    </div>
  );
// pages/index.js (or any other page)



  
}
