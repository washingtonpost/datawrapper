
(function(){

    var trim = function (myString) {
        return myString.replace(/^\s+/g,'').replace(/\s+$/g,'');
    };

    var last_sort;

    dw.visualization.register('data-table-wapo', {

        render: function(el) {
            header = $("<h1>Washington Post Data Tables</h1>");
            body = $("<p>We have removed the data table feature from Datawrapper, and ask you to instead make data tables using our other pre-existing table tools. If you navigate <a href = 'http://ds.wpprivate.com/documentation/graphics/#tables' target='_blank'>to this graphics wiki page</a> (only available when connected to the Post's network), you can find templates to create tables.</p><p>The 'Simple Data Table' and 'Sortable Table' code both create Post styled tables. Just replace the 'Head' and 'Cell' filler text with your own data to build the table.</p>")
            el.append(header);
            el.append(body);
        }

    });


}).call(this);