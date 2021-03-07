
import React from 'react';
import Light from './Light/Light';
import Switch from './Switch/Switch';
import Blinds from './Blinds/Blinds';
import Socket from './Socket/Socket';
import Camera from './Camera/Camera';
import { FocusableSection } from 'react-js-spatial-navigation';

const Devices = (props) => {

    const getDevice = (device, room) => {
        if (device.type === 'switch' || device.type === 'light'){
            return <Switch item={device}
                        stateClicked={switchHandler}
                        backHandler={props.sendBack}
                        key={device.id} room={room.id}
                        focusHandler={props.focusHandler}/>
        }
        if (device.type === 'socket'){
            return <Socket item={device}
                        stateClicked={switchHandler}
                        backHandler={props.sendBack}
                        key={device.id} room={room.id}
                        focusHandler={props.focusHandler}/>
        }
        if (device.type.startsWith('light_')){
            return(
                <Light item={device}
                    modalRef={props.modalRef}
                    menuVisible={device === props.selectedItem ? true : false}
                    selectedItem={props.selectedItem}
                    showMenu={props.showMenu}
                    hideMenu={props.hideMenu}
                    stateClicked={stateHandler}
                    colorClicked={colorHandler}
                    bightnessClicked={brightnessHandler}
                    key={device.id}
                    room={room.id}
                    focusHandler={props.focusHandler}
                    showAlert={props.showAlert}
                    backHandler={props.sendBack}
                />
            )
        }
        if (device.type === 'blinds'){
            return(
                <Blinds item={device}
                    modalRef={props.modalRef}
                    menuVisible={device === props.selectedItem ? true : false}
                    showMenu={props.showMenu}
                    hideMenu={props.hideMenu}
                    levelClicked={blindsHandler}
                    key={device.id}
                    room={room.id}
                    focusHandler={props.focusHandler}
                    showAlert={props.showAlert}
                    backHandler={props.sendBack}
                />
            )
        }
        if (device.type === 'camera'){
            return(
                <Camera item={device}
                    modalRef={props.modalRef}
                    menuVisible={device === props.selectedItem ? true : false}
                    room={room}
                    key={device.id}
                    focusHandler={props.focusHandler}
                    showMenu={props.showMenu}
                    hideMenu={props.hideMenu}
                    showAlert={props.showAlert}
                    backHandler={props.sendBack}
                />
            )
        }
        return;
    }

    const switchHandler = (event, id, room, item) => {
        props.lastSelectHandler(event.target);
        item.state = item.state.toLowerCase() === 'off' ? 'on' : 'off';
        props.setChange(id, room, item);
        props.mqttChange(id, 'set', 'switch', item.state);
    }

    const stateHandler = (id, room, state) => {
        //console.log(id, room, state);
        const item = props.selectedItem;
        item.state = state;
        props.selectedHandler(null); 
        props.setChange(id, room, item);
        props.mqttChange(id, 'set', 'switch', state);
        window.history.back();
    }

    const blindsHandler = (id, room, level) => {
        //console.log(id, room, level);
        if (props.selectedItem.position !== level) props.selectedItem.moving = true;
        const item = props.selectedItem;
        item.position = level;
        props.selectedHandler(null);
        props.setChange(id, room, item);
        props.mqttChange(id, 'set', 'position', level);
        window.history.back();
    }

    const colorHandler = (id, room, color) => {
        //console.log(id, room, color);
        const aRgbHex = color.match(/.{1,2}/g);
        const rgb_color = {
            r: parseInt(aRgbHex[0], 16),
            g: parseInt(aRgbHex[1], 16),
            b: parseInt(aRgbHex[2], 16)
        };
        const item = props.selectedItem;
        item.color = rgb_color;
        props.selectedHandler(null);
        if (item.state === 'off') item.state = 'on';
        props.setChange(id, room, item);
        props.mqttChange(id, 'color', 'color', rgb_color);
        window.history.back();
    }

    const brightnessHandler = (id, room, brightness) => {
        const item = props.selectedItem;
        item.brightness = brightness;
        props.selectedHandler(null);
        if (item.state === 'off') item.state = 'on';
        props.setChange(id, room, item);
        props.mqttChange(id, 'brightness', 'brightness', brightness);
        window.history.back();
    }

    return(
        props.rooms.map((room) => {
            return(
                <FocusableSection className='Wrap-Vertical' key={room.id} sectionId={room.id}>
                    {
                        room.devices.map((device) => {
                            return(getDevice(device, room))
                        })
                    }
                </FocusableSection>
            )
        })
    )
}

export default Devices;