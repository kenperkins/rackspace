var request = require('request'),
    _ = require('underscore');

exports.endpoints = {
    unitedStates: 'https://identity.api.rackspacecloud.com/v2.0',
    unitedKingdom: 'https://lon.identity.api.rackspacecloud.com/v2.0'
};

exports.authorize = (function() {

    var defaults = {
        uri: exports.endpoints.unitedStates + '/tokens',
        method: 'POST'
    };

    return function(options, callback) {
        var opts = _.extend(defaults, _.pick(options,
            'uri'));

        // setup our inputs for authorization
        // key & username
        if (options.apiKey && options.username) {
            opts.json = {
                auth: {
                    'RAX-KSKEY:apiKeyCredentials': {
                        username: options.username,
                        apiKey: options.apiKey
                    }
                }
            };
        }
        // key & password
        else if (options.password && options.username) {
            opts.json = {
                auth: {
                    passwordCredentials: {
                        username: options.username,
                        password: options.password
                    }
                }
            };
        }
        // Token and tenant are also valid inputs
        else if (options.token && (options.tenantId || options.tenantName)) {
            opts.json = {
                auth: {
                    token: {
                        id: options.token
                    }
                }
            };
        }
        // whoops, throw an error
        else {
            throw new Error('Must provide (apiKey and username) or (password and username) or (token and tenant)');
        }

        // Are we filtering down by a tenant?
        if (options.tenantId) {
            opts.json.auth.tenantId = options.tenantId;
        }
        else if (options.tenantName) {
            opts.json.auth.tenantName = options.tenantName;
        }

        request(opts, function(err, response, body) {
            if (err || response.statusCode !== 200) {
                callback(err ? err : body);
                return;
            }

            var auth = null;

            try {
                auth = new Identity(body, {
                    region: options.region
                });
                callback(null, auth);
            }
            catch (e) {
                callback({
                    message: 'Unable to parse identity',
                    error: e
                });
            }
        });
    };
})();

var Identity = function(details, options) {
    var self = this;

    options = options || {};

    if (details.access.token) {
        self.token = details.access.token;
    }

    if (details.access.serviceCatalog) {
        self.serviceCatalog = new ServiceCatalog({
            region: options.region || details.access.user['RAX-AUTH:defaultRegion']
        }, details.access.serviceCatalog);
    }

    self.user = details.access.user;
};

// TODO rationalize how invalid inputs get bubbled up to callers, considering
// TODO the async nature of being handed a service catalog, and then parsing it.

var ServiceCatalog = function(options, catalog) {
    if (!options.region) {
        throw ('You must specify a region or configure a default region');
    }

    var self = this;

    self.region = options.region;
    self.services = {};

    _.each(catalog, function(service) {
        self.services[service.name] = new Service(self.region, service);
    });
};

// TODO rationalize how invalid inputs get bubbled up to callers, considering
// TODO the async nature of being handed a service catalog, and then parsing it.

var Service = function(region, details) {
    var self = this;

    self.endpoints = details.endpoints;
    self.name = details.name;
    self.type = details.type;

    if (details.endpoints.length === 1) {
        if (details.endpoints[0].region && !matchRegion(details.endpoints[0].region, region)) {
            throw ('Requested region (' + region + ') not found for Service: ' + self.name);
        }

        self.selectedEndpoint = details.endpoints[0];
    }
    else {
        _.each(details.endpoints, function(endpoint) {
            if (matchRegion(endpoint.region, region)) {
                self.selectedEndpoint = endpoint;
            }
        });
    }

    if (!self.selectedEndpoint) {
        throw ('Unable to identify target endpoint for Service: ' + self.name);
    }
};

Service.prototype.getEndpointUrl = function(options) {
    var self = this,
        url = null,
        options = options || {};

    if (options.region) {
        _.each(self.endpoints, function(endpoint) {
            if (!endpoint.region || matchRegion(endpoint.region, options.region)) {
                return;
            }

            url = getUrl(endpoint);
        });
    }
    else {
        url = getUrl(self.selectedEndpoint);
    }

    function getUrl(endpoint) {
        return options.internal ?
            (endpoint.internalURL ?
                endpoint.internalURL : endpoint.publicURL) :
            endpoint.publicURL;
    }

    return url;
};

function matchRegion(a, b) {
    return a.toLowerCase() === b.toLowerCase();
}



