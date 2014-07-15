<?php

class DatawrapperPlugin_ThemeWaPo extends DatawrapperPlugin {

    public function init() {
        DatawrapperTheme::register($this, $this->getMeta());
    }

    private function getMeta() {
        return array(
            'id' => 'wapo',
            'title' => 'Washington Post',
            'version' => '0.0.0'
        );
    }

}
