/* Copyright Alex Lydiate 2011 Onwards */
var sits_block = {};

sits_block.SUCCESS = '0';
sits_block.ERROR_COHORT_FAILED_SITS_VALIDATION = '1';
sits_block.ERROR_FAILED_TO_CREATE_MAPPING = '2';
sits_block.ERROR_MAPPING_ALREADY_EXISTS = '3';
sits_block.ERROR_FAILED_TO_DELETE_MAPPING = '4';
sits_block.ERROR_FAILED_TO_RETRIEVE_MAPPING = '5';
sits_block.ERROR_FAILED_TO_INSTANTIATE_COHORT = '6';
sits_block.FAILED_TO_CREATE_GROUP ='7';
sits_block.FAILED_TO_ADD_TO_GROUP ='8';

sits_block.changes = [];
sits_block.appendCount = [];
sits_block.totalMaps = [];
sits_block.mapValueHasChanged = [];
sits_block.optionElements;
sits_block.overlay;

sits_block.totalPeriods;
sits_block.periodAppendCount;
sits_block.sUrl = location.protocol + '//' + location.hostname + '/blocks/sits/gui/client_async_request.php';

sits_block.isEven = function(int){
	if(int%2 === 0){
		return true;
	}else{
		return false;
	}
}

sits_block.validate_bucs_id = function(bucs_id){
	var patt = /^([a-z0-9])/i;
	if(bucs_id.match(patt) === null){
		return false;
	}else{
		return true;
	}
};

sits_block.getTextContent = function(element) {
	if (window.DOMParser) {
		return element.textContent;
	} else {
		return element.innerText;
	}
};

sits_block.setTextContent = function(element, content) {
	if (window.DOMParser) {
		element.textContent = content;
	} else {
		element.innerText = content;
	}
};

sits_block.loadXMLString = function(txt){
	if (window.DOMParser){
		  parser=new DOMParser();
		  xmlDoc=parser.parseFromString(txt,"text/xml");
		}else{ // Internet Explorer
		  xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
		  xmlDoc.async="false";
		  xmlDoc.loadXML(txt);
		}
	return xmlDoc;
};

sits_block.loadDate = function(dateString){
	var dateArray;
	dateArray = dateString.split('-');
	return new Date(dateArray[0],dateArray[1] - 1,dateArray[2]);	
};

sits_block.blurScreen = function(txt){
	var blurDiv = document.createElement("div");
	blurDiv.id = "blurDiv";
	blurDiv.style.cssText = "position:absolute; top:0; right:0; width:" + screen.width + "px; height:auto; background-color: #ffffff; opacity:0.5; filter:alpha(opacity=50)";
	
	var layerDiv = document.createElement("div");
	layerDiv.id = "layerDiv";
	layerDiv.style.cssText = "position:absolute; top:0; right:0; width:100%; height:auto";
	
	var waitDivContainer = document.createElement("div"); 
	var waitDiv = document.createElement("div");
	var loaderDiv = document.createElement("div");
	var waitMessageDiv = document.createElement("div");
	waitDivContainer.id = "waitDivContainer";
	waitDiv.id = "waitDiv";
	loaderDiv.id = "loaderDiv";
	waitMessageDiv.id = "waitMessageDiv";
	
	waitMessageDiv.appendChild(document.createTextNode(txt));	
	waitDiv.appendChild(loaderDiv);
	waitDiv.appendChild(waitMessageDiv);
	waitDivContainer.appendChild(waitDiv);
	layerDiv.appendChild(waitDivContainer);	
	
	var bodyElement = YAHOO.util.Dom.get('canvas');
	bodyElement.appendChild(blurDiv);
	bodyElement.appendChild(layerDiv);
};

sits_block.killBlur = function(){
	var layerDiv = YAHOO.util.Dom.get("layerDiv");
	layerDiv.parentNode.removeChild(layerDiv);
	var blurDiv = YAHOO.util.Dom.get("blurDiv");
	blurDiv.parentNode.removeChild(blurDiv);
};

sits_block.loaderToLoad = function(courseid){
	//Switch loader to loading gif
	var plusButtonElement, plusButtonImage;
	plusButtonElement = YAHOO.util.Dom.get('id_' + courseid + '_plus');
	plusButtonElement.removeAttribute('href');
	plusButtonImage = YAHOO.util.Dom.get('id_' + courseid + '_plus_img');
	YAHOO.util.Dom.setAttribute(plusButtonImage, 'src', './images/liloader.gif');
};

sits_block.loaderToClose = function(courseid){
	//Switch loader to close button
	var plusButtonImage, plusButtonElement;
	plusButtonImage = YAHOO.util.Dom.get('id_' + courseid + '_plus_img');
	YAHOO.util.Dom.setAttribute(plusButtonImage, 'src', './images/switch_minus.gif');
	plusButtonElement = YAHOO.util.Dom.get('id_' + courseid + '_plus');
	YAHOO.util.Dom.setAttribute(plusButtonElement, 'onclick', 'sits_block.hideMappingsForCourse(' + courseid + ')');
};

sits_block.loaderToOpen = function(courseid){
	//Switch loader to open button
	var minusButtonElement, minusButtonImage;
	minusButtonElement = YAHOO.util.Dom.get('id_' + courseid + '_plus');
	YAHOO.util.Dom.setAttribute(minusButtonElement, 'id', 'id_' + courseid + '_plus');
	YAHOO.util.Dom.setAttribute(minusButtonElement, 'onclick', 'sits_block.loadMappingsForCourse(' + courseid + ')');
	minusButtonImage = YAHOO.util.Dom.get('id_' + courseid + '_plus_img');
	YAHOO.util.Dom.setAttribute(minusButtonImage, 'src', './images/switch_plus.gif');
};

sits_block.showControls = function(courseid){
	var controlsElement = YAHOO.util.Dom.get('id_' + courseid + '_controls');
	YAHOO.util.Dom.setAttribute(controlsElement, 'style', 'display:block;');
};

sits_block.hideControls = function(courseid){
	var controlsElement = YAHOO.util.Dom.get('id_' + courseid + '_controls');
	YAHOO.util.Dom.setAttribute(controlsElement, 'style', 'display:none;');
};

sits_block.showLoading = function(courseid, txt){
	var loadMessageElement, loadingElement;
	sits_block.loaderToLoad(courseid);
	loadMessageElement = YAHOO.util.Dom.get('id_' + courseid + '_load_message');
	loadingElement = YAHOO.util.Dom.get('id_' + courseid + '_loading');
	sits_block.setTextContent(loadMessageElement, txt);
	YAHOO.util.Dom.setAttribute(loadingElement, 'style', 'display:block;');
};

sits_block.hideLoading = function(courseid, loaderClose){
	var loadMessageElement, loadingElement;
	if(loaderClose){
		sits_block.loaderToClose(courseid);
	}else{
		sits_block.oaderToOpen(courseid);
	}
	loadMessageElement = YAHOO.util.Dom.get('id_' + courseid + '_load_message');
	loadingElement = YAHOO.util.Dom.get('id_' + courseid + '_loading');
	sits_block.setTextContent(loadMessageElement, '');
	YAHOO.util.Dom.setAttribute(loadingElement, 'style', 'display:none');
};

