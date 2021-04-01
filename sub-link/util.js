class SubLinkUtils {}

/**
 * Handles the errors of the nodes
 * @param {string} errorText Error text
 * @param {Object} [err] Controll error object
 * @param {Object} [node] Node
 * @param {callback} [done] Done Callback
 * @returns {Object} Error object
 */
SubLinkUtils.processError = function processError(errorText, err, node, done) {
  var ret = {};

  if (!err) {
    ret = {};
    ret.text = errorText;
    ret.error = true;

    if (done) done(errorText);
    else if (node) node.error(errorText);
  } else {
    ret = err;
    ret.text = errorText;
    ret.error = true;
  }

  return ret;
};

/**
 * Cast done
 * @param {callback} done
 */
SubLinkUtils.castDone = function castDone(done) {
  if (done) done();
};

/**
 * Checks if a value is declared
 * @param {*} value - The value to test
 * @param {boolean} [allowEmpty=false] Can it be empty?
 * @param {boolean} [allowNull=false] Can it be Null?
 * @returns {boolean} Is declared
 */
SubLinkUtils.isDeclared = function isDeclared(value, allowEmpty = false, allowNull = false) {
  if (value === undefined || value === "undefined") return false;

  if ((value === null || value === "null") && allowNull === false) return false;

  if (typeof value === "string" && value === "" && allowEmpty === false) return false;

  if (value !== null && typeof value === "object" && Object.keys(value).length === 0 && allowEmpty === false) return false;

  if (Array.isArray(value) && value.length === 0 && allowEmpty === false) return false;

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (!SubLinkUtils.isDeclared(value[i], allowEmpty)) return false;
    }
  }

  return true;
};

/**
 * Sanitizes the Alias fields
 * @param {(string|string[])} alias - Alias
 * @param {Object} [node] - Node
 * @param {Object} [err] - Controll error object
 * @param {callback} [done] - Done Callback
 * @returns {string[]} Array of aliases
 */
SubLinkUtils.sanitizeAlias = function sanitizeAlias(alias, node, err, done) {
  var inAlias = alias;
  var nAlias;
  var cAlias = null;

  if (alias === undefined) {
    cAlias = null;
  } else if (alias === null) {
    cAlias = null;
  } else if (typeof alias === "number") {
    cAlias = [String(alias)];
  } else if (typeof alias === "string") {
    if (alias.indexOf(",") >= 0) cAlias = alias.split(",");
    else if (alias.indexOf(";") >= 0) cAlias = alias.split(";");
    else cAlias = [alias];
  } else if (Array.isArray(alias)) {
    for (let i = 0; i < alias.length; i++) {
      if (typeof alias[i] === "number") {
        inAlias[i] = String(alias[i]);
      } else if (typeof alias[i] !== "string") {
        SubLinkUtils.processError("Alias array must only contain strings", err, node, done);
        return null;
      }
    }
    cAlias = inAlias;
  } else {
    SubLinkUtils.processError("Alias must be a string or a array or strings", err, node, done);
    return null;
  }

  if (Array.isArray(cAlias)) {
    nAlias = [];
    for (let i = 0; i < cAlias.length; i++) {
      if (!SubLinkUtils.isDeclared(cAlias[i])) {
        continue;
      }

      if (!SubLinkUtils.checkAliasPattern(cAlias[i])) {
        SubLinkUtils.processError(`Alias with invalit pattern '${cAlias[i]}'`, err, node, done);
        return null;
      }

      if (cAlias[i] === "#") {
        nAlias = ["#"];
        break;
      }

      nAlias.push(cAlias[i]);
    }
    cAlias = nAlias;
  }

  if (!SubLinkUtils.isDeclared(cAlias)) return null;

  return cAlias;
};

/**
 * Checks if alias pattern is correct
 * @param {(string|string[])} alias Alias
 * @returns {boolean} Is valid pattern
 */
SubLinkUtils.checkAliasPattern = function checkAliasPattern(alias) {
  var inAlias = alias;
  const regex = new RegExp("^[a-zA-Z0-9\\_\\-\\.]+$");

  if (inAlias === "#") {
    return true;
  }

  if (!Array.isArray(inAlias)) {
    inAlias = [inAlias];
  }

  for (let i = 0; i < inAlias.length; i++) {
    if (inAlias[i] === "#") continue;

    if (!regex.test(inAlias[i])) {
      return false;
    }
  }
  return true;
};

