(function(){

    // The Washington Post Standard Theme
    // -------------

    // Every theme will inherit the properties of this
    // theme. They can override everything or just a bit
    // of them. Also, every theme can extend any other
    // existing theme.

    Datawrapper.Themes.Wapo = $.extend(true, {}, Datawrapper.Themes.Base, {

        colors: {
            // primary colors
            palette: ["#3178b5","#dc463f","#5ea154","#f8b44e"],
            // secondary colors, used in custom color dialog
            // this should contain colors that might be useful
            secondary: ["#000000", '#777777', '#cccccc', '#ffd500', '#6FAA12'],
            context: '#aaa',
            axis: '#000000',
            positive: '#1f77b4',
            negative: '#d62728',
            background: '#ffffff'
        },

        lineChart: {
            fillOpacity: 0.2
        },

        vpadding: 10,

        frame: false,

        verticalGrid: false

    });

}).call(this);