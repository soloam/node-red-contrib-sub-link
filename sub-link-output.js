module.exports = function(RED) {
    function SubLinkNodeOut(config) {
        RED.nodes.createNode(this,config);
        this.clone = config.clone
        
        var node = this;

        //Get Config Node
        node.subLink = RED.nodes.getNode(config.link);

        //Register Outbound Node In Config
        if (node.subLink) {
            node.subLink.registerSubOutput(node);
        }

        //Send Message
        node.sendMessage = function(msg){
            if(node.clone === true && msg._sub_flow_clone !== true){
                //Clone Message if requested by Output config and if not cloned by config
                message = RED.util.cloneMessage(msg);
            }
            else
                message = msg;

            delete message._sub_flow_clone;
            node.send(message);
        }

        //Unregister Outbound Node In Config
        node.on("close",function(){ 
            if (node.subLink) {
                node.subLink.unregisterSubOutput(node);
            }
        });
    }
    RED.nodes.registerType("sub-link-output",SubLinkNodeOut);
}