
import React, { Component } from 'react';
import Light from './Light/Light';
import Switch from './Switch/Switch';
import Blinds from './Blinds/Blinds';
import Socket from './Socket/Socket';
import Camera from './Camera/Camera';
import { FocusableSection } from 'react-js-spatial-navigation';

class Devices extends Component {

    selectedItem = null;
    lastSelected = null;

    showMenuHandler = (event, device) => {
        this.selectedItem = device;
        this.lastSelected = event.target;
        if (device.type === 'camera'){
            this.props.mqttChange(device.id, 'stream', 'stream', 'GET_STREAM');
        }
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
                    menuVisible={device === this.selectedItem ? true : false}
                    selectedItem={this.selectedItem}
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
                    menuVisible={device === this.selectedItem ? true : false}
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
                    menuVisible={device === this.selectedItem ? true : false}
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
      if (this.selectedItem && this.props.showAlert === false){
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

    hideMenuHandler = (event, id, room) => {
        const keys = [8, 27, 403, 461];
        if (keys.includes(event.keyCode)){
            const modal = document.querySelector('.show');
            modal.classList.remove('show');
            modal.classList.add('hide');
            this.props.menuChange(false, true);
            this.selectedItem = null;
            if (this.lastSelected) {
                this.lastSelected.focus();
                this.lastSelected = null;
            }
        }
    }

    /*hideCameraHandler = (event) => {
        if (event.keyCode === 8 || event.keyCode === 27 || event.keyCode === 403){
            const modal = document.querySelector('.show');
            modal.classList.remove('show');
            modal.classList.add('hide');
            this.selectedItem = null;
            if (this.lastSelected) {
                this.lastSelected.focus();
                this.lastSelected = null;
            }
        }
    }*/

    switchHandler = (event, id, room, item) => {
        this.lastSelected = event.target;
        item.state = item.state.toLowerCase() === 'off' ? 'on' : 'off';
        this.props.setChange(id, room, item);
        this.props.mqttChange(id, 'set', 'switch', item.state);
    }

    stateHandler = (id, room, state) => {
        //console.log(id, room, state);
        this.selectedItem.state = state;
        this.props.setChange(id, room, this.selectedItem);
        this.props.mqttChange(id, 'set', 'switch', state);
    }

    blindsHandler = (id, room, level) => {
        //console.log(id, room, level);
        if (this.selectedItem.position !== level) this.selectedItem.moving = true;
        this.selectedItem.position = level;
        this.props.setChange(id, room, this.selectedItem);
        this.props.mqttChange(id, 'set', 'position', level);
    }

    colorHandler = (id, room, color) => {
        console.log(id, room, color);
        const aRgbHex = color.match(/.{1,2}/g);
        const rgb_color = {
            r: parseInt(aRgbHex[0], 16),
            g: parseInt(aRgbHex[1], 16),
            b: parseInt(aRgbHex[2], 16)
        };
        this.selectedItem.color = rgb_color;
        if (this.selectedItem.state === 'off') this.selectedItem.state = 'on';
        this.props.setChange(id, room, this.selectedItem);
        this.props.mqttChange(id, 'color', 'color', rgb_color);
    }

    brightnessHandler = (id, room, brightness) => {
        this.selectedItem.brightness = brightness;
        if (this.selectedItem.state === 'off') this.selectedItem.state = 'on';
        this.props.mqttChange(id, 'brightness', 'brightness', brightness);
    }

    focused = (e) => {
       e.target.scrollIntoView({behavior: 'smooth', inline: 'center', block: 'center'});
       /*console.log(e.target.closest('.Wrap-Vertical'));
       e.target.closest('.Wrap-Vertical').scrollIntoView({behavior: 'smooth'})*/
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