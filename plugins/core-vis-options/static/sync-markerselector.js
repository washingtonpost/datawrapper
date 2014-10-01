$(function() {

    // column select
    dw.backend.on('sync-option:base-marker', sync);


    function sync(args) {

        var chart = args.chart,
            vis = args.vis,
            theme_id = chart.get('theme'),
            labels = vis.keys(),
            $el = $('#'+args.key),
            $picker = $('.base-marker-picker', $el);

        if (dw.theme(theme_id)) themesAreReady();
        else dw.backend.one('theme-loaded', themesAreReady);

        function themesAreReady() {

            var theme = dw.theme(theme_id);

            if (!args.option.hideBaseMarkerPicker) initBaseMarkerPicker();
            if (!args.option.hideCustomMarkerSelector) initCustomMarkerSelector();

            /*
             * initializes the base marker dropdown
             */
            function initBaseMarkerPicker() {
                // console.log(chart.get('metadata.visualize.base-marker', 0));
                // console.log(theme);
                var curMarker = chart.get('metadata.visualize.base-marker', 0);
                if (!_.isString(curMarker)) curMarker = theme.markers[curMarker];
                // update base marker picker
                // console.log($picker.markerselector())
                $picker
                    .css('background', curMarker)
                    .click(function() {
                        $picker.markerselector({
                            marker: curMarker,
                            markers: theme.markers,
                            change: baseMarkerChanged
                        });
                    });

                function baseMarkerChanged(marker) {
                    $picker.css('background', marker);
                    var palIndex = theme.markers.join(',')
                        .toLowerCase()
                        .split(',')
                        .indexOf(marker);
                    chart.set(
                        'metadata.visualize.base-marker',
                        palIndex < 0 ? marker : palIndex
                    );
                  //  curMarker = marker;
                }
            }

            /*
             * initializes the custom marker dialog
             */
            function initCustomMarkerSelector() {
                var labels = vis.keys(),
                    sel = chart.get('metadata.visualize.custom-markers', {}),
                    $head = $('.custom-marker-selector-head', $el),
                    $body = $('.custom-marker-selector-body', $el),
                    $customMarkerBtn = $('.custom', $head),
                    $labelUl = $('.dataseries', $body),
                    $resetAll = $('.reset-all-markers', $body);

                if (_.isEmpty(labels)) {
                    $head.hide();
                    return;
                }
                $head.show();

                $customMarkerBtn.click(function(e) {
                    e.preventDefault();
                    $body.toggle();
                    $customMarkerBtn.toggleClass('active');
                });

                $resetAll.click(resetAllMarkers);

                // populate custom marker selector
                $.each(labels, addLabelToList);

                $('.select-all', $body).click(function() {
                    $('li', $labelUl).addClass('selected');
                    customMarkerSelectSeries();
                });
                $('.select-none', $body).click(function() {
                    $('li', $labelUl).removeClass('selected');
                    customMarkerSelectSeries();
                });
                $('.select-invert', $body).click(function() {
                    $('li', $labelUl).toggleClass('selected');
                    customMarkerSelectSeries();
                });

                function addLabelToList(i, lbl) {
                    var s = lbl;
                    if (_.isArray(lbl)) {
                        s = lbl[0];
                        lbl = lbl[1];
                    }
                    var li = $('<li data-series="'+s+'"></li>')
                        .append('<div class="marker">×</div><label>'+lbl+'</label>')
                        .appendTo($labelUl)
                        .click(click);
                    if (sel[s]) {
                        $('.marker', li).html('').css('background', sel[s]);
                        li.data('marker', sel[s]);
                    }

                    function click(e) {
                        if (!e.shiftKey) $('li', $labelUl).removeClass('selected');
                        if (e.shiftKey && li.hasClass('selected')) li.removeClass('selected');
                        else li.addClass('selected');

                        customMarkerSelectSeries();

                        if (e.shiftKey) { // clear selection
                            if (window.getSelection) {
                                if (window.getSelection().empty) {  // Chrome
                                    window.getSelection().empty();
                                } else if (window.getSelection().removeAllRanges) {  // Firefox
                                    window.getSelection().removeAllRanges();
                                }
                            } else if (document.selection) {  // IE?
                                document.selection.empty();
                            }
                        }
                    }
                }

                // called whenever the user selects a new series
                function customMarkerSelectSeries() {
                    var li = $('li.selected', $labelUl),
                        $markPicker = $('.marker-picker', $body),
                        $reset = $('.reset-marker', $body);
                    console.log(li.data('marker'),theme.markers);

                    if (li.length > 0) {
                        $('.info', $body).hide();
                        $('.select', $body).show();
                        $markPicker.click(function() {
                            $markPicker.markerselector({
                                marker: li.data('marker'),
                                markers: theme.markers,
                                change: function(marker) {
                                    $markPicker.css('background', marker);
                                    update(marker);
                                }
                            });
                        }).css('background', li.data('marker') || '#fff');
                        $reset.off('click').on('click', reset);
                    } else {
                        $('.info', $body).show();
                        $('.select', $body).hide();
                    }

                    // set a new marker and save
                    function update(marker) {
                        console.log(chart.get('metadata'))
                        var sel = $.extend({}, chart.get('metadata.visualize.custom-markers', {}));
                        // console.log(sel);
                        $('.marker', li)
                            .css('background', marker)
                            .html('');
                        li.data('marker', marker);
                        li.each(function(i, el) {
                            sel[$(el).data('series')] = marker;
                        });
                        chart.set('metadata.visualize.custom-markers', sel);
                    }

                    // reset selected markers and save
                    function reset() {
                        var sel = $.extend({}, chart.get('metadata.visualize.custom-markers', {}));
                        li.data('marker', undefined);
                        $('.marker', li)
                            .css('background', '')
                            .html('×');
                        li.each(function(i, li) {
                            sel[$(li).data('series')] = '';
                        });
                        chart.set('metadata.visualize.custom-markers', sel);
                        $markPicker.css('background', '#fff');
                    }
                }

                function resetAllMarkers() {
                    $('li .marker', $labelUl).html('×').css('background', '');
                    $('li', $labelUl).data('marker', undefined);
                    $('.marker-picker', $body).css('background', '#fff');
                    chart.set('metadata.visualize.custom-markers', {});
                }
            }
        }

    }



});
