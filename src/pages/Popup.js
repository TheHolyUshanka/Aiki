/* global chrome */
import React from 'react';
import logo from '../images/aikido.png';
import './Popup.css';
import { Switch, Button, Row, Col } from 'antd';
import {
  blockCurrentWebsite,
  isCurrentWebsiteBlocked,
  unBlockCurrentWebsite
} from '../util/block-site';
import {
  getFromStorage,
  setInStorage,
  addStorageListener,
  setHistoricalFirebase
} from '../util/storage';

class Popup extends React.Component {
  state = {
    currentBlocked: false,
    currentAnInterceptionSite: false,
    enabled: undefined,
    totalTimeSpentLearningData:0,
    totalIntercepts:0
  };

  componentDidMount() {
    addStorageListener(() => this.setup());
    this.setup();
  }

  setup() {
    getFromStorage('enabled',  'intercepts',  'timeSpentLearning')
      .then((res) => {
      this.setState(typeof res.enabled === 'boolean' ? 
        res : 
        { enabled: true });
        // default value is enabled. will still undefined in storage untill one
        // turns the switch off.
        let intercepts = res.intercepts || {};
        let totalIntercepts = Object.values(intercepts).reduce(function(a, b) {
          return a + b 
        },0);
        
        let timeSpentLearning = res.timeSpentLearning || {};
        let totalTimeSpentLearningData = Object.values(timeSpentLearning).reduce(function(a, b) {
          return a + b 
        },0);

        this.setState({totalIntercepts, totalTimeSpentLearningData});
    });
    isCurrentWebsiteBlocked().then(currentBlocked => {
      this.setState({ currentBlocked });
    });
  }

  onSwitchChangeExtension(enabled) {
    this.setState({ enabled });
    setHistoricalFirebase({ enabled});
    setInStorage({ enabled });
  }

  onSwitchChangeWebsite(enabled) {
    if(!enabled){
      blockCurrentWebsite();
    } else{
      unBlockCurrentWebsite();
    }
  }

  openOptionsPage() {
    if (window.chrome && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.history.pushState({ urlPath: '?page=options' }, '', '?page=options');
      window.location.reload(); // not ideal, but works.
    }
  }

  convertToMinutesAndSeconds(){
    let hours = Math.floor(this.state.totalTimeSpentLearningData / 3600000);
    let minutes = Math.floor((this.state.totalTimeSpentLearningData / 60000)%60);
    let seconds = ((this.state.totalTimeSpentLearningData % 60000) / 1000).toFixed(0);
    if(hours < 1) {
      return minutes + " min " + seconds + " sec";
    } else {
      return hours + " hours " + minutes + " min " + seconds + " sec";
    }
  }

  textForCurrentSite(){
    if(!this.state.currentBlocked)
      return "Is this a time-wasting site?";
    else if (this.state.currentBlocked){
      return "Is this a time-wasting site?";
    } else {
      return "";
    }
  }

  render() {
    return (
      <div className="Popup">
        <header className="Popup-header">
          <Row>
           <Col span={6}>
             <img src={logo} className="Popup-logo" alt="logo" />
           </Col>
           <Col>
              Aiki
           </Col>
          </Row>
        </header>
        <Row className="Popup-body">
          <Col span={12} className="Popup-settings">
            Settings:
          </Col>
          <Col span={8} offset={4} style={{ textAlign: 'center'}}>
            <Button type="default" shape="circle" icon="setting"
              onClick={() => this.openOptionsPage()}
            />
          </Col>
        </Row>
        <Row className="Popup-body">
          <Col span={12} >
            Status of extension:
          </Col>
          <Col span={8} offset={4} className="Popup-slider" style={{ textAlign: 'center'}}>
            <Switch
                    loading={this.state.enabled === undefined}
                    checked={this.state.enabled}
                    onChange={checked => this.onSwitchChangeExtension(checked)} 
                    checkedChildren="On" 
                    unCheckedChildren="Off"/>
          </Col>
        </Row>   
        <Row className="Popup-body">
          <Col span={12}>
            {this.textForCurrentSite()}
          </Col>
          <Col span={8} offset={4} className="Popup-slider" style={{ textAlign: 'center'}} >
            <Switch
                    checked={this.state.currentBlocked}
                    onChange={checked => this.onSwitchChangeWebsite(!checked)} 
                    checkedChildren="No" 
                    unCheckedChildren="Yes"/>
          </Col>         
        </Row>
        <Row className="Popup-body">
          <Col span={12} className="Popup-statistics-title">
            Number of language sessions: 
          </Col>
          <Col span={8} offset={4} className="Popup-statistics">
            {this.state.totalIntercepts}
          </Col>
        </Row> 
        <Row className="Popup-bottom">
          <Col span={12} className="Popup-statistics-title">
            Time spent learning:
          </Col>
          <Col span={12} className="Popup-statistics-time">
            {this.convertToMinutesAndSeconds()}
          </Col>
          {/* <Col>
            <Button ghost={this.state.currentBlocked}
              type="primary" onClick={() => {
                !this.state.currentBlocked && blockCurrentWebsite();
                this.state.currentBlocked && unBlockCurrentWebsite();
              }}>
              {this.state.currentBlocked ? 'Don\'t intercept this' : 'Intercept this page'}
            </Button>
          </Col> */}
        </Row>      
      </div>
    );
  }
}

export default Popup;
