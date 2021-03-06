/*global require*/
'use strict';

require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        d3 : {
            exports: 'd3'
        },
        topojson : {
            exports: 'topojson'
        },
        tweenlite : {
            exports: 'TweenLite'
        },
        jqueryTransit : {
            deps: ['jquery']
        }
    },
    paths: {
        jquery: '../bower_components/jquery/jquery',
        jqueryTransit: '../bower_components/jquery.transit/jquery.transit',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore',
        d3 : '../bower_components/d3/d3',
        topojson : '../bower_components/topojson/topojson',
        tweenlite : "../bower_components/greensock/src/uncompressed/TweenMax",
        uri : '../bower_components/jsUri/Uri'
    }
});

require([
    'backbone',
    'routes/mainRouter',

    // helpers
    'helpers/commonData'

], function ( Backbone, MainRouter, commonData ) {



    var appRouter = new MainRouter();

    if(commonData.debug){
        window.appRouter = appRouter;
    }

    Backbone.history.start();
});
