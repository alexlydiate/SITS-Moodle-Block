<?php
require_once('sits.final.class.php');
require_once('i_sits_sync.interface.php');
require_once('cohort.class.php');
require_once('report.class.php');
require_once('mapping.class.php');
require_once('mapping_action.class.php');

/**
 * @package moodle_sits_block
 * @author Alex Lydiate <alexlydiate [at] gmail [dot] com>
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v2 or later
 */
class sits_sync implements i_sits_sync {

    private $sits; //sits class object
    private $report; //report class object
    private $academic_year; //current academic year string
    private $academic_year_start; //DateTime object
    private $academic_year_end; //DateTime object
    private $last_academic_year; //Last academic year string
    private $default_mod_start_minus = 14; //Integer, default number of days by which a default mapping is advanced
    private $default_mod_end_plus = 14; //Integer, default number of days by which a default mapping is extended FIXME Make these admin configurable
    private $sync_assign_period_with_sits = false; //Set this to true and the courses will revert to the SITS default period
    private $sync_count = 0; // number of courses successfully synced
    private $sync_failed = 0;
    private $created_courses = 0; //count of courses created in Moodle by the object, key => sits_id
    private $created_users = 0; //count of users created in Moodle by the object, key => bucsUsername
    private $count_users_to_courses = 0; //count of the total number of memberships added
    private $assignments = 0; //count of new role assignments
    private $duplicate_assignments = 0; //count of duplicate assignments
    private $course_data; //Object for passing to create_course()

    public function __construct($testing = false){
        $this->report = new report();
        //FIXME Put a try/catch block here and throw an exception in sits class to defend against SAMIS being down
        $this->sits = new sits($this->report, $testing);
        $this->set_academic_year();
        $this->set_last_academic_year();
        $this->build_course_data_object();
    }

    //////////////////////Implementation of i_sits_sync///////////////////////////

    public function sync_course($course_id){
        $mappings = $this->read_mappings_for_course($course_id);
        if(is_array($mappings)){
            foreach($mappings as $mapping){
                if($mapping->active){
       	            if(!$this->sync_mapping($mapping)){
       	                $this->report->log_report(1, 'Failed to sync mapping id ' . $mapping->id);
       	            }
                }
            }
            return true;
        }else{
            //FIXME The Moodle function get_records, called by $this->read_mappings_for_course
            //returns false if it doesn't find any records
            //But, there may be no mappings...and if so, shouldn't be returning false...
            return false; //doh!
        }
    }

    public function sync_all_courses(){
         
        global $CFG;
         
        if($CFG->sits_sync_all == 1){
            $this->report->log_report(2, 'Full sync routine called whilst already in progress');
            return false;
        }
         
        set_config('sits_sync_all', 1);
         
        $this->report->log_report(0, 'Started syncing all courses');
        if($this->sync_modules_with_sits()){
            $this->report->log_report(0, 'Finished syncing all modules');
        }else{
            $this->report->log_report(2, 'Failed to sync all modules');
            set_config('sits_sync_all', 0);
            return false;
        }

        if($this->sync_programs_with_sits()){
            $this->report->log_report(0, 'Finished syncing all programs');
        }else{
            $this->report->log_report(2, 'Failed to syncing all programs');
            set_config('sits_sync_all', 0);
            return false;
        }
         
        $this->report->log_report(0, 'Started mapping sync');
        if(!$this->sync_all_mappings()){
            $this->report->log_report(2, 'Failed to sync any mappings');
            set_config('sits_sync_all', 0);
            return false;
        }
        $this->report->log_report(0, 'Finished syncing all courses');
         
        set_config('sits_sync_all', 0);
        return true;
    }

    public function read_mappings_for_course($course_id){
        $course = get_record('course', 'id', $course_id);
        $select = <<<sql
courseid = %s
sql;

        $records =  get_records_select('sits_mappings', sprintf($select, $course_id), 'default_map');
        $mappings = array();
        if(is_array($records)){
            foreach($records as $record){
                $mappings[] = $this->mapping_object_from_record($record);
            }
        }
        if(count($mappings) < 1){
            return false;
        }else{
            return $mappings;
        }
    }

