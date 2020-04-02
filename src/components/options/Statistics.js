import React from 'react';
import { addStorageListener, getFromStorage, setInStorage, } from '../../util/storage';
import {
    Pie,
    PieChart,
    Tooltip,
    Cell
} from 'recharts';
import { Table, Col, Row, Divider, Button} from 'antd';
import { defaultColors } from '../../util/constants';

const columns =[
  {
    title: 'Website',
    dataIndex: 'name',
    key: 'name',
    width: 125,
    ellipsis: true
  },
  {
    title: 'Intercepts',
    dataIndex: 'value',
    key: 'value',
    sorter: (a, b) => a.value - b.value
  }

];

class Statistics extends React.Component {
  state = {
    interceptsData: [],
    timeSpentLearningData: [],
    colors: defaultColors,
    firstTimeUsage: true
  }

  componentDidMount() {
    addStorageListener(() => this.setup());
    this.setup();
  }

  setup() {
    getFromStorage('intercepts',  'timeSpentLearning')
      .then(res => {
      let intercepts = res.intercepts || {};
      let interceptsData = Object.keys(intercepts).map(key => ({
        name: key,
        value: intercepts[key]
      }));
      interceptsData.sort(function(a,b) {
        return b.value - a.value});

      let timeSpentLearning = res.timeSpentLearning || {};
      let timeSpentLearningData = Object.keys(timeSpentLearning).map(key => ({
        name: key,
        value: Math.round(timeSpentLearning[key] / 1000 / 60) // minutes
      }));

      let firstTimeUsage = interceptsData.length === 0;
        this.setState({ interceptsData, timeSpentLearningData, firstTimeUsage });
    });

    setInStorage()
  }

  render() {
    return (
      <>
        {this.state.interceptsData.length === 0 &&(
        <Row>
          <h3 style={{textAlign: 'center'}}>
            Your stats will show up here as soon as you start using Aiki
          </h3>
        </Row>)}
        
        {this.state.interceptsData.length !== 0 && (
        <Row>
        <h4>Your most distracting sites are:</h4>
          <Col span = {15}>
            <PieChart width={300} height={300}>
                <Pie dataKey="value" isAnimationActive={false}
                        data={this.state.interceptsData}
                        cx={125} cy={150} outerRadius={80} fill="#8884d8"
                        label>
                          {
                            this.state.interceptsData.map((_, index) => <Cell fill={this.state.colors[index % this.state.colors.length]}/>)
                          }
                      </Pie>
                <Tooltip />
            </PieChart>
          </Col>
          <Col span = {9}>
            <Table 
              columns={columns}
              dataSource={this.state.interceptsData} />
          </Col>
          
        </Row>
        )}
        <Divider />
        <Row style={{textAlign:'center'}}>
          <Button
            size="large"
            type="primary" onClick={() => {
              window.location.assign('https://www.google.com');
            }}>
            {this.state.firstTimeUsage ? 'Start using Aiki' : 'Update settings'}
           </Button>
        </Row>

        {/* <Divider />
        <Row>
        <h4>Time spent on exercises:</h4>
          <BarChart
          width={400}
          height={300}
          data={this.state.timeSpentLearningData}
          margin={{
              top: 5, right: 30, left: 20, bottom: 5,
          }}
          >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Time spent (minutes)" />
          </BarChart>
        </Row> */}
      </>
    )
  }
}

export default Statistics;
