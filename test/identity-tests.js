//

var identity = require('../lib/identity'),
    services = require('../lib/client/services').services,
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


describe('Authentication Tests', function() {

    it('Should connect and authenticate with apiKey & username', function(done) {

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

        identity.createIdentity(cfg, function(err, identity) {

            should.not.exist(err);
            should.exist(identity);
            should.exist(identity.token);
            should.exist(identity.serviceCatalog);

            done();
        });
    });

});