    public function create_mapping(&$mapping, $alter_to_default = false){
        //Temporary code to alter migrated mappings from old integration if they are found to be the default (including second param of declaration)
        //This can be removed after a successful install onto an old University of Bath Moodle DB FIXME MUST be removed before public release
        if($alter_to_default){
            $record = $this->read_mapping_for_course($mapping->cohort, $mapping->courseid);
            if(is_object($record) && $record->default == false){
                $mapping_to_update = $this->read_mapping_for_course($mapping->cohort, $mapping->courseid);
                $mapping_to_update->default = true;
                if(!$this->update_mapping($mapping_to_update)){
                    $this->report->log_report(1, sprintf('Update of mapping %s to %s failed', $mapping->cohort->sits_code, $mapping->courseid));
                    return false;
                }else{
                    return true;
                }
            }
        }
        //End temporary code
        $existing_map = $this->read_mapping_for_course($mapping->cohort, $mapping->courseid);
        //Check if it exists already and if so and deactivated, activate and update
        if(is_object($existing_map) && $existing_map->active){
            $this->report->log_report(1, sprintf('Mapping %s to %s already exists', $mapping->cohort->sits_code, $mapping->courseid));
            return false;
        }elseif(is_object($existing_map) && !$existing_map->active){
            $existing_map->start = $mapping->start;
            $existing_map->end = $mapping->end;
            $existing_map->manual = $mapping->manual;
            $existing_map->default = $mapping->default;
            $existing_map->specified = $mapping->specified;
            $existing_map->active = true;
            if(!update_record('sits_mappings', $this->data_row_object_from_mapping($existing_map))){
                $this->report->log_report(1, sprintf('Failed to update mapping for %s to %s', $existing_map->cohort->sits_code, $existing_map->courseid));
                return false;
            }elseif(!$this->add_mapping_action($existing_map, 'activate')){
                $this->report->log_report(1, sprintf('Failed to add activate action to history for %s to %s', $existing_map->cohort->sits_code, $existing_map->courseid));
                return false;
            }else{
                return true;
            }
        }elseif(!insert_record('sits_mappings', $this->data_row_object_from_mapping(&$mapping), false)){
            $this->report->log_report(1, sprintf('Failed to insert mapping %s to %s', $mapping->cohort->sits_code, $mapping->courseid));
            return false;
        }elseif(!$this->add_mapping_action($this->read_mapping_for_course($mapping->cohort, $mapping->courseid), 'create')){
            $this->report->log_report(1, sprintf('Failed to add create action to history for %s to %s', $mapping->cohort->sits_code, $mapping->courseid));
            return false;
        }else{
            return true;
        }
    }

    public function update_mapping(&$mapping){
        if(!update_record('sits_mappings', $this->data_row_object_from_mapping($mapping))){
            $this->report->log_report(1, sprintf('Failed to update mapping for %s to %s', $mapping->cohort->sits_code, $mapping->courseid));
            return false;
        }elseif(!$this->add_mapping_action($mapping, 'update')){
            $this->report->log_report(1, sprintf('Failed to add update action to history for %s to %s', $mapping->cohort->sits_code, $mapping->courseid));
            return false;
        }else{
            return true;
        }
    }

    public function deactivate_mapping(&$mapping){
        $mapping->active = false; //We're going to keep mapping records in perpetuity - active = false denotes, effectively, removal.

        if(!$this->remove_assignments($mapping)){
            $this->report->log_report(1, sprintf('Could not remove assignments for mapping %s to %s', $mapping->cohort->sits_code, $mapping->courseid));
            return false;
        }elseif(!update_record('sits_mappings', $this->data_row_object_from_mapping($mapping))){
            $this->report->log_report(1, sprintf('Failed to de-activate mapping for %s to %s', $mapping->cohort->sits_code, $mapping->courseid));
            return false;
        }elseif(!$this->add_mapping_action($mapping, 'deactivate')){
            $this->report->log_report(1, sprintf('Failed to add deactivate action to history for %s to %s', $mapping->cohort->sits_code, $mapping->courseid));
            return false;
        }else{
            return true;
        }
    }

    public function delete_mapping(&$mapping){
        if($this->remove_assignments($mapping)){
            return delete_records('sits_mappings', 'id', $mapping->id);
        }else{
            $this->report->log_report(1, sprintf('Could not remove assignments for mapping %s to %s', $mapping->cohort->sits_code, $mapping->courseid));
            return false;
        }
    }

    public function read_mapping_for_course(&$cohort, $courseid){
         
        if($cohort->type === 'module'){
            $conditions = <<<sql
courseid = %s
AND sits_code = '%s'
AND acyear = '%s'
AND period_code = '%s'
sql;

            $record = get_record_select('sits_mappings', sprintf($conditions,
            $courseid,
            $cohort->sits_code,
            $cohort->academic_year,
            $cohort->period_code));

        }elseif($cohort->type === 'program'){
            $conditions = <<<sql
courseid = %s
AND sits_code = '%s'
AND acyear = '%s'
AND year_group = '%s'
sql;
            $record = get_record_select('sits_mappings', sprintf($conditions,
            $courseid,
            $cohort->sits_code,
            $cohort->academic_year,
            $cohort->year_group));
        }
         
        if(!is_object($record)){
            return false;
        }else{
            return $this->mapping_object_from_record($record);
        }

    }

