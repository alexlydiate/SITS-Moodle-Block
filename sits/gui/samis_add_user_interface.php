<?php
/**
 *This file is a pop-up page to be displayed when the add user link is called from the
 *SAMIS block by the user clicking on the link.
 *It offers the ability to add a user to Moodle who has not yet been created via SAMIS updates.
 **/

require_once("../../../config.php");
include('./samis_head.php');?>
<html>
    <body>
        <div class="bath-header">
            <div class="logo-box"><a href="http://www.bath.ac.uk/"> <img
            	src="http://www.bath.ac.uk/graphics/logos/logo-hp-trans.gif"
            	alt="University of Bath" /> </a></div>
            <div id="header" class=" clearfix">
                <h1 class="headermain">Add BUCS Users to Moodle</h1>
            </div>
        </div>
        <div id = "container">
            <div id = "period_container" class="admin_box">
                <input type="text" name="courseid" style="display: none;" /> 
                <b>BUCS Username of person to be added: </b><input type="text" name="bucsname"
                	id="bucs_id_input" value="" maxlength="12" size="12" /> 
                <input type="submit" value="Add User" id="useradd_sub"
                	onclick="sits_block.add_user()" />
                <div class = "admin_instruction">
                <p>This form is used to add a BUCS user to Moodle.<br/>  
                BUCS Lite accounts are not held in SAMIS and therefore cannot be validated.<br/>
                Please ensure such usernames are correct before adding them.<br/>
                </div>  
            </div>
        </div>
    </body>
</html>
