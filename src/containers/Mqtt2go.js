import React, { Component } from 'react';

class Mqtt2go extends Component{
    mqtt = require('mqtt');

    options = {
        protocol: 'mqtt',
        clientId: 'tv-dashboard'
    };

    client = null;

    constructor(props){
        super(props);
        this.client = this.mqtt.connect(props.url, this.options);
        this.client.subscribe('BRQ/BUT/out');
        this.client.on('message', (topic, message) => {
            if (topic === 'BRQ/BUT/out'){
              //this.setState(JSON.parse(message.toString()))
              console.log(JSON.parse(message.toString()));
              this.props.onMessage(JSON.parse(message.toString()));
            }
            
          });
        this.getConfig();
    }

    getConfig(){
        const msg = {
          type: 'command',
          priority_level: 1,
          command_type: 'query_gui_dev',
          timestamp: new Date().getTime()
        }
        this.client.publish('BRQ/BUT/in', JSON.stringify(msg));
    }

    render(){
        return <div className={this.props.className}>{this.props.children}</div>
    }
}

export default Mqtt2go;