    public function read_mapping_from_id($mapping_id){
        $record =  get_record('sits_mappings', 'id', $mapping_id);
        if(!is_object($record)){
            return false;
        }

        $mapping = $this->mapping_object_from_record($record);

        if(!is_object($mapping)){
            return false;
        }else{
            return $mapping;
        }

    }

    public function read_users_for_mapping($mapping_id){
        //Get mapping object
        $userid_array = Array();
        $mapping = $this->read_mapping_from_id($mapping_id);
        //Call SITS with mappings cohort, get members rh
        if(!is_object($mapping)){
            return false;
        }

        if($mapping->cohort->type == 'module'){
            $rh = $this->sits->mod_student_members_rh($mapping->cohort);
        }elseif($mapping->cohort->type == 'program'){
            $rh = $this->sits->mod_program_members_rh($mapping->cohort);
        }else{
            return false;
        }

        while($row = oci_fetch_object($rh)){
            if($row->username != ''){
                $this->user_by_username($row->username);
            }else{
                $user = false;
            }
            if(is_object($user)){
                $userid_array[] = $user->id;
            }
        }
        return $userid_array;
    }

    public function user_by_username($username){
        //If the user isn't a user in Moodle, add them:
        $user = get_record('user', 'username', $username);
        if(is_object($user)){
            return $user;
        }else{
            $user = create_user_record($username, null, 'cas');
            if(is_object($user)){
                $this->created_users++;
                return $user;
            }else{
                return false;
            }
        }
    }

    public function add_cohort_members_to_group($cohort, $groupid){

        $return = true;

        switch($cohort->type){
            case 'program':
                $members_rh = $this->sits->prog_members_rh($cohort);
                break;
            case 'module':
                $members_rh = $this->sits->mod_student_members_rh($cohort);
                break;
        }

        while($row = oci_fetch_object($members_rh)){
            if($row->username != ''){
                $user = $this->user_by_username($row->username);
            }else{
                $user = false;
            }
            if(is_object($user)){
                if(!groups_add_member($groupid, $user->id)){
                    $return = false;
                    $this->report->log_report(1, 'Failed to add user with username ' . $row->username . ' to the group with id ' . $groupid);
                }
            }
        }
        return $return;
    }

    public function update_all_mapping_periods(){
        $return = true;
        $period_codes_rh = $this->sits->current_period_codes_rh();
        $altered_codes = get_records('sits_period');
        $keys_to_remove[] = Array();

        while($row = oci_fetch_object($period_codes_rh)){
            foreach($altered_codes AS $key => $altered_code){
                if($altered_code->period_code == $row->period_code && $altered_code->acyear == $row->acyear){
                    $keys_to_remove[] = $key; //Note that the altered period code is a current SAMIS code and need be processed individually
                }
            }
            $period = $this->get_period_for_code($row->period_code,$row->acyear);
            if($this->update_mappings_for_period($period) === false){
                $return = false;
                $this->report->log_report(1, 'Failed update the automatic mappings with period code ' . $period->code . ', academic year ' . $period->academic_year);
            }
        }

        foreach($altered_codes as $altered_code){
            if($altered_code->revert){
                $delete = delete_records('sits_period', 'period_code', $altered_code->period_code, 'acyear', $altered_code->acyear);
                $period = $this->get_period_for_code($altered_code->period_code, $alteredcode->acyear);
                if($this->update_mappings_for_period($period) === false){
                    $return = false;
                    $this->report->log_report(1, 'Failed update the automatic mappings with period code ' . $period->code . ', academic year ' . $period->academic_year);
                }
            }
        }

        foreach($keys_to_remove as $key){
            $altered_codes[$key] = null; //Don't process any altered codes that will have already been done as a current period code
        }

        foreach($altered_codes as $altered_code){
            if(is_object($altered_code) && !$altered_code->revert){
                $period = $this->get_period_for_code($altered_code->period_code,$altered_code->acyear);
                if($this->update_mappings_for_period($period) === false){
                    $return = false;
                    $this->report->log_report(1, 'Failed update the automatic mappings with period code ' . $altered_code->period_code . ', academic year ' . $altered_code->acyear);
                }
            }
        }

        return $return;
    }

    /////////////////Wrapping SITS abstraction services////////////////

    public function validate_module(&$module_cohort){
        return $this->sits->validate_module($module_cohort);
    }

    public function validate_program(&$program_cohort){
        return $this->sits->validate_program($program_cohort);
    }

