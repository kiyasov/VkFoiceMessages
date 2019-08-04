const _ = require("lodash");

async function formatData({ vk, req }) {
  const { body } = req;

  let {
    vkr: { items }
  } = await vk.call(body.methodName, body.props);

  let userList = [];
  let groupList = [];

  const itemsList = _.filter(items, ({ conversation: { peer: { type } } }) =>
    ["chat", "user", "group"].includes(type)
  );

  let conversation = _.map(
    itemsList,
    ({ conversation: { peer, chat_settings = {} } }) => {
      let idType = peer.type === "group" ? peer.local_id : peer.id;

      if (peer.type === "user") {
        userList.push(idType);
      } else if (peer.type === "group") {
        groupList.push(idType);
      }

      return {
        idType,
        id: peer.id,
        title: peer.type === "chat" ? chat_settings.title : "",
        type: peer.type
      };
    }
  );

  let { vkr } = await vk.call("users.get", {
    user_ids: _.join(userList, ",")
  });

  let { vkr: vkrGroup } = await vk.call("groups.getById", {
    group_ids: _.join(groupList, ",")
  });

  return _.map(conversation, item => {
    if (_.size(item.title) > 0) return item;

    let title;

    if (item.type === "user") {
      let user = _.find(vkr, ["id", item.idType]);

      let { first_name, last_name } = user;

      title = `${first_name} ${last_name}`;
    } else if (item.type === "group") {
      let group = _.find(vkrGroup, ["id", item.idType]);

      title = group.name;
    }

    return {
      ...item,
      title
    };
  });
}

async function sendMessage({ req, vk }) {
  const {
    body,
    files: { files = {} }
  } = req;

  const { url } = await vk.uploader.getUploadURL(
    "docs.getMessagesUploadServer",
    {
      type: "audio_message"
    }
  );

  let { vkr: fileData } = await vk.uploader.uploadFile(
    url,
    files[0].path,
    "file"
  );

  fileData = await vk.call("docs.save", fileData);
  fileData = fileData.vkr[0];

  await vk.call(body.methodName, {
    peer_id: body.peer_id,
    attachment: [`doc${fileData.owner_id}_${fileData.id}`]
  });

  return {
    status: "success"
  };
}

module.exports = {
  formatData,
  sendMessage
};
