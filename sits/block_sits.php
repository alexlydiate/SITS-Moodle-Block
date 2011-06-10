<?php
/* SITS Integration Block
 *
 * Copyright (C) 2011 University of Bath
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details:
 *
 * http://www.gnu.org/copyleft/gpl.html
 */

/**
 * @author  Alex Lydiate <alexlydiate [at] gmail [dot] com>
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v2 or later
 */

require_once($CFG->dirroot . '/blocks/sits/lib/sits_sync.class.php');

class block_sits extends block_base {

    function init() {
        $this->title   = get_string('sits', 'block_sits');
        $this->version = 2011053101;
        $this->cron = 300;
    }

    function get_content()
    {
        global $CFG, $COURSE;
        $context = get_context_instance(CONTEXT_COURSE, $COURSE->id);
        if(has_capability('moodle/course:update', $context))
        {
            if ($this->content !== NULL)
            {
                return $this->content;
            }else{
                $this->set_content();
                return $this->content;
            }
        }
        else
        {
            return null; //students don't get to see the block.
        }
    }

    function cron() {
        GLOBAL $CFG;
        switch($CFG->sits_cron_select){
            case 0:
            default: //Full sync is off, or else the variable has an unrecognised value - do nothing
                return true;
                break;
            case 1: //Cron is set to Daily
                $now = new DateTime();
                $last_cron_sync = new DateTime($CFG->sits_last_cron_sync);
                if($now->format('Y-m-d') != $last_cron_sync->format('Y-m-d') && (int)$now->format('G') >= $CFG->sits_hour_of_sync){
                    //sync has not run today and it's past the hour - mark it, and do it
                    set_config('sits_last_cron_sync', $now->format('Y-m-d H:i:s'));
                    return $this->run_full_sync();
                }
                break;
            case 2: //Cron is set to continuous
                return $this->run_full_sync();
                break;
        }
    }

    function run_full_sync(){
        $sits_sync = new sits_sync();
        return $sits_sync->sync_all_courses();
    }

    function instance_allow_config() {
        return true;
    }

    function set_content(){
        GLOBAL $CFG, $COURSE;
        $context = get_context_instance(CONTEXT_COURSE, 1);
        $cohorts_title = get_string('link_cohorts','block_sits');
        $adduser_title = get_string('add_user','block_sits');

        if($CFG->sits_gui_enabled){
            $markup = <<<html
<script type="text/javascript">
    function open_samis_cohort_window(){
        window.open("$CFG->wwwroot/blocks/sits/gui/samis_combo_interface.php?courseid=$COURSE->id","samis_user_interface","height=700,width=700,status=yes,toolbar=no,menubar=no,scrollbars=1,location=no");
    }
    function open_samis_admin_window(){
        window.open("$CFG->wwwroot/blocks/sits/gui/samis_admin_interface.php","samis_admin_interface","height=700,width=700,status=yes,toolbar=no,menubar=no,scrollbars=1,location=no");
    }
    function open_samis_add_user_window(){
        window.open("$CFG->wwwroot/blocks/sits/gui/samis_add_user_interface.php?courseid=$COURSE->id","samis_add_user_interface","height=700,width=587,status=yes,toolbar=no,menubar=no,scrollbars=1,location=no");
    }
</script>
<a href="#" onclick="open_samis_cohort_window();">$cohorts_title</a><br/>
<a href="#" onclick="open_samis_add_user_window();">$adduser_title</a>
html;

            if(has_capability('moodle/site:doanything', $context)){
                $markup .= '<br/>---';
                $markup .= '<br/><a href="#" onclick="open_samis_admin_window();">' . get_string('sits_admin','block_sits') . '</a>';
            }
        }else{
            $markup = '<b>The block is currently disabled</b>.<br/><br/>' . $CFG->sits_disable_message . '</br/>';
        }
        //Administrator Only Functionality

        if(has_capability('moodle/site:doanything', $context)){
            $markup .= '<br/><a href="/admin/settings.php?section=blocksettingsits">' . get_string('sits_settings','block_sits') . '</a>';
        }
        $this->content = new stdClass;
        $this->content->text = $markup;
        $this->content->footer = '';
    }

    function has_config() {
        return true;
    }
}