    public function get_period_for_code($period_code, $academic_year){
        //check if it has been altered
        $alt_period = get_record('sits_period', 'period_code', $period_code, 'acyear', $academic_year);
        if(is_object($alt_period)){
            return new sits_period($period_code,$academic_year, $alt_period->start_date, $alt_period->end_date);
        }else{
            $period = $this->sits->get_period_for_code($period_code, $academic_year);
            $period->start->sub(new DateInterval('P' . $this->default_mod_start_minus . 'D'));
            $period->end->add(new DateInterval('P' . $this->default_mod_end_plus . 'D'));
            return $period;
        }
    }

    public function validate_bucs_id($bucs_id){
        return $this->sits->validate_bucs_id($bucs_id);
    }

    public function insert_agreed_grade(&$student,&$grade,&$cohort){
        return $this->sits->insert_agreed_grade($student,$grade,$cohort);
    }

    public function update_agreed_grade(&$student,&$grade,&$cohort){
        return $this->sits->update_agreed_grade($student,$grade,$cohort);
    }

    /////////////////////Private Functions//////////////////////

    /**
     * Syncs all mappings for every course
     * @return boolean
     */
    private function sync_all_mappings(){
        $sql = <<<sql
SELECT DISTINCT(courseid) 
FROM mdl5_sits_mappings 
ORDER BY courseid
sql;
        $courses = get_records_sql($sql);
        if(!is_array($courses)){
            $this->report->log_report(1, 'Failed to get course id resultset');
            return false;
        }

        foreach($courses as $course){
            if(!$this->sync_course($course->courseid)){
                $this->report->log_report(1, 'No sync occurred for course with id ' . $course->courseid) . ' - the course may have no mappings';
            }
        }

        return true;
    }

    /**
     * Given a valid mapping object, returns a data object representing a row to insert into the database mappings table
     * @param mapping object $mapping
     * @return object $data
     */
    private function data_row_object_from_mapping(&$mapping){

        if($mapping->cohort->type === 'module'){
            $data->period_code = $mapping->cohort->period_code;
            $data->year_group = null;
            $data->type = 'module';
        }elseif($mapping->cohort->type === 'program'){
            $data->year_group = $mapping->cohort->year_group;
            $data->period_code = null;
            $data->type = 'program';
        }

        if($mapping->default){
            $data->default_map = 1; //I'd love this to be just $data->default, but 'default' is a reserved Moodle term
        }else{
            $data->default_map = 0;
        }

        if($mapping->manual){
            $data->manual = 1;
        }else{
            $data->manual = 0;
        }

        if($mapping->specified){
            $data->specified = 1;
        }else{
            $data->specified = 0;
        }

        if(!is_null($mapping->id)){
            $data->id = $mapping->id;
        }

        $data->courseid = $mapping->courseid;
        $data->sits_code = $mapping->cohort->sits_code;
        $data->acyear = $mapping->cohort->academic_year;
        $data->start_date = $mapping->start->format('Y-m-d H:i:s');
        $data->end_date = $mapping->end->format('Y-m-d H:i:s');
        $data->active = $mapping->active;

        return $data;
    }

    /**
     * Given a valid mapping action object, will construct and return a $data object suitable
     * for Moodle's insert_record() to sits_mapping_history table
     * @param mapping_action object $mapping_action
     * @return object
     */
    private function data_row_object_from_mapping_action(&$mapping_action){

        $data->map_id = $mapping_action->map_id;
        $data->userid = $mapping_action->userid;
        //Set action id - 0 = create, 1 = update, 2 = deactivate, 3 = activate
        switch($mapping_action->action){
            case 'create':
                $data->action = 0;
                break;
            case 'update':
                $data->action = 1;
                break;
            case 'deactivate':
                $data->action = 2;
                break;
            case 'activate':
                $data->action = 3;
                break;
            case 'delete':
                $data->action = 4;
                break;
        }

        switch($mapping_action->method){
            case 'automatic':
                $data->method = 0;
                break;
            case 'specified':
                $data->method = 1;
                break;
            case 'manual':
                $data->method = 2;
                break;
        }

        $data->end_date = $mapping_action->end->format('Y-m-d H:i:s');

        $time = new DateTime();
        $data->timestamp = $time->format('Y-m-d H:i:s');

        return $data;
    }

