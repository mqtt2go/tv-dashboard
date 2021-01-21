import React, { Component } from 'react';
import './App.css';
import Cockpit from '../components/Cockpit/Cockpit';
import Tabs from '../components/Tabs/Tabs';
import Scenes from '../components/Scenes/Scenes';
import Security from '../components/Security/Security';
import Alert from '../components/Security/Alert';
import Activity from '../components/Activity/Activity';
import Devices from '../components/Devices/Devices';
import Control from '../components/Control';
import SpatialNavigation, { Focusable, FocusableSection } from 'react-js-spatial-navigation';


function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const mqtt = require('mqtt');
const options = {
    protocol: 'mqtt',
    clientId: makeid(8)
  };

//const client = mqtt.connect(`mqtt://${window.location.hostname}:59001`, options);
const client = mqtt.connect('mqtt://tv-dashboard.duckdns.org:59001', options);
//const client = mqtt.connect(`mqtt://192.168.42.172:9001`, options);

class App extends Component {
  homes = [{name: 'Brno Home', prefix: 'BRQ/BUT', info: 'Smart Home Service powered by <strong>Home Assistant</strong> with a <strong>MQTT2GO</strong> compliant Add-on by <strong>Brno University of Technology</strong>.', system: 'TurrisOS 5.0.3', model: 'Turris Omnia'},
           {name: 'Vienna Home', prefix: 'VIE/A1', info: 'Any Smart Home Service, e.g., Powered by <strong>Perenio</strong>, <strong>Tuya</strong>, or <strong>Vivalabs</strong> with an <strong>MQTT2GO</strong> compliant AddOn can be connected to the <strong>Xplore TV</strong> dashboard!', system: 'TurrisOS 5.0.3', model: 'Turris Omnia'}];
  //homes = [{name: 'Brno Home', prefix: 'BRQ/BUT', info: 'Smart Home Service powered by <strong>Home Assistant</strong> with a <strong>MQTT2GO</strong> compliant Add-on by <strong>Brno University of Technology</strong>.', system: 'PEJIR 7.1.3-CB-but-A1', model: 'PEJIR01_AABc'},
  //         {name: 'Vienna Home', prefix: 'VIE/A1', info: 'Any Smart Home Service, e.g., Powered by <strong>Perenio</strong>, <strong>Tuya</strong>, or <strong>Vivalabs</strong> with an <strong>MQTT2GO</strong> compliant AddOn can be connected to the <strong>Xplore TV</strong> dashboard!', system: 'PEJIR 7.1.3-CB-but-A1', model: 'PEJIR01_AABc'}];
  home_id = 0;
  state = {scenes: [], security: [], alert: [], activities: [], rooms: []};
  activities = [];

  menuVisible = false;
  selectedItem = null;
  alertMsg = null;
  update = true;
  lastSelected = null;

  componentDidUpdate(){
    if (this.selectedItem){
         setTimeout(() => {
             const el = document.querySelector('.menu-active');
             if(el){
                 el.focus();
             }
         }, 50);
     }
    if (this.alertMsg){
        setTimeout(() => {
          const el = document.querySelector('.alert-active');
            if(el){
                el.focus();
            }
        }, 50);
      }
  }

  eventsHandler = (value) => {
    const alerts = [...this.state['alert']];
    const activities = [...this.state['activities']];


    if (activities.length > 2){
      activities.pop();
    }
    activities.unshift({timestamp: +new Date() / 1000, message: value['message']});
    this.setState({'activities': activities});

    const idx = alerts.findIndex(item => {
      return item.event_name === value['event_name'];
    });

    if (idx === -1) return;
    alerts[idx] = value;
    alerts[idx]['timestamp'] = +new Date();
    if (value['status'] === 'alert') this.alertMsg = value['message'];
    this.setState({'alert': alerts});
  }

