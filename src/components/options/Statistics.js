import React from 'react';
import { addStorageListener, getFromStorage } from '../../util/storage';
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
    interceptsData: [{"name":"a.dk", "value":2},
                    {"name":"b.dk", "value":3},
                    {"name":"c.dk", "value":1},
                    {"name":"d.dk", "value":2},
                    {"name":"e.dk", "value":4},
                    {"name":"f.dk", "value":5}],
    timeSpentLearningData: [{"name":"a.dk", "value":2},
    {"name":"b.dk", "value":3},
    {"name":"c.dk", "value":1}],
    COLORS: []
  }

  componentDidMount() {
    addStorageListener(() => this.setup());
    this.setup();
  }

  setup() {
    // getFromStorage('intercepts',  'timeSpentLearning')
    //   .then(res => {
    //   let intercepts = res.intercepts || {};
    //   let interceptsData = Object.keys(intercepts).map(key => ({
    //     name: key,
    //     value: intercepts[key]
    //   }));

    //   let timeSpentLearning = res.timeSpentLearning || {};
    //   let timeSpentLearningData = Object.keys(timeSpentLearning).map(key => ({
    //     name: key,
    //     value: Math.round(timeSpentLearning[key] / 1000 / 60) // minutes
    //   }));

    //   this.setState({ interceptsData, timeSpentLearningData });
    // });
    this.setState({ COLORS: ['#0088FE', '#00C49F', '#FFBB28', '#FF2F30', '#a52a2a', '#8884d8'] });
    this.setState({ interceptsData: 
                    this.state.interceptsData.sort(function(a,b) {
                      return b.value - a.value})});
  }

  render() {
    return (
      <>
        <Row>
        <h4>Times intercepted per website:</h4>
          <Col span = {15}>
            <PieChart width={300} height={300}>
                <Pie dataKey="value" isAnimationActive={false}
                        data={this.state.interceptsData}
                        cx={125} cy={150} outerRadius={80} fill="#8884d8"
                        label>
                          {
                            this.state.interceptsData.map((entry, index) => <Cell fill={this.state.COLORS[index % this.state.COLORS.length]}/>)
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
