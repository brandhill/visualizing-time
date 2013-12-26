define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'jqueryTransit',
    'tweenlite',

    // helpers
    'helpers/commonData',
    'helpers/constants',
    'helpers/windowEvent',

    // collection
    'collection/exhibitCollection',

    // views
    'views/sub/timelineEventListView',
    'views/sub/timelineGalleryView',


],function( $, _, Backbone, JST, jqueryTransit, TweenLite, commonData, CONSTANTS, windowEvent, exhibitCollection, timelineListView, timelineGalleryView ){
    var TimeLineContentView = Backbone.View.extend({
        el  : "#timeline-content",

        tl  : "#timeline-graphics",
        $tl : null,

        timeline : "#timeline-wrapper",
        $timeline : null,

        count : 0,

        yearCollection : [],
        exhibitCollectionJSON : null,
        clickState : true,

        events : {
            "click .time-line-event-content-wrapper" : "clickTimeLineEventContent"
        },

        template : JST['app/scripts/templates/timelineContentTemplate.ejs'],

        initialize: function(){
            _.bindAll(
                this,
                'loopAnimation'
            );

            this.$timeline = $(this.timeline);

            this.$tl = $(this.tl);

        },

        render : function( ){

            this.exhibitCollectionJSON = exhibitCollection.toJSON();

            var prevYear;
            var id, div, $div, startY, height;
            for( var i in this.exhibitCollectionJSON ){
                var data  = this.exhibitCollectionJSON[i];

                var contentItems = data.contentItems;

                var year  = parseInt(data.time);
                var title = data.title;

                var html = this.template({ id: data.id, title: title, year: year, contentItems: contentItems });


                this.$el.append(html);

                var imageDataCollection = commonData.imageDataCollection;

                for( var j in contentItems ){
                    var contentItem = contentItems[j];

                    var eventID = '#eventItem' + contentItem.id;

                    var contentItemImage = imageDataCollection[contentItem.id];

                    var contentItemImageWidth  = contentItemImage.width;
                    var contentItemImageHeight = contentItemImage.height;

                    var $eventID = $(eventID);

                    if(contentItemImageWidth > 10 && contentItemImageHeight > 10){
                        $eventID.append(contentItemImage);

                        if(contentItemImageWidth > contentItemImageHeight){
                            $eventID.find('img').addClass('img-landscape');
                        } else {
                            $eventID.find('img').addClass('img-vertical');
                        }

                    }else{
                        $eventID.addClass('display-none');
                    }

                }

                // --------

                var $year = $("#year-" + year);
                if(!$year.hasClass('emphasis'))
                    $year.addClass('emphasis');

                var rate           = (year - CONSTANTS.EVENT_START_YEAR) / CONSTANTS.EVENT_DURATION;
                var eventPositionX = ( rate * CONSTANTS.TIME_LINE_END_POS + ( 1 - rate ) * CONSTANTS.TIME_LINE_START_POS ) * commonData.windowSize.width;
                var domId = "#time-line-event-" + data.id;
                var posY;
                if(i > 6){
                    posY = CONSTANTS.TIME_LINE_POS_Y2 + 60 * (i-7) + 20;
                } else if(i > 2){
                    posY = CONSTANTS.TIME_LINE_POS_Y2 + 60 * (i-3) + 20;
                }else if(i > 0){
                    posY = CONSTANTS.TIME_LINE_POS_Y2 + 60 * (i-1) + 20;
                }else{
                    posY = CONSTANTS.TIME_LINE_POS_Y2 + 60 * i + 20;
                }


                var $domID = this.$el.find(domId);
                $domID.css({ translate: [ eventPositionX, posY ] })
                $domID.css({opacity: 0});

                //timelineGalleryView.appendGalleryView( data.id, contentItems, year, eventPositionX,posY );


                if(prevYear == year){
                    id = '#timeline-visual-' + year;

                    $div = $(id);

                    startY   = CONSTANTS.TIME_LINE_POS_Y2 + 8;
                    height   = posY - startY + 8;

                    $div.css("height", height);

                } else {
                    div = document.createElement('div');
                    $div = $(div);
                    $div.addClass('time-visual');
                    id = 'timeline-visual-' + year;
                    $div.attr('id', id);
                    $div.attr('data-year', year);
                    this.$tl.append(div);

                    startY   = CONSTANTS.TIME_LINE_POS_Y2 + 8;
                    height   = posY - startY + 8;

                    $div.css({ translate: [ eventPositionX, startY ] });
                    $div.css( {"height":height, opacity : 0 });

                    // -----
                    this.yearCollection.push(year);

                }

                prevYear = year;
            }


            setTimeout(this.loopAnimation, 1500);

        },

        loopAnimation : function(){
            var year = this.yearCollection[this.count];

            var $year = $('.event-item-collection-year-' + year);
            $year.addClass('visible');

            var attribute = '*[data-year="' + year +'"]';
            $(attribute).each(function(index){
                TweenLite.to(this, 0.6, {opacity: 1});
            });

            // -------------

            this.count++;

            if( this.count < this.yearCollection.length )
                setTimeout(this.loopAnimation, 1000)
            else
                this.clickState = false;
        },


        clickTimeLineEventContent : function(event){
            if(this.clickState) return;
            console.log('clickTimeLineEventContent');

            this.clickState = true;

            // ---------
            // opacity 0 image and line

            for(var i in this.yearCollection){
                var year = this.yearCollection[i];

                var $year = $('.event-item-collection-year-' + year);
                $year.removeClass('visible');

                var attribute = '*[data-year="' + year +'"]';
                $(attribute).each(function(index){
                    TweenLite.to(this, 0.6, {opacity: 0});
                });

            }

            // ---------

            var $currentTarget = $(event.currentTarget);
            var domID   = $currentTarget.attr("id");

            var selectedYear = $currentTarget.data('year');
            var id = $currentTarget.data('id');

            // change the color.

            var yearString = '#year-' + selectedYear
            this.$el.find(yearString).addClass('selected')

            // animate to timeline to the bottom

            var top = commonData.windowSize.height - 200;
            this.$timeline.transition({ y: top, duration: 1000 });

            // -------
            // showing the gallery

            timelineGalleryView.show(id);

            // -------

        }
    });

    var timeLineContentView = new TimeLineContentView();
    return timeLineContentView;
})