  changeStateHandler = (id, type, value) => {
    //console.log(id, type, value);

    const rooms = [...this.state['rooms']];
    let room_id = -1;
    let dev_id = -1;
    
    for (let i = 0; i < rooms.length; i++){
      const devIdx = rooms[i]['devices'].findIndex(item =>{
        return item.id === id;
      });
      if (devIdx >= 0){
          room_id = i;
          dev_id = devIdx;
          break;
      }
    }

    const device = rooms[room_id]['devices'][dev_id];

    if (device.type === 'blinds'){
      device.moving = false;
    }

    if (type === 'motion_detection'){
      device['events']['message'] = 'Motion detected now';
      device['events']['timestamp'] = +new Date();
      this.setState({'rooms': rooms});
      return;
    }

    if (device[type] === value) return;
    if (type === 'color') device['state'] = 'on';
    if (type === 'brightness' && value > 0) device['state'] = 'on';
    device[type] = value;
    this.setState({'rooms': rooms});
  }

  parseMqtt(topic, message){
    const device = topic.split('/');
    try {
      const data = JSON.parse(message);
      //console.log(topic, data);

      if (topic === `${this.homes[this.home_id].prefix}/devices/out`){
        client.unsubscribe(topic);
        this.setState(data['value']);
        client.publish(`${this.homes[this.home_id].prefix}/in`, JSON.stringify({priority_level: 1, type: 'query_activities', timestamp: new Date().getTime()}));
        return;
      }

      if (topic === `${this.homes[this.home_id].prefix}/out`){
        client.unsubscribe(topic);
        this.activities = data['value'];
        this.forceUpdate();
      }

      if (topic === `${this.homes[this.home_id].prefix}/activities/out`){
        client.unsubscribe(topic);
        this.setState({'activities': data['value']});
        return;
      }

      if (device[2] === 'events'){
        this.eventsHandler(data['value']);
        return;
      }

      if (device[3] === 'stream'){
        const el = document.querySelector('#camera-stream');
        if (el){
          el.src = data['value'];
        }
      }
      
      if (data['type'] === 'periodic_report'){
        this.changeStateHandler(device[2], device[3], data['report']['value']);
      } else if (device[3] === 'switch'){
        this.changeStateHandler(device[2], 'state', data['value']);
      } else {
        this.changeStateHandler(device[2], device[3], data['value']);
      }
    } catch (error) {
      return;
    }
  }

  componentDidMount() {
    client.subscribe(`${this.homes[this.home_id].prefix}/devices/out`);
    client.subscribe(`${this.homes[this.home_id].prefix}/activities/out`);
    client.publish(`${this.homes[this.home_id].prefix}/in`, JSON.stringify({priority_level: 1, type: 'query_gui_dev', timestamp: new Date().getTime()}));

    client.subscribe(`${this.homes[this.home_id].prefix}/+/+/out`);
    client.subscribe(`${this.homes[this.home_id].prefix}/events/in`);
    client.on('message', (topic, message) => this.parseMqtt(topic, message.toString()));
    setInterval(() => this.updateCameraImage(), 15000);

    window.history.pushState(null, null, window.location.pathname);
    window.history.replaceState({'home': true}, null, window.location.pathname);
    window.onpopstate = (event) => {
        if (event.state == null){
          if (this.lastSelected == null || !this.lastSelected.classList.contains('Tab')) {
            window.history.pushState({'home': true}, null, window.location.pathname);
            const tab = document.querySelector('.Active');
            tab.focus();
          } else{
            window.history.back();
          }
        } else if(event.state['home'] === true){
          const modal = document.querySelector('.show');
          modal.classList.remove('show');
          modal.classList.add('hide');
          this.selectedItem = null;
          this.switchFocusable(false, true);
          this.activities = [];
          if (this.lastSelected) {
            this.lastSelected.focus();
            this.lastSelected = null;
          }
        } 
      }
  }

  shouldComponentUpdate(){
    if (this.menuVisible === true && this.alertMsg){
      return true;
    }
    if (this.menuVisible === true || this.update === false) {
      return false;
    }
    return true;
  }

  enterSelectedHandler = (event, id) => {

    let type = '';

    if (id.startsWith('scn')){
        type = 'scenes';
        client.publish(`${this.homes[this.home_id].prefix}/in`, JSON.stringify({priority_level: 2, type: 'set', timestamp: new Date().getTime(), value: {scene_id: id}}));
    }

    if (id.startsWith('sec')){
      type = 'security';
      client.publish(`${this.homes[this.home_id].prefix}/security/in`, JSON.stringify({priority_level: 2, type: 'arm', timestamp: new Date().getTime(), value: id === 'sec_1' ? true : false}));
    }

    const items = [...this.state[type]];      

    items.forEach(item => {
      item['active'] = false;
    });

    const itemIdx = this.state[type].findIndex(item => {
      return item.id === id;
    });

    const item = items[itemIdx];
    item.active = true;
    this.setState({type: items});
  }