sits_block.showGroupLoading = function(txt){
	var loadingElement, textElement, controlsElement;
	controlsElement = YAHOO.util.Dom.get('group_controls');
	loadingElement = YAHOO.util.Dom.get('groups_load_message');
	textElement = YAHOO.util.Dom.get('groups_load_message_text');
	sits_block.setTextContent(textElement, txt);
	YAHOO.util.Dom.setAttribute(loadingElement, 'style', 'display:block;');
	YAHOO.util.Dom.setAttribute(controlsElement, 'style', 'display:none;');
};

sits_block.hideGroupLoading = function(){
	var loadingElement, controlsElement;
	controlsElement = YAHOO.util.Dom.get('group_controls');
	loadingElement = YAHOO.util.Dom.get('groups_load_message');
	YAHOO.util.Dom.setAttribute(loadingElement, 'style', 'display:none;');
	YAHOO.util.Dom.setAttribute(controlsElement, 'style', 'display:block;');
};

sits_block.showGroupNoMaps = function(){
	var mappingElement = YAHOO.util.Dom.get('select_mappings');
	var noMapElement = YAHOO.util.Dom.get('grp_no_maps');
	var groupSubmitElement = YAHOO.util.Dom.get('groupsubmit');
	var groupSelectElement = YAHOO.util.Dom.get('select_groups');
	var groupNameElement = YAHOO.util.Dom.get('groupname');
	var groupRadioExistElement = YAHOO.util.Dom.get('grp_radio_exist');
	var groupRadioCreateElement = YAHOO.util.Dom.get('grp_radio_create');
	
	groupRadioExistElement.disabled=true;
	groupRadioCreateElement.disabled=true;
	groupNameElement.disabled=true;
	groupSubmitElement.disabled=true;
	groupSelectElement.disabled=true;
	YAHOO.util.Dom.setAttribute(mappingElement,'style', 'display:none;');
	YAHOO.util.Dom.setAttribute(noMapElement,'style', 'display:block;');
};

sits_block.hideGroupNoMaps = function(){
	var mappingElement = YAHOO.util.Dom.get('select_mappings');
	var noMapElement = YAHOO.util.Dom.get('grp_no_maps');
	var groupSubmitElement = YAHOO.util.Dom.get('groupsubmit');
	var groupSelectElement = YAHOO.util.Dom.get('select_groups');
	var groupNameElement = YAHOO.util.Dom.get('groupname');
	var groupRadioExistElement = YAHOO.util.Dom.get('grp_radio_exist');
	var groupRadioCreateElement = YAHOO.util.Dom.get('grp_radio_create');
	
	groupRadioExistElement.disabled=true;
	groupRadioCreateElement.disabled=true;	
	groupNameElement.disabled=false;
	groupSubmitElement.disabled=false;
	groupSelectElement.disabled=false;
	YAHOO.util.Dom.setAttribute(mappingElement,'style', 'display:block;');
	YAHOO.util.Dom.setAttribute(noMapElement,'style', 'display:none;');
};

sits_block.swapControlsForLoadMessage = function(courseid, txt){
	sits_block.hideControls(courseid);
	sits_block.showLoading(courseid, txt);
};

sits_block.swapLoadMessageForControls = function(courseid, closeLoader){
	if(closeLoader){
		sits_block.hideLoading(courseid, true);
	}else{
		sits_block.hideLoading(courseid, false);
	}
	sits_block.showControls(courseid);
};

sits_block.showAddingCohortLoader = function(){
	var element;
	element = YAHOO.util.Dom.get('add_cohort_title');
	YAHOO.util.Dom.setAttribute(element, 'style', 'display:none');
	element = YAHOO.util.Dom.get('add_cohort_loader');
	YAHOO.util.Dom.setAttribute(element, 'style', 'display:block');
	element = YAHOO.util.Dom.get('id_add_cohort_buttons');
	YAHOO.util.Dom.setAttribute(element, 'style', 'display:none');
};

sits_block.showAddingCohortTitle = function(){	
	var element;
	element = YAHOO.util.Dom.get('add_cohort_title');
	YAHOO.util.Dom.setAttribute(element, 'style', 'display:block');
	element = YAHOO.util.Dom.get('add_cohort_loader');
	YAHOO.util.Dom.setAttribute(element, 'style', 'display:none');
	element = YAHOO.util.Dom.get('id_add_cohort_buttons');
	YAHOO.util.Dom.setAttribute(element, 'style', 'display:block');
};

sits_block.showNoCurrentGroups = function(){
	var element;
	element = YAHOO.util.Dom.get('add_to_existing');
	YAHOO.util.Dom.setAttribute(element, 'style', 'display:none');
	element = YAHOO.util.Dom.get('no_existing_groups');
	YAHOO.util.Dom.setAttribute(element, 'style', 'display:block');
};

sits_block.showAddToExistingGroups = function(){
	var element;
	element = YAHOO.util.Dom.get('add_to_existing');
	YAHOO.util.Dom.setAttribute(element, 'style', 'display:block');
	element = YAHOO.util.Dom.get('no_existing_groups');
	YAHOO.util.Dom.setAttribute(element, 'style', 'display:none');
};

sits_block.setDatesDisabledAttribute = function(mapId, disabled){
	var element;
	element = YAHOO.util.Dom.get('id_' + mapId + '_map_day');
	element.disabled = disabled;
	element = YAHOO.util.Dom.get('id_' + mapId + '_map_month');
	element.disabled = disabled;
	element = YAHOO.util.Dom.get('id_' + mapId + '_map_year');
	element.disabled = disabled;
};

sits_block.createMappingXML = function(course_id, sits_code, type, academic_year, period_code, year_group,
		unenrol, date){	
	var XML;
	XML = "<?xml version='1.0' standalone='yes'?>";
	XML += '<map>';
	XML += '<course_id>' + course_id + '</course_id>';
	XML += '<unenrol>' + unenrol + '</unenrol>';
	XML += '<default>' + 'false' + '</default>';
	XML += '<start_date></start_date>';
	XML += '<end_date>' + date + '</end_date>';	
	if(type === 'unit'){
		XML += '<cohort>';
		XML += '<type>module</type>';
		XML += '<sits_code>' + sits_code + '</sits_code>';
		XML += '<acyear>' + academic_year + '</acyear>';
		XML += '<period_code>' + period_code + '</period_code>';
		XML += '</cohort>';		
	}	
	if(type === 'programme'){
		XML += '<cohort>';
		XML += '<type>program</type>';
		XML += '<sits_code>' + sits_code + '</sits_code>';
		XML += '<acyear>' + academic_year + '</acyear>';
		XML += '<year_group>' + year_group + '</year_group>';
		XML += '</cohort>';
	}	
	XML += '</map>';	
	return XML;	
};

sits_block.toggle_dates = function(mapId)
{
	var element = YAHOO.util.Dom.get('id_' + mapId + '_map_unenrol_type');
	var disabled;
	if(1 === element.selectedIndex) {
		disabled = false;
	}else{
		disabled = true;
	}
	
	sits_block.setDatesDisabledAttribute(mapId, disabled);
};

