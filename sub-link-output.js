module.exports = function(RED) {
    function SubLinkNodeOut(config) {
        RED.nodes.createNode(this,config);
        this.clone = config.clone;
        this.topic = config.topic;
        this.alias = config.alias;
        
        var node = this;

        //Get Config Node
        node.subLink = RED.nodes.getNode(config.link);

        setTimeout(
            function(){ 
                node.updateStatus()
            }, 5000);

        //Send Message
        node.sendMessage = function(msg){
            if(node.clone === true && msg._sub_flow_clone !== true)
                message = RED.util.cloneMessage(msg);//Clone Message if requested by Output config and if not cloned by config
            else
                message = msg;

            this.updateStatus();

            delete message._sub_flow_clone;
            node.send(message);
            delete message;
            delete msg;
        }

        node.updateStatus = function(){
            this.status({fill:"green",shape:"dot",text:"Linked"});
        }

        //Register Outbound Node In Config
        if (node.subLink) {
            node.updateStatus();
            node.subLink.registerSubOutput(node,this.topic);
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