  updateCameraImage(){
    //if (this.menuVisible || this.alertMsg) return;
    const rooms = [...this.state['rooms']];
    rooms.forEach((room) => {
      room['devices'].forEach((device) =>{
        if(device.type === 'camera'){
          let url = new URL(device.image);
          url.search = '?random=' + Math.random();
          device.image = url.toString();

          const motion_diff = +new Date() - device.events.timestamp;
          if (motion_diff > 1800000) device.events.message = 'No motion detected';
          else if (motion_diff > 120000) device.events.message = `Motion detected ${Math.round(motion_diff / 60000)} mins ago`; 
          else if (motion_diff > 60000) device.events.message = `Motion detected 1 min ago`;
          else device.events.message = 'Motion detected now';
        }
      })
    })
    this.setState({rooms: rooms});
  }

  hideAlert(){
    this.alertMsg = null;
    this.update = true;
    const modal = document.querySelector('.show-alert');
    modal.classList.remove('show-alert');
    const el = document.querySelector('.menu-active');
    if (el){
      el.focus();
    } else{
      this.lastSelected.focus();
    }
    this.forceUpdate();
  }

  
  getAlert(){
    if(this.alertMsg){
      setTimeout(() => {
        const modal = document.querySelector('.Alert');
        modal.classList.add('show-alert');
        this.update = false;
      }, 50);
      return(
        <Control element={"Alert-Msg"}>
          <FocusableSection sectionId="alert-modal" className={"Alert hide-alert"}
              neighborUp=''
              neighborDown=''
              neighborLeft=''
              neighborRight=''>
            <img className="Warning-Icon" src={process.env.PUBLIC_URL + '/warning.svg'} alt='warning'></img>
            <div className="Alert-Wrap">
              <p className="Alert-Title">Alert!</p>
              <div className="Alert-Msg">{this.alertMsg}</div>
              <Focusable className="Alert-Btn alert-active" onClickEnter={(event) => this.hideAlert()}>Close</Focusable>
            </div>
          </FocusableSection>
        </Control>
      )
    }
  }

  sendMQTTChange = (id, command_type, variable, data) => {
    const topic = `${this.homes[this.home_id].prefix}/${id}/${variable}/in`;
    const message = {type: command_type, timestamp: new Date().valueOf(), value: data};
    client.publish(topic, JSON.stringify(message));
    //console.log(topic, JSON.stringify(message));
  }

  commitChange = (id, room_id, new_state) => {
    //this.menuVisible = true;
    const rooms = [...this.state['rooms']];
    const roomIdx = rooms.findIndex(item => {
        return item.id === room_id;
    });
    
    const devIdx = rooms[roomIdx]['devices'].findIndex(item =>{
        return item.id === id;
    });

    rooms[roomIdx]['devices'][devIdx] = new_state;
    this.setState({rooms: rooms});
  }

  switchFocusable = (isVisible, force = false) => {
      this.menuVisible = isVisible;
      if (isVisible || force) {
        this.forceUpdate();
      }
  }

  focused = (e) => {
    this.lastSelected = e.target;
    e.target.scrollIntoView({behavior: 'smooth', inline: 'center', block: 'center'});
  }

  setLastSelected = (target) => {
    this.lastSelected = target;
  }

  setSelected = (target) => {
    this.selectedItem = target;
  }

  hideMenuHandler = (event, key = true) => {
    const keys = [8, 27, 403, 461];
    if (keys.includes(event.keyCode) || key === false){
      window.history.back();
    }
  }

  backHandler = (event) => {
    if (event.keyCode === 27){
      window.history.back();
    }
  }

