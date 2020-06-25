import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { useToggle } from "react-use";

import useProfile from "../hooks/useProfile";

import {
  Input,
  Tooltip,
  Row,
  Button,
  notification,
  Descriptions,
  Col
} from "antd";

import {
  WarningOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  InfoCircleOutlined,
  LoadingOutlined
} from "@ant-design/icons";

import Message from "../components/Messages";

import axios from "axios";

import _ from "lodash";

export default function Index() {
  const [cookies, setCookie] = useCookies([
    "username",
    "password",
    "access_token"
  ]);

  const [profile, setProfile] = useProfile(null);

  const [isCode, toggleCode] = useToggle(false);

  const [dataList, setData] = useState({
    username: _.get(cookies, "username"),
    password: _.get(cookies, "password"),
    code: null,
    isSms: false
  });

  const changeValue = ({ target }) => {
    const { filed } = target.dataset;
    const value = target.value.replace(/\s/g, "");

    setData({
      ...dataList,
      [filed]: value
    });

    setCookie(filed, value, {
      expires: new Date(Date.now() + 3650000 * 3650000)
    });
  };

  const authProfile = async () => {
    let { isSms, code } = dataList;

    let props = {
      code
    };

    if (isSms) {
      props.push({
        force_sms: 1
      });
    }

    try {
      const { data } = await axios.post("/api/v1/authProfile", props);

      setProfile(data);
    } catch (error) {
      if (error.response) {
        const { data } = error.response;

        let message = data.data;

        if (_.get(data, "props")["error_code"] === "need_validation") {
          toggleCode(true);

          if (_.get(data, "props")["validation_type"] !== "2fa_app") {
            setData({
              ...dataList,
              isSms: true
            });
          }

          message = `Введите код из ${
            _.get(data, "props")["validation_type"] === "2fa_app"
              ? "приложения"
              : "смс"
          }`;
        }

        notification.error({
          message: "Ошибка!",
          description: message,
          icon: <WarningOutlined />
        });
      } else {
        console.error(error);
      }
    }
  };

  if (!profile) {
    return (
      <Row style={{ textAlign: "center", margin: "o auto" }}>
        <LoadingOutlined style={{ fontSize: "100pt" }} />
      </Row>
    );
  } else if (_.get(profile, "user_id")) {
    return (
      <Message>
        <Descriptions
          title={`${profile.first_name} ${profile.last_name}`}
        ></Descriptions>
      </Message>
    );
  }

  return (
    <Row style={{ textAlign: "center", margin: "o auto" }}>
      <Input
        style={{ width: 200, marginRight: 5 }}
        placeholder="Логин"
        defaultValue={dataList.username}
        onBlur={changeValue}
        data-filed="username"
        prefix={<UserOutlined />}
        suffix={
          <Tooltip title="Телефон или email">
            <InfoCircleOutlined />
          </Tooltip>
        }
      />
      <Input
        style={{ width: 200, marginRight: 5 }}
        placeholder="Пароль"
        onBlur={changeValue}
        data-filed="password"
        defaultValue={dataList.password}
        prefix={<SafetyCertificateOutlined />}
      />
      {isCode && (
        <Input
          style={{ width: 200, marginRight: 5 }}
          placeholder="Резервный код"
          onBlur={changeValue}
          data-filed="code"
          defaultValue={dataList.code}
          suffix={
            <Tooltip title="При наличии двухфакторной авторизации">
              <InfoCircleOutlined />
            </Tooltip>
          }
          prefix={<SafetyCertificateOutlined />}
        />
      )}
      <Button
        type="primary"
        onClick={authProfile}
        disabled={
          _.size(dataList.password) === 0 || _.size(dataList.username) === 0
        }
        style={{ marginTop: 16 }}
      >
        Войти
      </Button>
    </Row>
  );
}
