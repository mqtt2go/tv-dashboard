
import React, { Component } from 'react';
import Light from './Light/Light';
import Switch from './Switch/Switch';
import Blinds from './Blinds/Blinds';
import Socket from './Socket/Socket';
import Camera from './Camera/Camera';
import { FocusableSection } from 'react-js-spatial-navigation';

class Devices extends Component {

    //selectedItem = null;
    //lastSelected = null;

    showMenuHandler = (event, device) => {
        this.props.selectedHandler(device);
        //this.lastSelected = event.target;
        this.props.lastSelectHandler(event.target);
        if (device.type === 'camera'){
            this.props.mqttChange(device.id, 'stream', 'stream', 'GET_STREAM');
        }
        window.history.pushState({'menu': true}, null, window.location.pathname + 'menu');
        this.props.menuChange(true);
    }

    getDevice = (device, room) => {
        if (device.type === 'switch' || device.type === 'light'){
            return <Switch item={device} stateClicked={this.switchHandler} key={device.id} room={room.id} focusHandler={this.focused}/>
        }
        if (device.type === 'socket'){
            return <Socket item={device} stateClicked={this.switchHandler} key={device.id} room={room.id} focusHandler={this.focused}/>
        }
        if (device.type.startsWith('light_')){
            return(
                <Light item={device}
                    menuVisible={device === this.props.selectedItem ? true : false}
                    selectedItem={this.props.selectedItem}
                    showMenu={this.showMenuHandler}
                    hideMenu={this.hideMenuHandler}
                    stateClicked={this.stateHandler}
                    colorClicked={this.colorHandler}
                    bightnessClicked={this.brightnessHandler}
                    key={device.id}
                    room={room.id}
                    focusHandler={this.focused}
                    showAlert={this.props.showAlert}
                />
            )
        }
        if (device.type === 'blinds'){
            return(
                <Blinds item={device}
                    menuVisible={device === this.props.selectedItem ? true : false}
                    showMenu={this.showMenuHandler}
                    hideMenu={this.hideMenuHandler}
                    levelClicked={this.blindsHandler}
                    key={device.id}
                    room={room.id}
                    focusHandler={this.focused}
                    showAlert={this.props.showAlert}
                />
            )
        }
        if (device.type === 'camera'){
            return(
                <Camera item={device}
                    menuVisible={device === this.props.selectedItem ? true : false}
                    room={room}
                    key={device.id}
                    focusHandler={this.focused}
                    showMenu={this.showMenuHandler}
                    hideMenu={this.hideMenuHandler}
                    showAlert={this.props.showAlert}
                />
            )
        }
        return;
    }

    componentDidUpdate(){
        if (this.props.selectedItem && this.props.showAlert === false){
            if (typeof this.props.selectedItem == "string") return;
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
    }

    hideMenuHandler = (event, key = true) => {
        const keys = [8, 27, 403, 461];
        if (keys.includes(event.keyCode) || key === false){
            window.history.back();
        }
    }

    switchHandler = (event, id, room, item) => {
        this.props.lastSelectHandler(event.target);
        item.state = item.state.toLowerCase() === 'off' ? 'on' : 'off';
        this.props.setChange(id, room, item);
        this.props.mqttChange(id, 'set', 'switch', item.state);
    }

    stateHandler = (id, room, state) => {
        //console.log(id, room, state);
        const item = this.props.selectedItem;
        item.state = state;
        this.props.selectedHandler(null); 
        this.props.setChange(id, room, item);
        this.props.mqttChange(id, 'set', 'switch', state);
        window.history.back();
    }

    blindsHandler = (id, room, level) => {
        //console.log(id, room, level);
        if (this.props.selectedItem.position !== level) this.props.selectedItem.moving = true;
        const item = this.props.selectedItem;
        item.position = level;
        this.props.selectedHandler(null);
        this.props.setChange(id, room, item);
        this.props.mqttChange(id, 'set', 'position', level);
        window.history.back();
    }

    colorHandler = (id, room, color) => {
        //console.log(id, room, color);
        const aRgbHex = color.match(/.{1,2}/g);
        const rgb_color = {
            r: parseInt(aRgbHex[0], 16),
            g: parseInt(aRgbHex[1], 16),
            b: parseInt(aRgbHex[2], 16)
        };
        const item = this.props.selectedItem;
        item.color = rgb_color;
        this.props.selectedHandler(null);
        if (item.state === 'off') item.state = 'on';
        this.props.setChange(id, room, item);
        this.props.mqttChange(id, 'color', 'color', rgb_color);
        window.history.back();
    }

    brightnessHandler = (id, room, brightness) => {
        const item = this.props.selectedItem;
        item.brightness = brightness;
        this.props.selectedHandler(null);
        if (item.state === 'off') item.state = 'on';
        this.props.setChange(id, room, item);
        this.props.mqttChange(id, 'brightness', 'brightness', brightness);
        window.history.back();
    }

    focused = (e) => {
       /*e.target.scrollIntoView({behavior: 'smooth', inline: 'center', block: 'center'});*/
        this.props.focusHandler(e)
    }

    render(){
        return(
            this.props.rooms.map((room) => {
                return(
                    <FocusableSection className='Wrap-Vertical' key={room.id} sectionId={room.id}>
                        {
                            room.devices.map((device) => {
                               return(this.getDevice(device, room))
                            })
                        }
                    </FocusableSection>
                )
            })
        )
    }
}

export default Devices;