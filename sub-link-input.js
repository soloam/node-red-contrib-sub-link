module.exports = function(RED) {
    function SubLinkNodeIn(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        //Get Config Node
        node.subLink = RED.nodes.getNode(config.link);
       
        //Send Inbound Message (Emit Event)
        this.on('input', function(msg, send, done) {
            node.subLink.emit('newMessage', msg);

        });
    }
    RED.nodes.registerType("sub-link-input",SubLinkNodeIn);
}