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
    enabled: undefined
  };

  componentDidMount() {
    addStorageListener(() => this.setup());
    this.setup();
  }

  setup() {
    getFromStorage('enabled').then((res) => {
      this.setState(typeof res.enabled === 'boolean' ? 
        res : 
        { enabled: true });
        // default value is enabled. will still undefined in storage untill one
        // turns the switch off.
    });
    isCurrentWebsiteBlocked().then(currentBlocked => {
      this.setState({ currentBlocked });
    });
  }

  onSwitchChange(enabled) {
    this.setState({ enabled });
    setHistoricalFirebase({ enabled});
    setInStorage({ enabled });
  }

  openOptionsPage() {
    if (window.chrome && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.history.pushState({ urlPath: '?page=options' }, '', '?page=options');
      window.location.reload(); // not ideal, but works.
    }
  }

  render() {
    return (
      <div className="Popup">
        <header className="Popup-header">
          <Row>
           <img src={logo} className="Popup-logo" alt="logo" />
            Distraction Shield
          </Row>
        </header>
        <Row className="Popup-status">
          <Col span={4}>
            Status:
          </Col>
          <Col style={{ textAlign: 'right'}}>
            <Switch
                    loading={this.state.enabled === undefined}
                    checked={this.state.enabled}
                    onChange={checked => this.onSwitchChange(checked)} 
                    checkedChildren="Enabled" 
                    unCheckedChildren="Disabled"/>
          </Col>
        </Row>
        <Row className="Popup-settings">
          <Col span={4}>
            Settings:
          </Col>
          <Col style={{ textAlign: 'right'}}>
            <Button type="default" shape="circle" icon="setting"
              onClick={() => this.openOptionsPage()}
            />
          </Col>
        </Row>   
        <Row className="Popup-current">
          <Col>
            <Button ghost={this.state.currentBlocked}
              type="primary" onClick={() => {
                !this.state.currentBlocked && blockCurrentWebsite();
                this.state.currentBlocked && unBlockCurrentWebsite();
              }}>
              {this.state.currentBlocked ? 'Unblock current page' : 'Block current page'}
            </Button>
          </Col>
        </Row>     
      </div>
    );
  }
}

export default Popup;
