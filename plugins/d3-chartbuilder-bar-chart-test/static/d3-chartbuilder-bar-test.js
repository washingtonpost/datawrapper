dw.visualization.register('d3-chartbuilder-bar-test', {
	// console.log("foo")

	render: function($element, dataset, axes, theme) {
	    // create the empty structure
	    // console.log($element);//this.setRoot($element)
	    // var data = [];
	    // dataset = this.dataset;
	    // axes = this.axes();
	    // theme = this.theme();
	    // console.log(axes);
	    // console.log(dataset.toCSV())
	    // // theme = this.theme();
	    // // console.log(axes)
	    // // loop over each row in our dataset
	    // // dataset.eachRow(function(i) {
	    // // 	var name = dataset.column(axes.labels).val(i);
	    // // 	var value = dataset.column(axes.bars).val(i);
	    // //     // append new objects for each row
	    // //     // with the values from the axes
	    // //     data.push(
	    // //         {name: name,
	    // //         value: value}
	    // //     );
	    // // });
	    // console.log(data)

/**
* A bar chart. Required data format:
* [ { name : x-axis-bar-label, value : N }, ...]
*
*  Sample use:
*  var bargraph = d3.select('#bargraph')
*    .append('svg')
*    .chart('BarChart')
*    .yFormat(d3.format("d"))
*    .height(400)
*    .width(800)
*    .max(1.0);
*  bargraph.draw(bardata);
*/
var COMMA = ',';
var TAB = String.fromCharCode(9);

var chart;

var SAMPLE_CHART = {
    typePicker: 'column',
    chart_title: 'Sample data',
    name: 'Sample data',
    created: (new Date()).valueOf(),
    csvInput: "\
Name,First value,Second value\n\
2009,7.8,10.1\n\
2010,9.8,0\n\
2011,9.1,-30.6\n\
2012,8.3,2.2\n\
2013,7.9,5"
}

// $.fn.fieldMessage = function(type, message){
//     var formGroup = this.parent().parent();
//     this.clearFieldMessage();
//     formGroup.addClass(type);
//     formGroup.find('.help-block').text(message);

//     if (type == 'has-error') {
//         $('#createImageButton').attr('disabled', 'disabled');
//         $('#export .help-block').text('You must correct the following error before exporting your chart: ' + message); 
//     }
// }

// $.fn.clearFieldMessage = function(){
//     var formGroup = this.parent().parent();
//     formGroup.removeClass('has-error has-warning has-success');
//     formGroup.find('.help-block').text('');

//     if ($('.has-error').length == 0) {
//         $('#createImageButton').removeAttr('disabled');
//         $('#export .help-block').text(''); 
//     }
// }

ChartBuilder = {
  allColors: ['db4730','e58d3c','f0c74f','04807e','4da9da',
        '6d2217','72461d','776326','04403e','26546d',
        'a43424','ab6a2d','b3943a','04605d','3a7ea3',
        'db4730','e58d3c','f0c74f','04807e','4da9da',
        'e47563','ebaa69','f3d576','4ca09e','7bbfe3',
        'eea397','f2c69b','f7e3a2','88c0bf','7bbfe3',
        'f6d1cb','f9e2cc','fbf1d0','c4dfdf','d2eaf6'],
  rawData: '',
  parseData: function(csv) {
        /*
         * Parse  data from CSV/TSV.
         *
         * Returns a list of rows.
         */
        var reader = new CSVKit.Reader({
            separator: COMMA,
            columns_from_header: false
        });

        reader.parse(csv);

    // If there aren't at least two columns, return null
    if(reader.rows[0].length < 2) {
            throw 'At least two columns are required.';
        }

    // If there aren't at least two non empty rows, return null
    if(reader.rows.length < 2) {
            throw 'At least two rows are required.';
    }

        return reader.rows;
  },
    // convertTSVtoCSV: function(tsv) {
    //     /*
    //      * Convert TSV to CSV.
    //      */
    //     var reader = new CSVKit.Reader({
    //         separator: TAB,
    //         columns_from_header: false
    //     });

    //     reader.parse(tsv);

    //     var writer = new CSVKit.Writer();

    //     var csv = writer.write(reader.rows);

    //     $("#csvInput").val(csv);
        
    //     return csv;
    // },
  makeDataSeries: function(rows) {
        /*
         * Convert rows from CSV/TSV to data series for gneiss.
         */
    var data = [];
        var columnNames = [];
        var rowNames = [];

    for(var i = 0; i < rows[0].length; i++) {
            // Make sure we don't have duplicate columns
            if (columnNames.indexOf(rows[0][i]) >= 0){
                throw('Duplicate column name: ' + rows[0][i]);
            }

      var obj = {
                name: rows[0][i],
                data: []
            };

            columnNames.push(rows[0][i]);

      for(var j = 1; j < rows.length; j++) {
        // If it is the first column, containing the names
        if(i == 0) {
                    // Check for duplicate row names
                    if (rowNames.indexOf(rows[j][i]) >= 0){
                        throw('Duplicate row name: ' + rows[j][i]);
                    }

          obj.data.push(rows[j][i]);
                    rowNames.push(rows[j][i]);
        }
        // If it's a data point
        else {
          var value = rows[j][i];

                    if (value === undefined || value === 'null' || value === '') {
            // allow for nulls or blank cells
            value = null
          } else {
                        if (value.indexOf('$') >= 0 || value.indexOf('%') >= 0) {
                            throw "Data should not include unit labels such as $ or %. (You will be able to add them in Step 3.)";
                        }

                        if (isNaN(value)){
                            throw "Value \"" + value + "\" can not be parsed as a number.";
                        }
                        else {
                            value = parseFloat(value);
                        }
                    }
          
          obj.data.push(value);
        }
      }

      data.push(obj);
    }

    return data;
  },
    // transposeData: function() {
    //     /*
    //      * Transpose rows and columns in the data.
    //      */
    //     var data = $("#csvInput").val();

    //     if (!data) {
    //         return;
    //     }

    //     var rows = ChartBuilder.parseData(data);

    //     var maxLength = 0;
    //     var newRows = [];

    //     for (var i = 0; i < rows.length; i++) {
    //         maxLength = Math.max(rows[i].length, maxLength);
    //     }

    //     for (var i = 0; i < maxLength; i++) {
    //         var newRow = [];

    //         for (j = 0; j < rows.length; j++) {
    //             newRow.push(rows[j][i]);
    //         }

    //         newRows.push(newRow);
    //     }

    //     var writer = new CSVKit.Writer();
    //     data = writer.write(newRows);

    //     $("#csvInput").val(data);

    //     ChartBuilder.render();
    // },
  // createTable: function(rows) {
 //        /*
 //         * Render an HTML table from data rows, for validation.
 //         */
  //  $table = $('#dataTable table')
  //  $table.text('')

  //  $table.append('<tr><th>' + rows[0].join('</th><th>') + '</th></tr>')
        
  //  for (var i = 1; i < rows.length; i++) {
  //    if (rows[i]) {
  //      $('<tr><td>' + rows[i].join('</td><td>') + '</td></tr>')
  //        .appendTo($table)
  //    }       
  //  };
 //    },
  // createChartImage: function() {
 //        /*
 //         * Create PNG and SVG versions of the chart.
 //         */
  //  // Create PNG image
  //  var canvas = document.getElementById('canvas');
  //  canvas.width = $('#chartContainer').width() * 2;
  //  canvas.height = $('#chartContainer').height() * 2;

  //  var canvasContext = canvas.getContext('2d');
  //  var svg = $.trim(document.getElementById('chartContainer').innerHTML);
  //  canvasContext.drawSvg(svg,0,0,canvas.width,canvas.height);
    
    
  //  var filename = [];
    
  //  if(chart.g.title.length > 0) {
  //    filename.unshift(chart.g.title)
  //  }
    
  //  filename = filename.join('-').replace(/[^\w\d]+/gi, '-');
    
    
  //  $('#downloadImageLink')
  //    .attr('href',canvas.toDataURL('png'))
  //    .attr('download', function() { 
  //      return filename + '_chartbuilder.png'
  //      });

 //        // Create SVG image
  //  var svgString = $("#chartContainer").html()
  //  svgString = '<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n<svg ' + svgString.split("<svg ")[1]

  //     $("#downloadSVGLink")
 //            .attr("href", "data:text/svg," + encodeURI(svgString.split("PTSerif").join("PT Serif")) )
  //      .attr("download", function() { return filename + "_chartbuilder.svg" })

  //  ChartBuilder.saveCurrentChart(filename);  

 //        var charts = ChartBuilder.getSavedCharts().reverse();
 //        ChartBuilder.setSavedChartList(charts);
    
  // },
    updateConfigFromUI: function() {
        /*
         * Update the chart config from the latest UI state.
         */
        console.log(SAMPLE_CHART["csvInput"]);
        var data = SAMPLE_CHART["csvInput"]//$.trim($("#csvInput").val());
        console.log(data)

        // if (!data) {
        //     ChartBuilder.showInvalidData('Copy and paste some data from your spreadsheet!');

        //     return false;
        // } else {
            // ChartBuilder.hideInvalidData();
        // }

        // var comma_count = data.split(COMMA).length - 1;
        // var tab_count = data.split(TAB).length - 1;

        // if (tab_count >= comma_count) {
        //     data = ChartBuilder.convertTSVtoCSV(data);
        // }

        if (data !== null) {
            ChartBuilder.rawData = data;

            try {
                var rows = ChartBuilder.parseData(data);
            } catch(e) {
                // ChartBuilder.showInvalidData(e);

                return false;
            }

            try {
                dataSeries = ChartBuilder.makeDataSeries(rows);
            } catch(e) {
               // ChartBuilder.showInvalidData(e);

               return false;
            }

            // ChartBuilder.hideInvalidData();
            // ChartBuilder.createTable(rows);

            // First row is x axis, the rest is data
            chart.g.xAxisRef = dataSeries.shift().data;
            chart.g.series = dataSeries;
        }

        // Type
        chart.g.type = 'column'//$("#typePicker").val();

        if (chart.g.type == 'bar'){
            $('#axis-title').text('Horizontal Axis Options');
        } else {
            $('#axis-title').text('Vertical Axis Options');
        }

        // Title
        chart.g.title = "Title"//$("#chart_title").val();
        chart.g.titleLine.text(chart.g.title)
        // if (chart.g.title === ''){
        //     $('#chart_title').fieldMessage('has-error','Chart must have a title.');
        // } else {
        //     $('#chart_title').clearFieldMessage();
        // }

        // Prefix/suffix
        chart.g.yAxis.prefix = '';//$('#right_axis_prefix').val();
        chart.g.yAxis.suffix = '';//$('#right_axis_suffix').val();

        // Ticks
        var tickInterval = null//$("#axis_interval").val();
        //console.log('tick',tickInterval)
        // if (tickInterval !== ''){
        //     tickInterval = parseFloat(tickInterval);
        //     if (isNaN(tickInterval)) {
        //         tickInterval = null;
        //         $('#axis_interval').fieldMessage('has-error', 'Tick interval must be a number.');
        //     } else {
        //         chart.calculateYDomain();

        //         if (tickInterval <= 0){
        //             tickInterval = null;
        //             $('#axis_interval').fieldMessage('has-error', 'You must choose a larger tick interval.');
        //         } else if (((chart.g.yAxis.domain[1] - chart.g.yAxis.domain[0]) / tickInterval) > 20) {
        //             tickInterval = null;
        //             $('#axis_interval').fieldMessage('has-error', 'Too many ticks! Choose a larger tick interval.');
        //         } else {
        //             chart.g.yAxis.tickInterval = tickInterval;
        //             $('#axis_interval').clearFieldMessage();
        //         }
        //     }
        // } else {
        //     // $('#axis_interval').fieldMessage('has-error', 'You must define a tick interval.');
        //     chart.g.yAxis.tickInterval = null;
        // }        

        // Min/max
        // var min = null;//$("#right_axis_min").val();

        // if (min !== ''){
        //     min = parseFloat(min);
        //     if (isNaN(min)) {
        //         min = null;
        //         $('#right_axis_min').fieldMessage('has-error', 'Minimum must be a number.');
        //     } else if (min > chart.g.yAxis.extremes[0]){
        //         chart.calculateYDomain();
        //         chart.g.yAxis.min = min;
        //         $('#right_axis_min').fieldMessage('has-error', 'Minimum puts data outside the chart area. Your smallest value is ' + chart.g.yAxis.extremes[0] + '.');
        //     } else {
        //         chart.g.yAxis.min = min;
        //         $('#right_axis_min').clearFieldMessage();
        //     }
            
        // } else {
            // $('#right_axis_min').clearFieldMessage();
            chart.g.yAxis.min = null;
        // }        

        // var max = $("#right_axis_max").val();
        
        // if (max !== ''){
        //     max = parseFloat(max);
        //     if (isNaN(max)) {
        //         max = null;
        //         // $('#right_axis_max').fieldMessage('has-error', 'Maximum must be a number');
        //     } else if (max < chart.g.yAxis.extremes[1]){
        //         chart.calculateYDomain();
        //         chart.g.yAxis.max = max;
        //         // $('#right_axis_max').fieldMessage('has-error', 'Maximum puts data outside the chart area. Your largest value is ' + chart.g.yAxis.extremes[1] + '.');
        //     } else {
        //         if (!isNaN(min) && max < min){
        //             // $('#right_axis_max').fieldMessage('has-error', 'Maximum must be greater than Minimum.');
        //         } else {
        //             chart.g.yAxis.max = max;
        //             // $('#right_axis_max').clearFieldMessage();
        //         }
        //     }
        // } else {
            // $('#right_axis_max').clearFieldMessage();
            chart.g.yAxis.max = null;
        // }

        return true;
    },
    // colorPickerChanged: function() {
        
//         // * Update the chart when a color picker is changed.
         
    //     chart.g.series[$(this).parent().data().index].color = $(this).val();

    //     ChartBuilder.render();
    // },
  render: function() {
        /*
         * Redraw the chart and update series options as appropriate.
         */
    var g = chart.g;
        var valid = ChartBuilder.updateConfigFromUI();

        if (!valid) {
            return false;
        }
        
  //       $('.seriesItemGroup').detach();

    // var seriesContainer = $('#seriesItems')
      
        // Generate series controls
    // for (var i = 0; i < g.series.length; i++) {
    //  var s = g.series[i]
    //  seriesItem = $('<div class="seriesItemGroup">\
    //    <label for="' + ChartBuilder.idSafe(s.name) + '_color">' + s.name + '</label>\
    //    <input id="' + ChartBuilder.idSafe(s.name) + '_color" name="' + ChartBuilder.idSafe(s.name) + '" type="text" />\
    //  </div>');
      
    //  seriesContainer.append(seriesItem);

  //           var color = s.color ? s.color.replace('#','') : g.colors[i].replace('#','');
    //  var picker = seriesItem.find('#' + ChartBuilder.idSafe(s.name) + '_color').colorPicker({ pickerDefault: color, colors:ChartBuilder.allColors });

    //  seriesItem.data('index', i);

    //  picker.change(ChartBuilder.colorPickerChanged);
  //  }
        
        // Render!
    chart.render()

    chart.g = g;
  },
  // getAllInputData: function() {
  //  var d = {}, $el;
  //  var elems = $('input:not([id^=colorPicker]), textarea, select:not(#previous_charts)').each(function() {
  //    $el = $(this)
  //    d[$el.attr('id')] = $el.val()
  //  })
  //  return d
  // },
  idSafe: function(s) {
    s = s.replace(/[^\w\d]+/gi, '-');

    return s;
  },
  // showInvalidData: function(e) {
 //        e = e || 'Data could not be parsed.';

 //        $('#invalidDataSpan').text(e);
  //  $('#inputDataHeading').addClass('inputDataHInvData');
  //  $('#invalidDataSpan').removeClass('hide');
  // },
  // hideInvalidData: function() {
  //  $('#inputDataHeading').removeClass('inputDataHInvData');
  //  $('#invalidDataSpan').addClass('hide');
  // },
    getDefaultConfig: function() {
        var chartConfig = {};

        chartConfig.colors = ['#db4730','#e58d3c','#f0c74f','#04807e','#4da9da',
                            '#6d2217','#72461d','#776326','#04403e','#26546d',
                            '#a43424','#ab6a2d','#b3943a','#04605d','#3a7ea3',
                            '#db4730','#e58d3c','#f0c74f','#04807e','#4da9da',
                            '#e47563','#ebaa69','#f3d576','#4ca09e','#7bbfe3',
                            '#eea397','#f2c69b','#f7e3a2','#88c0bf','#7bbfe3',
                            '#f6d1cb','#f9e2cc','#fbf1d0','#c4dfdf','#d2eaf6'];

        return chartConfig;
    },
    // formatDate: function(d) {
    //     /*
    //      * Format a date for display in the chart list.
    //      */
    //     var date = (d.getMonth() + 1) +
    //         '-' + (d.getDate() + 1) +
    //         '-' + (d.getFullYear());

    //     var hours = d.getHours();
    //     var minutes = d.getMinutes();
    //     var ampm = hours >= 12 ? 'pm' : 'am';
    //     hours = hours % 12;
    //     hours = hours ? hours : 12;
    //     minutes = minutes < 10 ? '0' + minutes : minutes;
    //     var time = hours + ':' + minutes + ' ' + ampm;

    //     return date + ' ' + time;
    // },
  // saveCurrentChart: function(name) {
 //        /*
 //         * Save the current chart state to local storage as JSON.
 //         */
  //  try {
  //    localStorage['savedCharts'][0]
  //  }
  //  catch(e) {
  //    localStorage['savedCharts'] = JSON.stringify([])
  //  }
    
  //  var allcharts = JSON.parse(localStorage['savedCharts'])

  //  var newChart = ChartBuilder.getAllInputData()
  //  newChart.name = name
 //        newChart.created = (new Date()).valueOf();
        
  //  allcharts.push(newChart)
  //  localStorage['savedCharts'] = JSON.stringify(allcharts);
  // },
  loadChart: function(d) {
        /*
         * Load a chart from JSON representation.
         */
        // Set field values from JSON blog
    for (var key in d) {
      if(key != 'name' && key != 'created') {
        $('#' + key).val(d[key]);
      }
    }

        // Render the new chart
        ChartBuilder.render();
  },
  getSavedCharts: function() {
        /*
         * Get a list of saved charts from local storage.
         *
         * Will create a sample chart if none exist.
         */
    var charts = [];

    try {
            charts = [SAMPLE_CHART];
      // charts = JSON.parse(localStorage['savedCharts']);
    }
    catch(e) {
            // If no charts exist, store demo chart
            // charts = [SAMPLE_CHART];
            // localStorage['savedCharts'] = JSON.stringify(charts);
        }

    return charts
  },
    // setSavedChartList: function(charts) {
    //     /*
    //      * Set the list of saved charts.
    //      */
    //     var chartSelect = d3.select('#previous_charts');

    //     chartSelect.selectAll('option').remove();
        
    //     chartSelect.selectAll('option')
    //         .data(charts)
    //         .enter()
    //         .append('option')
    //         .text(function(d) {
    //             var created = ChartBuilder.formatDate(new Date(d.created));
    //             return d.name ? d.name + ' (' + created  + ')' : 'Untitled Chart (' + created + ')'
    //         })

    //     $('#previous_charts').trigger('chosen:updated');
    // },
    start: function(config) {
        /*
         * Go! 
         */
        var chartbuilderDefaultConfig = ChartBuilder.getDefaultConfig();
        chartbuilderDefaultConfig["container"] = $element.get(0);
        var chartConfig = $.extend(defaultGneissChartConfig, chartbuilderDefaultConfig, config);

        // $('#chartContainer').css('height', 480)
        chart = Gneiss.setup(chartConfig)

        // $('#previous_charts').chosen()
        //     .on('change', function() {
        //         ChartBuilder.loadChart(d3.select(this.selectedOptions[0]).data()[0])
        //     });
                
        // $('#createImageButton').click(function() {
        //     if(!$('#download-modal').hasClass('in')) {
        //         $('#createImageButton p').text('Reset');

        //         ChartBuilder.createChartImage();
        //     } else {
        //         $('#createImageButton p').text('Create Image of Chart');
        //     }
        // })

        // $('#right_axis_prefix').keyup(ChartBuilder.render);
        // $('#right_axis_suffix').keyup(ChartBuilder.render);
        // $('#right_axis_max').keyup(ChartBuilder.render);
        // $('#right_axis_min').keyup(ChartBuilder.render);
        // $('#axis_interval').keyup(ChartBuilder.render);
        // $('#typePicker').on('change', ChartBuilder.render);    
        // $('#chart_title').keyup(ChartBuilder.render);
        // $('#csvInput').keyup(ChartBuilder.render); 

        // $('#transpose-data').click(ChartBuilder.transposeData);

        // Clicking download closes the download modal
        // $('#downloadImageLink').on('click', function(){
        //     $('#download-modal').modal('hide');
        // });

        // Attach reset action
        // $('#reset-form').on('click', function(){
        //     $('input, textarea').val('');
        //     $('#csvInput').focus();
        //     ChartBuilder.render();
        // });

        // Get the list of saved charts and load the last one
        var charts = ChartBuilder.getSavedCharts();
        // charts.reverse();
        // ChartBuilder.setSavedChartList(charts); 
        ChartBuilder.loadChart(charts[0]);

        // Hack so chosen doesn't stay open after we load our saved chart
        // $('.navbar-brand').focus().blur();

        ChartBuilder.render();
    }
};

// if($.browser.msie === true){
//     alert('Sorry, Chart Builder requires Chrome, Firefox or Safari.');
// }

// WebFont.load({
//     monotype: {
//         projectId: '65980087-55e2-40ca-85ae-729fca359467',
//     },
//     active: function(name) {
        $(document).ready(function() {
            ChartBuilder.start();
        });
    // }
// });
}});