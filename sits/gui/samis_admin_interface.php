<?php
require_once("../../../config.php");
require_once('../../../group/lib.php');
require_once('../../../lib/grouplib.php');
require_once("../config/sits_config.php");

global $CFG, $USER, $COURSE;
$context = get_context_instance(CONTEXT_COURSE, 1);
if(has_capability('moodle/site:doanything', $context)){
    include('./samis_head.php');?>
    <script src="./scripts/samis_admin_interface.js" type="text/javascript"></script>
    <body class="yui-skin-sam">
    <div id="canvas">
        <div class="bath-header">
            <div class="logo-box"><a href="http://www.bath.ac.uk/"> <img
                src="http://www.bath.ac.uk/graphics/logos/logo-hp-trans.gif"
                alt="University of Bath" /> </a>
            </div>
            <div id="header" class=" clearfix">
                <h1 class="headermain"><?php print get_string('admin_interface','block_sits')?></h1>
            </div>
        </div>
        <div id = "container">
            <div id = "period_container" class="admin_box">
                <div id = "period_code_div">
                <div class = "admin_instruction">
                    <p><b>Period Alterations</b></p>
                    <p>The table below is used to change the start and end dates for period slots.<br/>  
                    This affects only Moodle, it makes no changes to SITS.<br/>
                    Flagging an existing Alteration to Revert will remove it and all mappings with that period will sync with SITS.</p>
                    <p><b>Please note changing period start and end dates may result in significant changes to enrollments.</b></p>
                </div>                
                    <table id = "period_code_table">
                    </table>
                </div>
                <div id = "period_code_controls" class="admin_controls">
                    <input type="submit" id = "period_code_add" value="Add Alteration" onClick="sits_block.add_period_alteration()"/>
                    <input type="submit" id = "period_code_save" value="Update Periods" onClick="sits_block.period_save()"/>
                </div>
                <div id="period_code_load" class="admin_controls" style="display: none;">
                    <img class="liloader" src="./images/liloader.gif" alt="Loading" style="float: left;">
                    <div id=period_code_load" style="float: left;">Updating period codes for all mappings - please wait</div>
                </div>
            </div>
             <div id = "sync_reset" class="admin_box">
                <div class = "admin_instruction">
                    <p><b>Full Sync Reset</b></p>
                    <p>If a fatal error occurs during a Full Sync, the flag indicating a full sync is in progress does not switch back.<br/>
                    It is important to understand why and, if necessary, fix the problem before trying again.<br/></p>
                    <p><b>The button below will reset the flag after such an incident, allowing a Full Sync once again.<br/></b></p>
                    
                </div>
                <div id = "reset_button" class="admin_controls">            
                <input type="submit" value = "Reset Full Sync Flag" onclick="sits_block.reset_sync_flag()">
                </div>
            </div>
                
            </div>
    </div>
    <script>YAHOO.util.Event.onDOMReady(sits_block.admin_init);</script>
    </body>
    </html> 
<?php
}else{
    die('This interface is for administrators only');
}
?>