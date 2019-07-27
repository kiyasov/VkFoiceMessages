const _ = require("lodash");

async function formatData({ vk, req }) {
  const { body } = req;

  let {
    vkr: { items }
  } = await vk.call(body.methodName, body.props);

  let userList = [];
  const itemsList = _.filter(items, ({ conversation: { peer: { type } } }) =>
    ["chat", "user"].includes(type)
  );

  let conversation = _.map(
    itemsList,
    ({ conversation: { peer, chat_settings = {} } }) => {
      if (peer.type !== "chat") {
        userList.push(peer.id);
      }

      return {
        id: peer.id,
        title: peer.type === "chat" ? chat_settings.title : ""
      };
    }
  );

  let { vkr } = await vk.call("users.get", {
    user_ids: _.join(userList, ",")
  });

  return _.map(conversation, item => {
    if (_.size(item.title) > 0) return item;

    let user = _.find(vkr, ["id", item.id]);

    let { first_name, last_name } = user;

    return {
      ...item,
      title: `${first_name} ${last_name}`
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
