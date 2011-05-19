<?php
/**
 *This file is a pop-up page to be displayed when the add user link is called from the
 *SAMIS block by the user clicking on the link.
 *It offers the ability to add a user to Moodle who has not yet been created via SAMIS updates.
 **/

require_once("../../../config.php");
require_once('../../../group/lib.php');
require_once('../../../lib/grouplib.php');
require_once("../lib/sits_sync.class.php");  //This used to require samis_management...not no more!
require_once("../config/sits_config.php");

include('./samis_head.php');?>
<body>
<div id="canvas">
<div class="bath-header">
<div class="logo-box"><a href="http://www.bath.ac.uk/"> <img
	src="http://www.bath.ac.uk/graphics/logos/logo-hp-trans.gif"
	alt="University of Bath" /> </a></div>
<div id="header" class=" clearfix">
<h1 class="headermain">Add BUCS Users to Moodle</h1>
</div>
</div>
<div class="mng_course">
<h5>Select User:</h5>
<input type="text" name="courseid" style="display: none;" /> BUCS
Username of person to be added:<input type="text" name="bucsname"
	id="bucs_id_input" value="" maxlength="12" size="12" /><br />
<input type="submit" value="Add User" id="useradd_sub"
	onclick="add_user()" />
<hr />
</div>

</body>
</html>