    /**
     * Syncs all SITS modules with their respective Moodle courses.
     * If a Moodle course does not exist for a particular SITS module one will be created
     * @return boolean
     */
    private function sync_modules_with_sits(){
        $academic_years = array($this->last_academic_year, $this->academic_year);
        foreach($academic_years as $acyear){
            $modules_rh = $this->sits->mods_for_academic_year($acyear);
            if($modules_rh === false){
                $this->report->log_report(1, 'Failed to get modules for academic year resource from SITS');
                return false;
            }
            while($row = oci_fetch_object($modules_rh)){
                //If the course doesn't exist in Moodle, create it:
                //Sadly, we can't guarantee idnumber is unique, therefore can't use get_record, singular
                $courses = get_records('course', 'idnumber', $row->sits_code);
                if(is_array($courses) && count($courses) > 1){
                    $this->report->log_report(1, 'Multiple Moodle courses found for module ' . $row->sits_code . ' - will sync all, though please review');
                }elseif(!is_array($courses)){
                    //Jiggle the row into an appropriate object to create a course
                    $this->course_data->idnumber = str_replace("'", "\'", $row->sits_code);
                    $this->course_data->shortname = str_replace("'", "\'", $row->shortname);
                    $this->course_data->fullname = str_replace("'", "\'", $row->fullname);
                    //Get Moodle category from SITS department code, or set cetegory to 1 (miscellaneous)
                    $category = get_record('sits_categories', 'sits_dep_code', $row->dep_code);
                    if(is_object($category)){
                        $this->course_data->category = $category->category_id;
                    }else{
                        $this->course_data->category = 1;
                    }
                    $course = create_course($this->course_data);
                    if(is_object($course)){
                        $this->created_courses++;
                        $courses = array();
                        $courses[] = $course;
                    }else{
                        $this->report->log_report(1, 'Failed to create course for SITS code ' . $row->sits_code);
                    }
                }
                 
                $cohort = new module_cohort($row->sits_code, $row->period_code, $acyear);
                 
                if(is_array($courses)){
                    if(!$this->ensure_module_has_default_mapping($courses, $cohort)){
                        $this->report->log_report(1, 'Ensure_module_has_default_mapping met with a problem');
                    }
                }
            }
        }
        return true;
    }

    /**
     * Syncs all SITS programs with their respective Moodle course, should one exist
     * FIXME new requirement unearthed: Programs should be automatically created, then hidden.  No good reason why.  Do it anyway :)
     * @return boolean
     */
    private function sync_programs_with_sits(){

        $progs_rh = $this->sits->progs_for_academic_year($this->academic_year);
        if($progs_rh === false){
            $this->report->log_report(1, 'Failed to get programs for academic year resource from SITS');
            return false;
        }
        while($row = oci_fetch_object($progs_rh)){
            $courses = get_records('course', 'idnumber', $row->sits_code);

            if(is_array($courses) && count($courses) > 1){
                $this->report->log_report(1, 'Multiple Moodle courses found for program ' . $row->sits_code . ' - will sync all, though please review');
            }
            //Only sync programs for which there is already a course created in Moodle - sadly, there may be more than one
            if(is_array($courses)){
                $cohort = new program_cohort($row->sits_code, 0, $this->academic_year); //0 denotes all year groups
                if(!$this->ensure_program_has_default_mapping($courses, $cohort)){
                    $this->report->log_report(1, 'Ensure_program_has_default_mapping met with a problem');
                }
            }
        }
        return true;
    }

    /**
     * Given a valid mapping object will sync that mapping with SITS
     * @param mapping object $mapping
     * @return boolean
     */
    private function sync_mapping(&$mapping){
        $now = new DateTime();
        if($mapping->end < $now && !$mapping->manual){
            //Mapping is auto and has expired, remove any associated assignments and return
            if(!is_object($this->remove_assignments($mapping))){
                $this->report->log_report(2, sprintf('Could not remove assignments for mapping %s'), $mapping->id);
                return false;
            }
            if($mapping->active){
                $mapping->active = false;
                $this->update_mapping($mapping);
            }
        }elseif(($mapping->start < $now && $mapping->end > $now) || $mapping->manual){ //...go ahead and sync
            switch($mapping->cohort->type){
                case 'program':
                    return $this->sync_program_mapping($mapping);
                    break;
                case 'module':
                    return $this->sync_module_mapping($mapping);
                    break;
            }
        }else{
            //$this->report->log_report(0, sprintf('Period of mapping of %s does not encompass current date', $mapping->id));
            //Date is outside of period code, so no need to go on -
            return true;
        }
    }

    /**
     * Given a valid mapping object with type='program' will sync that program mapping with SITS
     * @param mapping object $mapping
     * @return booleanmodule
     */
    private function sync_program_mapping(&$mapping){
         
        if($mapping->default){ //Default mappings sync all Tutors, Other Tutors and Students
            $members_rh = $this->sits->prog_members_rh($mapping->cohort);
        }else{ //Non-default mappings only sync students
            $members_rh = $this->sits->prog_student_members_rh($mapping->cohort);
        }
        if($members_rh === false){
            return false;
        }else{
            return $this->process_sync($members_rh, $mapping);
        }
    }

