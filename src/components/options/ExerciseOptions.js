import React from 'react';
import { addStorageListener, getFromStorage, setInStorage, setHistoricalFirebase } from '../../util/storage';
import { defaultExerciseSite, defaultExerciseSites, defaultexerciseDuration, s2, defaultTimeout } from '../../util/constants';
import { addExerciseSite, parseUrls, removeExerciseSite } from '../../util/block-site';
import { Row, Col, Input, Divider, TimePicker, Icon, Select, Button, Modal } from 'antd';
import moment from 'moment';

const { Option } = Select;

class ExerciseOptions extends React.Component {
  constructor(props) {
    super(props);
    this.addExerciseSiteInput = new React.createRef();
  }

  state = {
    currentExerciseSite: '',
    exerciseSites: [],
    exerciseDuration: 0,
    timeWastedDuration: 0,
    addSiteModalVisible: false,
    newExerciseSiteUrl: '',
    newExerciseSite: null
  }

  componentDidMount() {
    addStorageListener(() => this.setup());
    this.setup();
  }

  setup() {
    getFromStorage('currentExerciseSite', 'exerciseSites', 'exerciseDuration', 'timeWastedDuration')
      .then(res => {
        let currentExerciseSite = res.currentExerciseSite || defaultExerciseSite.name;
        let exerciseSites = res.exerciseSites || defaultExerciseSites;
        let exerciseDuration = res.exerciseDuration || defaultexerciseDuration;
        let timeWastedDuration = res.timeWastedDuration || defaultTimeout;
        if (exerciseSites.length === 0) currentExerciseSite = '';

      this.setState({ currentExerciseSite, exerciseSites, exerciseDuration, timeWastedDuration });
    });
  }

  setCurrentExerciseSite(currentExerciseSite) {
    setHistoricalFirebase({ currentExerciseSite});
    setInStorage({ currentExerciseSite }).then(() => {
      this.setState({ currentExerciseSite });
    });
  }

  // time is a moment object
  setExerciseDuration(time) {
    const exerciseDuration = time.valueOf();
    setHistoricalFirebase({ exerciseDuration });
    setInStorage({ exerciseDuration }).then(() => {
      this.setState({ exerciseDuration });
    });
  }

  setTimeWastingDuration(time) {
    const timeWastedDuration = time.valueOf();
    setHistoricalFirebase({ timeWastedDuration });
    setInStorage({ timeWastedDuration }).then(() => {
      this.setState({ timeWastedDuration });
    });
  }

  setAddSiteModalVisible(visible) {
    this.setState({ addSiteModalVisible: visible });
  }

  addExerciseSite() {
    let { newExerciseSite } = this.state;
    
    // set newly added exercise as current.
    this.setCurrentExerciseSite(newExerciseSite.name);

    addExerciseSite(newExerciseSite);
    this.closeModal();
  }

  setExerciseSiteUrl(e) {
    let newExerciseSiteUrl = e && e.target && e.target.value;

    let { newExerciseSite } = this.state;
    if (!newExerciseSiteUrl) newExerciseSite = null;

    this.setState({ newExerciseSiteUrl, newExerciseSite });
  }

  setExerciseSiteName() {
    if (!this.state.newExerciseSiteUrl) return;

    let urls = parseUrls(this.state.newExerciseSiteUrl);

    if (urls && urls.length === 1) {
      let newExerciseSite = urls[0];
      this.setState({ newExerciseSite });
    }
  }

  closeModal() {
    this.setState({ newExerciseSiteUrl: '', newExerciseSite: null });
    this.setAddSiteModalVisible(false);
  }

  removeCurrentExerciseSite() {
    const { currentExerciseSite, exerciseSites } = this.state;

    removeExerciseSite(currentExerciseSite);
    this.setCurrentExerciseSite(exerciseSites && exerciseSites.length > 0 ? 
        exerciseSites[0].name : '');
  }

  render() {
    return (
      <>
      <Row>
        <h4 style={{ textAlign: 'center'}}>
          Your language learning portal:
        </h4>
        <Col style={{ textAlign: 'center' }}>
          <Select
            value={this.state.currentExerciseSite}
            disabled="true"
            showArrow={false}
            style={{ width: 170 }}
            onChange={(e) => this.setCurrentExerciseSite(e)}
          >
            {this.state.exerciseSites.map((site, i) => {
                return (
                  <Option value={site.name} key={i}>
                    <img alt='favicon'
                      src={`${s2}${site.hostname}`} />&nbsp;
                    {site.name}
                  </Option>
                )
              }
            )}
          </Select><br/>
          {/* <Button ghost 
            onClick={() => this.setAddSiteModalVisible(true)}
            style={{ margin:'5px', color: '#40a9ff' }}>
            Add
          </Button>
          <Button ghost 
            onClick={() => this.removeCurrentExerciseSite()}
            style={{ margin:'5px', color: '#40a9ff' }}>
            Remove
          </Button>
          <Modal
            title="Add an exercise website"
            centered
            visible={this.state.addSiteModalVisible}
            onOk={() => this.addExerciseSite()}
            onCancel={() => this.closeModal()}
            width={350}
            cancelText=''
          >
            <Input placeholder="Exercise site url..."
                  onChange={e => this.setExerciseSiteUrl(e)}
                  onBlur={() => this.setExerciseSiteName()}
                  value={this.state.newExerciseSiteUrl}
                  style={{ margin: '20px 0px'}}
                  prefix={<Icon type="global" style={{ color: 'rgba(0,0,0,.25)' }} />}/>
            <Input placeholder="Name..."
                  onChange={e => {
                    let { newExerciseSite } = this.state;
                    newExerciseSite.name = e.target.value;
                    this.setState({ newExerciseSite });
                  }}
                  value={this.state.newExerciseSite && 
                          this.state.newExerciseSite.name}
                  style={{ margin: '20px 0px' }}
                  prefix={this.state.newExerciseSite &&
                    <img
                      alt='favicon'
                      src={`${s2}${this.state.newExerciseSite.hostname}`} />
                  }/>
          </Modal> */}
        </Col>
      </Row>
      <Divider />
      <Row justify="space-between" align="bottom">
        <h4 style={{ textAlign: 'center'}}>
          Choose the amount of time you want to spend learning:
        </h4>
        <Col style={{ textAlign: 'end'}}>
          Minutes | Seconds
        </Col>
        <Col span={12} style={{ textAlign: 'start'}}>
          Time on learning:
        </Col>
        <Col span={12} style={{ textAlign: 'end'}}>
            <TimePicker 
                allowClear={false}
                defaultValue={moment('12:08', 'mm:ss')}
                value={moment(this.state.exerciseDuration)}
                secondStep={5}
                suffixIcon={<Icon type="hourglass" />}
                format={'mm:ss'}
                onChange={time => this.setExerciseDuration(time)} />
        </Col>
        <Col span={8} style={{ textAlign: 'start'}}>
          Time you get on your time-wasting site in exchange: 
        </Col>
        <Col span={12} offset={4} style={{ textAlign: 'end', paddingTop: 10}}>
            <TimePicker 
                allowClear={false}
                defaultValue={moment('12:08', 'mm:ss')}
                value={moment(this.state.timeWastedDuration)}
                secondStep={5}
                suffixIcon={<Icon type="hourglass" />}
                format={'mm:ss'}
                onChange={time => this.setTimeWastingDuration(time)} />
        </Col>
      </Row> 
      </>
    )
  }
}

export default ExerciseOptions;
