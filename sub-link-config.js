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

        //Listener To Emit New Messages To Output
        node.listener = function(msg,input,topic) {
            var n=0;
            var target = node.target;
            
            var subId = null;
            
            if(msg.subId !== undefined){
                target = {};
                if(node.target[msg.subId] !== undefined){
                    target[msg.subId] = node.target[msg.subId]; 
                }
            }else if(msg.subAlias !== undefined){
                target = {};
                for(var i=0;i<msg.subAlias.length;i++){
                    if(node.aliasTarget[msg.subAlias[i]] !== undefined){
                        for(var o in node.aliasTarget[msg.subAlias[i]]){
                            target[o] = node.aliasTarget[msg.subAlias[i]][o];
                        }
                    }
                }
            }
            
            if(topic === undefined || topic === "")
                topic = null; 

            if(topic === null && msg.subTopic !== undefined && msg.subTopic !== "")
                topic = msg.subTopic;

            for(out in target){
                //Clone Messages
                if(node.clone === true && msg._sub_flow_clone !== true){
                    //Clone Message if requested by link config
                    message = RED.util.cloneMessage(msg);
                    message._sub_flow_clone = true;
                    message._cloned = true;
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
                
                var msg2 = {};
                msg2.subFromTopic = topic;
                msg2.subFromId  = input.id;

                if(input.name !== undefined && input.name !== "" && input.name !== null )
                    msg2.subFromName = input.name;

                if(input.alias !== undefined && input.alias !== "" && input.alias !== null )
                    msg2.subFromAlias = input.alias;

                target[out].node.getTargetMsgProp(msg2,target[out].node);

                //Delete Targets to prevent Loops
                delete message.subId;
                delete message.subTopic;
                delete message.subAlias;

                target[out].node.sendMessage(message,msg2,topic);
                n++;
                delete message;
                delete msg;
            }

            input.updateStatus(n,Object.keys(target).length);
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
                for(var i=0;i<n.alias.length;i++){
                    if(this.aliasTarget[n.alias[i]]===undefined)
                        this.aliasTarget[n.alias[i]] = {};
                    
                    this.aliasTarget[n.alias[i]][n.id]=node.target[n.id];

                    //Sort Alias
                    this.aliasTarget[n.alias[i]] = node.sortTargetPriority(this.aliasTarget[n.alias[i]]);
                }
            }

            //Sort Target
            this.target = node.sortTargetPriority(this.target);
        }

        node.sortTargetPriority = function (obj){
            obj = Object.entries(obj).sort((a,b) => b[1].node.priority-a[1].node.priority).reduce((accum, [k, v]) => {
                accum[k] = v;
                return accum;
              }, {});
            
            return obj;
        }

        //Unegister Output
        node.unregisterSubOutput = function(n){
            delete node.target[n.id];

            //Remove Alias
            for(var al in this.aliasTarget){
                delete this.aliasTarget[al][n.id];

                if(Object.keys(this.aliasTarget[al]).length === 0){
                    delete this.aliasTarget[al];
                    continue;
                }
            }                
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