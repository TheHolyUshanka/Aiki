import React from 'react';
import { addStorageListener, getFromStorage, setInStorage } from '../../util/storage';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Pie,
    PieChart,
    Tooltip,
    XAxis,
    YAxis,
    Cell
} from 'recharts';
import { Table, Col, Row, Divider} from 'antd';
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
    colors: defaultColors
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
        this.setState({ interceptsData, timeSpentLearningData });
    });

    setInStorage()
  }

  render() {
    return (
      <>
        <Row>
        <h4>Your most distracting sites are:</h4>
          <Col span = {15}>
            <PieChart width={300} height={300}>
                <Pie dataKey="value" isAnimationActive={false}
                        data={this.state.interceptsData}
                        cx={125} cy={150} outerRadius={80} fill="#8884d8"
                        label>
                          {
                            this.state.interceptsData.map((entry, index) => <Cell fill={this.state.colors[index % this.state.colors.length]}/>)
                          }
                      </Pie>
                <Tooltip />
            </PieChart>
          </Col>
          <Col span = {9}>
            <Table columns={columns}
                      dataSource={this.state.interceptsData} />
          </Col>
        </Row>
        <Divider />
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
        </Row>
      </>
    )
  }
}

export default Statistics;
