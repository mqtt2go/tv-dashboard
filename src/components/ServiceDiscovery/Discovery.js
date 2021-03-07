
import React, { Component } from 'react';
import Control from '../Control';
import { Focusable, FocusableSection } from 'react-js-spatial-navigation';
import classes from './Discovery.module.css';

class Discovery extends Component {

    state = {}
    loaded = false;
    txtRecords = {path: 'Path',product: 'Product Name',  provider: 'Provider', version: 'Version'};
    showRight = false;
    serviceAvailable = true;

    parseData(data){
        const services = {};
        data.forEach(service => {
            const node = {name: service.name, domain: service.domain, host: service.hostName, ipv4: service.addresses.ipv4, ipv6: service.addresses.ipv6,
                          type: service.type, subtype: service.subtype, port: service.port, record: service.properties};
            if (service.addresses.ipv4 in services){
                services[service.addresses.ipv4].push(node);
            } else {
                services[service.addresses.ipv4] = [node];
            }
        });
       this.setState({services: services, selIdx: 0, detailIdx: 0});
    }

    loadData() {
        /*fetch(process.env.PUBLIC_URL + '/zeroconf', {
           method: 'post',
           body: JSON.stringify(
               {
                   name: 'TV Dashboard at ' + window.location.hostname,
                   replaceWildcards: true,
                   serviceProtocol: 'any',
                   service: {
                       type: '_http._tcp',
                       subtype: '_mqtt2go._http._tcp',
                       port: 9,
                       txtRecord: {
                           version: '1.0',
                           provider: 'A1 Telekom Austria Group',
                           product: 'A1 Service Discovery'
                       }
                   }
               }
           ) 
        }).then(response => {
            if (!response.ok){
                throw new Error('Service Discovery not available');
            }
            fetch(process.env.PUBLIC_URL + '/services.json')
            .then(res => res.json())
            .then(results => {
                this.parseData(results);
            })
        }).catch(error => {
            console.log(error);
            this.serviceAvailable = false;
        })*/

        fetch(process.env.PUBLIC_URL + '/services.json')
        .then(res => res.json())
        .then(results => {
            this.parseData(results.services);
        })
    }

    componentDidUpdate(){
        if (this.loaded === false){
            this.loadData();
            this.loaded = true;
        }
    }

    changeIdx = (event, idx) => {
        if ('services' in this.state){
            this.showRight = false;
            this.setState({selIdx: idx, detailIdx: 0});
        }
    }

    changeDetailIdx = (event, idx) => {
        if ('services' in this.state){
            this.showRight = true;
            this.setState({detailIdx: idx});
        }
    }

    openLink = () => {
        const service = this.state.services[Object.keys(this.state.services)[this.state.selIdx]][this.state.detailIdx];
        const url = 'http://' + service['ipv4'] + ':' + String(service['port']) + (service.record['path'] ? service.record['path'] : '');
        window.open(url, '_blank');
    }

    getNodes(){
        if ('services' in this.state){
            return (Object.keys(this.state.services).map((key, idx) => {
                return(
                    <Focusable className={classes.Row + (idx === 0 ? ' menu-active' : '')} key={idx}
                        onFocus={(event) => this.changeIdx(event, idx)}
                        onKeyUp={(event) => this.props.hideMenu(event)}>
                        <p className={classes.Name}>{this.state.services[key][0].name}</p>
                        <p className={classes.Address}>{this.state.services[key][0].ipv4}</p>
                    </Focusable>
                )
            })
            )
        }
    }

    getServices(){
        if ('services' in this.state){
            const service = this.state.services[Object.keys(this.state.services)[this.state.selIdx]];
            return (
                <>
                    <p className={classes.Address}>Address</p>
                    <p className={classes.Name}>{service[0].host}</p>
                    <p className={classes.Name}>{service[0].ipv4}</p>
                    {service[0].ipv6 ? <p className={classes.Name}>{service[0].ipv6}</p> : <></>}
                    <div className={classes.InfoWrap}>
                        <p className={classes.Address}>Services</p>
                        {service.map((ser, idx) => {
                            return(
                                <Focusable className={classes.InfoRow} key={idx}
                                    onFocus={(event) => this.changeDetailIdx(event, idx)}
                                    onKeyUp={(event) => this.props.hideMenu(event)}>
                                    <p className={classes.Name}>{ser.name}</p>
                                    <p className={classes.Type}>{ser.type}</p>
                                </Focusable>
                            )
                        })}
                    </div>
                </>
            )
        }
    }

