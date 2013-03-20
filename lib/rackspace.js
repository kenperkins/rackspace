/*
 * rackspace.js: Entry point for rackspace package
 *
 * (C) 2013 Ken Perkins
 * MIT LICENSE
 *
 */

var rackspace = exports;

// Expose version through `pkginfo`.
require('pkginfo')(module, 'version');

// Core functionality
rackspace.createClient = require('./client').client.createClient;

rackspace.core = require('./client');
rackspace.models = require('./models');

//
////  Servers
//rackspace.Server = require('./models/server').Server;
//rackspace.Flavor = require('./cloudservers/flavor').Flavor;
//rackspace.Image = require('./cloudservers/image').Image;
//
//// Cloud Dns
//rackspace.Domain = require('./clouddns/domain').Domain;
//rackspace.Record = require('./clouddns/record').Record;
//rackspace.Status = require('./clouddns/status').Status;
//
//// Cloud Block Storage
//rackspace.Volume = require('./cloudblockstorage/volume').Volume;
//rackspace.VolumeType = require('./cloudblockstorage/volume').VolumeType;
//
//// Cloud LoadBalancers
//rackspace.LoadBalancer = require('./cloudloadbalancers/loadbalancer').LoadBalancer;
//rackspace.SessionPersistence = require('./cloudloadbalancers/loadbalancer').SessionPersistence;
//rackspace.Algorithm = require('./cloudloadbalancers/loadbalancer').Algorithm;
//rackspace.VirtualIp = require('./cloudloadbalancers/virtualip').VirtualIp;
//rackspace.VirtualIpTypes = require('./cloudloadbalancers/virtualip').VirtualIpTypes;
//rackspace.Protocols = require('./cloudloadbalancers/protocol').Protocols;
//rackspace.Node = require('./cloudloadbalancers/node').Node;
//rackspace.NodeConditions = require('./cloudloadbalancers/node').NodeConditions;
//rackspace.NodeType = require('./cloudloadbalancers/node').NodeType;
//
//rackspace.Endpoints = {
//    Openstack: {
//        type: 'compute',
//        name: 'cloudServersOpenStack'
//    },
//    CloudDns: {
//        type: 'rax:dns',
//        name: 'cloudDNS'
//    },
//    CloudLoadBalancer: {
//        type: 'rax:load-balancer',
//        name: 'cloudLoadBalancers'
//    },
//    CloudBlockStorage: {
//        type: 'volume',
//        name: 'cloudBlockStorage'
//    }
//};