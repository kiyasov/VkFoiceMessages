import React, { useState } from "react";
import { Upload, Icon, Button, Row, Select, notification } from "antd";

const { Option } = Select;

import axios from "axios";
import _ from "lodash";

import { useMount, useToggle } from "react-use";

import "../scss/pages/_messages.scss";

function Messages() {
  const [isLoad, toogle] = useToggle(false);
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

  const convertAudio = async () => {
    const formData = new FormData();

    fileList.forEach(file => {
      formData.append("file", file);
    });

    formData.append("filelocation", "chatId");
    formData.append("target", "MP3");
    formData.append("bitrate", "16k");
    formData.append("frequency", 16000);
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

  const handleUpload = async () => {
    if (isLoad) return false;

    toogle(true);

    const formData = new FormData();

    formData.append("peer_id", chatId);
    formData.append("files[]", await convertAudio());
    formData.append("methodName", "messages.send");

    try {
      await axios.post("/api/v1/method", formData);

      toogle(false);
      setFileList([]);

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
        loading={isLoad}
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
