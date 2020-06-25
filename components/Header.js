import React from "react";
import Link from "next/link";
import { Menu, Layout } from "antd";

import {
  HomeOutlined,
  LogoutOutlined,
  MessageOutlined,
  GithubOutlined
} from "@ant-design/icons";

const { Header } = Layout;

import useProfile from "../hooks/useProfile";
import { useCookies } from "react-cookie";

import _ from "lodash";

import "../scss/components/_header.scss";

export default function Head() {
  const [profile, setProfile] = useProfile();

  const [, , removeCookie] = useCookies([]);

  const logout = () => {
    setProfile(null);
    _.map(["access_token", "code", "username", "password"], removeCookie);
  };

  return (
    <Header style={{ width: "100%" }}>
      <div className="logo">
        <img src="/logo.png" />
      </div>
      <Menu theme="dark" mode="horizontal" style={{ lineHeight: "64px" }}>
        <Menu.Item key="1">
          <Link href="/">
            <a>
              <HomeOutlined />
              Главная
            </a>
          </Link>
        </Menu.Item>

        {_.get(profile, "user_id") && [
          <Menu.Item key="3">
            <Link href="/groups">
              <a>
                <MessageOutlined />
                Группы
              </a>
            </Link>
          </Menu.Item>,
          <Menu.Item key="4" onClick={logout}>
            <LogoutOutlined />
            Выйти
          </Menu.Item>
        ]}

        <Menu.Item key="2">
          <a
            href="https://github.com/kiyasov/VkVoiceMessages"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubOutlined />
            Исходный код
          </a>
        </Menu.Item>
      </Menu>
    </Header>
  );
}