    getServiceDetail(){
        if ('services' in this.state){
            const service = this.state.services[Object.keys(this.state.services)[this.state.selIdx]][this.state.detailIdx];
            return(
                <FocusableSection sectionId='detail-service'
                    neighborUp=''
                    neighborDown=''
                    neighborLeft='@detail-services'
                    neighborRight=''
                    className={classes.RightPanel + ' ' + (this.showRight ? classes.Show : classes.Hide)}>
                        <>
                            <p className={classes.InfoHead}>IPv4</p>
                            <p className={classes.InfoValue}>{service.ipv4}</p>
                            {service.ipv6 ? <><p className={classes.InfoHead}>IPv6</p><p className={classes.InfoValue}>{service.ipv6}</p></> : <></>}
                            <p className={classes.InfoHead}>Port</p>
                            <p className={classes.InfoValue}>{service.port}</p>
                            <p className={classes.InfoHead}>Name</p>
                            <p className={classes.InfoValue}>{service.name}</p>
                            <p className={classes.InfoHead}>Domain</p>
                            <p className={classes.InfoValue}>{service.domain}</p>
                            {service.host ? <><p className={classes.InfoHead}>Host</p><p className={classes.InfoValue}>{service.host}</p></> : <></>}
                            <p className={classes.InfoHead}>Service Type</p>
                            <p className={classes.InfoValue}>{service.type}</p>
                            {service.subtype ? <><p className={classes.InfoHead}>Service Sub-Type</p><p className={classes.InfoValue}>{service.subtype}</p></> : <></>}
                            {Object.keys(service.record).map((item) => {
                                return(
                                    <div key={item}>
                                        <p className={classes.InfoHead}>{item}</p>
                                        <p className={classes.InfoValue}>{service.record[item]}</p>
                                     </div>
                                )
                            })}
                            <div className={classes.BtnWrap}>
                                <Focusable className={classes.Btn} onClickEnter={this.openLink} onKeyUp={(event) => this.props.hideMenu(event)}>Open</Focusable>
                            </div>
                        </>
                </FocusableSection>
            )
        }
    }
    getMenu() {
        if (this.props.menuVisible){
            if (!this.serviceAvailable){
                return(
                    <Control element={"Modal-Menu"}>
                        <div className={'modal-menu'} ref={this.props.modalRef}>
                            <div className={classes.ServiceWrap}>
                                <FocusableSection sectionId='back-btn'
                                    neighborUp=''
                                    neighborDown=''
                                    neighborLeft=''
                                    neighborRight=''>
                                    <Focusable className={classes.Back} onKeyUp={(event) => this.props.hideMenu(event, false)}>
                                        <img alt="back" src={process.env.PUBLIC_URL + '/back.svg'}/>
                                    </Focusable>
                                </FocusableSection>
                                <FocusableSection sectionId='main-service'
                                    neighborUp=''
                                    neighborDown=''
                                    neighborLeft='@back-btn'
                                    neighborRight=''
                                    className={classes.ErrorWrap}>
                                    <div className="Error-item">
                                        <img src={process.env.PUBLIC_URL + '/ws_error.svg'} alt="Error"/>
                                    </div>
                                    <div className="Error-item"><strong>Ups, da ist etwas schief gelaufen.</strong> Wahrscheinlich fehlt das Zeroconfiguration Networking Service. Bitte wenden Sie sich an den Gerätehersteller oder an Ihren Dienstanbieter.</div>
                                    <div className="Error-item"><strong>Ooops, something went wrong.</strong> Probably the Zeroconfiguration Networking Service is missing. Please contact the device manufacturer or your service provider.</div>
                                    <Focusable className="Error-item menu-active" onKeyUp={(event) => this.props.hideMenu(event, false)}>
                                        <div className="Error-btn">Zurück • Back</div>
                                    </Focusable>
                                </FocusableSection>
                            </div>
                        </div>
                    </Control>
                )
            }
            return(
                <Control element={"Modal-Menu"}>
                    <div className={'modal-menu'} ref={this.props.modalRef}>
                        <h1 className={classes.Title}>Service Discovery</h1>
                        <div className={classes.ServiceWrap}>
                            <FocusableSection sectionId='back-btn'
                                neighborUp=''
                                neighborDown=''
                                neighborLeft=''
                                neighborRight=''>
                                <Focusable className={classes.Back} onKeyUp={(event) => this.props.hideMenu(event, false)}>
                                    <img alt="back" src={process.env.PUBLIC_URL + '/back.svg'}/>
                                </Focusable>
                            </FocusableSection>
                            <FocusableSection sectionId='main-service'
                                neighborUp=''
                                neighborDown=''
                                neighborLeft='@back-btn'
                                neighborRight='@detail-services'
                                className={classes.LeftPanel}>
                                    <div className={classes.Frame}>
                                        {this.getNodes()}
                                    </div>
                            </FocusableSection>
                            <FocusableSection sectionId='detail-services'
                                neighborUp=''
                                neighborDown=''
                                neighborLeft='@main-service'
                                neighborRight='@detail-service'
                                className={classes.MidPanel}>
                                    <div className={classes.Frame}>
                                        {this.getServices()}
                                    </div>
                            </FocusableSection>
                            {this.getServiceDetail()}
                        </div>
                    </div>
                </Control>
            )
        }
    }
    

    render(){
        return (
            <Focusable className={classes.Item}
                onFocus={(event) => this.props.focusHandler(event)}
                onClickEnter={(event) => this.props.showMenu(event, 'discovery')}>
                <img src={process.env.PUBLIC_URL + '/cogwheel.svg'} alt='service_icon'/>
                <p>Services</p>
                {this.getMenu()}
            </Focusable>
        )
    }
}

export default Discovery;