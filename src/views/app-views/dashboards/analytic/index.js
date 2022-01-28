import React, { useState, useEffect } from "react";
import { Row, Col, Button, Card, Avatar, Dropdown, Table, Menu, Tag, Modal } from 'antd';
import StatisticWidget from 'components/shared-components/StatisticWidget';
import ChartWidget from 'components/shared-components/ChartWidget';
import AvatarStatus from 'components/shared-components/AvatarStatus';
import GoalWidget from 'components/shared-components/GoalWidget';
import {
  VisitorChartData,
  AnnualStatisticData,
  ActiveMembersData,
  NewMembersData,
  RecentTransactionData
} from './DefaultDashboardData';
import ApexChart from "react-apexcharts";
import { apexLineChartDefaultOption, COLOR_2 } from 'constants/ChartConstant';
import {
  UserAddOutlined,
  FileExcelOutlined,
  PrinterOutlined,
  PlusOutlined,
  EllipsisOutlined,
  StopOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import utils from 'utils';
import { withRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import ccfTokenAbi from './abi/ccf-abi';
import wbnbTokenAbi from './abi/wbnb-abi';
// import metamaskErrro from './modal';
const Web3 = require('web3');
const tokenAddress = "0x7f9528b913A99989B88104b633D531241591A358";
const deadAddress = "0x000000000000000000000000000000000000dead";
const wbnbccf1 = "0x048056a77dd98b3FE78333B22F27670d8a8C37b7";
const wbnbccf = "0x83a0962aE816604a6b162a5E054912982C8e4C1C";
const wbnbAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

const MembersChart = props => (
  <ApexChart {...props} />
)

const memberChartOption = {
  ...apexLineChartDefaultOption,
  ...{
    chart: {
      sparkline: {
        enabled: true,
      }
    },
    colors: [COLOR_2],
  }
}

const newJoinMemberOption = (
  <Menu>
    <Menu.Item key="0">
      <span>
        <div className="d-flex align-items-center">
          <PlusOutlined />
          <span className="ml-2">Add all</span>
        </div>
      </span>
    </Menu.Item>
    <Menu.Item key="1">
      <span>
        <div className="d-flex align-items-center">
          <StopOutlined />
          <span className="ml-2">Disable all</span>
        </div>
      </span>
    </Menu.Item>
  </Menu>
)

const latestTransactionOption = (
  <Menu>
    <Menu.Item key="0">
      <span>
        <div className="d-flex align-items-center">
          <ReloadOutlined />
          <span className="ml-2">Refresh</span>
        </div>
      </span>
    </Menu.Item>
    <Menu.Item key="1">
      <span>
        <div className="d-flex align-items-center">
          <PrinterOutlined />
          <span className="ml-2">Print</span>
        </div>
      </span>
    </Menu.Item>
    <Menu.Item key="12">
      <span>
        <div className="d-flex align-items-center">
          <FileExcelOutlined />
          <span className="ml-2">Export</span>
        </div>
      </span>
    </Menu.Item>
  </Menu>
);

const cardDropdown = (menu) => (
  <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
    <a href="/#" className="text-gray font-size-lg" onClick={e => e.preventDefault()}>
      <EllipsisOutlined />
    </a>
  </Dropdown>
)

const tableColumns = [
  {
    title: 'METRIC',
    dataIndex: 'name',
    key: 'name',
    render: (text, record) => (
      <div className="d-flex align-items-center">
        <Avatar size={30} className="font-size-sm" style={{ backgroundColor: record.avatarColor }}>
          {utils.getNameInitial(text)}
        </Avatar>
        <span className="ml-2">{text}</span>
      </div>
    ),
  },
  {
    title: 'VALUE',
    dataIndex: 'date',
    key: 'date',
  },

];

export const DefaultDashboard = () => {
  const [visitorChartData] = useState(VisitorChartData);
  const [annualStatisticData] = useState(AnnualStatisticData);
  const [visible, setVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(0)
  const [wbnbPrice, setwbnbPrice] = useState(0);
  const [wbnbblance, setwbnbbalance] = useState();
  const [recentImformation1, setrecentImformation1] = useState([
    {
      id: '#5327',
      name: 'Total supply',
      date: 2000000000000,
      avatarColor: '#fa8c16'
    },
    {
      id: '#5328',
      name: 'Circulating supply',
      value: '0',
      date: 1690599617191.407,
      avatarColor: '#04d182'
    },
    {
      id: '#5329',
      name: 'Burnt token',
      date: 309400382808.593,
      avatarColor: '#ffc542'
    },{
      id: '#5330',
      name: 'Burning rate',
      date: 2 + ' %',
      avatarColor: '#04d182'
    }
  ]);
  const [recentImformation2, setrecentImformation2] = useState([{
    id: '#5331',
    name: 'Pancakeswap Price',
    value: '0',
    date: '$ ' ,
    avatarColor: '#04d182'
  },
  {
    id: '#5332',
    name: '24H Volume',
    value: '0',
    date: '$ ',
    avatarColor: '#fa8c16'
  },
  {
    id: '#5333',
    name: 'Liquidity',
    value: '0',
    date: '$ ',
    avatarColor: '#1890ff'
  },
  {
    id: '#5334',
    name: 'holders',
    date: '0',
    avatarColor: '#ffc542'
  },
  {
    id: '#5335',
    name: 'Market Cap(Fully Dilluted)',
    date: '$ ',
    avatarColor: '#ff6b72'
  },
  {
    id: '#5336',
    name: 'All-Time High',
    date: '$ ',
    avatarColor: '#ff6b72'
  }]);

  const [walletConnected, setWalletState] = useState(false);

  const ethEnabled = async () => {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      window.web3 = new Web3(window.ethereum);
      setWalletState(true);
      return true;
    }
    return false;
  }

  const { direction } = useSelector(state => state.theme)

  const params = {
    "ids": "cross-chain-farming",
    "vs_currency": "usd"
  };
  const price = {
    "ids": "wbnb",
    "vs_currencies": "usd"
  };
  // const [token, setToken] = useState({max_supply:'', circulatingSupply:'', burntToken:'', pancakeswap_price: '', volumePerDay: '', liquidity: '', holders: '', marketcapFull: '', ath: '' })
  const MINUTE_MS = 10000;
  let circulatingSupply;
  let manualburntToken = 303716853583977236;
  let burntToken;
  let pancakeswap_price;
  let volumePerDay;
  let liquidity;
  let holders;
  let marketcapFull;
  let ath;
  let total_supply;
  let max_supply = 2000000000000;

  async function getWbnbprice() {
    await axios.get("https://api.coingecko.com/api/v3/simple/price", { "params": price },
      { headers: { "Access-Control-Allow-Origin": 'http://localhost:3000' } })
      .then(res => {
        console.log(res.data.wbnb.usd + '-----------wbnbprice');
        setwbnbPrice(res.data.wbnb.usd);
      }).catch(err => {
        console.log(err + "first-------------price-------------");
      });
  }

  async function getData() {
    await axios.get("https://api.coingecko.com/api/v3/coins/markets", { params },
      { headers: { "Access-Control-Allow-Origin": 'http://localhost:3000' } })
      .then(res => {
        pancakeswap_price = res.data[0].current_price;
        volumePerDay = res.data[0].total_volume;
        liquidity = 152055;
        holders = 3701;
        total_supply = res.data[0].total_supply;
        marketcapFull = pancakeswap_price * total_supply;
        ath = res.data[0].ath;
        console.log("Pancake Data", res.data[0]);
       
        setrecentImformation2([
          {
            id: '#5331',
            name: 'Pancakeswap Price',
            value: pancakeswap_price,
            date: '$ ' + pancakeswap_price,
            avatarColor: '#04d182'
          },
          {
            id: '#5332',
            name: '24H Volume',
            value: volumePerDay,
            date: '$ ' + Number(volumePerDay).toLocaleString(),
            avatarColor: '#fa8c16'
          },
          {
            id: '#5333',
            name: 'Liquidity',
            value: liquidity,
            date: '$ ' + Number(liquidity).toLocaleString(),
            avatarColor: '#1890ff'
          },
          {
            id: '#5334',
            name: 'holders',
            date: Number(holders).toLocaleString(),
            avatarColor: '#ffc542'
          },
          {
            id: '#5335',
            name: 'Market Cap(Fully Dilluted)',
            date: '$ ' + Number(marketcapFull).toLocaleString(),
            avatarColor: '#ff6b72'
          },
          {
            id: '#5336',
            name: 'All-Time High',
            date: '$ ' + ath,
            avatarColor: '#ff6b72'
          }]);
          console.log( manualburntToken + '--------------2---------------');
      })
      .catch(err => {
        console.log(err + "first--------------------------");
      });
  };

  const getBalance = async () => {
    if (window.ethereum) {
      console.log('MetaMask is installed!');
    
      const provider = new Web3(window.web3.currentProvider);
      var ccfContract = new provider.eth.Contract(ccfTokenAbi, tokenAddress);
      ccfContract.methods.balanceOf(deadAddress).call().then(res => {
        manualburntToken = res;
        burntToken = max_supply - total_supply + manualburntToken/10**9;
        circulatingSupply = max_supply - burntToken ;
        
        setrecentImformation1([
          {
            id: '#5327',
            name: 'Total supply',
            date: Number(max_supply).toLocaleString(),
            avatarColor: '#fa8c16'
          },
          {
            id: '#5328',
            name: 'Circulating supply',
            value: circulatingSupply,
            date: Number(circulatingSupply).toLocaleString(),
            avatarColor: '#04d182'
          },
          {
            id: '#5329',
            name: 'Burnt token',
            date: Number(burntToken).toLocaleString(),
            avatarColor: '#ffc542'
          },{
            id: '#5330',
            name: 'Burning rate',
            date: 2 + ' %',
            avatarColor: '#04d182'
          }
        ]);
        console.log(res + '--------------1---------------');
      }).catch(err => {
    
        console.log(err);
      });
      var wbnbContract = new provider.eth.Contract(wbnbTokenAbi, wbnbAddress);
      wbnbContract.methods.balanceOf(wbnbccf).call().then(res => {
        console.log(res + '-------------wbnbbalance');
        setwbnbbalance(res/10**18);
      }).catch(err => {
    
        console.log(err);
      });
    } else {
      // alert('You have to installed Metamask! Otherwise you get NAN and CCF/BNB value.');
      setAlertVisible(true);

      
    }
  };


  // useEffect(() => {
  //   console.log(manualburntToken + '--------------3-----------')
    
  //   getData();
  // }, [manualburntToken]);
  

  useEffect(() => {
    console.log('--------------4-----------')
    getBalance();
    getData();
    getWbnbprice();
    setInterval(() => {
      getBalance();
      getData();
      getWbnbprice();
    }, MINUTE_MS);
    
  }, [manualburntToken]);

  return (
    <>
	{alertVisible === true ? (
        Modal.warning({ title: "Metamask Error", content: "You didn't install metamask" }),
        setAlertVisible(false))
        : null}
          <Row gutter={16} padding>
        <Col xs={32} sm={32} md={32} lg={24}>
          <Row gutter={40}>
            {
              annualStatisticData.map((elm, i) => (
                <Col xs={16} sm={16} md={16} lg={16} xl={8} key={i}>
                  <StatisticWidget
                    title={elm.title}
                    value={(i === 0 && recentImformation1[1].value !== undefined) ? "$ " + parseInt(recentImformation1[1].value * recentImformation2[0].value).toLocaleString() : 
                            (i === 2 && recentImformation2[1].value !== undefined) ? "$ " + recentImformation2[1].value.toLocaleString() : 
                            "$ " + parseInt(wbnbPrice * wbnbblance).toLocaleString()}
                    status={elm.status}
                    subtitle={elm.subtitle}
                  />
                </Col>
              ))
            }
          </Row>
          <Row gutter={16, 0}>
            <Col span={24}>
              <ChartWidget
                title="$CCF Metrics"
                extra={'$ ' + recentImformation2[0].value}
                series={visitorChartData.series}
                xAxis={visitorChartData.categories}
                height={'400px'}
                direction={direction}
              ></ChartWidget>
              <Card title="Token Information" extra={cardDropdown(latestTransactionOption)}>
                <Table
                  className="no-border-last"
                  columns={tableColumns}
                  dataSource={recentImformation1.concat(recentImformation2)}
                  rowKey='id'
                  pagination={false}
                />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  )
}


export default withRouter(DefaultDashboard);
