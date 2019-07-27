import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { useToggle } from "react-use";

import useProfile from "../hooks/useProfile";

import {
  Input,
  Tooltip,
  Icon,
  Row,
  Button,
  notification,
  Descriptions
} from "antd";

import Message from "../components/Messages";

import axios from "axios";

import _ from "lodash";

export default function Index() {
  const [cookies, setCookie] = useCookies([
    "username",
    "password",
    "access_token"
  ]);

  const [profile, setProfile] = useProfile();

  const [isCode, toggleCode] = useToggle(false);

  const [dataList, setData] = useState({
    username: _.get(cookies, "username"),
    password: _.get(cookies, "password"),
    code: null
  });

  const changeValue = ({ target }) => {
    const { filed } = target.dataset;
    const value = target.value.replace(/\s/g, "");

    setData({
      ...dataList,
      [filed]: value
    });

    setCookie(filed, value);
  };

  const authProfile = async () => {
    let { code } = dataList;

    try {
      const { data } = await axios.post("/api/v1/authProfile", {
        code
      });

      setProfile(data);
    } catch (error) {
      if (error.response) {
        const { data } = error.response;
        let message = data.data;

        if (_.get(data, "props")["validation_type"] === "2fa_app") {
          toggleCode(true);
          message = "Введите код из приложения";
        }

        notification.error({
          message: "Ошибка!",
          description: message,
          icon: <Icon type="stop" />
        });
      } else {
        console.error(error);
      }
    }
  };

  if (!profile) {
    return (
      <Row style={{ textAlign: "center", margin: "o auto" }}>
        <Icon type="loading" style={{ fontSize: "100pt" }} />
      </Row>
    );
  } else if (_.get(profile, "user_id")) {
    return (
      <Row style={{ padding: 10, margin: "o auto", textAlign: "center" }}>
        <Descriptions
          title={`${profile.first_name} ${profile.last_name}`}
        ></Descriptions>
        <Message />
      </Row>
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
        prefix={<Icon type="user" />}
        suffix={
          <Tooltip title="Телефон или email">
            <Icon type="info-circle" />
          </Tooltip>
        }
      />
      <Input
        style={{ width: 200, marginRight: 5 }}
        placeholder="Пароль"
        onBlur={changeValue}
        data-filed="password"
        defaultValue={dataList.password}
        prefix={<Icon type="safety-certificate" />}
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
              <Icon type="info-circle" />
            </Tooltip>
          }
          prefix={<Icon type="safety-certificate" />}
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
