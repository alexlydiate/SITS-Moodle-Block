<?php

$year_values = array('2008/9','2009/0','2010/1','2011/2','2012/3','2013/4');
$periodcode_values = array('S1','S2','AY','T1','T2','T3');
?>
<div id='add_cohort_title' style="display: block;">
<h3>Add SAMIS Cohort: <span id="which-samis-module">&nbsp;</span></h3>
</div>
<div id='add_cohort_loader' style="display: none;"><img class="liloader"
	src="./images/liloader.gif" alt="Loading" />
<h3>Adding cohort - please wait</h3>
</div>
<form class="addm" action="self">
<fieldset><legend>Cohort</legend>
<p><label>Cohort Type</label> <select id="select_moduletype"
	name="moduletype" onchange="sits_block.switchModuleType()">
	<option value="unit" selected="selected">Unit</option>
	<option value="programme">Programme</option>
</select> <br />
<label for="samis-module">SAMIS Code</label> <input style="width: 23em;"
	id="samis-module" type="text" value="" size="32" /> <!-- Changed from id="unit_typeahead" as unit typeahead wasn't working, jusdt wasting time and HTTP requests -->
</p>
<p><label for="mod-ac-year">Academic Year</label> <select
	id="mod-ac-year">
	<?php
	$year_values = $year_values;
	$periodcode_values = $periodcode_values;
	foreach($year_values as $year)
	{
	    $current_year = return_academic_year();
	    if($year != $current_year)
	    {
	        echo('<option value="' . $year . '">' . $year . '</option>');
	    }
	    else
	    {
	        echo('<option value="' . $year . '" selected="selected">' . $year . '</option>');
	    }
	}
	?>
</select></p>
<p><label for="mod-period">Period</label> <select id="mod-period">
<?php
echo('<option value="S1" selected="selected">Semester 1</option>'
. '<option value="S2">Semester 2</option>'
. '<option value="AY">All Year</option>'
. '<option value="DIS">DIS</option>'
. '<option value="">No period</option>'
. '<option value="">----------</option>'
. '<option value="M01">Aug (M01)</option>'
. '<option value="M02">Sep (M02)</option>'
. '<option value="M03">Oct (M03)</option>'
. '<option value="M04">Nov (M04)</option>'
. '<option value="M05">Dec (M05)</option>'
. '<option value="M06">Jan (M06)</option>'
. '<option value="M07">Feb (M07)</option>'
. '<option value="M08">Mar (M08)</option>'
. '<option value="M09">Apr (M09)</option>'
. '<option value="M10">May (M10)</option>'
. '<option value="M11">Jun (M11)</option>'
. '<option value="M12">Jul (M12)</option>');
?>
</select></p>
<p><label for="mod-programme">Year of Programme</label> <select
	id="mod-programme">
	<option value="0" selected="selected">All</option>
	<option value="1">1</option>
	<option value="2">2</option>
	<option value="3">3</option>
	<option value="4">4</option>
	<option value="5">5</option>
	<option value="6">6</option>
	<option value="7">7</option>
	<option value="8">8</option>
	<option value="9">9</option>
	<option value="10">10</option>
	<option value="11">11</option>
	<option value="12">12</option>
	<option value="13">13</option>
	<option value="14">14</option>
	<option value="15">15</option>
	<option value="16">16</option>
	<option value="17">17</option>
</select></p>

</fieldset>

<fieldset class="course_detail"><legend>Unenrolment Conditions</legend>
<p><label for="method">Method</label> <?php
echo('<select id="id_add_map_unenrol_type" onchange="sits_block.toggle_dates(' . "'add'" . ')";">');
echo('<option value="auto">Synchronise with SAMIS</option>');
echo('<option value="specified">Specified Date</option>');
echo('<option value="manual">Manual</option>');
echo('</select>');
?></p>
<p class="unenrol-date"><label for="datesdd_date">Date</label> <?php
$date = new DateTime();
echo('<select class="date_box day" id="id_add_map_day">' . get_days($date) . '</select>');
echo('<select class="date_box month" id="id_add_map_month">' . get_months($date) . '</select>');
echo('<select class="date_box year" id="id_add_map_year">' . get_years($date) . '</select>');
?></p>
</fieldset>
<p id="id_add_cohort_buttons"><input type="submit" class="add"
	value="Add Cohort" onclick="sits_block.add_module_to_mappings()" /> <input
	type="submit" class="cancel" value="Cancel" onclick="sits_block.overlay.hide();" />
</p>
<script type="text/javascript">sits_block.switchModuleType();</script></form>
