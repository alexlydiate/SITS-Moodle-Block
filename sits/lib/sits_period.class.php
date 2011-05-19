<?php
/** 
 * Defines a period of time as represent by a SITS period code
 * @package sits_php_abstraction
 * @package moodle_sits_block
 * @author Alex Lydiate <alexlydiate [at] gmail [dot] com>
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v2 or later
 */
class sits_period {

    public $code; //SITS period code string
    public $academic_year; //SITS academic year string
    public $start; //DateTime object instantiated from $start_date
    public $end; //DateTime object instantiated from $end_date
     
    public function __construct($code, $academic_year, $start_date, $end_date){
        $this->code = $code;
        $this->academic_year = $academic_year;
        $this->start = new DateTime($start_date);
        if($this->start === false){
            return false;
        }
        $this->end = new DateTime($end_date);
        if($this->end === false){
            return false;
        }
    }
}