module.exports = function module(RED) {
  function SubLinkNodeOut(config) {
    const Util = require("./util");

    var node;

    RED.nodes.createNode(this, config);
    node = this;

    /**
     * Starts Object
     */
    node.initialize = function initialize() {
      var lockTopic = false;
      var lockAlias = false;

      node.config = config;

      node.hasdatainput = config.hasdatainput || false;
      node.topicType = config.topicType;
      node.aliasType = config.aliasType;
      node.priorityType = config.priorityType;

      node.topic = Util.castTypeTopic(config.topicType, config.topic, node, RED);
      node.alias = Util.castTypeAlias(config.aliasType, config.alias, node, RED);

      node.priority = Util.castTypePriority(config.priorityType, config.priority, node, RED) || 0;

      node.outputstat = config.outputstat;
      node.outputstatType = config.outputstatType;

      node.aliasMatchAll = config.aliasMatchAll;
      node.subLink = RED.nodes.getNode(config.link);
      node.clone = config.clone;

      if (node.linked === true) {
        node.subLink.unregisterSubOutput(node);
      }

      node.linked = false;
      node.updateStatus();

      if (!node.subLink) {
        return null;
      }

      if (config.topicType === "msg") {
        lockTopic = true;
      }

      if (config.aliasType === "msg") {
        lockAlias = true;
      }

      node.subLink.registerSubOutput(node, node.topic, node.alias, node.priority, node.aliasMatchAll, lockTopic, lockAlias);
      node.sendSecondOutput();

      // Updates satus on start time
      setTimeout(node.updateStatus, 1);
      return null;
    };

    /**
     * Sends recived message
     * @param {Object} msg The message to send
     * @param {Object} msg2 The second output message to send
     * @param {string} topic The topic of the message
     */
    node.sendMessage = function sendMessage(msg, msg2, topic) {
      var message;

      if (node.clone === true && msg._sub_flow_clone !== true) {
        message = RED.util.cloneMessage(msg); // Clone Message if requested by Output config and if not cloned by config
        message._cloned = true;
      } else {
        message = msg;
      }

      node.updateStatus();

      // Information
      if (message._cloned === true) {
        // We only can set this if message is clone

        if (Util.isDeclared(node.outputstat)) {
          RED.util.setMessageProperty(message, node.outputstat, RED.util.cloneMessage(msg2), true);
        } else {
          Object.keys(msg2).forEach((p) => {
            message[p] = msg2[p];
          });
        }

        if (topic !== undefined && topic !== "" && topic !== null) {
          message.topic = topic;
        }
      }

      delete message._sub_flow_clone;
      delete message._cloned;
      node.send([message, msg2]);
    };

    /**
     * Updates the node status
     */
    node.updateStatus = function updateStatus() {
      var target;
      var topic;
      var alias;
      var lockTopic;
      var lockAlias;
      var aliasMatchAll;

      if (node.linked === true) {
        target = node.subLink.getTargetObj(node);

        topic = target.topic;
        alias = target.alias;
        lockTopic = target.lockTopic;
        lockAlias = target.lockAlias;
        aliasMatchAll = target.aliasMatchAll;

        if (!Util.isDeclared(topic) && lockTopic && !Util.isDeclared(alias) && lockAlias) {
          node.status({
            fill: "yellow",
            shape: "dot",
            text: "Linked No Config",
          });
          return;
        }

        if (!Util.isDeclared(topic) && lockTopic) {
          node.status({
            fill: "yellow",
            shape: "dot",
            text: "Linked No Topic Config",
          });
          return;
        }

        if (!Util.isDeclared(topic)) {
          topic = "";
        }

        if (!Util.isDeclared(alias) && lockAlias) {
          node.status({
            fill: "yellow",
            shape: "dot",
            text: "Linked No Alias Config",
          });
          return;
        }

        if (!Util.isDeclared(alias)) {
          alias = "";
        } else if (aliasMatchAll === true) {
          if (alias.length === 1) {
            alias = `::+${alias[0]}+`;
          } else {
            alias = `::${alias.join("+")}`;
          }
        } else if (alias.length === 1) {
          alias = `::|${alias[0]}|`;
        } else {
          alias = `::${alias.join("|")}`;
        }

        node.status({
          fill: "green",
          shape: "dot",
          text: `Linked ${topic}${alias}`,
        });
      } else {
        node.status({
          fill: "yellow",
          shape: "dot",
          text: "Linking",
        });
      }
    };

    /**
     * Sends the second output, basic
     */
    node.sendSecondOutput = function sendSecondOutput() {
      node.send([null, Util.getTargetMsgProp(node.id, {}, node.subLink)]);
      node.updateStatus();
    };

    /**
     * Event message input
     */
    node.on("input", (msg, send, done) => {
      var newNode = {};

      var err = {};

      var topic;
      var alias;
      var priority;
      var aliasMatchAll;

      var refTopic;
      var refAlias;
      var refPriority;
      var refAliasMatchAll;

      var target = node.subLink.getTargetObj(node);

      // -------- Reset -------- //
      if (msg.reset !== undefined && msg.reset === true) {
        node.initialize();
        Util.castDone(done);
        return;
      }

      if (target) {
        refTopic = target.topic;
        refAlias = target.alias;
        refPriority = target.priority;
        refAliasMatchAll = target.aliasMatchAll;
      }

      // -------- Topic -------- //
      if (msg.subTopic !== undefined) {
        topic = Util.sanitizeTopic(msg.subTopic, node, err);
      } else if (RED.util.getMessageProperty(msg, config.topic) !== undefined) {
        topic = Util.castTypeTopic(config.topicType, config.topic, node, RED, msg, err);
      }

      if (err.error) {
        Util.processError(err.text, null, node, done);
        return;
      }

      if (Util.isDeclared(topic, true, true) && topic !== refTopic) {
        newNode.topic = Util.sanitizeTopic(topic, node);
      }

      // -------- Alias -------- //
      if (msg.subAlias !== undefined) {
        alias = Util.sanitizeAlias(msg.subAlias, node, err);
      } else if (RED.util.getMessageProperty(msg, config.alias) !== undefined) {
        alias = Util.castTypeAlias(config.aliasType, config.alias, node, RED, msg, err);
      }

      if (err.error) {
        Util.processError(err.text, null, node, done);
        return;
      }

      if (Util.isDeclared(alias, true, true) && !Util.equalAlias(alias, refAlias)) {
        newNode.alias = Util.sanitizeAlias(alias, node);
      }

      // -------- Priority -------- //
      if (msg.subPriority !== undefined) {
        priority = Util.sanitizePriority(msg.subPriority, node);
      } else if (RED.util.getMessageProperty(msg, config.priority) !== undefined) {
        priority = Util.castTypePriority(config.priorityType, config.priority, node, RED, msg, err);
      }

      if (err.error) {
        Util.processError(err.text, null, node, done);
        return;
      }

      if (Util.isDeclared(priority, true, false) && priority !== refPriority) {
        newNode.priority = Util.sanitizePriority(priority, node);
      }

      // -------- Match All -------- //
      if (msg.subAliasMatchAll !== undefined) {
        aliasMatchAll = Util.sanitizeAliasMatchAll(msg.subAliasMatchAll, node);
      }

      if (err.error) {
        Util.processError(err.text, null, node, done);
        return;
      }

      if (Util.isDeclared(aliasMatchAll) && aliasMatchAll !== refAliasMatchAll) {
        newNode.aliasMatchAll = Util.sanitizeAliasMatchAll(aliasMatchAll, node);
      }

      /* Checks if any change and unregisteres to make new register in link */
      if (Object.keys(newNode).length !== 0) {
        if (Util.isDeclared(newNode.alias, true, true)) node.subLink.unregisterSubOutputAlias(node);

        node.subLink.registerSubOutput(node, newNode.topic, newNode.alias, newNode.priority, newNode.aliasMatchAll);
        node.sendSecondOutput();
      } else if (msg.config !== undefined && msg.config === true) node.sendSecondOutput();

      node.updateStatus();
      Util.castDone(done);
    });

    /**
     * Event node closed
     */
    node.on("close", (removed, done) => {
      if (node.subLink) node.subLink.unregisterSubOutput(node);
      if (done) done();
    });

    // Register Outbound Node In Config
    node.initialize();
  }
  RED.nodes.registerType("sub-link-output", SubLinkNodeOut);
};
