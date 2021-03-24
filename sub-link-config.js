module.exports = function(RED) {
    function SubLinkNodeConfig(config) {
        RED.nodes.createNode(this, config);
        this.name  = config.name;
        this.clone = config.clone;
        this.alias = config.alias;
        var MQTTPattern = require("mqtt-pattern");

        var node = this;

        //List of Outputs to this config
        node.target = {};
        node.aliasTarget = {};
        node.targetAlias = {};

        //Listener To Emit New Messages To Output
        node.listener = function(msg,topic=null) {
            var target = node.target;
            
            var subId = null;
            
            if(msg.subId !== undefined){
                target = {};
                if(node.target[msg.subId] !== undefined){
                    target[msg.subId] = node.target[msg.subId]; 
                }
            }else if(msg.subAlias !== undefined){
                target = {};
                if(node.aliasTarget[msg.subAlias] !== undefined){
                    for(var o in node.aliasTarget[msg.subAlias]){
                        target[o] = node.aliasTarget[msg.subAlias][o];
                    }
                }
            }
            
            if(topic === "")
                topic = null; 

            if(topic === null && msg.subTopic !== undefined && msg.subTopic !== "")
                topic = msg.subTopic;

            for(out in target){
                //Clone Messages
                if(node.clone === true && msg._sub_flow_clone !== true){
                    //Clone Message if requested by link config
                    message = RED.util.cloneMessage(msg);
                    message._sub_flow_clone = true;
                }else
                    message = msg;

                //Checks If Sends Messagae
                if(target[out].topic === "#"){
                    //Output All
                }else if(topic !== null && target[out].topic !== null){
                    if(MQTTPattern.matches(target[out].topic,topic) !== true)
                        continue;
                }else if(topic !== null || target[out].topic !== null){
                    continue;
                }else if(topic !== null && target[out].topic === null){
                    continue;
                }else if(topic === null && target[out].topic !== null){
                    continue;
                }

                message.subTopic   = topic;
                message.subMyId    = target[out].node.id;

                if(target[out].node.name !== undefined)
                    message.subMyName = target[out].node.name;

                if(target[out].node.alias !== undefined)
                    message.subMyAlias = target[out].node.alias;

                //Delete Targets to prevent Loops
                delete message.subId;
                delete message.subAlias;

                target[out].node.sendMessage(message);
                delete message;
                delete msg;
            }
        }

        //Register New Output
        node.registerSubOutput = function(n,topic=null){
            if(topic === "")
                topic = null; 

            //Store ID's
            node.target[n.id] = {};
            node.target[n.id].node = n;
            node.target[n.id].topic = topic;

            //Store Alias
            if(n.alias !== undefined && n.alias !== "" && n.alias !== null){
                if(this.aliasTarget[n.alias]===undefined)
                    this.aliasTarget[n.alias] = {};
                
                if(this.targetAlias[n.id]!==undefined){ 
                    delete this.aliasTarget[this.targetAlias[n.id]];
                    this.targetAlias[n.id] = n.alias;
                }

                this.targetAlias[n.id] = n.alias;
                this.aliasTarget[n.alias][n.id] = node.target[n.id];
            }
        }

        //Unegister Output
        node.unregisterSubOutput = function(n){
            delete node.target[n.id];

            //Remove Alias
            if(n.alias !== undefined && n.alias !== "" && n.alias !== null && aliasTarget[n.alias] !== undefined)
                delete aliasTarget[n.alias][n.id];

            if(Object.keys(aliasTarget[n.alias]).length === 0)
                delete aliasTarget[n.alias];
        }

        //Remove New Message Listener
        node.on("close",function(removed, done) { 
            for(t in node.target)
                node.unregisterSubOutput(node.target[t]);

            node.target = {};
            node.aliasTarget = {};
            
            if(done)
                done();
        });

    }
    RED.nodes.registerType("sub-link-config",SubLinkNodeConfig);
}