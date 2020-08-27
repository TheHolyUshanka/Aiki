import { Button, Card, Col, Input, Layout, Row, Switch, Table, Tag } from 'antd';
import moment, { duration } from 'moment';
import React from 'react';
import ExerciseOptions from '../components/options/ExerciseOptions';
import Statistics from '../components/options/Statistics';
import { blockWebsite, setTimeout, unblockWebsite } from '../util/block-site';
import { defaultTimeoutInterval, s2 } from '../util/constants';
import { addStorageListener, getFromStorage } from '../util/storage';
import './Options.css';
const { Header, Content, Footer } = Layout;

let b = false;
const columns = [
  {
    title: 'Page Name',
    dataIndex: 'name',
    render: (name, site) => (
      <div>
        <img alt='favicon' className='site-favicon' src={`${s2}${site.hostname}`} />
        {name}
      </div>
    ),
    width: 150,
    ellipsis: true, 
  },
  {
    title: 'Page Url',
    dataIndex: 'hostname',
    render: hostname => (
      <code>{hostname}</code>
    ),
    width: 185,
    ellipsis: true,
  },
  {
    title: 'Temporarily disable',
    dataIndex: 'timeout',
    render: (timeout, site) => {
      
      const start = moment() // now
      const end = moment(timeout);
      
      let timedout = timeout && start.isSameOrBefore(end);
      
      const tillStr = end.format('HH:mm');

      const defTiInt = defaultTimeoutInterval / 60 / 1000;
      
      let now = new Date().valueOf();
      
      return (
        <div style={{ display: 'flex' }}>
          <Switch size="small" 
            checked={timedout}
            onChange={checked => 
              setTimeout(site, checked ? now + defaultTimeoutInterval : now)
            }
            style={{ marginRight: '5px' }}
            title="Toggle timeout of blockade" />
          {timedout === true && (
            <>
              <small style={{ display: 'flex', flexDirection: 'column' }}>
                <Tag color="blue" style={{
                  borderColor: 'transparent',
                  backgroundColor: 'transparent'
                }} title = {"Timed out untill " + tillStr } >
                  Untill {tillStr}
                </Tag>
              </small>
              <Button icon="minus" size="small" type="link"
                style={{ color: '#8c8c8c' }}
                onClick={() => setTimeout(site, timeout - defaultTimeoutInterval)} 
                title = {"Minus "+ defTiInt + " minutes to the timeout"}/>
              <Button icon="plus" size="small" type="link"
                style={{ color: '#8c8c8c' }}
                onClick={() => setTimeout(site, timeout + defaultTimeoutInterval)} 
                title = {"Add "+ defTiInt + " minutes to the timeout"}/>
            </>
          )}
        </div>
      );
    }
  },
  {
    title: 'Remove website from the list',
    dataIndex: 'hostname',
    render: hostname => (
      <Button type="link" shape="circle" icon="close"
        onClick={() => unblockWebsite(hostname)}
        className="remove-button"
        title="Remove interception"/>
    ),
    align: 'right'
  },
];

class Options extends React.Component {
  constructor(props) {
    super(props);
    this.addBlockedWebsiteInput = new React.createRef();
  }

  state = {
    blockedUrls: []
  }

  async componentDidMount() {
    if(b){
      firstTimeRunStorage("2");
      b = false;
    }
    addStorageListener(() => this.setup());
    this.setup();
  }

  setup() {
    getFromStorage('blockedUrls').then(res => {
      let blockedUrls = res.blockedUrls || [];
      this.setState({ blockedUrls });
    });
  }
  
  didAddBlockedWebsite(url) {
   this.addBlockedWebsiteInput.current.input.setValue('');
   blockWebsite(url);
  }

  renderLabel({ value }) {
    return duration(value).humanize();
  }

  render() {
    const Search = Input.Search;
    return (
      <Layout style={{ background: 'rgb(248, 249, 250)' }}>
        <Header>
            <Col span={12}>
              <header className="Options-header">
                Aiki
              </header>
            </Col>
            <Col span={11} offset={1}>
            <header className="Options-subheader">
              <i> 
                Exchange your procrastination into microlearnings 
              </i>
            </header>
            </Col>
        </Header>
        <Content style={{ padding: '20px 50px' }}>
          <Row type="flex" justify="center">
            <Col className="grid-col">
              <h4 className="grid-col-title">Time-wasting Websites</h4>
              <Card className="grid-card">
                <h4> Type in pages you feel like you spend a little too much time on here (e.g. facebook.com, reddit.com):</h4>
                <Search autoFocus ref={this.addBlockedWebsiteInput}
                      placeholder="Type the url here..." 
                      enterButton="Add"
                      onSearch={(e) => this.didAddBlockedWebsite(e)}
                      className='block-button'
                      borderColor='black'/>
            
                <Table columns={columns}
                      dataSource={this.state.blockedUrls.map(
                        (obj, key) => ({ ...obj, key })
                      )} />
                <h4> 
                  NB: You can still use these websites, Aiki is only suggesting you spend a little time learning each time.
                </h4>
              </Card>
            </Col>
          </Row>
          <Row type="flex" justify="center">
            <Col className="grid-col">
              <h4 className="grid-col-title">Language learning settings</h4>
              <Card className="grid-card">
                <ExerciseOptions />
              </Card>
            </Col>
          </Row>
          <Row type="flex" justify="center">
            <Col className="grid-col">
              <h4 className="grid-col-title">Statistics</h4>
              <Card className="grid-card">
                <Statistics />
              </Card>
            </Col>
          </Row>
        </Content>
        <Footer style={{ textAlign: 'center' }}>IT University of Copenhagen © 2020</Footer>
      </Layout>
    );
  }
}

export default Options;
