<?php
/**
 * This is big hack-about of the original SAMIS block's samis_combo_interface
 * as part of stage one of the GUI development for the SITS block.  Frankenstien's monster, but with screws tight, at least.
 *
 * Stage Two should become properly integrated with Moodle instead of simply loading a couple of Moodle libraries.
 *
 * But, this is Stage One, in which the remit is to Make It Look Like The Old Interface, but Make It Work and Make It Sane(r).
 * So:
 * All Javascript functions have been moved to samis_user_interface.js for a bit of clarity, and re-written to utilise Moodle's prefered YUI.
 * Major php scripting and all php functions have been moved to samis_interface_logic.php.
 * The dtd and <head> tag has been moved to samis_head.php so it can be used across all three pages that make up the design of
 * the old SAMIS block interface.
 *
 *
 *
 * Original Comment Below:
 / This page contains functionality for both managing mapped cohorts and creating or populating groups based on cohorts.
 / It has two basic interfaces, one for cohort mappings and one for groups. Which is displayed is based on the calling
 / parameters.
 / Note, it is called "Combo" interface because the Groups and Cohorts functionality was originally separate.
 **/

require_once("../../../config.php");
require_once('../../../group/lib.php');
require_once('../../../lib/grouplib.php');
require_once("../lib/sits_sync.class.php");  //This used to require samis_management...not no more!
require_once("../config/sits_config.php");
require_once('./samis_interface_logic.php');//This is where the business end of the PHP is now residing

require_login();
if (isguestuser()) {
    print_error('guestsarenotallowed', '', $returnurl); //FIXME need more security than this
}

//Markup starts here
include('./samis_head.php');?>

<body>
<div id="canvas">
<div class="bath-header">
<div class="logo-box"><a href="http://www.bath.ac.uk/"> <img
	src="http://www.bath.ac.uk/graphics/logos/logo-hp-trans.gif"
	alt="University of Bath" /> </a></div>
</div>
<div id="header" class=" clearfix">
<h1 class="headermain"><?php print get_string('link_cohorts', 'block_sits')?></h1>
</div>
<div id="outertab"><!-- <div class="samis_notice">
					This tool is for mapping SAMIS student cohorts to Moodle courses, and creating Moodle groups from SAMIS cohorts. Before creating groups you must first map the relevant cohorts. To sync an individual course with SAMIS, press the 'Sync Course' button for that course.  All courses are automatically synced overnight.
				</div> --> <input name="tabcohort2" type="submit" id="cohort_btn"
	class="btn_tab" value="Cohorts" onclick="sits_block.switch_view('cohort');" /> <input
	name="tabgroup2" type="submit" id="group_btn" class="btn_tab"
	value="Groups" onclick="sits_block.switch_view('group');" /> <!--  <div style="float: right;"><input type="submit" class="macrooption" value="Check blurScreen()" onclick="sits_block.blurScreen('Testing blurScreen()');"/></div> -->
<div style="float: right;"><input type="submit" class="macrooption"
	value="Close Cohorts and Groups Interface" onclick="sits_block.exit();" /></div>
</div>
<!--START OF GROUPS-->
<div class="mng_groups" id='groups'>
<div name="grp_course_select" class="grpblock">
<h5>Step 1: Select a course</h5>
<form name="samis_add_user_action_form" class="samis_add_user"
	method="post" action="samis_combo_interface.php"><select
	id="grp_course" name="grp_course" onChange="sits_block.set_group_options()"
	>

	<?php
	foreach($course_is_tutor_on as $cur_course)
	{
	    $select_value =  $cur_course->fullname . ' (' .  $cur_course->shortname . ')';
	    echo('<option class="crs_sel_opt" value="' . $cur_course->id . '">' . $select_value . '</option>');
	}
	?>
</select></form>
</div>
    <div id="steps_two_and_three">
        <div id="grp_cohort_select" name="grp_cohort_select" class="grpblock">
        <h5>Step 2: Select mapped cohort(s)</h5>
        <select multiple="multiple" name="listcohorts[]" id="select_mappings"
        	style="width: 40em;">
        	<!-- populated by js function -->
        </select>
        <div id = "grp_no_maps" style="display: none"><p>You'll need to map a cohort to this course before you can add it to a group.</p></div>
        </div>
        <div id="group_controls">
        <div name="grp_group_select" class="grpblock">
        <h5>Step 3: Create a new group or add to an existing group</h5>
        <span class="samis_font">Enter a name for the group or select an
        existing one for this course from the drop down menu.<br />
        <br />
        
        <div id="add_to_existing"><input type="radio" id="grp_radio_exist"
        	name="action" value="add" /> Add to existing group <select
        	id="select_groups" name="group_reference" onclick="sits_block.groupexistselect();">
        	<!-- populated by js function -->
        </select></div>
        <div id="no_existing_groups" style="display: none"><b>There are no
        groups related to this course</b></div>
        <br />
        <input type="text" name="courseid" value="<?php echo($courseid); ?>"
        	style="display: none" /> <input type="radio" id="grp_radio_create"
        	name="action" value="create" /> Create new group <input type="text"
        	name="groupname" id="groupname" value="Enter group name"
        	onclick="sits_block.groupnameselect();" /> </span>
        <hr />
        </div>
        <br />
        <input id="groupsubmit" name="groupsubmit" type="submit"
        	onclick="sits_block.create_or_add_to_group()" value="Create / Add to Group" /> <input
        	id="viewgroups" name="viewgroups" type="submit"
        	onclick="sits_block.view_groups_page()" value="Open Groups Page" />
        <hr />
        </div>
        <div id="groups_load_message" class="groups_load_message"><img
        	class="liloader" src="./images/liloader.gif" alt="Loading"
        	/ style="float: left;">
        <div id="groups_load_message_text" style="float: left;"></div>
        </div>
    </div>
