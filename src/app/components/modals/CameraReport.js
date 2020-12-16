import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {Modal, Row} from 'antd';
import { LineChartOutlined, PieChartOutlined } from '@ant-design/icons';
import noImage from '../../../assets/img/no-image.jpg';

const LineChart = ({onCancel, lineVisible, reportImg, lineChartLoadError, lineImgLoadError}) => {
  return (
    <Modal
      visible={lineVisible}
      style={styles.modal}
      onCancel={onCancel}
      footer={[null, null]}
      width="90vw"
    >
      <Row>
        {lineImgLoadError ?
          <img src={noImage} style={styles.expandedImg} />
        :
          <img src={reportImg} onError={lineChartLoadError} style={styles.expandedImg} />
        }
      </Row>
    </Modal>
  );
};

const PieChart = ({onCancel, pieVisible, reportImg, pieChartLoadError, pieImgLoadError}) => {
  return (
    <Modal
      visible={pieVisible}
      style={styles.modal}
      onCancel={onCancel}
      footer={[null, null]}
      width="90vw"
    >
      <Row>
        {pieImgLoadError ?
          <img src={noImage} style={styles.expandedImg} />
        :
          <img src={reportImg} onError={pieChartLoadError} style={styles.expandedImg} />
        }
      </Row>
    </Modal>
  );
};

class CameraReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lineVisable: false,
      pieVisable: false,
      lineImgLoadError: false,
      pieImgLoadError: false
    }
  }

  showLineChart = () => {
    this.setState({lineVisible: true});
  };

  showPieChart = () => {
    this.setState({pieVisable: true});
  }

  handleCancel = () => {
    this.setState({lineVisible: false});
    this.setState({pieVisable: false});
  };

  handleLineChartLoadError = () => {
    this.setState({lineImgLoadError: true});
  }

  handlePieChartLoadError = () => {
    this.setState({pieImgLoadError: true});
  }

  render() {
    return (
      <div>
        <LineChartOutlined style={{marginRight: 10}} onClick={this.showLineChart} />
        <PieChartOutlined onClick={this.showPieChart} />
        <LineChart
          onCancel={this.handleCancel}
          reportImg={`${process.env.REACT_APP_REPORT_IMG_URL}/${this.props.data.uuid}_daily_chart.png`}
          lineVisible={this.state.lineVisible}
          lineChartLoadError={this.handleLineChartLoadError}
          lineImgLoadError={this.state.lineImgLoadError}
        />
        <PieChart
          onCancel={this.handleCancel}
          reportImg={`${process.env.REACT_APP_REPORT_IMG_URL}/${this.props.data.uuid}_daily_pie.png`}
          pieVisible={this.state.pieVisable}
          pieChartLoadError={this.handlePieChartLoadError}
          pieImgLoadError={this.state.pieImgLoadError}
        />
      </div>
    );
  }
}

const styles = {
  modal: {
    textAlign: 'center',
    wordBreak: 'break-word',
    top: '25px'
  },
  reportCardImg: {
    position: 'absolute',
    maxWidth: '100%',
    maxHeight: '100%',
    width: 'auto',
    height: 'auto',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto'
  },
  reportType: {
    fontSize: 14,
    paddingTop: 5
  },
  reportDateTime: {
    fontSize: 14,
    paddingTop: 5
  },
  reportTimeZone: {
    fontSize: 14,
    paddingTop: 5
  },
  expandedImg: {
    maxWidth: '80vw',
    width: '100%',
    margin: '0 auto'
  }
};

const mapStateToProps = (state) => {
  return {}
};
const mapDispatchToProps = (dispatch) => {
  return {
    updateAlertTags: (user, reportUuid, tags, tag_options) => dispatch(updateAlertTags(user, reportUuid, tags, tag_options))
  }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CameraReport));
