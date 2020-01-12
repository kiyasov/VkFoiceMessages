import React, { PureComponent } from "react";
import {
  Upload,
  Icon,
  Button,
  Row,
  Select,
  Input,
  notification,
  Checkbox
} from "antd";

const { Option } = Select;
const { TextArea } = Input;

import axios from "axios";
import _ from "lodash";

import { useMount, useToggle } from "react-use";

import "../scss/pages/_messages.scss";

class Messages extends PureComponent {
  constructor(props) {
    super(props);

    this.getConversations();

    this.state = {
      isLoad: false,
      checked: true,
      fileList: [],
      chatId: null,
      message: null,
      conversationsList: []
    };
  }

  getConversations = async () => {
    try {
      let { data } = await axios.post("/api/v1/method", {
        methodName: "messages.getConversations",
        props: {
          count: 50,
          extended: 1
        }
      });

      this.setState({
        conversationsList: data
      });
    } catch (error) {
      if (error.response) {
        const {
          data: { data }
        } = error.response;

        notification.error({
          message: "Ошибка!",
          description: data,
          icon: <Icon type="stop" />
        });
      } else {
        console.error(error);
      }
    }
  };

  onRemove = file => {
    const { fileList } = this.state;

    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);

    this.setState({
      fileList: newFileList
    });
  };

  beforeUpload = file => {
    const { fileList } = this.state;

    this.setState({
      fileList: [...fileList, file]
    });

    return false;
  };

  convertAudio = async () => {
    const { checked, fileList } = this.state;

    if (!checked) return fileList[0];

    const formData = new FormData();

    fileList.forEach(file => {
      formData.append("file", file);
    });

    formData.append("filelocation", "chatId");
    formData.append("target", "MP3");
    formData.append("bitrate", "320k");
    //  formData.append("frequency", 16000);
    formData.append("channel", 1);
    formData.append("type_converter", "audio");

    const {
      data: { id, filename }
    } = await axios.post("https://s1.fconvert.ru/fconvert.php", formData);

    const { data } = await axios({
      url: `https://s1.fconvert.ru/upload/${id}/`,
      method: "POST",
      responseType: "blob"
    });

    let blob = new Blob([data]);

    return new File([blob], filename);
  };

  handleUpload = async () => {
    const { isLoad, message, chatId, fileList } = this.state;

    if (isLoad) return false;

    this.setState({
      isLoad: true
    });

    const formData = new FormData();

    formData.append("peer_id", chatId);

    if (message) {
      formData.append("message", message);
    }

    if (fileList.length !== 0) {
      formData.append("files[]", await this.convertAudio());
    }

    formData.append("methodName", "messages.send");

    try {
      await axios.post("/api/v1/method", formData);

      this.setState({
        isLoad: false,
        fileList: [],
        message: null
      });

      notification.success({
        message: "Успешно!",
        description: "Сообщение отправлено",
        icon: <Icon type="check-circle" />
      });
    } catch (error) {
      if (error.response) {
        const {
          data: { data }
        } = error.response;

        notification.error({
          message: "Ошибка!",
          description: data,
          icon: <Icon type="stop" />
        });
      } else {
        console.error(error);
      }
    }
  };

  setMessage = ({ currentTarget: { value } }) => {
    this.setState({ message: value });
  };

  toogleChecked = () => {
    const { checked } = this.state;

    this.setState({ checked: !checked });
  };

  changeState = value => {
    this.setState({ chatId: value });
  };

  render() {
    const {
      fileList,
      checked,
      conversationsList,
      message,
      isLoad
    } = this.state;

    return (
      <Row className="messages-row">
        <Select
          showSearch
          style={{ width: 200, marginRight: 5 }}
          placeholder="Выберите диалог"
          optionFilterProp="children"
          onChange={this.changeState}
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
            0
          }
        >
          {_.map(conversationsList, ({ id, title }) => (
            <Option key={id} value={id}>
              {title}
            </Option>
          ))}
        </Select>

        <Upload
          onRemove={this.onRemove}
          data={fileList}
          beforeUpload={this.beforeUpload}
        >
          <Button>
            <Icon type="upload" /> Выберите аудиозапись
          </Button>
        </Upload>

        <Checkbox checked={checked} onChange={this.toogleChecked}>
          Конвертировать автоматически
        </Checkbox>

        <TextArea
          style={{
            width: 400,
            padding: 5,
            display: "block",
            margin: "10px auto"
          }}
          rows={4}
          defaultValue={message}
          onChange={this.setMessage}
          placeholder="Введите сообщение (не обязательно)"
        />

        <Button
          loading={isLoad}
          type="primary"
          onClick={this.handleUpload}
          disabled={!(fileList.length !== 0 || message)}
          style={{ marginTop: 16 }}
        >
          Отправить сообщение
        </Button>
      </Row>
    );
  }
}

export default Messages;
