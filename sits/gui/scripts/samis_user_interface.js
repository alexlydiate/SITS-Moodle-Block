/* Copyright Alex Lydiate 2011 Onwards */

var SUCCESS = '0';
var ERROR_COHORT_FAILED_SITS_VALIDATION = '1';
var ERROR_FAILED_TO_CREATE_MAPPING = '2';
var ERROR_MAPPING_ALREADY_EXISTS = '3';
var ERROR_FAILED_TO_DELETE_MAPPING = '4';
var ERROR_FAILED_TO_RETRIEVE_MAPPING = '5';
var ERROR_FAILED_TO_INSTANTIATE_COHORT = '6';
var FAILED_TO_CREATE_GROUP ='7';
var FAILED_TO_ADD_TO_GROUP ='8';

var changes = [];
var appendCount = [];
var totalMaps = [];
var mapValueHasChanged = [];
var optionElements;
var overlay;

var sUrl = location.protocol + '//' + location.hostname + '/blocks/sits/gui/client_async_request.php';

function isEven(int){
	if(int%2 === 0){
		return true;
	}else{
		return false;
	}
}

function validate_bucs_id(bucs_id){
	var patt = /^([a-z0-9])/i;
	if(bucs_id.match(patt) === null){
		return false;
	}else{
		return true;
	}
}

function getTextContent(element) {
	if (window.DOMParser) {
		return element.textContent;
	} else {
		return element.innerText;
	}
}

function setTextContent(element, content) {
	if (window.DOMParser) {
		element.textContent = content;
	} else {
		element.innerText = content;
	}
}

function loadXMLString(txt){
	if (window.DOMParser){
		  parser=new DOMParser();
		  xmlDoc=parser.parseFromString(txt,"text/xml");
		}else{ // Internet Explorer
		  xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
		  xmlDoc.async="false";
		  xmlDoc.loadXML(txt);
		}
	return xmlDoc;
}

function blurScreen(txt){
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
}

function killBlur(){
	var layerDiv = YAHOO.util.Dom.get("layerDiv");
	layerDiv.parentNode.removeChild(layerDiv);
	var blurDiv = YAHOO.util.Dom.get("blurDiv");
	blurDiv.parentNode.removeChild(blurDiv);
}

function loaderToLoad(courseid){
	//Switch loader to loading gif
	var plusButtonElement, plusButtonImage;
	plusButtonElement = YAHOO.util.Dom.get('id_' + courseid + '_plus');
	plusButtonElement.removeAttribute('href');
	plusButtonImage = YAHOO.util.Dom.get('id_' + courseid + '_plus_img');
	YAHOO.util.Dom.setAttribute(plusButtonImage, 'src', './images/liloader.gif');
}

function loaderToClose(courseid){
	//Switch loader to close button
	var plusButtonImage, plusButtonElement;
	plusButtonImage = YAHOO.util.Dom.get('id_' + courseid + '_plus_img');
	YAHOO.util.Dom.setAttribute(plusButtonImage, 'src', './images/switch_minus.gif');
	plusButtonElement = YAHOO.util.Dom.get('id_' + courseid + '_plus');
	YAHOO.util.Dom.setAttribute(plusButtonElement, 'onclick', 'hideMappingsForCourse(' + courseid + ')');
}

function loaderToOpen(courseid){
	//Switch loader to open button
	var minusButtonElement, minusButtonImage;
	minusButtonElement = YAHOO.util.Dom.get('id_' + courseid + '_plus');
	YAHOO.util.Dom.setAttribute(minusButtonElement, 'id', 'id_' + courseid + '_plus');
	YAHOO.util.Dom.setAttribute(minusButtonElement, 'onclick', 'loadMappingsForCourse(' + courseid + ')');
	minusButtonImage = YAHOO.util.Dom.get('id_' + courseid + '_plus_img');
	YAHOO.util.Dom.setAttribute(minusButtonImage, 'src', './images/switch_plus.gif');
}

function showControls(courseid){
	var controlsElement = YAHOO.util.Dom.get('id_' + courseid + '_controls');
	YAHOO.util.Dom.setAttribute(controlsElement, 'style', 'display:block;');
}

