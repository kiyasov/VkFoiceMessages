import React, { PureComponent } from "react";
import {
  Upload,
  Button,
  Row,
  Select,
  Input,
  notification,
  Checkbox
} from "antd";

import { withCookies } from "react-cookie";

import {
  WarningOutlined,
  CheckCircleOutlined,
  UploadOutlined
} from "@ant-design/icons";

const { Option } = Select;

import _ from "lodash";
import axios from "axios";

class Groups extends PureComponent {
  constructor(props) {
    super(props);

    const { cookies } = this.props;

    this.getGroups();

    this.state = {
      groupsList: [],
      chatId: cookies.get("groupId")
    };
  }

  getGroups = async () => {
    try {
      let { data } = await axios.post("/api/v1/method", {
        methodName: "groups.get",
        props: {
          count: 50,
          extended: 1,
          filter: "admin,editor,moder"
        }
      });

      this.setState({
        groupsList: _.map(_.get(data, "items"), ({ id, name }) => {
          return {
            id,
            name
          };
        })
      });
    } catch (error) {
      if (error.response) {
        const {
          data: { data }
        } = error.response;

        notification.error({
          message: "Ошибка!",
          description: data,
          icon: <WarningOutlined />
        });
      } else {
        console.error(error);
      }
    }
  };

  goGroup = () => {
    const { cookies } = this.props;
    const { groupId } = this.state;

    cookies.set("groupId", groupId, {
      expires: new Date(Date.now() + 3650000 * 3650000)
    });
  };

  changeState = value => {
    this.setState({ groupId: value });
  };

  render() {
    const { groupsList, groupId } = this.state;

    return (
      <>
        <Select
          showSearch
          style={{ width: 200 }}
          ref={input => (this.selectGroup = input)}
          placeholder="Выберите группу"
          onChange={this.changeState}
          optionFilterProp="children"
          defaultValue={groupId}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {_.map(groupsList, ({ id, name }) => (
            <Option key={id} value={id}>
              {name}
            </Option>
          ))}
        </Select>
        <br />
        <Button
          type="primary"
          onClick={this.goGroup}
          style={{ marginTop: 16, width: 200 }}
        >
          Войти в диалоги
        </Button>
      </>
    );
  }
}

export default withCookies(Groups);