    /**
     * Given a valid mapping object with type='module' will sync that module mapping with SITS
     * @param mapping object $mapping
     * @return boolean
     */
    private function sync_module_mapping(&$mapping){
        if($mapping->default){ //Default mappings sync all Tutors, Other Tutors and Students
            $members_rh = $this->sits->mod_members_rh($mapping->cohort);
        }else{ //Non-default mappings only sync students
            $members_rh = $this->sits->mod_student_members_rh($mapping->cohort);
        }
        	
        if($members_rh === false){
            return false;
        }else{
            return $this->process_sync($members_rh, $mapping);
        }
    }

    /**
     * Given a SITS resource handle referring to memberships of a particular module or program
     * and the respective mapping object will handle the business of enrolling SITS members onto the Moodle course.
     * @param Oracle resource handle $rh
     * @param mapping object $mapping
     * @return boolean
     */
    private function process_sync(&$rh, &$mapping){
        $course_context = get_context_instance(CONTEXT_COURSE, $mapping->courseid);
        if($course_context === false){
            $this->report->log_report(1, 'Failed to take sync '  . $mapping->id . '; could not get course context' );
            return false;
        }
        while($row = oci_fetch_object($rh)){
            if($row->username != ''){
                $user = $this->user_by_username($row->username);
            }else{
                $user = false;
            }
            if(is_object($user)){
       	        $role_id = $this->map_sits_role_to_moodle($row->role);
       	        //Does the assignment already exist for this mapping?
       	        $assignment = get_record('role_assignments', 'userid', $user->id, 'contextid', $course_context->id, 'roleid', $role_id);
       	        if(is_object($assignment)){
       	            if(!$this->take_assignment_ownership(&$mapping, &$assignment)){
       	                $this->report->log_report(1, 'Failed to take ownership '  . $row->sits_code . '; cannot enrol ' . $row->username . ', in process_full_sync' );
       	            }
       	        }else{
       	            //No current assignment; make it so:
       	            if(!$this->add_user_to_course($user->id, $role_id, $mapping) === true){
       	                $this->report->log_report(1, 'Failed to add user to course '  . $row->sits_code . '; cannot enrol ' . $row->username . ', in process_full_sync' );
                    }
                }
            }
        }
        return true;
    }
    /**
     * Enrols a user on a course with a role
     * @return bool true on adding the user to the course, false if not
     * @param int $user_id - Moodle user id
     * @param int $course_id - Moodle course id
     * @param int $role_id - Moodle role id
     * @param mapping $mapping
     */
    private function add_user_to_course($user_id, $role_id, &$mapping){
        //Get context id for the course
        $course_context = get_context_instance(CONTEXT_COURSE, $mapping->courseid);
        //If we can't, log error and return false
        if(!is_object($course_context)){
            $this->report->log_report(1, 'Could not get context for course id ' . $mapping->courseid);
            return false;
        }
        //Assign the user a role on the course; if that fails, log error and return false.
        if(!role_assign($role_id, $user_id, 0, $course_context->id, 0, 0, 0, $mapping->id)){
            $this->report->log_report(1, 'Could not assign user id ' . $user_id . ' to course id ' . $mapping->courseid . ' with role id ' . $role_id);
            return false;
        }else{
            $this->assignments++;
            return true;
        }
    }

    /**
     * setter function - builds course data object template
     * @return boolean
     */
    private function build_course_data_object(){
        if (!$site = get_site()){
            $this->report->log_report(1, 'Could not get data template from get_record in build_course_data()');
            return false;
        }
         
        $this->course_data = new stdClass();
         
        $this->course_data->startdate = time() + 3600 * 24;
        $this->course_data->summary = get_string("defaultcoursesummary");
        $this->course_data->format = "weeks";
        $this->course_data->password = '';
        $this->course_data->guest = 0;
        $this->course_data->numsections = 10;
        $this->course_data->idnumber = '';
        $this->course_data->cost = '';
        $this->course_data->newsitems = 5;
        $this->course_data->showgrades = 1;
        $this->course_data->groupmode = 0;
        $this->course_data->groupmodeforce = 0;
        $this->course_data->student = $site->student;
        $this->course_data->students = $site->students;
        $this->course_data->teacher = $site->teacher;
        $this->course_data->teachers = $site->teachers;

        return true;
    }

    /**
     * Maps SITS role ids, as return by $this->sits, to Moodle role ids
     * @param role $role
     * @return integer Moodle role id
     */
    private function map_sits_role_to_moodle($role){
        switch($role){
            case 1 :
            default :
                return 5;
                break;
            case 2 :
                return 3;
                break;
            case 3 :
                return 3;
                break;
        }
    }

