<?php
/**
 /This file is a pop-up page to be displayed when the admin link is called from the
 /SAMIS block by the user clicking on the link (only available to admins).
 /It offers the ability to trigger syncronisations, both a Moodle only one which will update
 /the enrolments database and trigger moodle to syncronise with it, and a more complete one
 /which will re-draw data from the SAMIS database to bring the cache up to date. This latter one
 /takes a great deal more time.
 /
 /It also offers the facility to amend, add or delete period slot codes / academic year combinations.
 /
 /It also offers the facility to amend, add or delete category mappings which are used by the SAMIS
 /functionality to determine what Moodle category a newly created course should appear in.
 **/

require_once("../../../config.php");
require_once('../../../group/lib.php');
require_once('../../../lib/grouplib.php');
require_once("../config/sits_config.php");

global $CFG, $USER, $COURSE;

$context = get_context_instance(CONTEXT_COURSE, $COURSE->id);
if(has_capability('moodle/course:update', $context))
{
    if(isset($_GET['courseid'])){
        $course = $_GET['courseid'];
        $user_courses = get_my_courses($USER->id, null, null, false, $course);
    }

    include('./samis_head.php');?>
<body>
<div id="canvas">
<div class="bath-header">
<div class="logo-box"><a href="http://www.bath.ac.uk/"> <img
	src="http://www.bath.ac.uk/graphics/logos/logo-hp-trans.gif"
	alt="University of Bath" /> </a></div>
<div id="header" class=" clearfix">
<h1 class="headermain"><?php print get_string('admin_interface','block_sits')?></h1>
</div><br/>
<p>This is where the interface to alter period slot start and end dates will be, perhaps amongst other things.</p>
<p>If you're wondering where the Sync All Courses button went, we've now got the cron doing that, so I deemed it unecessary.</p>

</body>
</html> 
    <?php
}
?>
