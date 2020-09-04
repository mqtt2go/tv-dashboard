import React, { Component } from 'react';
import './App.css';
import Cockpit from '../components/Cockpit/Cockpit';
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

const client = mqtt.connect(`mqtt://${window.location.hostname}:59001`, options);

//const client = mqtt.connect(`mqtt://192.168.42.172:9001`, options);

class App extends Component {

  state = {scenes: [], security: [], alert: [], activities: [], rooms: []}
  activities = [];

  menuVisible = false;
  selectedItem = null;
  alertMsg = null;
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
    if (value['status'] !== 'ok') this.alertMsg = value['message'];
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
    device[type] = value;
    this.setState({'rooms': rooms});
  }

  parseMqtt(topic, message){
    const device = topic.split('/');
    try {
      const data = JSON.parse(message);
      //console.log(topic, data);

      if (topic === 'BRQ/BUT/devices/out'){
        client.unsubscribe(topic);
        this.setState(data['value']);
        client.publish('BRQ/BUT/in', JSON.stringify({priority_level: 1, type: 'query_activities', timestamp: new Date().getTime()}));
        return;
      }

      if (topic === 'BRQ/BUT/out'){
        client.unsubscribe(topic);
        this.activities = data['value'];
        this.forceUpdate();
      }

      if (topic === 'BRQ/BUT/activities/out'){
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

      //if (this.menuVisible  || this.alertMsg) return;
      
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
    client.subscribe('BRQ/BUT/devices/out');
    client.subscribe('BRQ/BUT/activities/out');
    client.publish('BRQ/BUT/in', JSON.stringify({priority_level: 1, type: 'query_gui_dev', timestamp: new Date().getTime()}));

    client.subscribe('BRQ/BUT/+/+/out');
    client.subscribe('BRQ/BUT/events/in');
    client.on('message', (topic, message) => this.parseMqtt(topic, message.toString()));
    setInterval(() => this.updateCameraImage(), 15000);
  }

  shouldComponentUpdate(){
    if (this.menuVisible === true) {
      return false;
    }
    return true;
  }

  enterSelectedHandler = (event, id) => {

    let type = '';

    if (id.startsWith('scn')){
        type = 'scenes';
        client.publish('BRQ/BUT/in', JSON.stringify({priority_level: 2, type: 'set', timestamp: new Date().getTime(), value: {scene_id: id}}));
    }

    if (id.startsWith('sec')){
      type = 'security';
      client.publish('BRQ/BUT/security/in', JSON.stringify({priority_level: 2, type: 'arm', timestamp: new Date().getTime(), value: id === 'sec_1' ? true : false}));
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
    const modal = document.querySelector('.show-alert');
    modal.classList.remove('show-alert');
    const el = document.querySelector('.menu-active');
    if (el){
      el.focus();
    }
  }

  getAlert(){
    if(this.alertMsg){
      setTimeout(() => {
        const modal = document.querySelector('.Alert');
        modal.classList.add('show-alert');
      }, 50);
      return(
        <Control element={"Alert-Msg"}>
          <div className="Alert hide-alert">
            <img className="Warning-Icon" src={process.env.PUBLIC_URL + '/warning.svg'} alt='warning'></img>
            <div className="Alert-Wrap">
              <p className="Alert-Title">Alert!</p>
              <div className="Alert-Msg">{this.alertMsg}</div>
              <Focusable className="Alert-Btn alert-active"
                  onClickEnter={(event) => this.hideAlert()}
                  neighborUp=''
                  neighborDown=''
                  neighborLeft=''
                  neighborRight=''>Close</Focusable>
            </div>
          </div>
        </Control>
      )
    }
  }

  sendMQTTChange = (id, command_type, variable, data) => {
    const topic = `BRQ/BUT/${id}/${variable}/in`;
    const message = {type: command_type, timestamp: new Date().valueOf(), value: data};
    client.publish(topic, JSON.stringify(message));
    //console.log(topic, JSON.stringify(message));
  }

  commitChange = (id, room_id, new_state) => {
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
    e.target.scrollIntoView({behavior: 'smooth', inline: 'center', block: 'center'});
  }

  hideMenuHandler = (event) => {
    const keys = [8, 27, 403, 461];
    if (keys.includes(event.keyCode)){
      const modal = document.querySelector('.show');
      modal.classList.remove('show');
      modal.classList.add('hide');
      this.selectedItem = null;
      setTimeout(() => {
        this.switchFocusable(false, true);
      }, 300);
      this.activities = [];
      if (this.lastSelected) {
      this.lastSelected.focus();
      this.lastSelected = null;
      }
    }
  }


  showMenuHandler = (event, item) => {
    this.lastSelected = event.target;
    this.selectedItem = item;
    this.switchFocusable(true);
    if (this.selectedItem === 'activity'){
      client.publish('BRQ/BUT/in', JSON.stringify({type: 'query_log', timestamp: +new Date()}));
      client.subscribe('BRQ/BUT/out');
    }
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

  
  
  getContent(){
    if (this.state.rooms.length > 0){
    return(
      <SpatialNavigation className="App">
          <Cockpit homeName="A1 Smart Home"/>
          <div className="Overview Row">
              <div className="Scenes">
                <h3>Presets</h3>
                <FocusableSection className="Wrap" sectionId='scenes'>
                  <Scenes scenes={this.state.scenes} enterClicked={this.enterSelectedHandler} focusHandler={this.focused}/>
                </FocusableSection>
              </div>
              <div className="Security">
                <h3>Security</h3>
                <FocusableSection className="Wrap" sectionId='security'>
                  <Security security={this.state.security}
                      enterClicked={this.enterSelectedHandler}
                      focusHandler={this.focused}/>
                  <Alert status={this.state.alert}
                      alerts={this.state.alert}
                      enterClicked={this.enterShowHandler}
                      menuVisible={this.selectedItem === 'alert' ? true : false}
                      focusHandler={this.focused}
                      showAlert={this.alertMsg ? true : false}
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
                    showAlert={this.alertMsg ? true : false}/>
                <div className="Camera-Btn">
                  <img src={process.env.PUBLIC_URL + '/camera.svg'} alt='camera_icon'/>
                  <p>See all..</p>
                </div>
              </div>
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
