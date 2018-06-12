import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import moment from 'moment';
import {Modal, Row, Col, Form} from 'antd';

const ExpandAlertForm = Form.create()(
  (props) => {
    const {
      onCancel, visible, showAlert, alertImg, alertType, cameraName, locationName, timestamp, formatDatetime
    } = props;

    return (
      <Modal
        visible={visible}
        style={styles.modal}
        onCancel={onCancel}
        footer={[null, null]}
        width="90vw"
      >
        <Row type='flex' justify='space-between'>
          <Col style={styles.alertType} xs={24} sm={24} md={12} lg={8} xl={8}>{alertType}</Col>
          <Col style={styles.alertType} xs={24} sm={24} md={12} lg={8} xl={8}>{cameraName} at {locationName}</Col>
          <Col style={styles.alertDateTime} xs={24} sm={24} md={24} lg={8} xl={8}>{formatDatetime(timestamp)}</Col>
        </Row>
        <Row><img src={alertImg} style={styles.expandedImg} /></Row>
      </Modal>
    );
  }
);

class ExpandAlertModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visable: false,
    }
  }

  formatDatetime = (timestamp) => {
    const dt = moment(timestamp);
    return `${dt.format('L')} ${dt.format('LT')}`;
  }

  componentWillReceiveProps(nextProps) {}

  showModal = () => {
    this.setState({visible: true});
  };

  handleCancel = () => {
    this.setState({visible: false});
  };

  render() {
    return (
      <div>
        <img src={this.props.data.image.original} style={styles.alertCardImg} onClick={this.showModal} />
        <ExpandAlertForm
          onCancel={this.handleCancel}
          alertImg={this.props.data.image.original}
          visible={this.state.visible}
          alertType={this.props.data.type}
          cameraName={this.props.data.camera.name}
          locationName={this.props.data.camera.location.name}
          timestamp={this.props.data.timestamp}
          formatDatetime={this.formatDatetime}
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
  alertCardImg: {
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
  alertType: {
    fontSize: 14,
    paddingTop: 5
  },
  alertDateTime: {
    fontSize: 14,
    paddingTop: 5
  },
  expandedImg: {
    maxWidth: '80vw'
  }
};

const mapStateToProps = (state) => {
  return {}
};
const mapDispatchToProps = (dispatch) => {
  return {}
};

export default connect(mapStateToProps, mapDispatchToProps)(ExpandAlertModal);
