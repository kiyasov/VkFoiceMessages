import React from "react";
import Link from "next/link";
import { Menu, Layout } from "antd";

const { Header } = Layout;

import useProfile from "../hooks/useProfile";
import { useCookies } from "react-cookie";

import _ from "lodash";

export default function Head() {
  const [profile, setProfile] = useProfile();

  const [, , removeCookie] = useCookies([]);

  const logout = () => {
    setProfile(null);
    _.map(["access_token", "code", "username", "password"], removeCookie);
  };

  return (
    <Header style={{ width: "100%" }}>
      <div className="logo"></div>
      <Menu theme="dark" mode="horizontal" style={{ lineHeight: "64px" }}>
        <Menu.Item key="1">
          <Link href="/">
            <a>Профиль</a>
          </Link>
        </Menu.Item>
        {_.get(profile, "user_id") && (
          <Menu.Item key="3" onClick={logout}>
            Выйти
          </Menu.Item>
        )}
      </Menu>
    </Header>
  );
}