    /**
     * sets current academic year in the format 'yyyy/+1' style, such as 2010/1, 2011/2 and the lke
     */
    private function set_academic_year(){
        $date = date('m-Y');
        $date_array = explode('-', $date);
        if(intval($date_array[0]) >= 7){
            $this->academic_year = strval(intval($date_array[1])) . '/' . substr(strval(intval($date_array[1]) + 1), -1);
            $this->academic_year_start = new DateTime($date_array[1] . '-07-31 00:00:00');
            $this->academic_year_end = new DateTime($date_array[1] + 1 . '-07-31 00:00:00');
        }else{
            $this->academic_year = strval(intval($date_array[1]) - 1) . '/' . substr(strval(intval($date_array[1])), -1);
            $this->academic_year_start = new DateTime($date_array[1] - 1 . '-07-31 00:00:00');
            $this->academic_year_end = new DateTime($date_array[1] . '-07-31 00:00:00');
        }
    }

    /**
     * sets last academic year in the format 'yyyy/+1' style, such as 2010/1, 2011/2 and the lke
     */
    private function set_last_academic_year(){
        $date = new DateTime;
        $date->sub(new DateInterval('P1Y'));
        $date_array = explode('-', $date->format('m-Y'));
        if(intval($date_array[0]) >= 7){
            $this->last_academic_year = strval(intval($date_array[1])) . '/' . substr(strval(intval($date_array[1]) + 1), -1);
        }else{
            $this->last_academic_year = strval(intval($date_array[1]) - 1) . '/' . substr(strval(intval($date_array[1])), -1);
        }
    }

    /**
     * Given a data object representing a mapping record in the sits_mappings table, returns a mapping object
     * @param unknown_type $record
     * @return mapping object
     */
    private function mapping_object_from_record(&$record){
        switch($record->type){
            case 'module':
                $cohort = new module_cohort($record->sits_code, $record->period_code, $record->acyear);
                break;
            case 'program':
                $cohort = new program_cohort($record->sits_code, $record->year_group, $record->acyear);
                break;
        }
        return new mapping($record->courseid, $cohort, new DateTime($record->start_date), new DateTime($record->end_date), $record->manual, $record->default_map, $record->id, $record->specified, $record->active);
    }

    /**
     * Removes all role assignments owned by a particular mapping, given a valid mapping object
     * @param mapping object $mapping
     * @return boolean
     */
    private function remove_assignments(&$mapping){
        if($mapping->manual){
            return delete_records('role_assignments', 'enrol', $mapping->id);
        }else{
            return delete_records('role_assignments', 'enrol', $mapping->id);
        }
    }

    /**
     * Attempts to take ownership of a particular role assignment for a particular mapping, given valid mapping and assignment objects
     *
     * The pecking order (open to debate, but currently thus):
     *
     * 1) Assignments created through the Moodle GUI take precedence, and the SITS block will never take ownership of them
     * 2) SITS manual assignments take ownership of any other SITS assignment except those associated with default mappings
     * 3) Specified assignments are next in line
     * 3) Every other mapping fights it out on a first come, first serve basis.
     *
     * @param mapping object $mapping
     * @param object $assignment
     * @return boolean
     */
    private function take_assignment_ownership(&$mapping, &$assignment){
         
        $update = false;
         
        if($assignment->enrol == 'manual'){
            $update = false;
        }elseif($mapping->default == true){
            $update = true;
        }else{

            $sql = <<<sql
SELECT map.default_map, map.manual, map.end_date
FROM mdl5_role_assignments AS ra
LEFT JOIN mdl5_sits_mappings AS map ON ra.enrol=map.id
WHERE ra.id = %d
sql;

            $ra_map = get_record_sql(sprintf($sql, $assignment->id));
            $current_end_date = new DateTime($ra_map->end_date);
             
            if($mapping->manual == true && $ra_map->default_map == false){
                $update = true;
            }elseif($mapping->specified == true && $ra_map->default_map == false && $ra_map->manual == false && $current_end_date < $mapping->end){
                $update = true;
            }
        }
         
        if($update){
            $assignment->enrol = $mapping->id;
            if(!update_record('role_assignments', $assignment)){
                $this->report->log_report(1, 'Failed to update assignment ' . $assignment->id . ' for mapping ' . $mapping->id);
                return false;
            }else{
                return true;
            }
        }else{
            return true;
        }
    }

