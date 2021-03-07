
import React from 'react';
import classes from './Light.module.css';
import { Focusable, FocusableSection } from 'react-js-spatial-navigation';
import Control from '../../Control';

const light = (props) => {

    const colors = [{class: "White", value: 'FFFFFF'}, {class: "Red", value: 'FF0000'}, {class: "Orange", value: 'F2B329'},
                     {class: "Yellow", value: 'FFFF00'}, {class: "Green", value: '00FF00'}, {class: "Azure", value: '00FFFF'},
                     {class: "Blue", value: '0000FF'}, {class: "Magenta", value: 'FF00FF'}];
    const brightness = [{class: "Ten", value: 10}, {class: "Twentyfive", value: 25}, {class: "Fifty", value: 50},
                        {class: "Seventyfive", value: 75}, {class: "Hundered", value: 100}];

    const getIcon = (dev_type, state) => {
        let icon = "";
        switch(dev_type){
            case 'light_level': icon = 'bulb';
                break;
            case 'light_rgb': icon = 'bulb_rgb';
                break;
            default:
                icon = 'bulb';
        }
        if (state.toLowerCase() === 'off'){
            icon += '_off';
        }
        return icon;
    };

    const getState = (state, level) => {
        if (state.toLowerCase() === 'off'){
            return 'Off';
        }
        if (state.toLowerCase() === 'on'){
            if (level){
                return Math.round(level) + ' %';
            }
            return 'On'
        }
    }

    const getColors = () => {
        if (props.item.type === 'light_rgb'){
            return (
                <FocusableSection
                    sectionId='color'
                    neighborUp='@buttons'
                    neighborDown='@brightness'
                    neighborLeft='@back-btn'
                    neighborRight=''
                    className={classes.ColorWrap}>
                    {
                        colors.map((color, idx) => {
                            return <Focusable className={[classes.ColorItem, classes[color.class]].join(" ")} key={idx}
                                                onClickEnter={() => props.colorClicked(props.item.id, props.room, color.value)}/>
                        })
                    }
                </FocusableSection>
            )
        }
        return null;
    }
    
    const getMenu = () => {
        if (props.menuVisible){
            return(
                    <Control element={"Modal-Menu"}>
                        <div ref={props.modalRef} className={'modal-menu'} onKeyUp={(event) => props.hideMenu(event, props.item.id, props.room)}>
                            <h1 className={classes.Title}>{props.item.name}</h1>
                                <FocusableSection sectionId='buttons'
                                    neighborUp=''
                                    neighborDown={props.item.type === 'light_rgb' ? '@color' : '@brightness'}
                                    neighborLeft='@back-btn'
                                    neighborRight=''
                                    className={classes.StateBtnWrap}>
                                    <Focusable className={classes.StateBtn + ' menu-active'} onClickEnter={() => props.stateClicked(props.item.id, props.room, 'on')}>
                                        <img className={classes.Icon} src={process.env.PUBLIC_URL + '/bulb.svg'} alt='icon'/>
                                        <p>Turn On</p>
                                    </Focusable>
                                    <Focusable className={classes.StateBtn} onClickEnter={() => props.stateClicked(props.item.id, props.room, 'off')}>
                                        <img className={classes.Icon} src={process.env.PUBLIC_URL + '/bulb_off.svg'} alt='icon'/>
                                        <p>Turn Off</p>
                                    </Focusable>
                                </FocusableSection>
                                {getColors()}
                                <FocusableSection
                                    sectionId='brightness'
                                    neighborUp={props.item.type === 'light_rgb' ? '@color' : '@buttons'}
                                    neighborDown=''
                                    neighborLeft='@back-btn'
                                    neighborRight=''
                                    className={classes.BrightnessWrap}>
                                    {
                                        brightness.map((brightness, idx) => {
                                            return <Focusable
                                                        className={[classes.BrightnessItem, classes[brightness.class]].join(" ")} key={idx}
                                                        onClickEnter={() => props.bightnessClicked(props.item.id, props.room, brightness.value)}>
                                                            {brightness.value + '%'}
                                                    </Focusable>
                                        })
                                    }
                                </FocusableSection>
                                <FocusableSection sectionId='back-btn'
                                    neighborUp=''
                                    neighborDown=''
                                    neighborLeft=''
                                    neighborRight=''>
                                    <Focusable className={classes.Back} onKeyUp={(event) => props.hideMenu(event, false)}>
                                        <img alt="back" src={process.env.PUBLIC_URL + '/back.svg'}/>
                                    </Focusable>
                                </FocusableSection>
                        </div>
                    </Control>
                )
            }
        }

    return(<Focusable className={classes.Item}
                onClickEnter={(event) => props.showMenu(event, props.item)}
                onKeyUp={(event) => props.backHandler(event)}
                onFocus={(event) => props.focusHandler(event)}>
            <div className={classes.Wrap}>
                <img className={classes.Icon} src={process.env.PUBLIC_URL + '/' + getIcon(props.item.type, props.item.state) + '.svg'} alt='icon' />
                <p className={classes.Name}>{props.item.name}</p>
                <p className={classes.Technology}>{props.item.technology}</p>
                <div className={classes.State}>
                    <p>{getState(props.item.state, props.item.brightness)}</p>
                </div>
            </div>
            {getMenu()}
        </Focusable>)
}

export default light;