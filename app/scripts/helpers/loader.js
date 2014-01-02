define([
    'jquery',
    'underscore',
    'backbone',
    'd3',

    // helpers
    'helpers/commonData',
    'helpers/events',

    // collection
    'collection/exhibitCollection'

],function( $, _, Backbone, d3, commonData, Events, exhibitCollection ){

    var Loader = function(){
        _.bindAll(this, 'geoLoadDone', 'exhibitLoadDone', 'imageLoadDone', 'onLoad', 'onError', 'allLoadDone');
    };

    Loader.prototype = {
        geoStatus           : false,
        exhibitStatus       : false,
        imageDataLoadStatus : false,
        mediaData : {},
        count : 0,
        MAX_Count: 0,


        startToLoad : function(){
            d3.json('json-data/geo-data.json', this.geoLoadDone);

            var superCollection = 'chronozoomer',
                subCollection   = 'chronozoomer',
                timeLine        = 'fefea7de-89d2-426e-91ba-b4d87c9bda4c';

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

                success : this.exhibitLoadDone,

                error : function( XMLHttpRequest, textStatus, errorThrown ) {
                    alert("Ajax error: "+textStatus+", "+errorThrown);
                }
            });

        },

        geoLoadDone : function(error, output){
            commonData.geoData = output;
            this.geoStatus = true;

            this.allLoadDone();

        },

        exhibitLoadDone : function( data, textStatus, jqXHR ){
            if(data != null){
                this.exhibitStatus = true;
                commonData.eventsData = data;
                this.imageLoadDone();

                var exhibits = data.exhibits;

                exhibitCollection.comparator = 'time';
                if( exhibits != null ){
                    for( var i = 0; i < exhibits.length; i++ ){
                        exhibitCollection.add(exhibits[i])
                    }
                }

                // -------------

                exhibitCollection.addUniqueValue();

                // -------------

            }
        },

        imageLoadDone : function(){
            console.log(commonData.eventsData);

            var exhibits = commonData.eventsData.exhibits;
            commonData.imageDataCollection = {};

            var i, j;
            var exhibit, contentItems, contentItem, contentItemID, mediaType, mediaUri;

            for( i in exhibits ){
                exhibit = exhibits[i];
                contentItems = exhibit.contentItems;

                for( j in contentItems ){
                    this.MAX_Count++;

                }
            }

            for( i in exhibits ){
                exhibit = exhibits[i];
                contentItems = exhibit.contentItems;

                for(j in contentItems){
                    contentItem = contentItems[j];
                    //console.log(contentItem);
                    contentItemID = contentItem.id;
                    mediaType = contentItem.mediaType;
                    mediaUri = contentItem.uri;

                    var image = new Image();

                    if(mediaType == "image"){
                        image.src = mediaUri;
                    } else {
                        var res = mediaUri.split('/');
                        var youtubeID = res[res.length - 1];
                        var imageString = 'http://img.youtube.com/vi/' + youtubeID + '/default.jpg';

                        image.src = imageString;

                    }

                    commonData.imageDataCollection[contentItemID] = image;
                    //image.onload = this.onLoad;
                    image.addEventListener('load', this.onLoad);
                    image.addEventListener('error', this.onError);

                }
            }
        },

        onError: function( errorMsg ){
            this.count++;
        },

        onLoad : function(){
            this.count++;

            console.log(this.count + "/" + this.MAX_Count);

            if(this.MAX_Count == this.count){
                this.imageDataLoadStatus = true;
                this.allLoadDone();
            }
        },

        allLoadDone : function(){

            if(this.geoStatus && this.exhibitStatus && this.imageDataLoadStatus ){
                Events.trigger(Events.LOAD_DONE);
            }
        }


    };

    var loader = new Loader();
    return loader;

});