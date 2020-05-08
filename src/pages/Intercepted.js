import React from 'react';
import { Progress, message, Icon, Row, Col, Button, Empty } from 'antd';
import { getFromStorage, setInStorage, setInFirebase } from '../util/storage';
import {
    defaultExerciseSite,
    defaultExerciseSites,
    defaultexerciseDuration,
    defaultTimeout
} from '../util/constants';
import { parseUrl, setTimeout } from '../util/block-site';
import { duration } from 'moment';
import './Intercepted.css';

class Intercepted extends React.Component {
    state = {
      currentExerciseSite: '',
      timeLeft: 0,
      timestamp: new Date().getTime(),
      timer: null,
      exerciseSites: [],
      exerciseDuration: 0,
      timeWastedDuration: 0,
      timeSpentLearningTemp: {},
      closeSuccess: false,
      skipTimeLeft: 4000,
      skipped: false,
      countedTime: 0,
      countTimer: null
    }

    componentDidMount() {
        message.open({
            content: "Let's do something useful before having fun!",
            icon: <Icon type="smile" />
        });

        this.setup();

        let timer = setInterval(() => {
            let timestamp = new Date().getTime();
            let timePassed = timestamp - this.state.timestamp;

            if (!document.hasFocus()) timePassed = 0;

            let skipTimeLeft = this.state.skipTimeLeft - timePassed;

            let timeLeft = this.state.timeLeft - timePassed;

            if (timeLeft <= 0) clearInterval(this.state.timer)

            // update time spent learning on website
            getFromStorage('timeSpentLearning').then(res => {
                let timeSpentLearning = res.timeSpentLearning || {};
                let site = this.getExerciseSite();

                if (!site) return; // not found, do not update.

                let newExerciseTimeSpent = timeSpentLearning[site.name]
                                                + timePassed || timePassed;
                timeSpentLearning[site.name] = newExerciseTimeSpent;

                this.setState({timeSpentLearningTemp: timeSpentLearning});
                
                return setInStorage({ timeSpentLearning });
            }); 

            this.setState({ timeLeft, timestamp, skipTimeLeft });
        }, 1000);

        let countTimer = setInterval(() => {
            if(document.hasFocus() && this.state.timeLeft <= 0){
                let countedTime = this.state.countedTime + 1000;
                this.setState({ countedTime });
            }
        }, 1000);
        
        this.setState({ timer, countTimer });
    }

    setup() {
        getFromStorage('intercepts', 'currentExerciseSite',
                        'exerciseSites', 'exerciseDuration', 'timeWastedDuration').then(res => {
            let currentExerciseSite = res.currentExerciseSite || 
                defaultExerciseSite.name; // @FIXME dont assume.
            let exerciseSites = res.exerciseSites || defaultExerciseSites;
            let exerciseDuration = res.exerciseDuration || defaultexerciseDuration
            let timeLeft = exerciseDuration; // set initial time
            let timeWastedDuration = res.timeWastedDuration || defaultTimeout;

            this.setState({ currentExerciseSite, exerciseSites,
                            exerciseDuration, timeLeft, timeWastedDuration });

            let intercepts = res.intercepts || {};
            let parsed = parseUrl(this.getUrl());

            if (!parsed) return; // no url search param
            
            let count = intercepts[parsed.hostname] + 1 || 1;
            intercepts[parsed.hostname] = count;

            setInFirebase({ intercepts });
            return setInStorage({ intercepts });
        });
        
        window.addEventListener('beforeunload', (event) => {
            event.preventDefault();

            if(this.state.timeLeft <= 0){
                getFromStorage('timeSpentLearning').then(res => {
                    let timeSpentLearning = res.timeSpentLearning || {};
                    let site = this.getExerciseSite();
    
                    if (!site) return; // not found, do not update.
    
                    let newExerciseTimeSpent = timeSpentLearning[site.name]
                                                    + this.state.countedTime || this.state.countedTime;
                    timeSpentLearning[site.name] = newExerciseTimeSpent;
    
                    this.setState({timeSpentLearningTemp: timeSpentLearning});
                    
                    return setInStorage({ timeSpentLearning });
                });
                if(!this.state.closeSuccess){
                    this.onContinue();
                }
            }
                        
            return setInFirebase(this.state.timeSpentLearningTemp); 
        });
    }

    getUrl() {
        let params = (new URL(window.location)).searchParams; // since chrome 51, no IE
        return params.has('url') ? params.get('url') : '';
    }

    getExerciseSite() {
        return this.state.exerciseSites.find(site => {
            return site.name === this.state.currentExerciseSite;
        });
    }

    onContinue() {
        this.timeout();
        setInFirebase('Succes');
        this.setState({closeSuccess: true});
    }

    onSkip(){
        this.timeout();
        setInFirebase('Skipped');
    }

    timeout(){
        let url = parseUrl(this.getUrl());
        let now = new Date().valueOf();

        setTimeout(url, now + this.state.timeWastedDuration).then(() => {
            window.location.href = url.href;
        });
    }

    render() {
        let url = parseUrl(this.getUrl());
        let name = url && url.name
        let site = this.getExerciseSite();
        let progressPercentage = 100 - Math.round(
            (
                // convert to seconds first.
                Math.round(this.state.timeLeft / 1000)
                / 
                Math.round(this.state.exerciseDuration / 1000)
            ) * 100
        );

        // time left string
        let padZero = unit => unit <= 0 ? `00` : (unit < 10 ? `0${unit}` : `${unit}`);
        let timeLeftMoment = duration(this.state.timeLeft);
        let timeLeftString = `${padZero(timeLeftMoment.minutes())}:` +
                                `${padZero(timeLeftMoment.seconds())}`;

        return (
            <div>
                {site ? (
                    <iframe title="Interception page" 
                        width="100%"
                        src={site ? site.href : ''}
                        className="full-screen-iframe"
                        >
                    </iframe>
                ) : (
                    <Empty description="No exercise website"
                        style={{ height: '89vh', paddingTop: '30vh' }} />
                )}
                <div className="status-footer">
                    <Row className="status-bar">
                        <Progress 
                            percent={progressPercentage}
                            size="small"
                            showInfo={false}
                            strokeWidth={5}
                            />
                    </Row>
                    <Row
                        className="status-overlay">
                        <Col span={14} offset={4}>
                            {this.state.timeLeft > 0 &&
                            <div>Time left: &nbsp;
                                <small>
                                    <code>{timeLeftString}</code>
                                </small>
                            </div>
                            }

                            {this.state.timeLeft <= 0 &&
                                <div>Well done! You earned&nbsp;
                                {duration(this.state.timeWastedDuration).humanize()}
                                &nbsp;of browsing time.</div>
                            }
                        </Col>
                        <Col span={6}>
                            <Button className="success-button"
                                type="primary" 
                                icon="login"
                                disabled={this.state.timeLeft > 0}
                                loading={this.state.timeLeft > 0}
                                onClick={() => this.onContinue()}
                                >
                                Continue to  { name } 
                            </Button>
                        <Col className="between-buttons">
                            <Button className="skip-button"
                                type="dashed"
                                size="small"
                                disabled={this.state.skipTimeLeft > 0}
                                onClick={() => this.onSkip()}
                                >
                                Emergency skip to { name } 
                            </Button>
                        </Col>
                        </Col>
                    </Row>
                </div>                
            </div>
        );
    }
}
export default Intercepted;