module.exports = function module(RED) {
  function SubLinkNodeConfig(config) {
    const MQTTPattern = require("mqtt-pattern");

    const Util = require("./util");

    var node;

    RED.nodes.createNode(this, config);
    node = this;

    /**
     * Starts Object
     */
    node.initialize = function initialize() {
      node.config = config;
      node.name = config.name;
      node.clone = config.clone;

      // List of Outputs to this config
      node.target = {};
      node.aliasTarget = {};
    };

    /**
     * Recives messages to be delivered
     * @param {Object} msg Message to deliver
     * @param {Object} input Input Node
     * @param {string} topic Topic
     * @param {string[]} alias Alieses
     * @param {boolean} aliasMatchAll Match all alias
     * @param {callback} done Done Callback
     */
    node.listener = function listener(msg, input, topic, alias, aliasMatchAll, done) {
      var n = 0;
      var t = 0;
      var target;
      var message;
      var msg2;

      target = node.target;

      if (Util.isDeclared(msg.subId)) {
        target = {};
        if (node.target[msg.subId] !== undefined) {
          target[msg.subId] = node.target[msg.subId];
        }
      } else if (Array.isArray(alias) && Util.isDeclared(alias) && alias.indexOf("#") >= 0) {
        // Dont clear Targets
      } else if (Util.isDeclared(alias)) {
        target = {};
        for (let i = 0; i < alias.length; i++) {
          if (node.aliasTarget[alias[i]] !== undefined) {
            Object.keys(node.aliasTarget[alias[i]]).forEach((o) => {
              if (node.aliasTarget[alias[i]][o].node.aliasMatchAll) {
                if (!Util.includedAlias(alias, node.aliasTarget[alias[i]][o].alias)) {
                  return;
                }
              }

              if (aliasMatchAll) {
                if (!Util.includedAlias(node.aliasTarget[alias[i]][o].alias, alias)) {
                  return;
                }
              }

              target[o] = node.aliasTarget[alias[i]][o];
            });
          }
        }

        if (node.aliasTarget["#"] !== undefined) {
          Object.keys(node.aliasTarget["#"]).forEach((o) => {
            target[o] = node.aliasTarget["#"][o];
          });
        }
      }

      t = Object.keys(target).length;

      Object.keys(target).forEach((out) => {
        // Discart Locked (Output nodes that are dynamic and still have no data)
        if (!Util.isDeclared(target[out].topic) && target[out].lockTopic === true) {
          return;
        }

        if (!Util.isDeclared(target[out].alias) && target[out].lockAlias === true) {
          return;
        }

        // Checks If Sends Message by Topic
        if (target[out].topic === "#") {
          // Output All
        } else if (Util.isDeclared(topic) && Util.isDeclared(target[out].topic)) {
          if (MQTTPattern.matches(target[out].topic, topic) !== true) {
            return;
          }
        } else if (Util.isDeclared(topic) && !Util.isDeclared(target[out].topic)) {
          return;
        } else if (!Util.isDeclared(topic) && Util.isDeclared(target[out].topic)) {
          return;
        }

        // Checks if sends message by Alias of Target
        if (target[out].node.aliasMatchAll) {
          // Origin does not have alias
          if (!Util.isDeclared(alias) && Util.isDeclared(target[out].alias)) {
            return;
          }

          if (!Util.includedAlias(target[out].alias, alias)) {
            return;
          }
        }

        // Clone Messages
        if (node.clone === true && msg._sub_flow_clone !== true) {
          // Clone Message if requested by link config
          message = RED.util.cloneMessage(msg);
          message._sub_flow_clone = true;
          message._cloned = true;
        } else message = msg;

        msg2 = {};
        msg2.subFromTopic = topic;
        msg2.subFromId = input.id;
        msg2.subFromName = input.name || null;
        msg2.subFromAlias = alias || null;
        msg2.subMyPosition = n + 1;
        msg2.subFromTotal = t;
        Util.getTargetMsgProp(out, msg2, node);

        // Delete Targets to prevent Loops
        delete message.subId;
        delete message.subTopic;
        delete message.subAlias;

        target[out].node.sendMessage(message, msg2, topic);
        n++;
      });

      input.updateStatus(n, t);
      Util.castDone(done);
    };

    /**
     * Registers new output
     * @param {Object} n Node to register
     * @param {string} topic Topic
     * @param {string[]} alias Alias
     * @param {number} priority Priority
     * @param {boolean} aliasMatchAll Match all alias
     * @param {boolean} lockTopic Topic must be informed
     * @param {boolean} lockAlias Alias must be iformed
     */
    node.registerSubOutput = function registerSubOutput(n, topic, alias, priority, aliasMatchAll, lockTopic = false, lockAlias = false) {
      var nodeR;
      nodeR = n;

      nodeR.linked = false;
      nodeR.updateStatus();

      // Store ID's
      if (node.target[nodeR.id] === undefined) {
        node.target[nodeR.id] = {};
        node.target[nodeR.id].node = nodeR;
        node.target[nodeR.id].topic = null;
        node.target[nodeR.id].priority = null;
        node.target[nodeR.id].alias = null;
        node.target[nodeR.id].lockTopic = lockTopic;
        node.target[nodeR.id].lockAlias = lockAlias;
      }

      if (Util.isDeclared(topic, true, true)) {
        node.target[nodeR.id].topic = Util.sanitizeTopic(topic, node);
      }

      if (Util.isDeclared(alias, true, true)) {
        node.target[nodeR.id].alias = Util.sanitizeAlias(alias, node);
      }
      if (Util.isDeclared(priority, true, false)) {
        node.target[nodeR.id].priority = Util.sanitizePriority(priority, node);
      }
      if (Util.isDeclared(aliasMatchAll)) {
        node.target[nodeR.id].aliasMatchAll = Util.sanitizeAliasMatchAll(aliasMatchAll, node);
      }

      // Store Alias
      if (Util.isDeclared(alias)) {
        for (let i = 0; i < alias.length; i++) {
          if (node.aliasTarget[alias[i]] === undefined) node.aliasTarget[alias[i]] = {};

          node.aliasTarget[alias[i]][nodeR.id] = node.target[nodeR.id];

          // Sort Alias
          node.aliasTarget[alias[i]] = node.sortTargetPriority(node.aliasTarget[alias[i]]);
        }
      }

      // Sort Target
      node.target = node.sortTargetPriority(node.target);
      nodeR.linked = true;
      nodeR.updateStatus();
    };

    /**
     * Returns target object
     * @param {(string|Object)} n Object to return or ID
     * @returns {Object} Target object config
     */
    node.getTargetObj = function getTargetObj(n) {
      var nodeId;
      var target;

      if (!n) return null;

      if (!node.target) return null;

      if (typeof n === "string") nodeId = n;
      else if (typeof n === "object") nodeId = n.id;

      target = node.target[nodeId];

      if (!target) return null;

      return target;
    };

    /**
     * Sorts target by priority
     * @param {Object} obj Target to sort
     * @returns {Object} Sorted target
     */
    node.sortTargetPriority = function sortTargetPriority(obj) {
      var sortObj;
      sortObj = obj;

      sortObj = Object.entries(sortObj)
        .sort((a, b) => b[1].priority - a[1].priority)
        .reduce((accum, [k, v]) => {
          const ac = accum;
          ac[k] = v;
          return ac;
        }, {});

      return sortObj;
    };

    /**
     * Unregister a Output node
     * @param {Object} n Output node Object
     */
    node.unregisterSubOutput = function unregisterSubOutput(n) {
      const unregNode = n;

      unregNode.linked = false;
      unregNode.updateStatus();

      // Removes Target
      delete node.target[unregNode.id];

      // Remove Alias
      node.unregisterSubOutputAlias(unregNode);
    };

    /**
     * Unregister Alias only
     * @param {Object} n Output node Object
     */
    node.unregisterSubOutputAlias = function unregisterSubOutputAlias(n) {
      const unregNode = n;
      unregNode.linked = false;
      unregNode.updateStatus();

      // Remove Alias
      Object.keys(node.aliasTarget).forEach((al) => {
        delete node.aliasTarget[al][n.id];

        if (Object.keys(node.aliasTarget[al]).length === 0) {
          delete node.aliasTarget[al];
        }
      });
    };

    /**
     * Event node closed
     */
    node.on("close", (removed, done) => {
      Object.keys(node.target).forEach((t) => {
        node.unregisterSubOutput(node.target[t]);
      });

      node.target = {};
      node.aliasTarget = {};

      if (done) done();
    });

    node.initialize();
  }
  RED.nodes.registerType("sub-link-config", SubLinkNodeConfig);
};