function hideControls(courseid){
	var controlsElement = YAHOO.util.Dom.get('id_' + courseid + '_controls');
	YAHOO.util.Dom.setAttribute(controlsElement, 'style', 'display:none;');
}

function showLoading(courseid, txt){
	var loadMessageElement, loadingElement;
	loaderToLoad(courseid);
	loadMessageElement = YAHOO.util.Dom.get('id_' + courseid + '_load_message');
	loadingElement = YAHOO.util.Dom.get('id_' + courseid + '_loading');
	setTextContent(loadMessageElement, txt);
	YAHOO.util.Dom.setAttribute(loadingElement, 'style', 'display:block;');
}

function hideLoading(courseid, loaderClose){
	var loadMessageElement, loadingElement;
	if(loaderClose){
		loaderToClose(courseid);
	}else{
		loaderToOpen(courseid);
	}
	loadMessageElement = YAHOO.util.Dom.get('id_' + courseid + '_load_message');
	loadingElement = YAHOO.util.Dom.get('id_' + courseid + '_loading');
	setTextContent(loadMessageElement, '');
	YAHOO.util.Dom.setAttribute(loadingElement, 'style', 'display:none');
}

function showGroupLoading(txt){
	var loadingElement, textElement, controlsElement;
	controlsElement = YAHOO.util.Dom.get('group_controls');
	loadingElement = YAHOO.util.Dom.get('groups_load_message');
	textElement = YAHOO.util.Dom.get('groups_load_message_text');
	setTextContent(textElement, txt);
	YAHOO.util.Dom.setAttribute(loadingElement, 'style', 'display:block;');
	YAHOO.util.Dom.setAttribute(controlsElement, 'style', 'display:none;');
}

function hideGroupLoading(){
	var loadingElement, controlsElement;
	controlsElement = YAHOO.util.Dom.get('group_controls');
	loadingElement = YAHOO.util.Dom.get('groups_load_message');
	YAHOO.util.Dom.setAttribute(loadingElement, 'style', 'display:none;');
	YAHOO.util.Dom.setAttribute(controlsElement, 'style', 'display:block;');
}

function swapControlsForLoadMessage(courseid, txt){
	hideControls(courseid);
	showLoading(courseid, txt);
}

function swapLoadMessageForControls(courseid, loaderToClose){
	if(loaderToClose){
		hideLoading(courseid, true);
	}else{
		hideLoading(courseid, false);
	}
	showControls(courseid);
}

function showAddingCohortLoader(){
	var element;
	element = YAHOO.util.Dom.get('add_cohort_title');
	YAHOO.util.Dom.setAttribute(element, 'style', 'display:none');
	element = YAHOO.util.Dom.get('add_cohort_loader');
	YAHOO.util.Dom.setAttribute(element, 'style', 'display:block');
	element = YAHOO.util.Dom.get('id_add_cohort_buttons');
	YAHOO.util.Dom.setAttribute(element, 'style', 'display:none');
}

function showAddingCohortTitle(){	
	var element;
	element = YAHOO.util.Dom.get('add_cohort_title');
	YAHOO.util.Dom.setAttribute(element, 'style', 'display:block');
	element = YAHOO.util.Dom.get('add_cohort_loader');
	YAHOO.util.Dom.setAttribute(element, 'style', 'display:none');
	element = YAHOO.util.Dom.get('id_add_cohort_buttons');
	YAHOO.util.Dom.setAttribute(element, 'style', 'display:block');
}

function showNoCurrentGroups(){
	var element;
	element = YAHOO.util.Dom.get('add_to_existing');
	YAHOO.util.Dom.setAttribute(element, 'style', 'display:none');
	element = YAHOO.util.Dom.get('no_existing_groups');
	YAHOO.util.Dom.setAttribute(element, 'style', 'display:block');
}

function showAddToExistingGroups(){
	var element;
	element = YAHOO.util.Dom.get('add_to_existing');
	YAHOO.util.Dom.setAttribute(element, 'style', 'display:block');
	element = YAHOO.util.Dom.get('no_existing_groups');
	YAHOO.util.Dom.setAttribute(element, 'style', 'display:none');
}

