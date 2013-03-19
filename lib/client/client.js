var identity = require('identity'),
    request = require('request'),
    url = require('url');

exports.services = {
    cloudServers: 'cloudServers',
    cloudFiles: 'cloudFiles',
    cloudFilesCDN: 'cloudFilesCDN',
    cloudMonitoring: 'cloudMonitoring',
    cloudDatabases: 'cloudDatabases',
    cloudBlockStorage: 'cloudBlockStorage',
    cloudBackup: 'cloudBackup',
    cloudLoadBalancers: 'cloudLoadBalancers',
    cloudServersOpenStack: 'cloudServersOpenStack',
    cloudDNS: 'cloudDNS'
};

exports.createClient = function(options, callback) {
    return new Client(options, callback);
};

var Client = function(options, callback) {

    var self = this;
    this.options = options;
    this.authorized = false;

    identity.authorize(options, function(err, catalog) {
        if (err) {
            callback(err);
            return;
        }

        self.serviceCatalog = catalog;
        self.authorized = true;
    });
};

/**
 * @name Client.authorizedRequest
 *
 * @description Global handler for creating a new authorized request to the provided
 * Rackspace API endpoint.
 *
 * @param {Object}      details     provides required values for the request
 * @param {Function}    callback    handles the callback of your api call
 */
Client.prototype.authorizedRequest = function(details, callback) {
    var self = this;

    if (!details || !callback) {
        throw new Error('Details and Callback are required');
    }

    ['endpoint', 'uri'].forEach(function(required) {
        if (!details[required]) throw new Error('details.' +
            required + ' is a required argument.');
    });

    if (!self.authorized) {
        // TODO do the right thing here
    }

    var requestOptions = {
        uri: url.resolve(self.serviceCatalog[details.endpoint].getEndpointUrl(), details.uri),
        method: details.method || 'GET',
        json: details.data ? details.data : true,
        headers: {
            'X-AUTH-TOKEN': self.serviceCatalog.token.id
        }
    };

    if (details.qs) {
        requestOptions.qs = details.qs;
    }

    request(requestOptions, callback);
};