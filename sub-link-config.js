module.exports = function(RED) {
    function SubLinkNodeConfig(config) {
        RED.nodes.createNode(this, config);
        this.name  = config.name;
        this.clone = config.clone
        var MQTTPattern = require("mqtt-pattern");

        var node = this;

        //List of Outputs to this config
        node.target = {};

        //Listener To Emit New Messages To Output
        node.listener = function(msg,subTopic=null) {
            if(subTopic === "")
            subTopic = null; 

            if(subTopic === null && msg.subTopic !== undefined && msg.subTopic !== "")
                subTopic = msg.subTopic;

            for(out in node.target){
                
                //Clone Messages
                if(node.clone === true && msg._sub_flow_clone !== true){
                    //Clone Message if requested by link config
                    message = RED.util.cloneMessage(msg);
                    message._sub_flow_clone = true;
                }else
                    message = msg;

                //Checks If Sends Messagae
                if(node.target[out].subTopic === "#"){
                    //Output All
                }else if(subTopic !== null && node.target[out].subTopic !== null){
                    if(MQTTPattern.matches(node.target[out].subTopic,subTopic) !== true)
                        continue;
                }else if(subTopic !== null || node.target[out].subTopic !== null){
                    continue;
                }else if(subTopic !== null && node.target[out].subTopic === null){
                    continue;
                }else if(subTopic === null && node.target[out].subTopic !== null){
                    continue;
                }

                node.target[out].node.sendMessage(message);
                delete message;
                delete msg;
            }
        }

        //Register New Output
        node.registerSubOutput = function(n,subTopic=null){
            if(subTopic === "")
            subTopic = null; 

            node.target[n.id] = {};
            node.target[n.id].node = n;
            node.target[n.id].subTopic = subTopic;
        }

        //Unegister Output
        node.unregisterSubOutput = function(n){
            delete node.target[n.id];
        }

        //Remove New Message Listener
        node.on("close",function(removed, done) { 
            for(t in node.target)
                node.unregisterSubOutput(n);
            if(done)
                done();
        });

    }
    RED.nodes.registerType("sub-link-config",SubLinkNodeConfig);
}