function setDatesDisabledAttribute(mapId, disabled){
	var element;
	element = YAHOO.util.Dom.get('id_' + mapId + '_map_day');
	element.disabled = disabled;
	element = YAHOO.util.Dom.get('id_' + mapId + '_map_month');
	element.disabled = disabled;
	element = YAHOO.util.Dom.get('id_' + mapId + '_map_year');
	element.disabled = disabled;
}

function createMappingXML(course_id, sits_code, type, academic_year, period_code, year_group,
		unenrol, date){	
	var XML;
	XML = "<?xml version='1.0' standalone='yes'?>";
	XML += '<map>';
	XML += '<course_id>' + course_id + '</course_id>';
	XML += '<manual>' + unenrol + '</manual>';
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
}

function toggle_dates(mapId)
{
	var element = YAHOO.util.Dom.get('id_' + mapId + '_map_unenrol_type');
	var disabled;
	if(1 === element.selectedIndex) {
		disabled = false;
	}else{
		disabled = true;
	}
	
	setDatesDisabledAttribute(mapId, disabled);
}

function get_years(date)
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
}

function get_months(date)
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
}

function get_days(date)
{
    days_html = '';
    var count;
    var day = date.getDate();
    for(count = 1; count < 31; count++)
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
}

function get_unenrolment_types(mapping)
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
}