/**
 * Checks if both alieses have the same values
 * @param {(string|string[])} a Alias A
 * @param {(string|string[])} b Alias B
 * @returns {boolean} If both are the same or not
 */
SubLinkUtils.equalAlias = function equalAlias(a, b) {
  var ac;
  var bc;

  if (typeof a !== "string" && !Array.isArray(a)) return false;
  if (typeof b !== "string" && !Array.isArray(b)) return false;

  if (a === b) return true;
  if (a == null || b == null) return false;

  if (Array.isArray(a)) ac = [...a];
  else ac = a;

  if (Array.isArray(b)) bc = [...b];
  else bc = b;

  ac = SubLinkUtils.sanitizeAlias(ac);
  bc = SubLinkUtils.sanitizeAlias(bc);

  if (ac == null || bc == null) return false;

  if (ac.length !== bc.length) return false;

  ac.sort();
  bc.sort();

  for (let i = 0; i < ac.length; ++i) {
    if (ac[i] !== bc[i]) return false;
  }
  return true;
};

/**
 * Checks if Alias B is contained in Alias A
 * @param {(string|string[])} a Alias A
 * @param {(string|string[])} b Alias B
 * @returns {boolean} If are contained or not
 */
SubLinkUtils.includedAlias = function includedAlias(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;

  if (!SubLinkUtils.isDeclared(a) && SubLinkUtils.isDeclared(b)) return false;
  if (SubLinkUtils.isDeclared(a) && !SubLinkUtils.isDeclared(b)) return false;

  if (a.indexOf("#") >= 0) return true;
  if (b.indexOf("#") >= 0) return true;

  // Alias B is inside alias A
  for (let i = 0; i < b.length; i++) {
    if (a.indexOf(b[i]) < 0) return false;
  }

  return true;
};

/**
 * Casts the Alias Fields
 * @param {string} type - Type to cast from
 * @param {(string|string[])} alias Alias
 * @param {Object} node Node object
 * @param {Object} RED RED object
 * @param {Object} msg Message object
 * @param {Object} err Controll error object
 * @param {callback} done Done Callback
 * @returns {string[]} The aliases
 */
SubLinkUtils.castTypeAlias = function castTypeAlias(type, alias, node, RED, msg, err, done) {
  var cAlias = null;
  var retErr = err;

  if (RED) {
    if (type === "msg" && !msg) return null;

    if (type === "msg" && RED.util.getMessageProperty(msg, alias) === undefined) {
      retErr.error = true; // No need for message, only stop process
      return null;
    }
    cAlias = RED.util.evaluateNodeProperty(alias, type, node, msg);
  } else {
    switch (type) {
      case "msg":
      case "flow":
      case "global":
      case "env":
        return alias;
      case "str":
      case "string":
        cAlias = alias;
        break;
      case "json":
        cAlias = JSON.parse(alias);
        break;
      default:
        cAlias = null;
        break;
    }
  }

  return SubLinkUtils.sanitizeAlias(cAlias, node, err, done);
};

/**
 * Sanitizes the Topic fields
 * @param {string} topic - Topic
 * @param {Object} [node] - Node
 * @param {Object} [err] - Controll error object
 * @param {callback} [done] - Done Callback
 * @returns {string} Topic
 */
SubLinkUtils.sanitizeTopic = function sanitizeTopic(topic, node, err, done) {
  var cTopic = null;

  if (topic === undefined) {
    cTopic = null;
  } else if (topic === null) {
    cTopic = null;
  } else if (typeof topic === "number") {
    cTopic = String(topic); // Not the best practices to use numbers as topic, but is possible
  } else if (typeof topic !== "string") {
    SubLinkUtils.processError("Topic must be a string", err, node, done);
    return null;
  } else cTopic = topic;

  if (!SubLinkUtils.checkTopicPattern(cTopic)) {
    SubLinkUtils.processError("Topic with invalit pattern", err, node, done);
    return null;
  }

  if (!SubLinkUtils.isDeclared(cTopic)) return null;

  return cTopic;
};

/**
 * Casts the Topic Fields
 * @param {string} type - Type to cast from
 * @param {string} topic Topic
 * @param {Object} node Node object
 * @param {Object} RED RED object
 * @param {Object} msg Message object
 * @param {Object} err Controll error object
 * @param {callback} done Done Callback
 * @returns {string} The topic
 */
