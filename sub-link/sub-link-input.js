module.exports = function module(RED) {
  function SubLinkNodeIn(config) {
    const Util = require("./util");

    var node;

    RED.nodes.createNode(this, config);
    node = this;

    /**
     * Starts Object
     */
    node.initialize = function initialize() {
      node.config = config;
      node.topic = Util.castTypeTopic(config.topicType, config.topic, node);
      node.topicType = config.topicType;
      node.alias = Util.castTypeAlias(config.aliasType, config.alias, node);
      node.aliasType = config.aliasType;
      node.aliasMatchAll = config.aliasMatchAll;
      node.subLink = RED.nodes.getNode(config.link);
      setTimeout(node.updateStatus, 1);
    };

    /**
     * Updates node status
     * @param {number} n Number of messages delivered
     * @param {number} t Number of nodes tested
     */
    node.updateStatus = function updateStatus(n, t) {
      if (!n && !t) {
        node.status({ fill: "green", shape: "dot", text: "Linked" });
      } else {
        node.status({ fill: "green", shape: "dot", text: `Linked (${n}/${t})` });
      }
    };

    /**
     * Event message input
     */
    node.on("input", (msg, send, done) => {
      var err = {};
      var alias;
      var topic;
      var aliasMatchAll;

      // -------- Topic -------- //
      if (msg.subTopic !== undefined) {
        topic = Util.sanitizeTopic(msg.subTopic, node, err);
      } else {
        topic = Util.castTypeTopic(config.topicType, config.topic, node, RED, msg, err);
      }

      if (err.error) {
        Util.processError(err.text, null, node, done);
        return;
      }

      // -------- Alias -------- //
      if (msg.subAlias !== undefined) {
        alias = Util.sanitizeAlias(msg.subAlias, node, err);
      } else {
        alias = Util.castTypeAlias(config.aliasType, config.alias, node, RED, msg, err);
      }
      if (err.error) {
        Util.processError(err.text, null, node, done);
        return;
      }

      // -------- Match -------- //
      aliasMatchAll = config.aliasMatchAll;
      if (aliasMatchAll !== true) {
        aliasMatchAll = msg.aliasMatchAll;
      }

      node.subLink.listener(msg, node, topic, alias, aliasMatchAll, done);
    });

    // Register Outbound Node In Config
    node.initialize();
  }
  RED.nodes.registerType("sub-link-input", SubLinkNodeIn);
};
