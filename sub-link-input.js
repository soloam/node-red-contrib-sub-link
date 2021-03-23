module.exports = function(RED) {
    function SubLinkNodeIn(config) {
        RED.nodes.createNode(this,config);
        this.topic = config.topic;

        var node = this;

        //Get Config Node
        node.subLink = RED.nodes.getNode(config.link);
       
        //Send Inbound Message (Emit Event)
        this.on('input', function(msg, send, done) {
            msg.subFromId = node.id;
            node.subLink.listener(msg,this.topic);
            delete msg;

            if (done)
                done(); 
        });
    }
    RED.nodes.registerType("sub-link-input",SubLinkNodeIn);
}
