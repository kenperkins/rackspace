//

var rackspace = require('../lib/rackspace'),
    services = rackspace.core.services,
    should = require('should'),
    nock = require('nock'),
    _ = require('underscore'),
    config = null,
    mock = false;

try {
    config = require('../config.json');
    console.log('Using user defined config');
}
catch (e) {
    mock = true;
    console.log('Using mock api endpoint');
}

describe('Servers Tests', function() {

    var client;

    before(function(done) {

        var cfg = config ? config : {
            apiKey: 'asdf1234',
            username: 'thisismyusername',
            region: 'ORD'
        };

        if (mock) {
            nock('https://identity.api.rackspacecloud.com')
                .post('/v2.0/tokens', { auth: {
                    'RAX-KSKEY:apiKeyCredentials': {
                        username: cfg.username,
                        apiKey: cfg.apiKey
                    }
                }})
                .replyWithFile(200, __dirname + '/mock/identity/200-USA-identity-response.json');
        }

        rackspace.createClient(cfg, function(err, c) {
            should.not.exist(err);
            should.exist(c);

            client = c;
            done();
        });
    });


    it('Should be able to get servers', function(done) {
        if (mock) {
            nock('https://ord.servers.api.rackspacecloud.com')
                .get('/v2/809120/servers/detail')
                .replyWithFile(200, __dirname + '/mock/servers/200-get-servers-detail.json');
        }

        client.compute.getServers(function(err, servers) {
            should.not.exist(err);
            should.exist(servers);
            servers.length.should.equal(2);

            done();
        });
    });

    it('Shouldn\'t error when getting servers returns no servers', function(done) {
        if (mock) {
            nock('https://ord.servers.api.rackspacecloud.com')
                .get('/v2/809120/servers/detail')
                .replyWithFile(200, __dirname + '/mock/servers/200-get-servers-detail-no-servers.json');
        }

        client.compute.getServers(function(err, servers) {
            should.not.exist(err);
            should.exist(servers);
            servers.length.should.equal(0);

            done();
        });
    });
});