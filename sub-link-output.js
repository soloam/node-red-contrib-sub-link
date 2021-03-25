module.exports = function(RED) {
    function SubLinkNodeOut(config) {
        RED.nodes.createNode(this,config);
        this.clone = config.clone;
        this.topic = config.topic;
        this.priority = parseInt(config.priority)||0;
        
        this.aliasType = config.aliasType;

        switch(this.aliasType){
            case "str":
                this.alias = [];
                if(config.alias !== undefined && config.alias !== null && config.alias !== "")
                    this.alias = [config.alias];
            break;
            case "json":
                this.alias = JSON.parse(config.alias);
            break;
        }

        if(Array.isArray(this.alias) === false || this.alias.length === 0)
            this.alias = null;
        
        var node = this;

        //Get Config Node
        node.subLink = RED.nodes.getNode(config.link);

        setTimeout(
            function(){ 
                node.updateStatus()
            }, 5000);

        //Send Message
        node.sendMessage = function(msg,msg2){
            if(node.clone === true && msg._sub_flow_clone !== true)
                message = RED.util.cloneMessage(msg);//Clone Message if requested by Output config and if not cloned by config
            else
                message = msg;

            this.updateStatus();

            delete message._sub_flow_clone;
            node.send([message,msg2]);
            delete message;
            delete msg;
            delete msg2;
        }

        node.updateStatus = function(){
            this.status({fill:"green",shape:"dot",text:"Linked"});
        }

        node.getTargetMsgProp = function(msg){
            msg.subMyId    = this.id;

            if(this.name !== undefined && this.name  !== "" && this.name  !== null )
                msg.subMyName = this.name;

            if(this.alias !== undefined && this.alias !== "" && this.alias !== null )
                msg.subMyAlias = this.alias;

            if(this.topic !== undefined && this.topic !== "" && this.topic !== null)
                msg.subPattern = this.topic;

            if(this.priority > 0)
                msg.subMyPriority = this.priority;

            return msg;

        }

        node.sendSecondOutput = function(){
            node.send(
                [
                    null,
                    node.getTargetMsgProp({})
                ]
            )
        }

        //Register Outbound Node In Config
        if (node.subLink) {
            node.updateStatus();
            node.subLink.registerSubOutput(node,this.topic);
            node.sendSecondOutput();
        }

        //Unregister Outbound Node In Config
        node.on("close",function(removed, done){ 
            if (node.subLink)
                node.subLink.unregisterSubOutput(node);
            if(done)
                done();
        });
    }
    RED.nodes.registerType("sub-link-output",SubLinkNodeOut);
}