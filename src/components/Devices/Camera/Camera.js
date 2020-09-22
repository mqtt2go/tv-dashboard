
import React from 'react';
import classes from './Camera.module.css';
import { Focusable, FocusableSection } from 'react-js-spatial-navigation';
import Control from '../../Control';

const camera = (props) => {

    const getEnvironmet = () => props.room['devices'].map((env, idx) => {
        let temp, hum;
        if (env.temperature !== undefined && (env.type === 'switch' || env.type === 'sensor')){
            temp = <div className={classes.Environment}>
                        <img src={process.env.PUBLIC_URL + '/temperature.svg'} alt='temp'/>
                        <p>{(parseFloat(env.temperature)).toFixed(1)}°</p>
                    </div>
        }
        if (env.humidity !== undefined){
            hum = <div className={classes.Environment}>
                        <img src={process.env.PUBLIC_URL + '/humidity.svg'} alt='humidity'/>
                        <p>{(parseFloat(env.humidity)).toFixed(1)}%</p>
                  </div>
        }
        return (
            <div className={classes.EnvWrap} key={idx}>
                {temp}
                {hum}
            </div>
        )
    });

    const getMenu = () => {
        if (props.menuVisible){
            return(
                <Control element={"Modal-Menu"}>
                    <div className={classes.CameraMenu + (props.showAlert ? ' show' : ' hide')}>
                        <FocusableSection className={classes.MenuWrap} neighborUp='' neighborDown='' neighborLeft='@back-btn' neighborRight='' sectionId='camera-stream'>
                            <Focusable className={classes.StreamWrap + ' menu-active'} onKeyUp={(event) => props.hideMenu(event)}>
                                    <p className={classes.Name + ' ' + classes.Shadow}>{props.item.name}</p>
                                    <p className={classes.Live}>Live</p>
                                    <img id="camera-stream" src={props.item.image} alt="Camera stream"></img>
                            </Focusable>
                        </FocusableSection>
                        <FocusableSection sectionId='back-btn' neighborUp='' neighborDown='' neighborLeft='' neighborRight=''>
                            <Focusable className={classes.Back} onKeyUp={(event) => props.hideMenu(event, false)}>
                                <img alt="back" src={process.env.PUBLIC_URL + '/back_w.svg'}/>
                            </Focusable>
                        </FocusableSection>
                    </div>
                </Control>
            )
        }
    }

    return(
        <Focusable className={classes.Item}
            onFocus={(event) => props.focusHandler(event)}
            onClickEnter={(event) => props.showMenu(event, props.item)}>
            <div className={classes.ContWrap}>
                        <img className={classes.Background} src={props.item.image} alt='camera_icon'/>
                        <div className={classes.Shadow}>
                            <p className={classes.Name}>{props.item.name}</p>
                            {getEnvironmet()}
                        </div>
                        <div className={classes.Movement}>
                            <img className={classes.Background} src={process.env.PUBLIC_URL + '/dots.svg'} alt='dots'/>
                            <p>{props.item.events.message}</p>
                        </div>
                    </div>
                    {getMenu()}
        </Focusable>
    )
}

export default camera;