</div>

<!--END OF GROUPS--> <!--START OF COHORTS-->
<div class="mng_cohort" id="cohorts">
<div class="pagetitle"><!-- <h4>Manage SAMIS Cohorts</h4>	
				<input type="submit" class="savechanges" id="btn_cohort_save" value="Save All Changes" disabled=true onclick="sits_block.commit();" />  -->
<div class="filter">
<input id="course_search_input" type="text" onkeyup="sits_block.filterCourses(this.value)"></input> Enter part of a course
name or idnumber to filter display</div>
</div>
<div id="course_search"></div>
<div id="courses" class="course-list"><!-- <h4>Your Moodle Courses</h4>  -->
	<?php
	/*
	 * This code block outputs the user's course list
	 */
	if($course_is_tutor_on)
	{
					foreach($course_is_tutor_on as $cur_course)
					{
					    echo('<div class="course_cont" id="id_' . $cur_course->id  . '">' ."\n");
					    echo('	<div id = "id_' . $cur_course->id  . '_title" class="course_title">');
					    echo('		<a id="id_' . $cur_course->id . '_plus" class="expand" onclick="sits_block.loadMappingsForCourse(' . $cur_course->id . ');">' ."\n");
					    echo('			<img id="id_' . $cur_course->id . '_plus_img" class="toggle" src="./images/switch_plus.gif" alt="Toggle visibility" />' ."\n");
					    echo('		</a>' ."\n");
					    echo('		<b>' . $cur_course->fullname . '</b><div style="display: none;">' .$cur_course->shortname . ' / ' . $cur_course->idnumber . "</div>\n");
					    echo(	'</div>' ."\n");
					    echo('	<div id="course_' . $cur_course->id . '" class="collapsible course">' ."\n");
					    echo('<div id = "id_' . $cur_course->id . '_content" class="course-cont">');
					    echo('<div id = "id_' . $cur_course->id . '_mappings" class="course-cont">');
					    echo(     '</div>');
					    echo('</div>');
					    echo('<div id= "id_' . $cur_course->id . '_control_container">');
					    echo('<div id= "id_' .  $cur_course->id . '_controls" class="controls" style="display: none;">');
					    echo('      <input type="submit" class="save_btn" id="id_' . $cur_course->id . '_save"  value="Save Changes" '
					    . 'onclick="sits_block.save_course_changes(' . $cur_course->id . ');"/>' ."\n");
					    echo('		<input type="submit" class="add" id="id_' . $cur_course->id . '_addbut"  value="Add Cohort" '
					    . 'onclick="sits_block.addModuleClick(' . $cur_course->id . ');" />' ."\n");
					    echo('		<input type="submit" class="add" id="id_' . $cur_course->id . '_sync"  value="Sync Course" '
					    . 'onclick="sits_block.sync_course(' . $cur_course->id . ');" />' ."\n");
					    echo('        <input type="submit" class="add" id="id_' . $cur_course->id . '_view"  value="View Enrolled Users" '
					    . 'onclick="sits_block.view_course(' . $cur_course->id . ');" />' ."\n");
					    echo('</div>' ."\n");
					    echo('<div id="id_' .  $cur_course->id . '_loading" class="controls" style="display: none;">');
					    echo('<div id="id_' .  $cur_course->id . '_load_message" class="load_message"></div>');
					    echo('</div>' ."\n");
					    echo('	</div>' ."\n");
					    echo('</div>' ."\n");
					    echo('</div>' ."\n");
					}
	}
	?></div>
</div>
</div>
<div id="pop-up-box" style="display: none;"><?php include("$CFG->dirroot/blocks/sits/gui/samis_user_interface_addm.php"); ?>
<form id="message_submit_form" class="apply_changes" method="post"
	action="samis_apply_changes.php"><input id="message_submit_form_value"
	name="message_submit_form_value" type="text" value="error" /> <input
	id="courseid" name="courseid" value="<?php echo($courseid); ?>" /></form>
</div>
<script>YAHOO.util.Event.onDOMReady(sits_block.user_init);</script>
</body>
</html>
