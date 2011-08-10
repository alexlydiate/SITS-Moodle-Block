<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="X-UA-Compatible" content="IE=8" /> <!-- Flip it back out of IE7 compatability, if necessary -->
<link rel="stylesheet" type="text/css"
    href="<?php echo $CFG->wwwroot ?>/theme/standard/styles.php" />
<link rel="stylesheet" type="text/css"
    href="<?php echo $CFG->wwwroot ?>/theme/bath/styles.php" />
<link rel="stylesheet" type="text/css"
    href="./css/samis_user_interface.css" />
<!--CSS file (default YUI Sam Skin) -->
<link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/2.9.0/build/calendar/assets/skins/sam/calendar.css">
 
<!--[if IE 6]>
            <link rel="stylesheet" type="text/css" href="<?php echo $CFG->wwwroot ?>/theme/standard/styles_ie6.css" />
            <link rel="stylesheet" type="text/css" href="<?php echo $CFG->wwwroot ?>/theme/bath/styles_ie7.css" />
            <link rel="stylesheet" type="text/css" href="./css/styles_ie.css" />
        <![endif]-->
<!--[if IE 7]>
            <link rel="stylesheet" type="text/css" href="<?php echo $CFG->wwwroot ?>/theme/standard/styles_ie7.css" />
            <link rel="stylesheet" type="text/css" href="<?php echo $CFG->wwwroot ?>/theme/bath/styles_ie7.css" />
            <link rel="stylesheet" type="text/css" href="./css/styles_ie.css" />
        <![endif]-->
<!-- JS -->
<script src="./js/prototype/prototype.js" type="text/javascript"></script>
<script src="./js/prototype/scriptaculous.js?load=effects"
    type="text/javascript"></script>
<script src="./js/prototype/overlay.js" type="text/javascript"></script>
<!--  Want to get rid of the above -->
<!-- YUI Base Dependency -->
<script src="./js/yui/yahoo-min.js"
    type="text/javascript"></script>
<!-- YUI Used for Custom Events and event listener bindings -->
<script src="./js/yui/event-min.js"
    type="text/javascript"></script>
<!-- YUI AJAX connection -->
<script
    src="./js/yui/connection-min.js"
    type="text/javascript"></script>
<!-- YUI DOM Source file -->
<script src="./js/yui/dom-min.js"></script>
<!-- YUI Element, depends on DOM -->
<script
    src="./js/yui/element-min.js"></script>
<script src="./js/sits_block.js" type="text/javascript"></script>

<!--  end JS -->
<meta http-equiv="content-type" content="text/html;charset=UTF-8" />
<title>Manage SAMIS Cohorts</title>
<link rel="stylesheet" type="text/css" href="./css/dialog.css" />
</head>
<?php
//FIXME Probably need to be a little more PR conscious in the messages...

if(preg_match('/IE 7/', $_SERVER['HTTP_USER_AGENT']) && !preg_match('/Trident\/4.0/', $_SERVER['HTTP_USER_AGENT'])){
    die('The SAMIS block does not support Internet Explorer 7.  Please use Internet Explorer 8 or higher, or an alternate browser.');
}elseif(preg_match('/IE 6/', $_SERVER['HTTP_USER_AGENT'])){
    die('The SAMIS block does not support Internet Explorer 6.  Please use Internet Explorer 8 or higher, or an alternate browser.');
}
?>
