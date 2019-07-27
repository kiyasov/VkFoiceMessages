import React, { useState } from "react";
import { Upload, Icon, Button, Row, Select, notification } from "antd";

const { Option } = Select;

import axios from "axios";
import _ from "lodash";

import { useMount } from "react-use";

import "../scss/pages/messages.scss";

function Messages() {
  const [fileList, setFileList] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [conversationsList, setConversations] = useState([]);

  useMount(async () => await getConversations());

  const getConversations = async () => {
    try {
      let { data } = await axios.post("/api/v1/method", {
        methodName: "messages.getConversations",
        props: {
          count: 50
        }
      });

      setConversations(data);
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

  const props = {
    onRemove: file => {
      setFileList(fileList => {
        const index = fileList.indexOf(file);
        const newFileList = fileList.slice();
        newFileList.splice(index, 1);

        return newFileList;
      });
    },
    beforeUpload: file => {
      setFileList(fileList => [...fileList, file]);

      return false;
    },
    fileList
  };

  const handleUpload = async () => {
    const formData = new FormData();

    formData.append("peer_id", chatId);
    formData.append("methodName", "messages.send");

    fileList.forEach(file => {
      formData.append("files[]", file);
    });

    try {
      await axios.post("/api/v1/method", formData);

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

  return (
    <Row className="messages-row">
      <Select
        showSearch
        style={{ width: 200, marginRight: 5 }}
        placeholder="Выберите диалог"
        optionFilterProp="children"
        onChange={value => setChatId(value)}
        filterOption={(input, option) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {_.map(conversationsList, ({ id, title }) => (
          <Option key={id} value={id}>
            {title}
          </Option>
        ))}
      </Select>
      <Upload {...props}>
        <Button>
          <Icon type="upload" /> Выберите аудиозапись
        </Button>
      </Upload>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        style={{ marginTop: 16 }}
      >
        Отправить сообщение
      </Button>
    </Row>
  );
}

export default Messages;