function appendMappingToPage(mapping, newMap){
	
	var html, yeargroup, periodcode;	
	var sitscode = mapping.getElementsByTagName("sits_code")[0].firstChild.data;
	var acyear = mapping.getElementsByTagName("acyear")[0].firstChild.data;
	var course_id = mapping.getElementsByTagName("course_id")[0].firstChild.data;
	if(mapping.getElementsByTagName("type")[0].firstChild.data === 'module'){
		periodcode = mapping.getElementsByTagName("period_code")[0].firstChild.data;
		yeargroup = 'N/A';
	}else{	
		yeargroup = mapping.getElementsByTagName("year_group")[0].firstChild.data;
		periodcode = 'N/A';
	}	
	var default_map = mapping.getElementsByTagName("default")[0].firstChild.data;	
	var id = mapping.getElementsByTagName("id")[0].firstChild.data;	
	var date = new Date(mapping.getElementsByTagName("end_date")[0].firstChild.data);
	var year_options = get_years(date);
	var month_options = get_months(date);
	var day_options = get_days(date);
	var unenrol_type = get_unenrolment_types(mapping);	
	html = '<p class="course_detail" id="id_' + id + '">';
	if(newMap === true){
		html += '<strong class="mpg_category">NEWLY ADDED: </strong>';
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
	html += '<select id="id_' + id + '_map_unenrol_type" class="map_select" onchange="toggle_dates(' + id + ');enable_save(' + course_id + '); mapValueChange(' + id + ')">';
	html += unenrol_type;
	html += '</select>';
	html += '</span>';
	html += '<span class="date-selects"><span class="mpg_category"> Date: </span>';
	html += '<select class="day" id="id_' + id + '_map_day" class="map_select" onchange="enable_save(' + course_id + '); mapValueChange(' + id + ')">';
	html += day_options;
	html += '</select>';
	html += '<select class="month" id="id_' + id + '_map_month"  class="map_select" onchange="enable_save(' + course_id + '); mapValueChange(' + id + ')">';
	html += month_options;
	html += '</select>';
	html += '<select class="year" id="id_' + id + '_map_year" class="map_select" onchange="enable_save(' + course_id + '); mapValueChange(' + id + ')">';
	html += year_options;
	html += '</select>';
	if(default_map === '0'){
		html += '&nbsp&nbsp<input type="submit" class="map_submit" id="id_' + id + '_map_remove"  value ="Remove Cohort" onclick="toggle_delete(this,' + id + '); enable_save(' + course_id + ')"/>';
	}else{
		html += '&nbsp&nbsp<input type="submit" style="display:none" class="map_submit" id="id_' + id + '_map_remove"  value ="Remove Cohort" onclick="toggle_delete(this,' + id + '); enable_save(' + course_id + ')"/>';
		html += '<b>&nbsp&nbsp Default</b>';
	}
	html += '</span>';
	html += '</p>';
	var mapDiv = document.createElement('div');
	if(newMap === true){
		mapDiv.style.cssText = 'background-color: #BAD897;';
	}else{
		if(isEven(appendCount[course_id])){
			mapDiv.style.cssText = 'background-color: #DFDFDF;';
		}else{
			mapDiv.style.cssText = 'background-color: #EFEFEF;';
		}
	}
	mapDiv.innerHTML = html;
	mapDiv.id = 'id_' + id + '_map';
	mapDiv.className = id;
	YAHOO.util.Dom.get('id_' + course_id + '_mappings').appendChild(mapDiv);
	toggle_dates(id);
	appendCount[course_id]++;
	if(appendCount[course_id] === totalMaps[course_id]){
		showControls(course_id);
		loaderToClose(course_id);
		if(changes[course_id] !== true){
			var saveElement = YAHOO.util.Dom.get('id_' + course_id + '_save');
			YAHOO.util.Dom.setAttribute(saveElement, 'disabled', 'disabled');
		}
	}
}

function appendNoMapsToCourseDiv(courseid){
	var noMapDiv = document.createElement("div");
	html = '<p class="course_detail" id="id_' + courseid + '">';
	html += 'No current mappings exist for this course.';
	html +='</p>';
	noMapDiv.innerHTML = html;
	noMapDiv.id = 'id_' + courseid + '_no_maps';
	var element = YAHOO.util.Dom.get('id_' + courseid + '_mappings');
	element.appendChild(noMapDiv);
	showControls(courseid);
	loaderToClose(courseid);
	var saveElement = YAHOO.util.Dom.get('id_' + courseid + '_save');
	YAHOO.util.Dom.setAttribute(saveElement, 'disabled', 'disabled');	
}

function removeNoMapsToCourseDiv(courseid){
	var noMapElement = YAHOO.util.Dom.get('id_' + courseid + '_no_maps');
	if(noMapElement != null){
		noMapElement.parentNode.removeChild(noMapElement);
	}
}

function appendMappingToGroupsPage(mapping){
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
	setTextContent(option, 'SAMIS code:' + sitscode + ', Academic Year: ' + acyear + ' Period: ' + periodcode + ', Year of Study: ' + yeargroup);
	if(isEven(appendCount[course_id])){
		option.style.cssText = 'background-color: #DFDFDF;';
	}else{
		option.style.cssText = 'background-color: #EFEFEF;';
	}
	option.id = id;
	element = YAHOO.util.Dom.get('select_mappings');
	element.appendChild(option);
	appendCount[course_id]++;
	if(appendCount[course_id] === totalMaps[course_id]){
		hideGroupLoading();
	}
}

function appendNoMapsToGroupsPage(courseid){
	var noMapDiv = document.createElement("div");
	html = '<p class="course_detail" id="' + courseid + '">';
	html += 'No current mappings exist for this course.';
	html +='</p>';
	noMapDiv.innerHTML = html;
	var element = YAHOO.util.Dom.get('select_mappings');
	element.appendChild(noMapDiv);
	showControls(courseid);
	loaderToClose(courseid);
	element = YAHOO.util.Dom.get(courseid + '_save');
	YAHOO.util.Dom.setAttribute(element, 'disabled', 'disabled');	
}

function appendGroupToSelect(groupXml){
	var select = YAHOO.util.Dom.get('select_groups');
	var option = document.createElement("option");
	setTextContent(option, groupXml.getElementsByTagName("name")[0].firstChild.data);
	option.value = groupXml.getElementsByTagName("id")[0].firstChild.data;
	select.appendChild(option);
}

function asyncRequest(op, xml){	

	var responseSuccess;
	var i, n, errors, cid, xmlElements, xmlDoc, deleted, updated, message, getMapXML, srcXmlDoc, transaction, gid, courses, delElement;
	
	switch(op){
		case 'create_map':
			    responseSuccess = function(o) {
				if(o.responseText.match(/xml version/)){
					//Got an XML doc returned, must be a success				
					xmlDoc = loadXMLString(o.responseText);
					cid = xmlDoc.getElementsByTagName("course_id")[0].firstChild.data;
					xmlElements = xmlDoc.getElementsByTagName("map");
					totalMaps[cid] = xmlElements.length;
					appendCount[cid] = 0;
					if(xmlElements.length > 0){
						removeNoMapsToCourseDiv(cid);
						appendMappingToPage(xmlElements[0], true);						
					}
					showAddingCohortTitle();
					overlay.hide();
				}else{
					switch(o.responseText){
						case ERROR_COHORT_FAILED_SITS_VALIDATION:
							showAddingCohortTitle();
							alert('The cohort you have defined does not exist.  Please review and try again.');
							YAHOO.util.Dom.get('samis-module').activate();
						break;
						case ERROR_FAILED_TO_INSTANTIATE_COHORT:
							showAddingCohortTitle();
							alert('An error has meant the cohort you have defined has not been recognised.  Please contact an administrator.');
							YAHOO.util.Dom.get('samis-module').activate();
						break;
						case ERROR_FAILED_TO_CREATE_MAPPING:
							showAddingCohortTitle();
							alert('The application failed to create the mapping.  Please contact an administrator');
							YAHOO.util.Dom.get('samis-module').activate();
						break;
						case ERROR_MAPPING_ALREADY_EXISTS:
							showAddingCohortTitle();
							alert('This mapping already exists.');
							YAHOO.util.Dom.get('samis-module').activate();
						break;
						default:
							showAddingCohortTitle();
							alert('An unidentified error has occured.  Please contact an administrator');
						break;
					}
				}
			};
		break;
		case 'batch':
			    responseSuccess = function(o) {
				xmlDoc = loadXMLString(o.responseText);				
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
			        mapValueHasChanged[updated[n].firstChild.data] = false;
		        }
				for (i=0;i<courses.length;i++){
					//hideMappingsForCourse(courses[i].firstChild.data);
					disable_save(courses[i].firstChild.data);
					swapLoadMessageForControls(courses[i].firstChild.data, true);
				}	
			};
		break;
		case 'sync':
			    responseSuccess = function(o) {
				xmlDoc = loadXMLString(o.responseText);				
				errors = xmlDoc.getElementsByTagName("error");
				courses = xmlDoc.getElementsByTagName("course_id");
				if(errors.length > 0){
					for (i=0;i<errors.length;i++){ 
						alert(errors[i].firstChild.data);
					}			
				}
				for (i=0;i<courses.length;i++){
					swapLoadMessageForControls(courses[i].firstChild.data, true);
				}
				
			};
		break;	
		case 'adduser':
		case 'sync_all':
			    responseSuccess = function(o) {
				xmlDoc = loadXMLString(o.responseText);
				message = xmlDoc.getElementsByTagName("message");
				killBlur();
				alert(message[0].firstChild.data);
			};
		break;
		case 'get_map_ids':
			    responseSuccess = function(o) {
				xmlDoc = loadXMLString(o.responseText);
				cid = xmlDoc.getElementsByTagName("cid")[0].firstChild.data;
				xmlElements = xmlDoc.getElementsByTagName("id");
				totalMaps[cid] = xmlElements.length;
				appendCount[cid] = 0;
				if(xmlElements.length > 0){
					for (i=0;i<xmlElements.length;i++){
						getMapXML = "<?xml version='1.0' standalone='yes'?>";
						getMapXML += "<map><id>" + xmlElements[i].firstChild.data + "</id></map>"; 
						asyncRequest('get_map',getMapXML);
					}
				}else{
					srcXmlDoc = loadXMLString(xml);					
					appendNoMapsToCourseDiv(srcXmlDoc.getElementsByTagName("course_id")[0].firstChild.data);
				}
			};
		break;
		case 'get_map':
			    responseSuccess = function(o) {
				xmlDoc = loadXMLString(o.responseText);
				xmlElements = xmlDoc.getElementsByTagName("map");
				if(xmlElements.length > 0){
					appendMappingToPage(xmlElements[0], false);						
				}else{
					srcXmlDoc = loadXMLString(xml);					
					appendNoMapsToCourseDiv(srcXmlDoc.getElementsByTagName("course_id")[0].firstChild.data);
				}
			};
		break;
		case 'get_map_ids_group':
			    responseSuccess = function(o) {
				xmlDoc = loadXMLString(o.responseText);
				cid = xmlDoc.getElementsByTagName("cid")[0].firstChild.data;
				xmlElements = xmlDoc.getElementsByTagName("id");
				totalMaps[cid] = xmlElements.length;
				appendCount[cid] = 0;
				if(xmlElements.length > 0){
					for (i=0;i<xmlElements.length;i++){
						getMapXML = "<?xml version='1.0' standalone='yes'?>";
						getMapXML += "<map><id>" + xmlElements[i].firstChild.data + "</id></map>"; 
						asyncRequest('get_map_group', getMapXML);
					}
				}else{
					srcXmlDoc = loadXMLString(xml);					
					appendNoMapsToGroupsPage(srcXmlDoc.getElementsByTagName("course_id")[0].firstChild.data);
					hideGroupLoading();
				}
			};
		break;
		case 'get_map_group':
			    responseSuccess = function(o) {
				xmlDoc = loadXMLString(o.responseText);
				xmlElements = xmlDoc.getElementsByTagName("map");
				if(xmlElements.length > 0){
					appendMappingToGroupsPage(xmlElements[0]);						
				}else{
					srcXmlDoc = loadXMLString(xml);					
					appendNoMapsToGroupsPage(srcXmlDoc.getElementsByTagName("course_id")[0].firstChild.data);
				}
			};
		break;
		case 'get_groups':
		    responseSuccess = function(o) {
				xmlDoc = loadXMLString(o.responseText);
				cid = xmlDoc.getElementsByTagName("cid")[0].firstChild.data;
				xmlElements = xmlDoc.getElementsByTagName("group");
				if(xmlElements.length > 0){
					for (i=0;i<xmlElements.length;i++){
						appendGroupToSelect(xmlElements[i]);
					}
					showAddToExistingGroups();
				}else{
					showNoCurrentGroups();
				}
			};
		break;
		case 'create_group':
		    responseSuccess = function(o) {
				switch(o.responseText){
				case SUCCESS:
					srcXmlDoc = loadXMLString(xml);
					cid = srcXmlDoc.getElementsByTagName("course_id")[0].firstChild.data;
					update_group_list(cid);
					hideGroupLoading();					
				break;
				case FAILED_TO_CREATE_GROUP:
					hideGroupLoading();
					alert('An error has meant that the application failed to create the group');
				break;				
				case FAILED_TO_ADD_TO_GROUP:
					hideGroupLoading();
					alert('An error has meant that the application failed to add the chosen mapped cohorts to the group');
				break;
				default:
					hideGroupLoading();
					alert('An unidentified error has occured.  Please contact an administrator');
				break;
				}
			};
		break;
		case 'add_to_group':
		    responseSuccess = function(o) {
				switch(o.responseText){
				case SUCCESS:
					hideGroupLoading();
				break;
				case FAILED_TO_ADD_TO_GROUP:
					hideGroupLoading();
					alert('An error has meant that the application failed to add the chosen mapped cohorts to the group');			
					break;
				default:
					hideGroupLoading();
					alert('An unidentified error has occured.  Please contact an administrator');
				break;
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
	
	transaction = YAHOO.util.Connect.asyncRequest('POST', sUrl, callback, 'op=' + op + '&xml=' + escape(xml));
}
	
function create_batch_xml(courseid)
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
				if(mapValueHasChanged[mapping_id]){
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
}

function loadMappingsForCourse(courseid){
	changes[courseid] = false;
	var xml;
	var currentDiv = YAHOO.util.Dom.get('id_' + courseid + '_mappings');
	//Check if mappings are loaded, if so remove in order to reload 
	if(currentDiv !== null){
		currentDiv.parentNode.removeChild(currentDiv);
	}
	//Swap to loading gif
	loaderToLoad(courseid);
	//Add mappings div
	var mapDiv = document.createElement("div");
	mapDiv.id = 'id_' + courseid + '_mappings';
	YAHOO.util.Dom.get('id_' + courseid + '_content').appendChild(mapDiv);	
	//build XML for request
	xml = "<?xml version='1.0' standalone='yes'?>";
	xml += '<get_maps><course_id>' + courseid + '</course_id></get_maps>';
    //Kick off request
	asyncRequest('get_map_ids', xml);
}

function hideMappingsForCourse(courseid){
	var saveConfirm = true;
	if(changes[courseid] === true){					
		saveConfirm = confirm('You have made unsaved changes.  Click OK to close the course mappings without saving, or click cancel and then Save Changes.');
	}
		if(saveConfirm){
		var currentDiv = YAHOO.util.Dom.get('id_' + courseid + '_mappings');
		//Check if mappings are loaded, if so remove in order to reload 
		if(currentDiv !== null){
			currentDiv.parentNode.removeChild(currentDiv);
		}
		//Swap Plus/Minus buttons
		loaderToOpen(courseid);
		//Hide Controls
		var controlsElement = YAHOO.util.Dom.get('id_' + courseid + '_controls');
		YAHOO.util.Dom.setAttribute(controlsElement,'style', 'display:none;');
	}
}

function add_coursem(moodlecourse)
{
	window.open("samis_user_interface_addm.php?moodlecourse=" + moodlecourse,"mockup_4m","height=500,width=600,status=no,toolbar=no,menubar=no,scrollbars=1,location=no");
}

function view_groups_page()
{
	var courseSelect = YAHOO.util.Dom.get('grp_course');
	var courseid = courseSelect.options[courseSelect.selectedIndex].value;
	window.open('/group/index.php?id=' + courseid, '', 'height = 600px, width = 800px, scrollbars=yes');
}

function save_course_changes(courseid)
{
	var confirmed;
	confirmed = confirm('Please confirm  to save your changes to the mappings for course id ' + courseid);
	if(confirmed)
	{
		xml = create_batch_xml(courseid);
		swapControlsForLoadMessage(courseid, 'Saving Changes - please wait');
		asyncRequest('batch',xml);
		changes[courseid]=false;
	}
}

function sync_course(course_id){
	var confirmed;
	confirmed = confirm('Please confirm you would like to sync the Moodle course ' + course_id + ' with SAMIS');
	if(confirmed){
		var saveConfirm = true;
		if(changes[course_id] === true){					
			saveConfirm = confirm('You have made unsaved changes.  Click OK to continue without saving, or click cancel and then Save Changes before syncing.');
		}
		if(saveConfirm){
			xml = "<?xml version='1.0' standalone='yes'?><syncs><sync>" + course_id + "</sync></syncs>";
			swapControlsForLoadMessage(course_id, 'Syncing Course - please wait');
			asyncRequest('sync',xml);
		}
	}
}

function displayMapLoader(course_id){
	var loadDiv = document.createElement("div");
	loadDiv.id = 'id_' + course_id + "_load";
	loadDiv.className = 'liloader';
	var titleDiv = YAHOO.util.Dom.get('id_' + course_id + "_title");
	titleDiv.appendChild(loadDiv);
}

function exit()
{
	confirmed = confirm('Click OK to close the Cohorts and Groups interface');
	if(confirmed)
	{
		window.close();
	}
}

function display_add_module(moodle_course) {
    child = window.open("./samis_user_interface_addm.php?moodle_course=" + moodle_course,"addmodule", "height=600,width=587,status=yes,toolbar=no,menubar=no,scrollbars=1,location=no");
}

function add_module_to_mappings() {
	var year_group, period_code, mappingXML, typeElement;
	var titleElement = YAHOO.util.Dom.get('which-samis-module');
	var course_id = getTextContent(titleElement);
	var codeElement = YAHOO.util.Dom.get('samis-module');
	var sits_code = codeElement.value;
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
	
	mappingXML = createMappingXML(
			course_id,
			codeElement.value,
			type.options[type.selectedIndex].value,
			acYearElement.options[acYearElement.selectedIndex].value,
			period_code, 
			year_group,
			unenrolElement.options[unenrolElement.selectedIndex].value, 
			dateStringToSend
	);
	showAddingCohortLoader();
	asyncRequest('create_map', mappingXML);
}

function addModuleClick(courseid)
{
	setTextContent(YAHOO.util.Dom.get('which-samis-module'), courseid);
	overlay.show();
} 

function switchModuleType()
{
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
}

function toggle_delete(remButton, mapId)
{
	var mapElement = YAHOO.util.Dom.get('id_' + mapId);
	var enrolElment = YAHOO.util.Dom.get('id_' + mapId + '_map_unenrol_type');
	if(remButton.value === 'Remove Cohort') {
		remButton.value = 'Restore Cohort';
		setDatesDisabledAttribute(mapId, true);
		YAHOO.util.Dom.addClass(mapElement, 'disabled');
		YAHOO.util.Dom.setAttribute(enrolElment, 'disabled', 'disabled');
	} else {
		remButton.value = 'Remove Cohort';
		setDatesDisabledAttribute(mapId, false);
		YAHOO.util.Dom.removeClass(mapElement, 'disabled');
		YAHOO.util.Dom.setAttribute(enrolElment, 'disabled', '');
	}	
}

function update_cohort_list(courseid){
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
	asyncRequest('get_map_ids_group', xml);
}

function update_group_list(courseid) {
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
	asyncRequest('get_groups', xml);
}

function set_group_options(){
	showGroupLoading('Loading mapped cohorts - please wait');
	var selectElement;
	selectElement = YAHOO.util.Dom.get('grp_course');
	update_cohort_list(selectElement.options[selectElement.selectedIndex].value);
	update_group_list(selectElement.options[selectElement.selectedIndex].value);
}

function create_or_add_to_group(){
	
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
		showGroupLoading('Creating group - please wait');
	}else{
		op = 'add_to_group';
		groupElement = YAHOO.util.Dom.get('select_groups');
		xml += '<group_id>' + groupElement.options[groupElement.selectedIndex].value + '</group_id>';
		showGroupLoading('Adding selected cohorts to group - please wait');
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
	asyncRequest(op, xml);
}

function update_add_group()
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
}

function groupnameselect()
{
	var bx, rd;
	bx = YAHOO.util.Dom.get('groupname');
	rd = YAHOO.util.Dom.get('grp_radio_create');
	if(bx.value === 'Enter group name')
	{
		bx.value = '';
	}
	rd.checked="checked";
}

function groupexistselect()
{
	var rd;
	rd = YAHOO.util.Dom.get('grp_radio_exist');
	rd.checked="checked";
}

function switch_view(view)
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
}

function enable_save(courseid)
{
	YAHOO.util.Dom.get('id_' + courseid + '_save').disabled = false;
	changes[courseid] = true;
}

function mapValueChange(mapid)
{
	mapValueHasChanged[mapid] = true;
}


function disable_save(courseid)
{
	YAHOO.util.Dom.get('id_' + courseid + '_save').disabled = true;
	changes[courseid] = false;
}

function view_course(course_id){
	window.open('/blocks/sits/gui/views/participants.php?id=' + course_id, '', 'height = 600px, width = 800px, scrollbars=yes');
}

function add_user(){
	var bucs_id, fieldElement;
	fieldElement = YAHOO.util.Dom.get('bucs_id_input');
	bucs_id = fieldElement.value;
	if(validate_bucs_id(bucs_id)){
		var xml;
		xml = "<?xml version='1.0' standalone='yes'?>";
		xml += "<useradd>";
		xml += "<bucsid>" + bucs_id + "</bucsid>";
		xml += "</useradd>";

		blurScreen('Adding User - please wait');
		asyncRequest('adduser', xml);
		
	}else{
		alert('The username you have entered is not in a BUCS username format - please enter a valid BUCS username');
	}
}

function sync_all_courses(){
	var confirmed;
	confirmed = confirm('If you are absolutely sure you want to sync Each and Every Course In Moodle, go ahead and confirm.');
	if(confirmed)
	{
		blurScreen('Syncing All Courses - please wait');
		asyncRequest('sync_all',"<?xml version='1.0' standalone='yes'?><sync_all></sync_all>");
	}
}

function filterCourses(searchString){
	var searchPattern = new RegExp(searchString, 'i'); 
	var i;	
	var titleString, parentElement;
	var courseTitles = YAHOO.util.Dom.getElementsByClassName('course_title');
	for(i = 0; i < courseTitles.length; i++){
		titleString = getTextContent(courseTitles[i]);
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
}

function init() {
	overlay = new DialogOverlay($('pop-up-box').remove());
    $$('input.add').invoke('enable');
    switch_view('cohort');
    toggle_dates('add');
    set_group_options();
}

YAHOO.util.Event.onDOMReady(init);