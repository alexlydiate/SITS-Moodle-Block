<?php
/**
 * This script handles all incoming requests from the GUI, which take the form of two key=>value pairs:
 * 'op', which decribes the operation requested and is used as a switch, and
 * 'xml' which is the XML to be processed in that operation
 * @package moodle_sits_block
 * @author Alex Lydiate <alexlydiate [at] gmail [dot] com>
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v2 or later
 */
require_once('../../../config.php');
require_once($CFG->dirroot . '/blocks/sits/config/sits_config.php');
require_once($CFG->dirroot . '/blocks/sits/lib/sits_client_request.class.php');

// Where we came from. Used in a number of redirects.
$returnurl = $CFG->wwwroot . '/course/index.php';
// Check permissions.
require_login();
if (isguestuser()) {
    print_error('guestsarenotallowed', '', $returnurl); //FIXME need more security than this
}
//Grab the request:
$op = $_POST['op'];
$xml = stripslashes($_POST['xml']);

new sits_client_request($op, $xml);
?>