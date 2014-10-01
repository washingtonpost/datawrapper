<?php

class DatawrapperPlugin_VisualizationScatterChart extends DatawrapperPlugin_Visualization {

    public function getMeta(){
        $meta = array(
            "title" => __("Scatter Chart", $this->getName()),
            "id" => "scatter-chart",
            "extends" => "raphael-chart",
            "dimensions" => 2,
            "order" => 40,
            "axes" => array(
                "x" => array(
                    "accepts" => array("number", "date"),
                ),
                "y1" => array(
                    "accepts" => array("number"),
                    "multiple" => true
                ),
                "y2" => array(
                    "accepts" => array("number"),
                    "multiple" => true,
                    "optional" => true
                )
            ),
            "options" => $this->getOptions(),
            "locale" => array(
                "tooManyLinesToLabel" => __("Your chart contains <b>more lines than we can label</b>, so automatic labeling is turned off. To fix this <ul><li>filter some columns in the data table in the previous step, or</li><li>use direct labeling and the highlight feature to label the lines that are important to your story.</li></ul>"),
                "useLogarithmicScale" => __("Use logarithmic scale"),
                "couldNotParseAllDates" => str_replace('%s', 'http://blog.datawrapper.de/2013/cleaning-your-data-in-datawrapper/', __("Some of the <b>dates in your x-axis could not be parsed</b>, hence the line chart cannot display a proper date axis. To fix this<ul><li>return to the previous step and clean your date column.</li><li><a href='%s'>Read more about how to do this.</a></li></ul>"))
            ),
            "annotations" => array(
                array('type' => 'axis-range', 'axis' => 'x'),
                array('type' => 'axis-point', 'axis' => 'x'),
                array('type' => 'axis-range', 'axis' => 'y'),
                array('type' => 'axis-point', 'axis' => 'y'),
                array('type' => 'data-point')
            )
        );
        return $meta;
    }

    public function getOptions(){
        $options = array(
            "base-color" => array(
                "type" => "base-color",
                "label" => __("Base color")
            ),
            "base-marker" => array(
                "type" => "base-marker",
                "label" => __("Base marker")
            ),
            "legend-position" => array(
                "type" => "radio-left",
                "label" => __("Legend position"),
                "default" => "right",
                "depends-on" => array(
                    "direct-labeling" => false,
                    "chart.min_columns[y1]" => 2
                ),
                "options" => array(
                    array(
                        "value" => "right",
                        "label" => __("right")
                    ),
                    array(
                        "value" => "top",
                        "label" => __("top"),
                    ),
                    array(
                        "value" => "inside",
                        "label" => __("inside left"),
                    ),
                    array(
                        "value" => "inside-right",
                        "label" => __("inside right"),
                    )
                )
            ),
            "sep-marker" => array(
                "type" => "separator",
                "label" => __("Customize markers")
            ),
            "sort-by" => array(
                "type" => "column-select",
                "label" => __("Sort table by"),
                "optional" => true,
                "hidden" => true
            ),
            "marker-radius" => array(
                "type" => "text",
                "label" => __("Marker size"),
                "default" => "5",
                "suffix" => "px"
            ),
            "sep-y-axis" => array(
                "type" => "separator",
                "label" => __("Customize y-Axis")
            ),
            "baseline-zero" => array(
                "type" => "checkbox",
                "label" => __("Extend to zero"),
            ),
            "extend-range" => array(
                "type" => "checkbox",
                "label" => __("Extend to nice ticks"),
                "help" => __("Extend the y-axis range to nice, rounded values instead of the default range from the minimum to maximum value.")
            ),
            "invert-y-axis" => array(
                "type" => "checkbox",
                "label" => __("Invert direction"),
                "default" => false
            ),
            "scale-y1" => array(
                "type" => "radio-left",
                "label" => __("Scale (y-axis)"),
                "options" => array(
                    array("label" => __("linear"), "value" => "linear"),
                    array("label" => __("logarithmic"), "value" => "log")
                ),
                "default" => "linear",
                "depends-on" => array(
                    "chart.min_value[y1]" => ">0",
                    "chart.magnitude_range[y1]" => ">3"
                )
            ),
            "user-change-scale" => array(
                "type" => "checkbox",
                "label" => __("Let user change scale"),
                "default" => false,
                // same dependencies as scale b/c otherwise there is nothing to change
                "depends-on" => array(
                    "chart.min_value[y1]" => ">0",
                    "chart.magnitude_range[y1]" => ">3"
                )
            )
        );
        return $options;
    }

}
