const _ = require("lodash");
const easyvk = require("easyvk");

function getUser(fromId, { extendsList, chat_settings }) {
  if (!chat_settings) {
    let that = _.find(extendsList, ["id", +/\d+/.exec(fromId)]);

    let userName = _.has(that, "first_name")
      ? `${that.first_name} ${that.last_name}`
      : _.get(that, "name");
    let userNameAcc = _.has(that, "first_name_acc")
      ? `${that.first_name_acc} ${that.last_name_acc}`
      : userName;
    let avatar = _.get(that, "photo_100");
    let sex = _.result(that, "sex", 0) === 1 ? "female" : "male";

    return _.assign(
      _.omit(that, [
        "photo_100",
        "first_name_acc",
        "last_name_acc",
        "first_name",
        "last_name",
        "sex"
      ]),
      {
        id: fromId,
        userName,
        avatar,
        userNameAcc,
        sex
      }
    );
  }

  let avatar = _.result(chat_settings, "photo.photo_100", "");
  let userName = _.result(chat_settings, "title", "");

  return { id: fromId, userName, avatar };
}

async function formatData({ vk, req }) {
  let { body } = req;

  let type = "user";

  if (_.toInteger(req.universalCookies.get("groupId")) > 0) {
    body.props = _.merge(body.props, {
      group_id: req.universalCookies.get("groupId")
    });
    type = "group";
  }

  let { items, profiles, groups } = await vk.call(body.methodName, body.props);

  return {
    [type]: _.map(items, ({ conversation: { peer, chat_settings } }) => {
      let { userName } = getUser(peer.id, {
        chat_settings,
        extendsList: _.concat(profiles, groups)
      });

      return {
        id: peer.id,
        title: userName,
        type: peer.type
      };
    })
  };
}

async function sendMessage({ req, vk }) {
  const {
    body,
    files: { files = {} }
  } = req;

  let props = {
    random_id: easyvk.randomId()
  };

  if (body.message) {
    props = {
      ...props,
      message: body.message
    };
  }

  /*

  if (_.toInteger(req.universalCookies.get("groupId")) > 0) {
    props = _.merge(props, {
      group_id: req.universalCookies.get("groupId")
    });
  }*/

  if (_.size(files) > 0) {
    const url = await vk.uploader.getUploadURL("docs.getMessagesUploadServer", {
      type: "audio_message"
    });

    let fileData = await vk.uploader.uploadFile(url, files[0].path, "file");

    let { audio_message } = await vk.call("docs.save", fileData);

    fileData = audio_message;

    await vk.call(body.methodName, {
      peer_id: body.peer_id,
      attachment: [`doc${fileData.owner_id}_${fileData.id}`],
      ...props
    });
  } else {
    await vk.call(body.methodName, {
      peer_id: body.peer_id,
      ...props
    });
  }

  return {
    status: "success"
  };
}

module.exports = {
  formatData,
  sendMessage
};