SubLinkUtils.castTypeTopic = function castTypeTopic(type, topic, node, RED, msg, err, done) {
  var cTopic = null;
  var retErr = err;

  if (RED) {
    if (type === "msg" && !msg) return null;

    if (type === "msg" && RED.util.getMessageProperty(msg, topic) === undefined) {
      retErr.error = true; // No need for message, only stop process
      return null;
    }

    cTopic = RED.util.evaluateNodeProperty(topic, type, node, msg);
  } else {
    switch (type) {
      case "msg":
      case "flow":
      case "global":
      case "env":
        return topic;
      case "str":
      case "string":
        cTopic = topic;
        break;
      default:
        cTopic = null;
        break;
    }
  }

  return SubLinkUtils.sanitizeTopic(cTopic, node, err, done);
};

/**
 * Checks if topic pattern is correct
 * @param {string} topic Alias
 * @returns {boolean} Is valid pattern
 */
SubLinkUtils.checkTopicPattern = function checkTopicPattern(topic) {
  var regex = /^(#$|(\+|[^+#]*)(\/(\+|[^+#]*))*(\/(\+|#|[^+#]*))?$)/;

  if (topic === "#") return true;

  if (regex.test(topic)) return true;
  return false;
};

/**
 * Sanitizes the Priority fields
 * @param {(string|number)} priority - Topic
 * @param {Object} [node] - Node
 * @param {Object} [err] - Controll error object
 * @param {callback} [done] - Done Callback
 * @returns {number} Priority
 */
SubLinkUtils.sanitizePriority = function sanitizePriority(priority, node, err, done) {
  var cPriority = null;

  cPriority = parseInt(priority, 10) || null;
  if (Number.isNaN(cPriority)) {
    SubLinkUtils.processError("Priority must be a number", err, node, done);
    return null;
  }

  return cPriority;
};

/**
 * Casts the Priority Field
 * @param {string} type - Type to cast from
 * @param {(string|number)} priority Priority
 * @param {Object} node Node object
 * @param {Object} RED RED object
 * @param {Object} msg Message object
 * @param {Object} err Controll error object
 * @param {callback} done Done Callback
 * @returns {number} The topic
 */
SubLinkUtils.castTypePriority = function castTypePriority(type, priority, node, RED, msg, err, done) {
  var cPriority = priority;
  return SubLinkUtils.sanitizePriority(cPriority, node, err, done);
};

/**
 * Sanitizes the Alias Match All field
 * @param {boolean} aliasMatchAll - Alias Match All
 * @param {Object} [node] - Node
 * @param {Object} [err] - Controll error object
 * @param {callback} [done] - Done Callback
 * @returns {boolean} Alias Match All
 */
SubLinkUtils.sanitizeAliasMatchAll = function sanitizeAliasMatchAll(aliasMatchAll, node, err, done) {
  if (typeof aliasMatchAll !== "boolean") {
    SubLinkUtils.processError("Alias Match All must be a boolean", err, node, done);
    return null;
  }

  return aliasMatchAll;
};

/**
 * Returns message Properties
 * @param {string} id Node ID
 * @param {Object} msg Message to fill
 * @param {Object} subLink Link Config object
 * @returns {Object} Filled message
 */
SubLinkUtils.getTargetMsgProp = function getTargetMsgProp(id, msg = {}, subLink = null) {
  var message = msg;
  var target;

  if (SubLinkUtils.isDeclared(subLink)) target = subLink.getTargetObj(id);

  message.subMyId = id;

  if (SubLinkUtils.isDeclared(target) && SubLinkUtils.isDeclared(target.node) && SubLinkUtils.isDeclared(target.node.name)) message.subMyName = target.node.name;
  else message.subMyName = null;

  if (SubLinkUtils.isDeclared(target) && SubLinkUtils.isDeclared(target.alias)) message.subMyAlias = target.alias;
  else message.subMyAlias = null;

  if (SubLinkUtils.isDeclared(target) && SubLinkUtils.isDeclared(target.topic)) message.subMyPattern = target.topic;
  else message.subMyPattern = null;

  if (SubLinkUtils.isDeclared(target) && SubLinkUtils.isDeclared(target.priority)) message.subMyPriority = target.priority;
  else message.subMyPriority = 0;

  return message;
};

module.exports = SubLinkUtils;
