var identity = require('identity'),
    request = require('request');

exports.createClient = function(options) {
    return new Client(options);
};

var Client = function(options) {
    this.options = options;
    this.authorized = false;
    this.serviceCatalog = {};
};

/**
 * @name Client.authorizedRequest
 *
 * @description Global handler for creating a new authorized request to the provided
 * Rackspace API endpoint.
 *
 * @param {Object}      options     provides required values for the request
 * @param {Function}    callback    handles the callback of your api call
 */
Client.prototype.authorizedRequest = function(options, callback) {
    var self = this;

    if (!options || !callback) {
        throw new Error('Options and Callback are required');
    }

    var defaultEndpoint = options.endpoint ? options.endpoint :
        rackspace.Endpoints.Openstack;

    var endpoint = getEndpoint(_.extend({}, defaultEndpoint, {
        region: self.config.defaultRegion
    }), self.config.serviceCatalog);

    var requestOptions = {
        uri: endpoint + options.uri,
        method: options.method || 'GET',
        json: options.data ? options.data : true,
        headers: {
            'X-AUTH-TOKEN': self.config.token.id
        }
    };

    if (options.qs) {
        requestOptions.qs = options.qs;
    }

    request(requestOptions, callback);
};