sits_block.get_years = function(date)
{
    var start_year = 1970;
    var count;
    var end_year = 2015;
    var years_html = '';    
    var year = date.getFullYear();    
    for(count = start_year; count <= end_year; count++){
        if(count===year)
        {
            years_html += '<option value="' + count + '" selected="selected">' + count + '</option>';
        }
        else
        {
            years_html += '<option value="' + count + '">' + count + '</option>';
        }
    }
    return years_html;
};

sits_block.get_months = function(date)
{
    var months_html = '';
    var current_month;
    var month = date.getMonth();
    var months = ['JAN','FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    for(current_month = 0; current_month < 12; current_month++)
    {
        if(current_month===month)
        {
            months_html += '<option value="' + months[current_month] + '" selected="selected">' + months[current_month] + '</option>';
        }
        else
        {
            months_html += '<option value="' + months[current_month] + '">' + months[current_month] + '</option>';
        }
    }
    return months_html;
};

sits_block.get_days = function(date)
{
    days_html = '';
    var count;
    var day = date.getDate();
    for(count = 1; count <= 31; count++)
    {
        if(count===day)
        {
            days_html += '<option value="' + count + '" selected="selected">' + count + '</option>';
        }
        else
        {
            days_html += '<option value="' + count + '">' + count + '</option>';
        }
    }
    return days_html;
};

sits_block.get_unenrolment_types = function(mapping)
{
	var specified_value = mapping.getElementsByTagName("specified")[0].firstChild.data;
	var manual_value = mapping.getElementsByTagName("manual")[0].firstChild.data;
	var default_map = mapping.getElementsByTagName("default")[0].firstChild.data;
	var ui_map_type;
	var types_html;
	//Sort out what's what
	if(specified_value === '0' && manual_value === '0'){
		ui_map_type = 'automatic';
	}
	if(specified_value === '1' && manual_value === '0'){
		ui_map_type = 'specified';
	}
	if(specified_value === '0' && manual_value === '1' && default_map === '0'){
		ui_map_type = 'manual'; 
	}	
	if(default_map === '1'){
	switch(ui_map_type){
		case 'specified':
			types_html = '<option value="automatic">Sync with SAMIS</option>' +
			'<option value="specified" selected="selected">Specified Date</option>';
		break;
		//case 'automatic':
		default:
			types_html = '<option value="automatic" selected="selected">Sync with SAMIS</option>' +
			'<option value="specified">Specified Date</option>';
		break;
		}
	}else{
	    switch(ui_map_type){
		case 'manual':
			types_html = '<option value="automatic">Sync with SAMIS</option>' +
			'<option value="specified">Specified Date</option>' +  
			'<option value="manual" selected="selected">Manual</option>';
		break;
		case 'specified':
			types_html = '<option value="automatic">Sync with SAMIS</option>' +
			'<option value="specified" selected="selected">Specified Date</option>' +  
			'<option value="manual">Manual</option>';
		break;
		//case 'automatic':
		default:
			types_html = '<option value="automatic" selected="selected">Sync with SAMIS</option>' +
			'<option value="specified">Specified Date</option>' +  
			'<option value="manual">Manual</option>';
		break;
	    }
	}	
    return types_html;
};

sits_block.appendMappingToPage = function(mapping, newMap){
	
	var html, yeargroup, periodcode;	
	var sitscode = mapping.getElementsByTagName("sits_code")[0].firstChild.data;
	var acyear = mapping.getElementsByTagName("acyear")[0].firstChild.data;
	var course_id = mapping.getElementsByTagName("course_id")[0].firstChild.data;
	if(mapping.getElementsByTagName("type")[0].firstChild.data === 'module'){
		periodcode = mapping.getElementsByTagName("period_code")[0].firstChild.data;
		yeargroup = 'N/A';
	}else{	
		yeargroup = mapping.getElementsByTagName("year_group")[0].firstChild.data;
		if(yeargroup == '0'){
			yeargroup = 'All';
		}
		periodcode = 'N/A';
	}	
	var default_map = mapping.getElementsByTagName("default")[0].firstChild.data;	
	var id = mapping.getElementsByTagName("id")[0].firstChild.data;	
	var date = sits_block.loadDate(mapping.getElementsByTagName("end_date")[0].firstChild.data);
	var year_options = sits_block.get_years(date);
	var month_options = sits_block.get_months(date);
	var day_options = sits_block.get_days(date);
	var unenrol_type = sits_block.get_unenrolment_types(mapping);	
	html = '<p class="course_detail" id="id_' + id + '">';
	if(newMap === true){
		html += '<strong class="mpg_category">COHORT SAVED: </strong>';
	}
	html += '<span class="mpg_category">SAMIS Code: </span>';
	html += '<strong class="mpg_category">' + sitscode + '</strong>';
	html += '<span class="mpg_category"> Academic Year: </span><strong class="mpg_category">' + acyear + '</strong>';
	html += '<span class="mpg_category"> Period: </span><strong class="mpg_category">' + periodcode + '</strong>';
	html += '<span class="mpg_category"> Year of Study: </span><strong class="mpg_category">' + yeargroup + '</strong>';
	html += '<strong class="hiddenfield">' + id + '</strong>';
	html += '<strong class="hiddenfield">' + id + '</strong>';
	html += '<br/>';
	html += '<span class="unenrol-selects"><label for="id_' + id + '"><span class="mpg_category">Unenrol Method: </span></label>';
	html += '<select id="id_' + id + '_map_unenrol_type" class="map_select" onchange="sits_block.toggle_dates(' + id + ');sits_block.enable_save(' + course_id + '); sits_block.mapValueChange(' + id + ')">';
	html += unenrol_type;
	html += '</select>';
	html += '</span>';
	html += '<span class="date-selects"><span class="mpg_category"> Date: </span>';
	html += '<select class="day" id="id_' + id + '_map_day" class="map_select" onchange="sits_block.enable_save(' + course_id + '); sits_block.mapValueChange(' + id + ')">';
	html += day_options;
	html += '</select>';
	html += '<select class="month" id="id_' + id + '_map_month"  class="map_select" onchange="sits_block.enable_save(' + course_id + '); sits_block.mapValueChange(' + id + ')">';
	html += month_options;
	html += '</select>';
	html += '<select class="year" id="id_' + id + '_map_year" class="map_select" onchange="sits_block.enable_save(' + course_id + '); sits_block.mapValueChange(' + id + ')">';
	html += year_options;
	html += '</select>';
	if(default_map === '0'){
		html += '&nbsp&nbsp<input type="submit" class="map_submit" id="id_' + id + '_map_remove"  value ="Remove Cohort" onclick="sits_block.toggle_delete(this,' + id + '); sits_block.enable_save(' + course_id + ')"/>';
	}else{
		html += '&nbsp&nbsp<input type="submit" style="display:none" class="map_submit" id="id_' + id + '_map_remove"  value ="Remove Cohort" onclick="sits_block.toggle_delete(this,' + id + '); sits_block.enable_save(' + course_id + ')"/>';
		html += '<b>&nbsp&nbsp Default</b>';
	}
	html += '</span>';
	html += '</p>';
	var mapDiv = document.createElement('div');
	if(newMap === true){
		mapDiv.style.cssText = 'background-color: #BAD897;';
	}else{
		if(sits_block.isEven(sits_block.appendCount[course_id])){
			mapDiv.style.cssText = 'background-color: #DFDFDF;';
		}else{
			mapDiv.style.cssText = 'background-color: #EFEFEF;';
		}
	}
	mapDiv.innerHTML = html;
	mapDiv.id = 'id_' + id + '_map';
	mapDiv.className = id;
	YAHOO.util.Dom.get('id_' + course_id + '_mappings').appendChild(mapDiv);
	sits_block.toggle_dates(id);
	sits_block.appendCount[course_id]++;
	if(sits_block.appendCount[course_id] === sits_block.totalMaps[course_id]){
		sits_block.showControls(course_id);
		sits_block.loaderToClose(course_id);
		if(sits_block.changes[course_id] !== true){
			var saveElement = YAHOO.util.Dom.get('id_' + course_id + '_save');
			YAHOO.util.Dom.setAttribute(saveElement, 'disabled', 'disabled');
		}
	}
};

sits_block.appendNoMapsToCourseDiv = function(courseid){
	var noMapDiv = document.createElement("div");
	html = '<p class="course_detail" id="id_' + courseid + '">';
	html += 'No current mappings exist for this course.';
	html +='</p>';
	noMapDiv.innerHTML = html;
	noMapDiv.id = 'id_' + courseid + '_no_maps';
	var element = YAHOO.util.Dom.get('id_' + courseid + '_mappings');
	element.appendChild(noMapDiv);
	sits_block.showControls(courseid);
	sits_block.loaderToClose(courseid);
	var saveElement = YAHOO.util.Dom.get('id_' + courseid + '_save');
	YAHOO.util.Dom.setAttribute(saveElement, 'disabled', 'disabled');	
};

sits_block.removeNoMapsToCourseDiv = function(courseid){
	var noMapElement = YAHOO.util.Dom.get('id_' + courseid + '_no_maps');
	if(noMapElement != null){
		noMapElement.parentNode.removeChild(noMapElement);
	}
};

sits_block.appendMappingToGroupsPage = function(mapping){
	var sitscode = mapping.getElementsByTagName("sits_code")[0].firstChild.data;
	var acyear = mapping.getElementsByTagName("acyear")[0].firstChild.data;
	var course_id = mapping.getElementsByTagName("course_id")[0].firstChild.data;
	var periodcode, yeargroup, id, option, element;
	if(mapping.getElementsByTagName("type")[0].firstChild.data === 'module'){
		periodcode = mapping.getElementsByTagName("period_code")[0].firstChild.data;
		yeargroup = 'N/A';
	}else{	
		yeargroup = mapping.getElementsByTagName("year_group")[0].firstChild.data;
		periodcode = 'N/A';
	}
	
	id = mapping.getElementsByTagName("id")[0].firstChild.data;	
	//var date = new Date(mapping.getElementsByTagName("end_date")[0].firstChild.data);

	option = document.createElement('option');
	sits_block.setTextContent(option, 'SAMIS code:' + sitscode + ', Academic Year: ' + acyear + ' Period: ' + periodcode + ', Year of Study: ' + yeargroup);
	if(sits_block.isEven(sits_block.appendCount[course_id])){
		option.style.cssText = 'background-color: #DFDFDF;';
	}else{
		option.style.cssText = 'background-color: #EFEFEF;';
	}
	option.id = id;
	element = YAHOO.util.Dom.get('select_mappings');
	element.appendChild(option);
	sits_block.appendCount[course_id]++;
	if(sits_block.appendCount[course_id] === sits_block.totalMaps[course_id]){
		sits_block.hideGroupLoading();
	}
};

sits_block.appendNoMapsToGroupsPage = function(courseid){
	var noMapDiv = document.createElement("div");
	var mappingElement = YAHOO.util.Dom.get('steps_two_and_three');
	var noMapElement = YAHOO.util.Dom.get('grp_no_maps');
	noMapDiv.id = 'no_map_div';
	html = '<p class="course_detail" id="' + courseid + '">';
	html += 'No current mappings exist for this course.';
	html +='</p>';
	sits_block.setTextContent(noMapDiv, html);	
	YAHOO.util.Dom.setAttribute(mappingElement,'style', 'display:none;');
	YAHOO.util.Dom.setAttribute(noMapElement,'style', 'display:block;');
};

sits_block.appendGroupToSelect = function(groupXml){
	var select = YAHOO.util.Dom.get('select_groups');
	var option = document.createElement("option");
	sits_block.setTextContent(option, groupXml.getElementsByTagName("name")[0].firstChild.data);
	option.value = groupXml.getElementsByTagName("id")[0].firstChild.data;
	select.appendChild(option);
};

sits_block.asyncRequest = function(op, xml){	

	var responseSuccess;
	var i, n, errors, cid, xmlElements, xmlDoc, deleted, updated, message, getMapXML, srcXmlDoc, transaction, gid, courses, delElement;
	
	switch(op){
		case 'create_map':
			    responseSuccess = function(o) {
				if(o.responseText.match(/xml version/)){
					//Got an XML doc returned, must be a success				
					xmlDoc = sits_block.loadXMLString(o.responseText);
					cid = xmlDoc.getElementsByTagName("course_id")[0].firstChild.data;
					xmlElements = xmlDoc.getElementsByTagName("map");
					sits_block.totalMaps[cid] = xmlElements.length;
					sits_block.appendCount[cid] = 0;
					if(xmlElements.length > 0){
						sits_block.removeNoMapsToCourseDiv(cid);
						sits_block.appendMappingToPage(xmlElements[0], true);						
					}
					sits_block.showAddingCohortTitle();
					sits_block.overlay.hide();
				}else{
					switch(o.responseText){
						case sits_block.ERROR_COHORT_FAILED_SITS_VALIDATION:
							sits_block.showAddingCohortTitle();
							alert('The cohort you have defined does not exist.  Please review and try again.');
							YAHOO.util.Dom.get('samis-module').activate();
						break;
						case sits_block.ERROR_FAILED_TO_INSTANTIATE_COHORT:
							sits_block.showAddingCohortTitle();
							alert('An error has meant the cohort you have defined has not been recognised.  Please contact an administrator.');
							YAHOO.util.Dom.get('samis-module').activate();
						break;
						case sits_block.ERROR_FAILED_TO_CREATE_MAPPING:
							sits_block.showAddingCohortTitle();
							alert('The application failed to create the mapping.  Please contact an administrator');
							YAHOO.util.Dom.get('samis-module').activate();
						break;
						case sits_block.ERROR_MAPPING_ALREADY_EXISTS:
							sits_block.showAddingCohortTitle();
							alert('This mapping already exists.');
							YAHOO.util.Dom.get('samis-module').activate();
						break;
						default:
							sits_block.showAddingCohortTitle();
							alert('An unidentified error has occured.  Please contact an administrator');
						break;
					}
				}
			};
		break;
		case 'batch':
			    responseSuccess = function(o) {
				xmlDoc = sits_block.loadXMLString(o.responseText);				
				errors = xmlDoc.getElementsByTagName("error");
				courses = xmlDoc.getElementsByTagName("course_id");
				deleted = xmlDoc.getElementsByTagName("deleted");
				updated = xmlDoc.getElementsByTagName("updated");
				if(errors.length > 0){
					for (i=0;i<errors.length;i++){ 
						alert(errors[i].firstChild.data);
					}
				}
				//load all affected courses
				for(n=0; n<deleted.length; n++){
				    delElement = YAHOO.util.Dom.get('id_' + deleted[n].firstChild.data + '_map');
				    delElement.parentNode.removeChild(delElement);
			    }
				for(n=0; n<updated.length; n++){
					sits_block.mapValueHasChanged[updated[n].firstChild.data] = false;
		        }
				for (i=0;i<courses.length;i++){
					//sits_block.hideMappingsForCourse(courses[i].firstChild.data);
					sits_block.disable_save(courses[i].firstChild.data);
					sits_block.swapLoadMessageForControls(courses[i].firstChild.data, true);
				}	
			};
		break;
		case 'sync':
			    responseSuccess = function(o) {
				xmlDoc = sits_block.loadXMLString(o.responseText);				
				errors = xmlDoc.getElementsByTagName("error");
				courses = xmlDoc.getElementsByTagName("course_id");
				if(errors.length > 0){
					for (i=0;i<errors.length;i++){ 
						alert(errors[i].firstChild.data);
					}			
				}
				for (i=0;i<courses.length;i++){
					sits_block.swapLoadMessageForControls(courses[i].firstChild.data, true);
				}
				
			};
		break;	
		case 'adduser':
		case 'sync_all':
			    responseSuccess = function(o) {
				xmlDoc = sits_block.loadXMLString(o.responseText);
				message = xmlDoc.getElementsByTagName("message");
				sits_block.killBlur();
				alert(message[0].firstChild.data);
			};
		break;
		case 'get_map_ids':
			    responseSuccess = function(o) {
				xmlDoc = sits_block.loadXMLString(o.responseText);
				cid = xmlDoc.getElementsByTagName("cid")[0].firstChild.data;
				xmlElements = xmlDoc.getElementsByTagName("id");
				sits_block.totalMaps[cid] = xmlElements.length;
				sits_block.appendCount[cid] = 0;
				if(xmlElements.length > 0){
					for (i=0;i<xmlElements.length;i++){
						getMapXML = "<?xml version='1.0' standalone='yes'?>";
						getMapXML += "<map><id>" + xmlElements[i].firstChild.data + "</id></map>"; 
						sits_block.asyncRequest('get_map',getMapXML);
					}
				}else{
					srcXmlDoc = sits_block.loadXMLString(xml);					
					sits_block.appendNoMapsToCourseDiv(srcXmlDoc.getElementsByTagName("course_id")[0].firstChild.data);
				}
			};
		break;
		case 'get_map':
			    responseSuccess = function(o) {
				xmlDoc = sits_block.loadXMLString(o.responseText);
				xmlElements = xmlDoc.getElementsByTagName("map");
				if(xmlElements.length > 0){
					sits_block.appendMappingToPage(xmlElements[0], false);						
				}else{
					srcXmlDoc = sits_block.loadXMLString(xml);					
					sits_block.appendNoMapsToCourseDiv(srcXmlDoc.getElementsByTagName("course_id")[0].firstChild.data);
				}
			};
		break;
		case 'get_map_ids_group':
			    responseSuccess = function(o) {
				xmlDoc = sits_block.loadXMLString(o.responseText);
				cid = xmlDoc.getElementsByTagName("cid")[0].firstChild.data;
				xmlElements = xmlDoc.getElementsByTagName("id");
				sits_block.totalMaps[cid] = xmlElements.length;
				sits_block.appendCount[cid] = 0;
				if(xmlElements.length > 0){
					for (i=0;i<xmlElements.length;i++){
						getMapXML = "<?xml version='1.0' standalone='yes'?>";
						getMapXML += "<map><id>" + xmlElements[i].firstChild.data + "</id></map>"; 
						sits_block.asyncRequest('get_map_group', getMapXML);
					}
					sits_block.hideGroupLoading();
				}else{
					sits_block.showGroupNoMaps();
					sits_block.hideGroupLoading();
				}
			};
		break;
		case 'get_map_group':
			    responseSuccess = function(o) {
				xmlDoc = sits_block.loadXMLString(o.responseText);
				xmlElements = xmlDoc.getElementsByTagName("map");
				if(xmlElements.length > 0){	
					sits_block.appendMappingToGroupsPage(xmlElements[0]);						
				}else{
					sits_block.showGroupNoMaps();
					sits_block.hideGroupLoading();
				}
			};
		break;
		case 'get_groups':
		    responseSuccess = function(o) {
				xmlDoc = sits_block.loadXMLString(o.responseText);
				cid = xmlDoc.getElementsByTagName("cid")[0].firstChild.data;
				xmlElements = xmlDoc.getElementsByTagName("group");
				if(xmlElements.length > 0){
					for (i=0;i<xmlElements.length;i++){
						sits_block.appendGroupToSelect(xmlElements[i]);
					}
					sits_block.showAddToExistingGroups();
				}else{
					sits_block.showNoCurrentGroups();
				}
			};
		break;
		case 'create_group':
		    responseSuccess = function(o) {
				switch(o.responseText){
				case sits_block.SUCCESS:
					srcXmlDoc = sits_block.loadXMLString(xml);
					cid = srcXmlDoc.getElementsByTagName("course_id")[0].firstChild.data;
					sits_block.update_group_list(cid);
					sits_block.hideGroupLoading();					
				break;
				case sits_block.FAILED_TO_CREATE_GROUP:
					sits_block.hideGroupLoading();
					alert('An error has meant that the application failed to create the group');
				break;				
				case sits_block.FAILED_TO_ADD_TO_GROUP:
					sits_block.hideGroupLoading();
					alert('An error has meant that the application failed to add the chosen mapped cohorts to the group');
				break;
				default:
					sits_block.hideGroupLoading();
					alert('An unidentified error has occured.  Please contact an administrator');
				break;
				}
			};
		break;
		case 'add_to_group':
		    responseSuccess = function(o) {
				switch(o.responseText){
				case sits_block.SUCCESS:
					sits_block.hideGroupLoading();
				break;
				case sits_block.FAILED_TO_ADD_TO_GROUP:
					sits_block.hideGroupLoading();
					alert('An error has meant that the application failed to add the chosen mapped cohorts to the group');			
					break;
				default:
					sits_block.hideGroupLoading();
					alert('An unidentified error has occured.  Please contact an administrator');
				break;
				}
			};
		break;
		case 'get_periods':
		    responseSuccess = function(o) {
		    	xmlDoc = sits_block.loadXMLString(o.responseText);
				xmlElements = xmlDoc.getElementsByTagName("period");
				sits_block.totalPeriods = xmlElements.length;
				sits_block.periodAppendCount = 0;
				if(xmlElements.length > 0){
					for (i=0;i<xmlElements.length;i++){
						sits_block.appendPeriod(xmlElements[i]);
					}
				}else{			
					appendNoAlteredPeriods();
				}
		    };	
		break;
	}
	 
	var responseFailure = function(o) {
		alert('The application has failed to communicate successfully with the server.');
	};
	 
	var callback = {
	  success:responseSuccess,
	  failure:responseFailure
	};
	
	transaction = YAHOO.util.Connect.asyncRequest('POST', sits_block.sUrl, callback, 'op=' + op + '&xml=' + escape(xml));
};
	
sits_block.create_batch_xml = function(courseid)
{	
	var mapping_id, xml, i, removeButton, day, month, year, type;
	
	xml = "<?xml version='1.0' standalone='yes'?>";
	xml += "<batch_actions>";
	xml += "<course id='" + courseid + "'>";
	var mappingsElement = YAHOO.util.Dom.get('id_' + courseid + '_mappings');
	for (i = 0; i < mappingsElement.childNodes.length; i++) {
		mapping_id = mappingsElement.childNodes[i].className;
		if(mapping_id !== null){
			removeButton = YAHOO.util.Dom.get('id_' + mapping_id + '_map_remove');
			if(removeButton.value === 'Restore Cohort'){
				xml += "<map id='" + mapping_id + "'>";
				xml += '<delete>true</delete>';
				xml += '</map>';
			}else{
				if(sits_block.mapValueHasChanged[mapping_id]){
					xml += "<map id='" + mapping_id + "'>";
					day = YAHOO.util.Dom.get('id_' + mapping_id + '_map_day');
					month = YAHOO.util.Dom.get('id_' + mapping_id + '_map_month');
					year = YAHOO.util.Dom.get('id_' + mapping_id + '_map_year');				
					type = YAHOO.util.Dom.get('id_' + mapping_id + '_map_unenrol_type');	
					xml += '<end_date>' + year.value + '-' + month.value + '-' + day.value + '</end_date>';
					xml += '<type>' + type.value + '</type>';
					xml += '</map>';
				}
			}
		}
	}
	xml += "</course>";
	xml += '</batch_actions>';
	return xml;
};

sits_block.loadMappingsForCourse = function(courseid){
	sits_block.changes[courseid] = false;
	var xml;
	var currentDiv = YAHOO.util.Dom.get('id_' + courseid + '_mappings');
	//Check if mappings are loaded, if so remove in order to reload 
	if(currentDiv !== null){
		currentDiv.parentNode.removeChild(currentDiv);
	}
	//Swap to loading gif
	sits_block.loaderToLoad(courseid);
	//Add mappings div
	var mapDiv = document.createElement("div");
	mapDiv.id = 'id_' + courseid + '_mappings';
	YAHOO.util.Dom.get('id_' + courseid + '_content').appendChild(mapDiv);	
	//build XML for request
	xml = "<?xml version='1.0' standalone='yes'?>";
	xml += '<get_maps><course_id>' + courseid + '</course_id></get_maps>';
    //Kick off request
	sits_block.asyncRequest('get_map_ids', xml);
};

sits_block.hideMappingsForCourse = function(courseid){
	var saveConfirm = true;
	if(sits_block.changes[courseid] === true){					
		saveConfirm = confirm('You have made unsaved changes.  Click OK to close the course mappings without saving, or click cancel and then Save Changes.');
	}
		if(saveConfirm){
		var currentDiv = YAHOO.util.Dom.get('id_' + courseid + '_mappings');
		//Check if mappings are loaded, if so remove in order to reload 
		if(currentDiv !== null){
			currentDiv.parentNode.removeChild(currentDiv);
		}
		//Swap Plus/Minus buttons
		sits_block.loaderToOpen(courseid);
		//Hide Controls
		var controlsElement = YAHOO.util.Dom.get('id_' + courseid + '_controls');
		YAHOO.util.Dom.setAttribute(controlsElement,'style', 'display:none;');
	}
};

sits_block.add_coursem = function(moodlecourse){
	window.open("samis_user_interface_addm.php?moodlecourse=" + moodlecourse,"mockup_4m","height=500,width=600,status=no,toolbar=no,menubar=no,scrollbars=1,location=no");
};

sits_block.view_groups_page = function(){
	var courseSelect = YAHOO.util.Dom.get('grp_course');
	var courseid = courseSelect.options[courseSelect.selectedIndex].value;
	window.open('/group/index.php?id=' + courseid, '', 'height = 600px, width = 800px, scrollbars=yes');
};

sits_block.save_course_changes = function(courseid){
	var confirmed;
	confirmed = confirm('Please confirm to save your changes to the mappings');
	if(confirmed)
	{
		xml = sits_block.create_batch_xml(courseid);
		sits_block.swapControlsForLoadMessage(courseid, 'Saving Changes - please wait');
		sits_block.asyncRequest('batch',xml);
		sits_block.changes[courseid]=false;
	}
};

sits_block.sync_course = function(course_id){
	var confirmed;
	confirmed = confirm('Please confirm you would like to sync this Moodle course with SAMIS');
	if(confirmed){
		var saveConfirm = true;
		if(sits_block.changes[course_id] === true){					
			saveConfirm = confirm('You have made unsaved changes.  Click OK to continue without saving, or click cancel and then Save Changes before syncing.');
		}
		if(saveConfirm){
			xml = "<?xml version='1.0' standalone='yes'?><syncs><sync>" + course_id + "</sync></syncs>";
			sits_block.swapControlsForLoadMessage(course_id, 'Syncing Course - please wait');
			sits_block.asyncRequest('sync',xml);
		}
	}
};

sits_block.displayMapLoader = function(course_id){
	var loadDiv = document.createElement("div");
	loadDiv.id = 'id_' + course_id + "_load";
	loadDiv.className = 'liloader';
	var titleDiv = YAHOO.util.Dom.get('id_' + course_id + "_title");
	titleDiv.appendChild(loadDiv);
};

sits_block.exit = function(){
	confirmed = confirm('Click OK to close the Cohorts and Groups interface');
	if(confirmed)
	{
		window.close();
	}
};

sits_block.display_add_module = function(moodle_course){
    child = window.open("./samis_user_interface_addm.php?moodle_course=" + moodle_course,"addmodule", "height=600,width=587,status=yes,toolbar=no,menubar=no,scrollbars=1,location=no");
};

sits_block.add_module_to_mappings = function(){
	var year_group, period_code, mappingXML, typeElement;
	var titleElement = YAHOO.util.Dom.get('which-samis-module');
	var course_id = sits_block.getTextContent(titleElement);
	var codeElement = YAHOO.util.Dom.get('samis-module');
	var sits_code = codeElement.value.toUpperCase();
	var type = YAHOO.util.Dom.get('select_moduletype');
	var dayElement = YAHOO.util.Dom.get('id_add_map_day');
	var monElement = YAHOO.util.Dom.get('id_add_map_month');
	var yearElement = YAHOO.util.Dom.get('id_add_map_year');
	var acYearElement = YAHOO.util.Dom.get('mod-ac-year');
	var unenrolElement = YAHOO.util.Dom.get('id_add_map_unenrol_type');
	var dateString = dayElement.value +  ' ' + monElement.value +  ' ' + yearElement.value; 
	var date = new Date(dateString);
	var today = new Date();
	var dateStringToSend = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();	
	var progPatt = /^[A-z]{4}\-[A-z]{3}\d{2}$/;
	var unitPatt = /^[A-z]{2}\d{5}$/;
	
	if (sits_code === '') {
		alert('Please specify a SAMIS cohort.');
		codeElement.focus();
		return;
	}
	
	if(type.value === 'programme') {
		if(sits_code.match(progPatt) === null){
			alert('Please enter a SAMIS programme code in a valid format');
			codeElement.focus();
			return;
		}else{
			period_code = null;
			typeElement = YAHOO.util.Dom.get('mod-programme');
			year_group = typeElement.options[typeElement.selectedIndex].value;
		}
	}else{
		if(sits_code.match(unitPatt) === null){
			alert('Please enter a SAMIS unit code in a valid format');
			codeElement.focus();
			return;
		}else{
			year_group = null; 
			typeElement = YAHOO.util.Dom.get('mod-period');
			period_code = typeElement.options[typeElement.selectedIndex].value;
		}
	}
	
	if (unenrolElement.value === 'specified' && date<today){
	  alert("The date you entered is either today, or in the past - please enter a future date");
	  dayElement.focus();
	  return;
	}
	
	mappingXML = sits_block.createMappingXML(
			course_id,
			sits_code,
			type.options[type.selectedIndex].value,
			acYearElement.options[acYearElement.selectedIndex].value,
			period_code, 
			year_group,
			unenrolElement.options[unenrolElement.selectedIndex].value, 
			dateStringToSend
	);
	sits_block.showAddingCohortLoader();
	sits_block.asyncRequest('create_map', mappingXML);
}

sits_block.addModuleClick = function(courseid){
	sits_block.setTextContent(YAHOO.util.Dom.get('which-samis-module'), courseid);
	sits_block.overlay.show();
};

sits_block.switchModuleType = function(){
	var  periodselect, programyearselect;
	periodselect = YAHOO.util.Dom.get('mod-programme');
	programyearselect = YAHOO.util.Dom.get('mod-period');
	moduletype = YAHOO.util.Dom.get('select_moduletype').value;

	if(moduletype === 'programme')
	{
		periodselect.disabled = false;
		programyearselect.disabled = true;			
	}
	else
	{
		periodselect.disabled = true;
		programyearselect.disabled = false;			
	}
};

sits_block.toggle_delete = function(remButton, mapId){
	var mapElement = YAHOO.util.Dom.get('id_' + mapId);
	var enrolElment = YAHOO.util.Dom.get('id_' + mapId + '_map_unenrol_type');
	if(remButton.value === 'Remove Cohort') {
		remButton.value = 'Restore Cohort';
		sits_block.setDatesDisabledAttribute(mapId, true);
		YAHOO.util.Dom.addClass(mapElement, 'disabled');
		YAHOO.util.Dom.setAttribute(enrolElment, 'disabled', 'disabled');
	} else {
		remButton.value = 'Remove Cohort';
		sits_block.setDatesDisabledAttribute(mapId, false);
		YAHOO.util.Dom.removeClass(mapElement, 'disabled');
		YAHOO.util.Dom.setAttribute(enrolElment, 'disabled', '');
	}	
};

sits_block.update_cohort_list = function(courseid){
	var i, xml;
	var mappingElement = YAHOO.util.Dom.get('select_mappings');
	var mappingsOptions = YAHOO.util.Dom.getChildren(mappingElement);
	for(i=0; i<mappingsOptions.length; i++){
		mappingsOptions[i].parentNode.removeChild(mappingsOptions[i]);
	}
	//build XML for request
	xml = "<?xml version='1.0' standalone='yes'?>";
	xml += '<get_maps><course_id>' + courseid + '</course_id></get_maps>';
    //Kick off request
	sits_block.asyncRequest('get_map_ids_group', xml);
};

sits_block.update_group_list = function(courseid) {
	var i, xml;
	var groupsElement = YAHOO.util.Dom.get('select_groups');
	var groupsOptions = YAHOO.util.Dom.getChildren(groupsElement);
	for(i=0; i<groupsOptions.length; i++){
		groupsOptions[i].parentNode.removeChild(groupsOptions[i]);
	}
	//build XML for request
	xml = "<?xml version='1.0' standalone='yes'?>";
	xml += '<get_groups><course_id>' + courseid + '</course_id></get_groups>';
    //Kick off request
	sits_block.asyncRequest('get_groups', xml);
};

sits_block.set_group_options = function(){
	sits_block.hideGroupNoMaps();
	sits_block.showGroupLoading('Loading mapped cohorts - please wait');
	var selectElement;
	selectElement = YAHOO.util.Dom.get('grp_course');
	sits_block.update_cohort_list(selectElement.options[selectElement.selectedIndex].value);
	sits_block.update_group_list(selectElement.options[selectElement.selectedIndex].value);
};

sits_block.create_or_add_to_group = function(){
	
	var mappingSelect = YAHOO.util.Dom.get('select_mappings');
	var groupElement;	
	var courseSelect = YAHOO.util.Dom.get('grp_course');
	var createRadioBtn = YAHOO.util.Dom.get('grp_radio_create');
	var courseid = courseSelect.options[courseSelect.selectedIndex].value;
	var op, xml, i;
	
	xml = "<?xml version='1.0' standalone='yes'?>";
	xml += '<maps_to_group><course_id>' + courseid + '</course_id>';
	
	if(createRadioBtn.checked){
		op = 'create_group';
		groupElement = YAHOO.util.Dom.get('groupname');	
		xml += '<group_name>' + groupElement.value + '</group_name>';
		sits_block.showGroupLoading('Creating group - please wait');
	}else{
		op = 'add_to_group';
		groupElement = YAHOO.util.Dom.get('select_groups');
		xml += '<group_id>' + groupElement.options[groupElement.selectedIndex].value + '</group_id>';
		sits_block.showGroupLoading('Adding selected cohorts to group - please wait');
	}	
	xml +='<maps>';
	for(i=0;i<mappingSelect.options.length; i++){
		if(mappingSelect.options[i].selected){
			xml += '<map_id>' + mappingSelect.options[i].id + '</map_id>';
		}
	}
	xml +='</maps>';
	xml += '</maps_to_group>';
	//alert('Here is where you ended - you need to add the cases and test the server side functions "create_group" and "add_to_group" next');
	sits_block.asyncRequest(op, xml);
};

sits_block.update_add_group = function()
{
	var bx_cohort, bx_group, btn_add;
	bx_cohort = YAHOO.util.Dom.get('listcohorts[]');
	bx_group = YAHOO.util.Dom.get('listgroups');
	btn_add = YAHOO.util.Dom.get('groupsubmit');
	if(bx_cohort.value === 'no mappings')
	{
		btn_add.disabled = true;
	}
	else
	{
		btn_add.disabled = false;
	}
};

sits_block.groupnameselect = function()
{
	var bx, rd;
	bx = YAHOO.util.Dom.get('groupname');
	rd = YAHOO.util.Dom.get('grp_radio_create');
	if(bx.value === 'Enter group name')
	{
		bx.value = '';
	}
	rd.checked="checked";
};

sits_block.groupexistselect = function()
{
	var rd;
	rd = YAHOO.util.Dom.get('grp_radio_exist');
	rd.checked="checked";
};

sits_block.switch_view = function(view)
{
	var groupElement = YAHOO.util.Dom.get('groups');
	var cohortElement = YAHOO.util.Dom.get('cohorts');
	var groupBtn = YAHOO.util.Dom.get('group_btn');
	var cohortBtn = YAHOO.util.Dom.get('cohort_btn');
	if(view === 'group'){
		YAHOO.util.Dom.setAttribute(groupElement, 'style', 'display:block;');
		YAHOO.util.Dom.setAttribute(cohortElement, 'style', 'display:none;');
		groupBtn.disabled=true;
		cohortBtn.disabled=false;
	}else{
		YAHOO.util.Dom.setAttribute(groupElement, 'style', 'display:none;');
		YAHOO.util.Dom.setAttribute(cohortElement, 'style', 'display:block;');
		groupBtn.disabled=false;
		cohortBtn.disabled=true;
	}
};

sits_block.enable_save = function(courseid)
{
	YAHOO.util.Dom.get('id_' + courseid + '_save').disabled = false;
	sits_block.changes[courseid] = true;
};

sits_block.mapValueChange = function(mapid)
{
	sits_block.mapValueHasChanged[mapid] = true;
};


sits_block.disable_save = function(courseid)
{
	YAHOO.util.Dom.get('id_' + courseid + '_save').disabled = true;
	sits_block.changes[courseid] = false;
};

sits_block.view_course = function(course_id){
	window.open('/blocks/sits/gui/views/participants.php?id=' + course_id, '', 'height = 600px, width = 800px, scrollbars=yes');
};

sits_block.add_user = function(){
	var bucs_id, fieldElement;
	fieldElement = YAHOO.util.Dom.get('bucs_id_input');
	bucs_id = fieldElement.value;
	if(sits_block.validate_bucs_id(bucs_id)){
		var xml;
		xml = "<?xml version='1.0' standalone='yes'?>";
		xml += "<useradd>";
		xml += "<bucsid>" + bucs_id + "</bucsid>";
		xml += "</useradd>";

		sits_block.blurScreen('Adding User - please wait');
		sits_block.asyncRequest('adduser', xml);
		
	}else{
		alert('The username you have entered is not in a BUCS username format - please enter a valid BUCS username');
	}
};

sits_block.sync_all_courses = function(){
	var confirmed;
	confirmed = confirm('If you are absolutely sure you want to sync Each and Every Course In Moodle, go ahead and confirm.');
	if(confirmed)
	{
		sits_block.blurScreen('Syncing All Courses - please wait');
		sits_block.asyncRequest('sync_all',"<?xml version='1.0' standalone='yes'?><sync_all></sync_all>");
	}
};

sits_block.filterCourses = function(searchString){
	var searchPattern = new RegExp(searchString, 'i'); 
	var i;	
	var titleString, parentElement;
	var courseTitles = YAHOO.util.Dom.getElementsByClassName('course_title');
	for(i = 0; i < courseTitles.length; i++){
		titleString = sits_block.getTextContent(courseTitles[i]);
		parentElement = courseTitles[i].parentNode;
		if(searchString === ''){			
			YAHOO.util.Dom.setAttribute(parentElement, 'style', 'display:block;');
		}else{
			if(titleString.match(searchPattern) === null){
				YAHOO.util.Dom.setAttribute(parentElement, 'style', 'display:none;');
			}else{
				YAHOO.util.Dom.setAttribute(parentElement, 'style', 'display:block;');
			}
		}
	}
};

sits_block.populate_period_codes = function(){
	var xml = "<?xml version='1.0' standalone='yes'?><get_periods></get_periods>";
	sits_block.asyncRequest('get_periods', xml);
};

sits_block.appendPeriod = function(periodXML){
	var code = periodXML.getElementsByTagName("code")[0].firstChild.data;
	var acyear = periodXML.getElementsByTagName("acyear")[0].firstChild.data;
	var start = periodXML.getElementsByTagName("start")[0].firstChild.data;
	var end = periodXML.getElementsByTagName("end")[0].firstChild.data;
	var revert = document.createElement('input');
	YAHOO.util.Dom.setAttribute(revert, 'type', 'checkbox');
	if(periodXML.getElementsByTagName("revert")[0].firstChild.data == '1'){
		YAHOO.util.Dom.setAttribute(revert, 'checked', 'yes');
	}
	var periodTable = YAHOO.util.Dom.get('period_codes');
	var calendarDiv = YAHOO.util.Dom.get('calendar');
	var row = document.createElement('tr');
	
	var startButton = document.createElement('button');
	sits_block.setTextContent(startButton, start);
	YAHOO.util.Dom.setAttribute(startButton, 'id', sits_block.periodAppendCount + '_start');
	var startCalDiv = document.createElement('div');
	YAHOO.util.Dom.setAttribute(startCalDiv, 'id', sits_block.periodAppendCount + '_startCal');
	YAHOO.util.Dom.setAttribute(startCalDiv, 'style', 'display:none;');
	
	var endButton = document.createElement('button');
	sits_block.setTextContent(endButton, end);
	YAHOO.util.Dom.setAttribute(endButton, 'id', sits_block.periodAppendCount + '_end');
	
	
	var td1 = document.createElement('td');
	var td2 = document.createElement('td');
	var td3 = document.createElement('td');
	var td4 = document.createElement('td');
	var td5 = document.createElement('td');
	
	sits_block.setTextContent(td1, code);
	row.appendChild(td1);
	sits_block.setTextContent(td2, acyear);
	row.appendChild(td2);
	
	td3.appendChild(startButton);
	row.appendChild(td3);
	
	td4.appendChild(endButton);
	row.appendChild(td4);
	
	td5.appendChild(revert);
	row.appendChild(td5);
	
	periodTable.appendChild(row);
	
	var startCal = new YAHOO.widget.Calendar(startCalDiv,{ title:code + ', ' + acyear + ': Start', close:true });
	calendarDiv.appendChild(startCalDiv);
	activeDate = sits_block.periodAppendCount; 
	startCal.selectEvent.subscribe(sits_block.calendarSelectHandler, startCal, false);
	startCal.render();
	
	YAHOO.util.Event.addListener(sits_block.periodAppendCount + '_start', "click", startCal.show, startCal, true); 
	sits_block.periodAppendCount++;

};

sits_block.calendarSelectHandler = function(type, args, obj){
	if(activeDate === null){
		return false
	}
	var activeDateButton  = YAHOO.util.Dom.get(activeDate +'_start');
	sits_block.setTextContent(activeDate)
	alert(args);
	alert(obj);
};

sits_block.renderCalendar = function(element){
	var startCal = new YAHOO.widget.Calendar(element);
	startCal.render();
};

sits_block.admin_init = function() {
	populate_period_codes();
};

sits_block.user_init = function() {
	sits_block.overlay = new DialogOverlay($('pop-up-box').remove());
    $$('input.add').invoke('enable');
    sits_block.switch_view('cohort');
    sits_block.toggle_dates('add');
    sits_block.set_group_options();
};

