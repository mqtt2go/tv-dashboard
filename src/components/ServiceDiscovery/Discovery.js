
import React, { Component } from 'react';
import Control from '../Control';
import { Focusable, FocusableSection } from 'react-js-spatial-navigation';
import classes from './Discovery.module.css';

class Discovery extends Component {

    state = {}
    loaded = 0;
    mainItems = [{key: 'ipv4', name: 'IPv4'}, {key: 'ipv6', name: 'IPv6'}, {key: 'port', name: 'Port'}, {key: 'name', name: 'Name'}, { key: 'domain', name: 'Domain'},
                 { key: 'host', name: 'Host'}, {key: 'type', name: 'Service Type'}, { key: 'subtype', name: 'Service Subtype'}]
    showRight = false;
    serviceAvailable = true;

    componentDidMount() {
        window.addEventListener('beforeunload', () => {
            console.log('Unregistering service');
        })
    }

    parseData(data){
        const services = {};
        data.forEach(service => {
            const node = {name: service.name, domain: service.domainName, host: service.hostName, ipv4: service.addresses.ipv4, ipv6: service.addresses.ipv6,
                          type: service.service.type, subtype: service.service.subtype, port: service.service.port, record: service.service.txtRecord};
            if (service.addresses.ipv4 in services){
                services[service.addresses.ipv4].push(node);
            } else {
                services[service.addresses.ipv4] = [node];
            }
        });
        if ('services' in this.state){
            this.setState({services: services});
        } else {
            this.setState({services: services, selIdx: 0, detailIdx: 0});
        }
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
        if (Date.now() - this.loaded > 60 * 1000){
            this.loadData();
            this.loaded = Date.now();
            console.log('Data Loaded');
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
                        <div className={classes.Frame}>
                            {this.mainItems.map((item, idx) => {
                                if (service[item.key]){
                                    return(
                                        <Focusable className={classes.DetailRow} key={'detail_' + idx}>
                                            <p className={classes.InfoHead}>{item.name}</p>
                                            <p className={classes.InfoValue}>{service[item.key]}</p>
                                        </Focusable>
                                    )
                                } else return(null)
                            })}
                            {Object.keys(service.record).map((item) => {
                                return(
                                    <Focusable className={classes.DetailRow} key={item}>
                                        <p className={classes.InfoHead}>{item}</p>
                                        <p className={classes.InfoValue}>{service.record[item]}</p>
                                    </Focusable>
                                )
                            })}
                            <div className={classes.BtnWrap}>
                                <Focusable key={'open_btn'} className={classes.Btn} onClickEnter={this.openLink} onKeyUp={(event) => this.props.hideMenu(event)}>Open</Focusable>
                            </div>
                        </div>
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