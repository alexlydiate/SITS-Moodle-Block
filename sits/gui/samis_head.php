<?php
//FIXME Far to rough and ready
if(preg_match('/IE 7/', $_SERVER['HTTP_USER_AGENT'])){
    die('You are either using IE7, or are making IE8 behave as IE7 by using Compatibility Mode - the SAMIS block does not support IE 7.  Please use IE 8 or higher, or an alternate browser - if you are in IE8 with Compatibility Mode, please switch this off.');
}elseif(preg_match('/IE 6/', $_SERVER['HTTP_USER_AGENT'])){
    die('The SAMIS block does not support IE 6.  Please use IE 8 or higher, or an alternate browser.');
}?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<link rel="stylesheet" type="text/css"
	href="<?php echo $CFG->wwwroot ?>/theme/standard/styles.php" />
<link rel="stylesheet" type="text/css"
	href="<?php echo $CFG->wwwroot ?>/theme/bath/styles.php" />
<link rel="stylesheet" type="text/css"
	href="./styles/samis_user_interface.css" />
<!--CSS file (default YUI Sam Skin) -->
<link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/2.9.0/build/calendar/assets/skins/sam/calendar.css">
 
<!--[if IE 6]>
			<link rel="stylesheet" type="text/css" href="<?php echo $CFG->wwwroot ?>/theme/standard/styles_ie6.css" />
			<link rel="stylesheet" type="text/css" href="<?php echo $CFG->wwwroot ?>/theme/bath/styles_ie7.css" />
			<link rel="stylesheet" type="text/css" href="./styles/styles_ie.css" />
		<![endif]-->
<!--[if IE 7]>
			<link rel="stylesheet" type="text/css" href="<?php echo $CFG->wwwroot ?>/theme/standard/styles_ie7.css" />
			<link rel="stylesheet" type="text/css" href="<?php echo $CFG->wwwroot ?>/theme/bath/styles_ie7.css" />
			<link rel="stylesheet" type="text/css" href="./styles/styles_ie.css" />
		<![endif]-->
<!-- JS -->
<script src="./scripts/prototype.js" type="text/javascript"></script>
<script src="./scripts/scriptaculous.js?load=effects"
	type="text/javascript"></script>
<script src="./scripts/overlay.js" type="text/javascript"></script>
<!--  Want to get rid of the above -->
<!-- YUI Base Dependency -->
<script src="http://yui.yahooapis.com/2.8.2r1/build/yahoo/yahoo-min.js"
	type="text/javascript"></script>
<!-- YUI Used for Custom Events and event listener bindings -->
<script src="http://yui.yahooapis.com/2.8.2r1/build/event/event-min.js"
	type="text/javascript"></script>
<!-- YUI AJAX connection -->
<script
	src="http://yui.yahooapis.com/2.8.2r1/build/connection/connection-min.js"
	type="text/javascript"></script>
<!-- YUI DOM Source file -->
<script src="http://yui.yahooapis.com/2.8.2r1/build/dom/dom-min.js"></script>
<!-- YUI Element, depends on DOM -->
<script
	src="http://yui.yahooapis.com/2.8.2r1/build/element/element-min.js"></script>
<script src="./scripts/samis_interface_lib.js" type="text/javascript"></script>

<!-- Dependencies -->
<script src="http://yui.yahooapis.com/2.9.0/build/yahoo-dom-event/yahoo-dom-event.js"></script>
<!-- Combo calendar and event listener -->
<script type="text/javascript" src="http://yui.yahooapis.com/combo?2.9.0/build/yahoo-dom-event/yahoo-dom-event.js&2.9.0/build/calendar/calendar-min.js"></script>
<!--  end JS -->
<meta http-equiv="content-type" content="text/html;charset=UTF-8" />
<title>Manage SAMIS Cohorts</title>
<link rel="stylesheet" type="text/css" href="./styles/dialog.css" />
</head>