  showMenuHandler = (event, item) => {
    this.lastSelected = event.target;
    this.selectedItem = item;
    this.switchFocusable(true);
    if (this.selectedItem === 'activity'){
      client.publish(`${this.homes[this.home_id].prefix}/in`, JSON.stringify({type: 'query_log', timestamp: +new Date()}));
      client.subscribe(`${this.homes[this.home_id].prefix}/out`);
    }
    window.history.replaceState({'home': true}, null, window.location.pathname);
    window.history.pushState({'home': true}, null, window.location.pathname + 'menu');

    setTimeout(() => {
      const modal = document.querySelector('.hide');
      modal.classList.remove('hide');
      modal.classList.add('show');
      const el = document.querySelector('.menu-active');
      if(el){
          el.focus();
      }
      }, 50);
  }

  switchHomeHandler = (home) => {
    client.unsubscribe(`${this.homes[this.home_id].prefix}/devices/out`);
    client.unsubscribe(`${this.homes[this.home_id].prefix}/activities/out`);
    client.unsubscribe(`${this.homes[this.home_id].prefix}/+/+/out`);
    client.unsubscribe(`${this.homes[this.home_id].prefix}/events/in`);
    this.home_id = home;
    if (home === 1) {
      this.activities = [{}];
      this.setState({"scenes":[{"id":"scn_1","name":"Lights OFF","icon":"moon","active":false},{"id":"scn_2","name":"Lights ON","icon":"sun","active":false},{"id":"scn_3","name":"Movie time","icon":"movie","active":false},{"id":"scn_4","name":"Reading","icon":"glasses","active":false}],"alert":[{"event_name":"consumption_alert","message":"Power consumption within the limit.","status":"ok","timestamp":0},{"event_name":"movement_alert","message":"No movement detected.","status":"ok","timestamp":0},{"event_name":"humidity_alert","message":"Humidity within the limit.","status":"ok","timestamp":0},{"event_name":"temperature_alert","message":"Temperature within the limit.","status":"ok","timestamp":0},{"event_name":"lights_alert","message":"All lights in regular operation.","status":"ok","timestamp":0}],"security":[{"id":"sec_1","type":"button","name":"Arm","icon":"arm","active":false},{"id":"sec_2","type":"button","name":"Disarmed","icon":"disarm","active":true}],"activities":[{"timestamp": new Date().getTime() / 1000 - 125,"message":"Krystof is away"},{"timestamp": new Date().getTime() / 1000 - 915,"message":"Air conditioning turned On"},{"timestamp": new Date().getTime() / 1000 - 3652,"message":"Vacuum cleaner turned Off"}],"rooms":[{"id":"room_0","devices":[{"id":"camera1","name":"Living Room","type":"camera","image":"http://147.229.149.12:58123/local/images/livingroom.png","events":{"message":"No motion detected","timestamp":0}},{"id":"sb1","name":"RGB Lamp","type":"light_rgb","color":0,"brightness":0,"state":"off"},{"id":"sh25","name":"Window Blinds","type":"blinds","position":50},{"id":"plugs","name":"Air Conditioning","type":"socket","voltage":235,"current":0.42,"consumption":96.5,"state":"on"},{"id":"th16","name":"Projector","type":"switch","temperature":26.0,"humidity":54.7,"state":"off"}]},{"id":"room_1","devices":[{"id":"camera2","name":"Garden","type":"camera","image":"http://147.229.149.12:58123/local/images/garden.png","events":{"message":"No motion detected","timestamp":0}},{"id":"bulbs_non","name":"Foountain Light*","type":"light_rgb","technology":"Shelly","color":0,"brightness":60,"state":"on"},{"id":"ht_non","name":"Ambient Sensor*","type":"sensor","technology":"Shelly","temperature":24.0,"humidity":55.5},{"id":"fibaro_socket","name":"Pump*","type":"switch","technology":"Zwave","state":"off"}]},{"id":"room_None","devices":[{"id":"camera3","name":"Entrance","type":"camera","image":"http://147.229.149.12:58123/local/images/entrance.png","events":{"message":"No motion detected","timestamp":0}},{"id":"zipato_bulb_2_level","name":"Chandelier*","type":"light_level","technology":"ZWave","brightness":20,"state":"on"},{"id":"th16_2","name":"Vacuum cleaner","type":"switch","temperature":26.3,"humidity":52.1,"state":"off"}]}]});
    } else {
      client.subscribe(`${this.homes[this.home_id].prefix}/devices/out`);
      client.subscribe(`${this.homes[this.home_id].prefix}/activities/out`);
      client.publish(`${this.homes[this.home_id].prefix}/in`, JSON.stringify({priority_level: 1, type: 'query_gui_dev', timestamp: new Date().getTime()}));
      client.subscribe(`${this.homes[this.home_id].prefix}/+/+/out`);
      client.subscribe(`${this.homes[this.home_id].prefix}/events/in`);
      //client.on('message', (topic, message) => this.parseMqtt(topic, message.toString()));
    }
  }

