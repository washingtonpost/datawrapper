<?php

class DatawrapperPlugin_D3ChartbuilderBarChartTest extends DatawrapperPlugin {

public function init(){
        $visMeta = array(
            "id" => "d3-bar-test",
            "title" => "Bar Chart (d3)",
            "libraries" => array(
            	array(
    			"local" => "vendor/d3.min.js",
    			"cdn" => "//cdnjs.cloudflare.com/ajax/libs/d3/3.3.11/d3.min.js"
				),
				array(
    			"local" => "vendor/d3.chart.min.js",
    			"cdn" => "//cdnjs.cloudflare.com/ajax/libs/d3/3.3.11/d3.min.js"
				)
            	),
            "axes" => array(
                "labels" => array(
                    "accepts" => array("text", "date")
                ),
                "bars" => array(
                    "accepts" => array("number")
                )
            )
        );
        DatawrapperVisualization::register($this, $visMeta);
    }
}