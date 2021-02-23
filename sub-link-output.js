module.exports = function(RED) {
    function SubLinkNodeOut(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        //Get Config Node
        node.subLink = RED.nodes.getNode(config.link);

        //Register Outbound Node In Config
        if (node.subLink) {
            node.subLink.registerSubOutput(node);
        }

        //Send Message
        node.sendMessage = function(msg){
            //TODO: Possible give option to clone message
            node.send(msg);
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