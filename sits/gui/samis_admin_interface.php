<?php
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
<script src="./scripts/samis_admin_interface.js" type="text/javascript"></script>
<body class="yui-skin-sam">
<div id="canvas">
<div class="bath-header">
<div class="logo-box"><a href="http://www.bath.ac.uk/"> <img
    src="http://www.bath.ac.uk/graphics/logos/logo-hp-trans.gif"
    alt="University of Bath" /> </a></div>
<div id="header" class=" clearfix">
<h1 class="headermain"><?php print get_string('admin_interface','block_sits')?></h1>
</div>
<div id = "container">
    <table id = "period_codes">
    </table>
    <div id = "calendar"></div>
</div>
</body>
<script>YAHOO.util.Event.onDOMReady(sits_block.admin_init);</script>
</html> 
    <?php
}
?>
