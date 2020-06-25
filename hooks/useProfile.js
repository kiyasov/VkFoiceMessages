import React, { useState } from "react";

import { useMount } from "react-use";

import axios from "axios";

import { notification } from "antd";

import { Icon } from "@ant-design/compatible";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  const getProfile = async () => {
    try {
      let { data } = await axios.post("/api/v1/getProfile");

      setProfile(data);
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

        setProfile({});
      } else {
        console.error(error);
      }
    }
  };

  useMount(async () => await getProfile());

  return [profile, setProfile];
}
