var openstack = require('openstack'),
    identity = require('../identity'),
    util = require('util');

exports.createClient = function(options, callback) {

    if (options.loadFromFile && options.token) {
        identity.loadIdentity(options.token, options.region, create);
    }
    else {
        identity.createIdentity(options, create);
    }

    function create(err, auth) {
        if (err) {
            callback(err);
            return;
        }

        var client = new Client(auth, options);

        callback(err, client);
    }

};

var Client = function(auth, options) {

    var self = this;

    self.options = options;
    self.auth = auth;
    self.compute = new openstack.Compute(self);
};

util.inherits(Client, openstack.core.client.Client);