import { useEffect,useState } from 'react';
import solace from 'solclientjs';
import TopicPublisher from './api/TopicPublisher.mjs';
import TopicSubscriber from './api/TopicSubscriber.mjs';



export default function Home() {

  // State to track whether the effect should run
  const [runPub, setRunPub] = useState(false);
  const [runSub, setRunSub] = useState(false);


  // Specify connection parameters
  const hosturl = 'ws://localhost:8008';
  const username = 'admin';
  const vpn = 'default';
  const password = 'admin';


  useEffect(() => {

    if (!runPub) {
      return; // Don't run effect if runEffect is false
    }

        // Initialize factory with the most recent API defaults
    var factoryProps = new solace.SolclientFactoryProperties();
    factoryProps.profile = solace.SolclientFactoryProfiles.version10;
    solace.SolclientFactory.init(factoryProps);

    // enable logging to JavaScript console at WARN level
    // NOTICE: works only with ('solclientjs').debug
    solace.SolclientFactory.setLogLevel(solace.LogLevel.WARN);

    // create the publisher, specifying the name of the subscription topic
    var publisher = new TopicPublisher('tutorial/topic');

    // publish message to Solace PubSub+ Event Broker
    publisher.run(process.argv);

    // Cleanup function
    return () => {
      // Gracefully disconnect when component unmounts
      //publisher.disconnect();
    };
  }, [runPub]); 



  useEffect(() => {

    if (!runSub) {
      return; // Don't run effect if runEffect is false
    }

        // Initialize factory with the most recent API defaults
        var factoryProps = new solace.SolclientFactoryProperties();
        factoryProps.profile = solace.SolclientFactoryProfiles.version10;
        solace.SolclientFactory.init(factoryProps);
    
        // enable logging to JavaScript console at WARN level
        // NOTICE: works only with ('solclientjs').debug
        solace.SolclientFactory.setLogLevel(solace.LogLevel.WARN);


          // Create a new instance of TopicSubscriber
    const subscriber = new TopicSubscriber(solace, 'tutorial/topic');

      // Run the subscriber
    subscriber.run(process.argv);

      // Cleanup function
    return () => {
      // Gracefully disconnect when component unmounts
      subscriber.disconnect();
    };
  }, [runSub]); 



  



  const handleClickPub = () => {
    setRunPub(true); // Set runEffect to true to trigger the effect
  };

  const handleClickSub = () => {
    setRunSub(true); // Set runEffect to true to trigger the effect
  };

  return (
    <div>
        <h1>Welcome to My Next.js App</h1>
        {/* <TopicSubscriberButton /> */}

        <button onClick={handleClickPub}>Publish Topic</button>
        <button onClick={handleClickSub}>Subscribe Topic</button>

    </div>
  );
// pages/index.js (or any other page)



  
}
