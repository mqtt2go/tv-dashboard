
import React from 'react';
import classes from './Activity.module.css';
import { Focusable, FocusableSection } from 'react-js-spatial-navigation';
import Control from '../Control';

const activity = (props) => {

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const now = new Date();

    const getTimeValue = (timestamp) => {
        let date = '';
        const log_time = new Date(timestamp * 1000);
        if (now - log_time > 2 * 86400000) date = `${log_time.getDate()}. ${months[log_time.getMonth()]} ${log_time.getFullYear()}`; 
        else if (now - log_time >= 86400000) date = 'Yesterday';
        else date = 'Today';
        return `${date} - ${log_time.getHours()}:${log_time.getMinutes().toString().padStart(2, '0')}`;
    }

    const getLoading = () => {
        if (props.longActivities.length === 0){
            return(
                <div className={classes.Loader}>
                    <p>Loading...</p>
                </div>
                )
        }
    }

    const getMenu = (data) => {
        if (props.menuVisible){
            return(
                <Control element={"Modal-Menu"}>
                    <div className={classes.ActivityMenu + (props.showAlert || props.longActivities.length > 0 ? ' show' : ' hide')} onKeyUp={(event) => props.hideMenu(event)}>
                        <h1 className={classes.Title}>Activities Log</h1>
                        <FocusableSection sectionId='activity-menu'
                                neighborUp=''
                                neighborDown=''
                                neighborLeft='@back-btn'
                                neighborRight=''
                                className={classes.ActivityPanel}>
                            <div className={classes.Frame}>
                                {data.map((activity, idx) => {
                                    return(
                                        <Focusable className={classes.Row + (idx === 0 ? ' menu-active' : '')} key={idx}>
                                            <p className={classes.Time}>{getTimeValue(activity.timestamp)}</p>
                                            <p className={classes.Message} >{activity.message}</p>
                                        </Focusable>
                                    )
                                })
                                }
                                {getLoading()}
                            </div>
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

    return(
        <Focusable className={classes.Activity}
            onFocus={(event) => props.focusHandler(event)}
            onKeyUp={(event) => props.sendBack(event)}
            onClickEnter={(event) => props.showMenu(event, 'activity')}>
            {props.activities.map((activity, idx) =>{
                return (
                    <div className={classes.Row} key={idx}>
                        <p className={classes.Time}>{getTimeValue(activity.timestamp)}</p>
                        <p className={classes.Message} >{activity.message}</p>
                    </div>
                )
            })
        }
        {getMenu(props.longActivities.length > 0 ? props.longActivities : props.activities)}
        </Focusable>
    )
}

export default activity;