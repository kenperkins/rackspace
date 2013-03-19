//

var identity = require('../lib/client/identity'),
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

    it('Should fail because of invalid inputs', function(done) {
        try {
            identity.authorize({}, function(err, response) {

            });
        }
        catch (e) {
            should.exist(e);
            e.should.be.an.instanceof(Error);
            e.should.have.property('message', 'Must provide (apiKey and username) or (password and username) or (token and tenant)')
            done();
        }
    });

    it('Should fail because of missing password with username', function(done) {
        try {
            identity.authorize({
                username: 'foo'
            }, function(err, response) {

            });
        }
        catch (e) {
            should.exist(e);
            e.should.be.an.instanceof(Error);
            e.should.have.property('message', 'Must provide (apiKey and username) or (password and username) or (token and tenant)')
            done();
        }
    });

    it('Should fail because of missing username with apiKey', function(done) {
        try {
            identity.authorize({
                apiKey: 'foo'
            }, function(err, response) {

            });
        }
        catch (e) {
            should.exist(e);
            e.should.be.an.instanceof(Error);
            e.should.have.property('message', 'Must provide (apiKey and username) or (password and username) or (token and tenant)')
            done();
        }
    });

    it('Should fail because of missing tenant with a token', function(done) {
        try {
            identity.authorize({
                token: 'foo'
            }, function(err, response) {

            });
        }
        catch (e) {
            should.exist(e);
            e.should.be.an.instanceof(Error);
            e.should.have.property('message', 'Must provide (apiKey and username) or (password and username) or (token and tenant)')
            done();
        }
    });

    it('Should fail because of missing username with password', function(done) {
        try {
            identity.authorize({
                password: 'foo'
            }, function(err, response) {

            });
        }
        catch (e) {
            should.exist(e);
            e.should.be.an.instanceof(Error);
            e.should.have.property('message', 'Must provide (apiKey and username) or (password and username) or (token and tenant)')
            done();
        }
    });

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

        identity.authorize(cfg, function(err, catalog) {

            should.not.exist(err);
            should.exist(catalog);
            should.exist(catalog.token);
            should.exist(catalog.services);

            done();
        });
    });

    it('Should fail to authenticate with bad apiKey & username', function(done) {

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
                .replyWithFile(401, __dirname + '/mock/identity/401-invalid-apiKeyCredentials.json');
        }

        identity.authorize(cfg, function(err, catalog) {

            should.exist(err);
            should.not.exist(catalog);
            err.unauthorized.message.should.equal('Username or api key is invalid');

            done();
        });
    });

    it('Should fail to authenticate with apiKey & username & bad tenant', function(done) {

        var cfg = config ? config : {
            apiKey: 'asdf1234',
            username: 'thisismyusername',
            region: 'ORD',
            tenantId: 'asdf12#$'
        };

        if (mock) {
            nock('https://identity.api.rackspacecloud.com')
                .post('/v2.0/tokens', { auth: {
                    'RAX-KSKEY:apiKeyCredentials': {
                        username: cfg.username,
                        apiKey: cfg.apiKey
                    },
                    tenantId: cfg.tenantId
                }})
                .replyWithFile(401, __dirname + '/mock/identity/401-invalid-apiKeyCredentials.json');
        }

        identity.authorize(cfg, function(err, catalog) {

            should.exist(err);
            should.not.exist(catalog);
            err.unauthorized.code.should.equal(401);

            done();
        });
    });

    it('Should fail to authenticate with bad password & username', function(done) {

        var cfg = config ? config : {
            password: 'asdf1234',
            username: 'thisismyusername',
            region: 'ORD'
        };

        if (mock) {
            nock('https://identity.api.rackspacecloud.com')
                .post('/v2.0/tokens', { auth: {
                    'passwordCredentials': {
                        username: cfg.username,
                        password: cfg.password
                    }
                }})
                .replyWithFile(401, __dirname + '/mock/identity/401-invalid-passwordCredentials.json');
        }

        identity.authorize(cfg, function(err, catalog) {

            should.exist(err);
            should.not.exist(catalog);
            err.unauthorized.message.should.equal('Unable to authenticate user with credentials provided.');

            done();
        });
    });

    it('Should fail to authenticate with password & username & bad tenant', function(done) {

        var cfg = config ? config : {
            password: 'asdf1234',
            username: 'thisismyusername',
            tenantId: 'asdf12#$',
            region: 'ORD'
        };

        if (mock) {
            nock('https://identity.api.rackspacecloud.com')
                .post('/v2.0/tokens', { auth: {
                    'passwordCredentials': {
                        username: cfg.username,
                        password: cfg.password
                    },
                    tenantId: cfg.tenantId
                }})
                .replyWithFile(401, __dirname + '/mock/identity/401-invalid-passwordCredentials.json');
        }

        identity.authorize(cfg, function(err, catalog) {

            should.exist(err);
            should.not.exist(catalog);
            err.unauthorized.code.should.equal(401);

            done();
        });
    });

    it('Should connect and authenticate with password & username', function(done) {

        var cfg = config ? config : {
            password: 'asdf1234',
            username: 'thisismyusername',
            region: 'ORD'
        };

        if (mock) {
            nock('https://identity.api.rackspacecloud.com')
                .post('/v2.0/tokens', { auth: {
                    'passwordCredentials': {
                        username: cfg.username,
                        password: cfg.password
                    }
                }})
                .replyWithFile(200, __dirname + '/mock/identity/200-USA-identity-response.json');
        }

        identity.authorize(cfg, function(err, catalog) {

            should.not.exist(err);
            should.exist(catalog);
            should.exist(catalog.token);
            should.exist(catalog.services);

            done();
        });
    });

    it('Should connect and authenticate with token and tenantId', function(done) {

        var cfg = config ? config : {
            token: 'asdf1234',
            tenantId: '809120',
            region: 'ORD'
        };

        if (mock) {
            nock('https://identity.api.rackspacecloud.com')
                .post('/v2.0/tokens', {
                    auth: {
                        token: {
                            id: cfg.token
                        },
                        tenantId: cfg.tenantId
                    }
                })
                .replyWithFile(200, __dirname + '/mock/identity/200-USA-identity-response.json');
        }

        identity.authorize(cfg, function(err, catalog) {

            should.not.exist(err);
            should.exist(catalog);
            should.exist(catalog.token);
            should.exist(catalog.services);
            catalog.token.tenant.id.should.equal(cfg.tenantId);

            done();
        });
    });

    it('Endpoints should match requested region or be region-agnostic', function(done) {

        var cfg = config ? config : {
            token: 'asdf1234',
            tenantId: '809120',
            region: 'ORD'
        };

        if (mock) {
            nock('https://identity.api.rackspacecloud.com')
                .post('/v2.0/tokens', {
                    auth: {
                        token: {
                            id: cfg.token
                        },
                        tenantId: cfg.tenantId
                    }
                })
                .replyWithFile(200, __dirname + '/mock/identity/200-USA-identity-response.json');
        }

        identity.authorize(cfg, function(err, catalog) {

            should.not.exist(err);
            should.exist(catalog);
            should.exist(catalog.token);
            should.exist(catalog.services);

            _.each(catalog.services, function(service) {
                if (service.selectedEndpoint.region) {
                    service.selectedEndpoint.region.toLowerCase().should.equal(cfg.region.toLowerCase());
                }
            });

            done();
        });
    });

    it('Should fail to match endpoint region for CloudDatabases', function(done) {

        var cfg = config ? config : {
            token: 'asdf1234',
            tenantId: '809120',
            region: 'ORD'
        };

        if (mock) {
            nock('https://identity.api.rackspacecloud.com')
                .post('/v2.0/tokens', {
                    auth: {
                        token: {
                            id: cfg.token
                        },
                        tenantId: cfg.tenantId
                    }
                })
                .replyWithFile(200, __dirname + '/mock/identity/missingRegionEndpoint.json');
        }

        identity.authorize(cfg, function(err, catalog) {

            should.exist(err);
            err.message.should.equal('Unable to parse service catalog');
            should.not.exist(catalog);

            done();
        });
    });

    it('Should fail when default region is not specified', function(done) {

        var cfg = config ? config : {
            token: 'asdf1234',
            tenantId: '809120'
        };

        if (mock) {
            nock('https://identity.api.rackspacecloud.com')
                .post('/v2.0/tokens', {
                    auth: {
                        token: {
                            id: cfg.token
                        },
                        tenantId: cfg.tenantId
                    }
                })
                .replyWithFile(200, __dirname + '/mock/identity/200-USA-identity-response.json');
        }

        identity.authorize(cfg, function(err, catalog) {

            should.exist(err);
            err.error.should.equal('You must specify a region or configure a default region');
            should.not.exist(catalog);

            done();
        });
    });

    it('Get the correct endpoint url for a service', function(done) {

        var cfg = config ? config : {
            token: 'asdf1234',
            tenantId: '809120',
            region: 'ORD'
        };

        if (mock) {
            nock('https://identity.api.rackspacecloud.com')
                .post('/v2.0/tokens', {
                    auth: {
                        token: {
                            id: cfg.token
                        },
                        tenantId: cfg.tenantId
                    }
                })
                .replyWithFile(200, __dirname + '/mock/identity/200-USA-identity-response.json');
        }

        identity.authorize(cfg, function(err, catalog) {

            should.not.exist(err);
            should.exist(catalog);
            should.exist(catalog.services['cloudServersOpenStack']);

            catalog.services['cloudServersOpenStack'].getEndpointUrl().should.equal('https://ord.servers.api.rackspacecloud.com/v2/809120');

            done();
        });
    });

    it('Get the publicURL for an endpoint, even when asking for a private (when no private exists)', function(done) {

        var cfg = config ? config : {
            token: 'asdf1234',
            tenantId: '809120',
            region: 'ORD'
        };

        if (mock) {
            nock('https://identity.api.rackspacecloud.com')
                .post('/v2.0/tokens', {
                    auth: {
                        token: {
                            id: cfg.token
                        },
                        tenantId: cfg.tenantId
                    }
                })
                .replyWithFile(200, __dirname + '/mock/identity/200-USA-identity-response.json');
        }

        identity.authorize(cfg, function(err, catalog) {

            should.not.exist(err);
            should.exist(catalog);
            should.exist(catalog.services['cloudServersOpenStack']);

            catalog.services['cloudServersOpenStack'].getEndpointUrl({ internal: true}).should.equal('https://ord.servers.api.rackspacecloud.com/v2/809120');

            done();
        });
    });

    it('Get the internalURL for an endpoint, when asking for internal', function(done) {

        var cfg = config ? config : {
            token: 'asdf1234',
            tenantId: '809120',
            region: 'ORD'
        };

        if (mock) {
            nock('https://identity.api.rackspacecloud.com')
                .post('/v2.0/tokens', {
                    auth: {
                        token: {
                            id: cfg.token
                        },
                        tenantId: cfg.tenantId
                    }
                })
                .replyWithFile(200, __dirname + '/mock/identity/200-USA-identity-response.json');
        }

        identity.authorize(cfg, function(err, catalog) {

            should.not.exist(err);
            should.exist(catalog);
            should.exist(catalog.services['cloudFiles']);

            catalog.services['cloudFiles'].getEndpointUrl({ internal: true}).should.equal('https://snet-storage101.ord1.clouddrive.com/v1/MossoCloudFS_e5d24d36-6096-481d-8b88-d27fa087c2d6');

            done();
        });
    });
});