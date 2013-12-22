define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'jqueryTransit',

    // helpers
    'helpers/commonData',

    // views
    'views/sub/timelineView',
    'views/sub/timelineContentView',

    // collection
    'collection/exhibitCollection'

],function ( $, _, Backbone, JST, jqueryTransit, commonData, timelineView, timelineContentViews, exhibitCollection ) {
    var MainView = Backbone.View.extend({
        el : "#main-content",
        template : JST['app/scripts/templates/mainTemplate.ejs'],

        line  : null,
        $line : null,

        initialize : function(){
            this.getTimelines('chronozoomer','chronozoomer','fefea7de-89d2-426e-91ba-b4d87c9bda4c');

            this.line = document.getElementById("timeline");
            this.$line = $(this.line);

        },

        render : function(){

        },

        getTimelines : function(superCollection,subCollection,timeLine){
            var self = this;
            $.ajax({
                type : "GET",
                url  : "http://test.chronozoom.com/api/gettimelines",
                data : {
                    supercollection: superCollection,
                    collection: subCollection,
                    commonAncestor: timeLine,
                    depth: 5
                },

                dataType: "json",
                success : function( data, textStatus, jqXHR ){
                    if(data != null){
                        constants.EVENT_START_YEAR = data.start;
                        constants.EVENT_END_YEAR   = data.end;
                        constants.EVENT_DURATION   = data.end - data.start;


                        self.timelineRaw = data;
                        self.createTimeLine();
                        self.parseExhibits(data.exhibits);
                    }
                },

                error : function( XMLHttpRequest, textStatus, errorThrown ) {
                    alert("Ajax error: "+textStatus+", "+errorThrown);
                }
            });
        },

        createTimeLine : function( ){

            this.$line.css('width', commonData.windowSize.width);
            timelineView.render();

        },

        parseExhibits : function( exhibits ){
            if( exhibits != null ){
                for( var i = 0; i < exhibits.length; i++ ){
                    // console.log(exhibits[i]);
                    exhibitCollection.add(exhibits[i])
                }
            }

            // -------------
            timelineContentViews.render();


        }
    });

    return MainView;

});