  getContent(){
    if (this.state.rooms.length > 0){
    return(
      <SpatialNavigation className="App">
          <Cockpit homeName="A1 Smart Home"/>
          <FocusableSection className="Overview Tabs" sectionId='tabs'>
            <Tabs homes={this.homes}
              homeId={this.home_id}
              homeHandler={this.switchHomeHandler}
              focusHandler={this.focused}
              hideMenu={this.hideMenuHandler}/>
          </FocusableSection>
          <div className="Row">
              <div className="Scenes">
                <h3>Presets</h3>
                <FocusableSection className="Wrap" sectionId='scenes'>
                  <Scenes scenes={this.state.scenes} enterClicked={this.enterSelectedHandler} focusHandler={this.focused} sendBack={this.backHandler}/>
                </FocusableSection>
              </div>
              <div className="Security">
                <h3>Security</h3>
                <FocusableSection className="Wrap" sectionId='security'>
                  <Security security={this.state.security}
                      enterClicked={this.enterSelectedHandler}
                      sendBack={this.backHandler}
                      focusHandler={this.focused}/>
                  <Alert status={this.state.alert}
                      alerts={this.state.alert}
                      enterClicked={this.enterShowHandler}
                      menuVisible={this.selectedItem === 'alert' ? true : false}
                      focusHandler={this.focused}
                      showAlert={this.alertMsg ? true : false}
                      sendBack={this.backHandler}
                      showMenu={this.showMenuHandler}
                      hideMenu={this.hideMenuHandler}/>
                </FocusableSection>
              </div>
              <div className="Activity">
                <h3>Activity</h3>
                <div className="Wrap">
                  <Activity
                    activities={this.state.activities}
                    longActivities={this.activities}
                    menuVisible={this.selectedItem === 'activity' ? true : false}
                    showAlert={this.alertMsg ? true : false}
                    hideMenu={this.hideMenuHandler}
                    focusHandler={this.focused}
                    sendBack={this.backHandler}
                    showMenu={this.showMenuHandler}/>
                </div>
              </div>
            </div>
            <div className="Rooms">
              <h3>Rooms</h3>
              <div className="Row">
                <Devices rooms={this.state.rooms}
                    setChange={this.commitChange}
                    menuChange={this.switchFocusable}
                    mqttChange={this.sendMQTTChange}
                    focusHandler={this.focused}
                    hideMenu={this.hideMenuHandler}
                    lastSelectHandler={this.setLastSelected}
                    selectedItem={this.selectedItem}
                    selectedHandler={this.setSelected}
                    sendBack={this.backHandler}
                    showAlert={this.alertMsg ? true : false}/>
                <div className="Camera-Btn">
                  <img src={process.env.PUBLIC_URL + '/camera.svg'} alt='camera_icon'/>
                  <p>See all..</p>
                </div>
              </div>
            </div>
            <div className="Info-Message">
              <div dangerouslySetInnerHTML={{ __html: this.homes[this.home_id].info}}/>
              <div>Device Model: {this.homes[this.home_id].model} • Firmware version: {this.homes[this.home_id].system}</div>
            </div>
            <div id="Modal-Menu"></div>
            <div id="Alert-Msg"></div>
            {this.getAlert()}
        </SpatialNavigation>
    )} else {
      return(
        <div className='spinner'>
          <div className="sk-folding-cube">
            <div className="sk-cube1 sk-cube"></div>
            <div className="sk-cube2 sk-cube"></div>
            <div className="sk-cube4 sk-cube"></div>
            <div className="sk-cube3 sk-cube"></div>
          </div>
          <p>Loading...</p>
        </div>
      )
    }
  }

  render (){
    document.title = 'A1 TV Dashboard';
    return (
      <>{this.getContent()}</>
    );
  }
}
export default App;
