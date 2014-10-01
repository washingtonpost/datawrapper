
define(function() {

    return function() {
        /*
         * API-draft:
         *
         * $('button').markerselector({
              marker: '#ff0000'  // current selection
         *    palette: ['#fe8843', '#48cd45', ...],  // theme palette
         *    change: function(new_marker) { }  // called after user closed popup
         * });
         */
        $.fn.markerselector = function(opts) {
            $('.marker-selector').remove();
            var btn = $(this),
                popup = $('<div />')
                    .addClass('marker-selector')
                    .css({
                        left: btn.offset().left - 70,
                        top: btn.offset().top - 40 // 30px = body.padding-top
                    })
                    .appendTo('body'),
                markers = $('<div />').addClass('markers').appendTo(popup),
                // lightness = $('<div />').addClass('marker-axis lightness').appendTo(popup),
                // saturation = $('<div />').addClass('marker-axis saturation').appendTo(popup),
                // hue = $('<div />').addClass('marker-axis hue').appendTo(popup),
                bottom = $('<div />').addClass('footer').appendTo(popup),
                // hexTf = $('<input type="text" />').addClass('hex').appendTo(bottom),
                okBtn = $('<button />').html('<i class="icon-ok"></i>').addClass('btn btn-small ok').appendTo(bottom);

            // addcol(opts.markers, bottom);
            // console.log(opts.markers);
            // initialize palette markers
            // console.log(opts.markers)
            $.each(opts.markers, function(i, marker) {
                // console.log(marker,markers)
                addcol(marker, markers);
            });

            setMarker(opts.marker);

            function closePopup() {
                popup.remove();
                if (_.isFunction(opts.change)) opts.change(opts.marker);
            }

            // hexTf.change(function() { setMarker(hexTf.val()); });
            okBtn.click(closePopup);

            setTimeout(function() {
                $('body').one('click', body_click);
            }, 300);

            function setMarker(mark, cont) {
                // var lch = chroma.marker(hex).lch(),
                //     center = [60, 50, lch[2]],
                //     spread_ = [55, 50, 70],
                //     steps = [7, 7, 7],
                //     steps2 = [6, 6, 6];

                opts.marker = mark;
                // _.each([lightness, saturation, hue], function(cnt, i) {
                //     if (cont != cnt || cont == hue) {
                //         cnt.html('');
                //         var values = spread(center[i], spread_[i], steps[i], steps2[i]);
                //         // shift center to match marker
                //         center[i] += lch[i] - dw.utils.nearest(values, lch[i]);
                //         _.each(spread(center[i], spread_[i], steps[i], steps2[i]), function(x) {
                //             var lch_ = lch.slice(0);
                //             lch_[i] = x;
                //             addcol(chroma.lch(lch_).hex(), cnt);
                //         });
                //     }
                // });
                // hexTf.val(hex).css({
                //     background: hex,
                //     'border-marker': chroma.marker(hex).darker().hex(),
                //     marker: chroma.luminance(hex) > 0.45 ? '#000' : '#fff'
                // });
                $('.marker', popup).removeClass('selected').removeClass('inverted');
                $('.marker', popup)
                   .filter(function(i,e) { return $(e).data('marker') == mark; })
                    .addClass('selected');
                // if ($('.marker.selected', hue).length > 2) {
                //     $('.marker.selected', hue).removeClass('selected');
                // }
                // $('.marker.selected', popup)
                //     .filter(function(i,e) { return $(e).data('marker') == mark; })
                //     .addClass('inverted');
            }

            // function spread(center, width, num, num2, exp) {
            //     var r = [center], s = width / num, a = 0;
            //     num2 = _.isUndefined(num2) ? num : num2;
            //     exp = exp || 1;
            //     while (num-- > 0) {
            //         a += s;
            //         r.unshift(center - a);
            //         if (num2-- > 0) r.push(center + a);
            //     }
            //     return r;
            // }

            function addcol(marker, cont) {
                $('<div />')
                    .addClass('marker')
                    .data('marker', marker)
                    .text(marker)
                    .click(function(evt) {
                        var c = $(evt.target);
                        setMarker(c.data('marker'), cont);
                        // stop propagation so body.click won't fire
                        evt.stopPropagation();
                    })
                    .dblclick(function(evt) {
                        var c = $(evt.target);
                        opts.marker = c.data('marker');
                        closePopup();
                    })
                    .appendTo(cont);
            }

            function body_click(evt) {
                var el = $(evt.target);
                if (!el.is('.marker-selector') && el.parents('.marker-selector').length === 0) {
                    popup.remove();
                } else {
                    $('body').one('click', body_click);
                }
            }
        };
    };

});