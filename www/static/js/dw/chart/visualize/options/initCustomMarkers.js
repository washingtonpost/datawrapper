
define(function() {

    /*
     * initialize the custom marker dialog
     */
    function initCustomMarkers(chart) {
        var customMarkers = $('#customMarkers'),
            sel = chart.get('metadata.visualize.custom-markers', {});
            labels = dw.backend.currentVis.keys();

        if (_.isEmpty(labels)) {
            $('a[href=#customMarkers]').hide();
            return;
        }
        $('a[href=#customMarkers]').show();

        // populate custom marker selector
        $.each(labels, addLabelToList);

        $('#customMarkers .dataseries li').click(dataseriesClick);
        $('#reset-marker-choice').click(resetMarkerChoice);
        $('a[href=#customMarkers]').click(customMarkersClick);
        $('#reset-all-markers').click(resetAllMarkers);
        var usermarker = $('#user-marker').keyup(userMarkerKeyUp);

        function addLabelToList(i, lbl) {
            var s = lbl;
            if (_.isArray(lbl)) {
                s = lbl[0];
                lbl = lbl[1];
            }
            var li = $('<li data-series="'+s+'"></li>');
            li.append('<div class="marker">×</div><label>'+lbl+'</label>');
            if (sel[s]) {
                $('.marker', li).html('').css('background', sel[s]);
                li.data('marker', sel[s]);
            }
            $('#customMarkers .dataseries').append(li);
        }

        function dataseriesClick(e) {
            var li = e.target.nodeName.toLowerCase() == 'li' ? $(e.target) : $(e.target).parents('li');
            if (!e.shiftKey) $('#customMarkers .dataseries li').removeClass('selected');
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

        function userMarkerKeyUp(e) {
            var col = usermarker.val();
            if (col.trim() == '') {
                usermarker.parent().removeClass('error').removeClass('success');
            } else {
                try {
                    var marker = chroma.marker(col.trim());
                    usermarker.parent().removeClass('error').addClass('success');
                    setNewMarkerForCurrentSeries(marker.hex());
                } catch (e) {
                    usermarker.parent().removeClass('success').addClass('error');
                }
            }
        }

        function customMarkersClick(e) {
            e.preventDefault();
            $('#customMarkers').modal();
            customMarkerSelectSeries();
        }

        // called whenever the user selects a new series
        function customMarkerSelectSeries() {
            var li = $('#customMarkers .dataseries li.selected');
            var markers = $('#markers-markers').data('markers').split(',');
            if (markers.indexOf(li.data('marker')) < 0) $('#user-marker').val(li.data('marker'));
            else $('#user-marker').val('');

            $('#markers-markers')
              .data('marker', li.data('marker'))
              .markerpicker({
                change: function(marker) {
                    $('#user-marker').val('');
                    setNewMarkerForCurrentSeries(marker);
                }
            });
        }

        // set a new marker and save
        function setNewMarkerForCurrentSeries(marker) {
            var sel = $.extend({}, chart.get('metadata.visualize.custom-markers', {})),
                li = $('#customMarkers .dataseries li.selected');
            $('.marker', li)
                .css('background', marker)
                .html('');
            li.data('marker', marker);
            li.each(function(i, el) {
                sel[$(el).data('series')] = marker;
            });
            chart.set('metadata.visualize.custom-markers', sel);
        }

        // action for "reset all markers" button
        function resetMarkerChoice(e) {
            var li = $('#customMarkers .dataseries li.selected');
            li.data('marker', '');
            $('.marker', li)
                .css('background', '')
                .html('×');
            var sel = $.extend({}, chart.get('metadata.visualize.custom-markers', {}));
            li.each(function(i, li) {
                sel[$(li).data('series')] = '';
            });
            chart.set('metadata.visualize.custom-markers', sel);
        }

        function resetAllMarkers(e) {
            $('#customMarkers .dataseries li .marker').html('×').css('background', '');
            $('#customMarkers .dataseries li').data('marker', '');
            chart.set('metadata.visualize.custom-markers', {});
        }
    }

    return initCustomMarkers;
});