    /**
     * Given an array of courses and the valid module cohort which is the default for each of those courses
     * this function will ensure that a default mapping exists for each.  Sadly, there may be more than one course for a single SITS module,
     * hence the necessity of the array.  This because there is a present requirement at Bath that manually created courses can have their idnumber field
     * (that which refers to the SAMIS code) editable by the user, and there is no constraint on the database that it should be unique.  Not pleasant.
     * @param array $courses
     * @param module_cohort object $module_cohort
     * @return boolean
     */
    private function ensure_module_has_default_mapping(&$courses, &$module_cohort){
        //Set boolean return variable to be switched if there is a problem
        $return = true;

        foreach($courses as $course){
            $mapping = $this->read_mapping_for_course($module_cohort, $course->id);
            if(is_object($mapping)){ //No need to create it - but is it marked as a default?
                if(!$mapping->default){ //No it isn't!  An outrage, make it so:
                    $mapping->default = true;
                    $this->update_mapping($mapping);
                }
            }else{ //No mapping exists, create it:
                $period = $this->sits->get_period_for_code($module_cohort->period_code, $module_cohort->academic_year);
                $mapping = new mapping($course->id, $module_cohort, $period->start, $period->end, false, true);
                if(!$this->create_mapping($mapping, true)){ //second param is temporary development hack
                    $this->report->log_report(1, 'Failed to create default mapping for ' . $module_cohort->sits_code);
                    $return = false;
                }
            }

            if($this->sync_assign_period_with_sits){
                //If you want to reset to mapping to the SITS period code
                $period->start->sub(new DateInterval('P' . $this->default_mod_start_minus . 'D'));
                $period->end->add(new DateInterval('P' . $this->default_mod_end_plus . 'D'));
                $default_mapping->start_date = $period->start->format('Y-m-d H:i:s');
                $default_mapping->end_date = $period->end->format('Y-m-d H:i:s');
                if(!$this->update_mapping($default_mapping)){
                    $this->report->log_report(1, 'Failed to update default mapping for ' . $module_cohort->sits_code);
                    $return = false;
                }
            }
        }
        return $return;
    }

    /**
     * Given an array of courses and the valid program cohort which is the default for each of those courses
     * this function will ensure that a default mapping exists for each.  Sadly, there may be more than one course for a single SITS program,
     * hence the necessity of the array.  This because there is a present requirement at Bath that manually created courses can have their idnumber field
     * (that which refers to the SAMIS code) editable by the user, and there is no constraint on the database that it should be unique.  Not pleasant.
     * @param array $courses
     * @param program_cohort object $program_cohort
     * @return boolean
     */
    private function ensure_program_has_default_mapping(&$courses, &$program_cohort){
        //Set boolean return variable to be switched if there is a problem
        $return = true;

        foreach($courses as $course){
            $mapping = $this->read_mapping_for_course($program_cohort, $course->id);
            if(is_object($mapping)){ //No need to create it - but is it marked as a default?
                if(!$mapping->default){ //No it isn't!  An outrage, make it so:
                    $mapping->default = true;
                    $this->update_mapping($mapping);
                }
            }else{ //No mapping exists, create it:
                $mapping = new mapping($course->id,  $program_cohort, $this->academic_year_start, $this->academic_year_end, false, true);
                if(!$this->create_mapping($mapping, true)){ //second param is temporary development hack
                    $this->report->log_report(1, 'Failed to create default mapping for ' . $program_cohort->sits_code);
                    $return = false;
                }
            }
        }
        return $return;
    }

    /**
     * Updates all automatic mappings with the period dates given
     * @param sits_period object $period
     * @return boolean
     */
    private function update_mappings_for_period(&$period){

        $where = <<<sql
period_code = '%s'
AND acyear = '%s' 
AND manual = 0 
AND specified = 0
sql;

        $set_start = set_field_select('sits_mappings', 'start_date', $period->start->format('Y-m-d H:i:s'), sprintf($where, $period->code, $period->academic_year));
        $set_end = set_field_select('sits_mappings', 'end_date', $period->end->format('Y-m-d H:i:s'), sprintf($where, $period->code, $period->academic_year));

        if($set_start != false && set_end != false){
            return true;
        }else{
            return false;
        }
    }

    /**
     * Adds a record to sits_mapping_history
     * @param mapping object $mapping
     * @param string $action
     */
    private function add_mapping_action(&$mapping, $action){

        global $USER;
        if(is_object($USER)){
            $userid = $USER->id;
        }else{
            $userid = 0;
        }
        //Set method id - 0 = automatic, 1 = specified, 2 = manual
        if(!$mapping->specified && !$mapping->manual){
            $method = 'automatic';
        }
        if($mapping->specified && !$mapping->manual){
            $method = 'specified';
        }
        if(!$mapping->specified && $mapping->manual && !$mapping->default){
            $method = 'manual';
        }

        $mapping_action = new mapping_action($mapping->id, $userid, $action, $method, $mapping->end);
         
        return insert_record('sits_mappings_history', $this->data_row_object_from_mapping_action($mapping_action), false);

    }
}