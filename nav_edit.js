/*
created by Jennifer Lewis (jennifer.bobbe@citigroup.com)
at Graphic Communications (http://webgraphics)
*/

//global variables
/* 
These identify the variable that are used throughout the code.
On click sets most of them by selecting a Nav Item to be manipulated in some way.
*/
var HAVE_NOT_SUBMITTED_FORM = true;
var addNum = 1000;
var NEW_NAME = "";
var HIGHLIGHTED_NAME = "";
var NAV_ID 	= "";
var RANK 	= "";
var PARENT_ID = "";
var NEW_PARENT_ID = "";
var PARENT = "";
var NAV = "";
var NAV_NUM = "";
var STATE = "";
var NEXT_NAV = "";
var IMG_DIR = "\/website_editor\/img\/";

/* 
These are Move-related variables.
In the case of a move a second Nav item is selected as the 
spot to which the orginally selected item will be moved.
*/
var MOVE_MODE = false;
var MOVE_NAV_NAME = "";
var MOVE_NAV_ID 	= "";
var MOVE_RANK 	= "";
var MOVE_PARENT_ID = "";
var MOVE_NEW_PARENT_ID = "";
var MOVE_PARENT = "";
var MOVE_NAV = "";
var MOVE_NAV_NUM = "";
var MOVE_STATE = "";
var MOVE_NEXT_NAV = "";
//end of global variables

//functions for new UI
/* 
When a function is selected on the interface, the classnames of 
all of the functions are updated to indicate which has been selected.
Also the value of insert nav changes, which will trigger the proper
function (insert or rename) in the rest of this javascript.
*/
function changeLook(look){
	if (DEMO){
		if(look==1){
		document.getElementById('insert').className="enableNav";
		document.getElementById('addchild').className="disableNav";
		document.getElementById('reName').className="disableNav";
		document.getElementById('insertNav').value = "insert";
		}
		else if(look==2){
		document.getElementById('insert').className="disableNav";
		document.getElementById('addchild').className="enableNav";
		document.getElementById('reName').className="disableNav";
		document.getElementById('insertNav').value = "insert";
		}
		else if(look==3){
		document.getElementById('insert').className="disableNav";
		document.getElementById('addchild').className="disableNav";
		document.getElementById('reName').className="enableNav";
		document.getElementById('insertNav').value = "rename";
		}
	}		
	else if(!DEMO){
		if(look==1){
		document.getElementById('insert').className="enableNav";
		document.getElementById('reName').className="disableNav";
		document.getElementById('insertNav').value = "insert";
		}
		else if(look==3){
		document.getElementById('insert').className="disableNav";
		document.getElementById('reName').className="enableNav";
		document.getElementById('insertNav').value = "rename";
		}
	
	}	
}

//Nav item selection
/* 
Highlight(id) and changePage(id) are the 2 functions that are triggered
when a nav item is clicked.  The highlight() function jsut changes the appearance
of the nav (opened, closed, nav item selected is red, etc.).  changePage()
relates to the rest of the functionality. It decides where to send information 
about the nav item you've selected.

If a nav item is selected, and "move" is the selected action, then this javascript
is in "MOVE_MODE".  Then a second link must be selected as the location to move to.
Note that the information about the location to move to is also captured here in 
changePage().
*/

function changePage(theId){
	var myId = "dx" + theId;
	myElem = document.getElementById(myId);
	if (myElem)
		{
			if(!(MOVE_MODE)){
				
				var name = myElem.innerHTML;
				
				HIGHLIGHTED_NAME = name;
				document.getElementById("navName").innerHTML = name;
		
				sendId(myId);
			}
			else if(MOVE_MODE){
			
				var moveName = myElem.innerHTML;
				
				MOVE_NAV_NAME = moveName;					
				
				sendMoveId(myId);
				moveConfirm();
					
			}
		}
		else{
			return;	
		}
}

//Nav item selection
/* 
sendId(myId) sends information about the
nav item selected, based on id's, to the global variables.
It also cancels the selection of a nav item.
*/

function sendId(myId){
	//set variables based on highlight	
	if (myId!=0){
			NAV_ID 	= myId;
			NAV_NUM = NAV_ID.replace(/^dx/, "");
			RANK 	= document.getElementById(myId).getAttribute('rank');
			PARENT_ID = document.getElementById(myId).getAttribute('parentId');
			NAV = document.getElementById(NAV_ID).parentNode;
				if(PARENT_ID){
						NEW_PARENT_ID = "dx" + PARENT_ID;
						PARENT = document.getElementById(NEW_PARENT_ID).parentNode;
				}else if (!PARENT_ID){
						PARENT = NAV.parentNode;
				}
			STATE = NAV.lastChild.getAttribute("state");	
			NEXT_NAV = NAV.nextSibling;
	}else if(myId==0){
				document.getElementById("navName").innerHTML = "";
				HIGHLIGHTED_NAME = "";
				NAV_ID 	= "";
				RANK 	= "";
				PARENT_ID = "";
				NEW_PARENT_ID = "";
				PARENT = "";
				NAV = "";
				NAV_NUM = "";
				STATE = "";
				NEXT_NAV = "";	
	}
}

function isEmpty(myStr)
{
	return myStr.match(/^\s{0,}$/);
}
function testNewName(){
		var isBlank = isEmpty(NEW_NAME);
		if (isBlank){
				var myColl	= document.getElementsByTagName("INPUT");
				myColl[1].focus();
				alert("Please enter text for your new link name.");
				return false;
		}else{
				return true;
		}
}

//function for either type of insert
/* 
sendId(myId) sends information about the
nav item selected, based on id's, to the global variables.
It also cancels the selection of a nav item.
*/
function insertNavItem(){
	var isBlank = isEmpty(HIGHLIGHTED_NAME);
	if (isBlank){
			alert("Please select a link to rename\nor insert new links");
			return;
		}
	
	NEW_NAME = document.forms[0].newName.value;
	addNum++;
	
	if(document.forms[0].addNew[0].checked){
				addNavItem();
		}
		else if(document.forms[0].addNew[1].checked){
			if (DEMO){
					addNavChildItem();
			}		
			else if(!DEMO){
					renameNavItem();
			}	
		}
		if (DEMO){
			if(document.forms[0].addNew[2].checked){
				renameNavItem();
		}
		}
}

//rename nav item
/* 
This places the new name in the nav.  Items can only be
renamed in the nav prior to submitting to the database.
After they are submitted they must be renamed in the content editor.
*/
function renameNavItem(){
	HIGHLIGHTED_NAME = HIGHLIGHTED_NAME.replace(/&amp;/g,"&");
	NEW_NAME = NEW_NAME.replace(/&amp;/g,"&");
	if (!((STATE=="new")||(STATE=="withchildren"))){
		alert("This item, "+HIGHLIGHTED_NAME+", has already been saved.\nThe page must be renamed in the Content area.");
	}else{
		if (testNewName()){
				if(confirm("Are you sure you want to rename "+HIGHLIGHTED_NAME+" as "+NEW_NAME+"?")){
						NAV.lastChild.innerHTML = NEW_NAME;
						sendId(0);		
						highlight(0);
				}else{
						sendId(0);		
						highlight(0);
				}
		}// not blank
	}//if not new of with children
}

//adding a nav item at the same level as the selected link
function addNavItem(){
	if(NAV.className == "leftnav1"){
		alert("You cannot add another top level navigation item.");
		}else{
			if (testNewName()){
			var newItem = NAV.cloneNode(true);	
			var myParent = NAV.parentNode;
			var myClass = "";
			var myNext = "";
			var newRank = parseInt(RANK)+1;

				//either the new nav item is directly following the selected link,
				//or it is added after the selected links children.
				if (NEXT_NAV&&(NEXT_NAV.nodeName == "DIV")){
						myNext = NEXT_NAV.nextSibling;
						
					}else if (NEXT_NAV&&((NEXT_NAV.nodeName == "P")||(NEXT_NAV.nodeName=="FORM"))){	
						myNext = NEXT_NAV;	
					}
						//calls generic updateRank function.  Re-ranks the navs under the nav parent.
						updateRank(newItem,myParent,newRank);
						myClass = newItem.className;
						myClass = parseInt(myClass.replace(/^leftnav/, ""));
						
						
						rewriteInnerHtml(newItem,"new",addNum,newRank,myClass,NEW_NAME,PARENT_ID,false,false);	
							
								
				if(NEXT_NAV){	
				myParent.insertBefore(newItem,myNext);
						}
						else{	
				myParent.appendChild(newItem);
				}
			sendId(0);		
			highlight(0);
			}
		}
}

//adds a nav item one level down from the selected link
function addNavChildItem(){
	if (testNewName()){
	var myNext = "";
	var newItem = "";
	var myClass = "";
	var classNum = "";
	var newDiv = "";
	var numChildren = "";
	var newParent = "";
	var myState = "";
	var newRank = "";
	var changedRank = "";
	
	if (NEXT_NAV&&(NEXT_NAV.nodeName == "DIV")){//if the selcted link already has children
						//add new link as first in list of children
						myNext = NEXT_NAV.firstChild;
						newItem = myNext.cloneNode(true);
						myClass = newItem.className;
						classNum = parseInt(myClass.replace(/^leftnav/, ""));
						NEXT_NAV.insertBefore(newItem,myNext);	
						newParent = newItem.parentNode;
						newRank = newItem.lastChild.getAttribute("rank");
						updateRank(newItem,newParent,newRank);
						// rewrite child
						rewriteInnerHtml(newItem,"new",addNum,1,classNum,NEW_NAME,NAV_NUM,false,false);
						document.getElementById("cat" + NAV_NUM).style.display = "block";
						document["folder" + NAV_NUM].src = folderImg.src;												
							
					}else if(NAV){//selected link has no children, must create div
						
						newDiv = document.createElement("DIV");
						newDiv.style.display='none';
						var newDivId = "cat"+NAV_NUM;
						newDiv.setAttribute("id",newDivId);
						//now create the new child
						myClass = NAV.className;
		
						myClass = parseInt(myClass.replace(/^leftnav/, ""));					
						classNum = parseInt(myClass+1);
						
						rewriteInnerHtml(newDiv,"new",addNum,1,classNum,NEW_NAME,NAV_NUM,false,true);
						
								if (NEXT_NAV&&((NEXT_NAV.nodeName == "P")||(NEXT_NAV.nodeName=="FORM"))){
										myNext = NEXT_NAV;
										NEXT_NAV.parentNode.insertBefore(newDiv,myNext);
									}else{
										NAV.parentNode.appendChild(newDiv);
									}	
							
							myState = (STATE=="new")?"withchildren":STATE;
							myClass = parseInt(myClass);
							// rewrite the parent
							
							rewriteInnerHtml(NAV,myState,NAV_NUM,RANK,myClass,HIGHLIGHTED_NAME,PARENT_ID,true,false);
							//(item,state,id,rank,classNum,myText,parentId,isParent,isParagraph)
							//NAV.lastChild.style.color = "red";
							document.getElementById("cat" + NAV_NUM).style.display = "block";
							document["folder" + NAV_NUM].src = folderImg.src;
																											
						}
						sendId(0);
						highlight(0);
		}									
}


//seperate out rewrite function	
function rewriteInnerHtml(item,state,id,rank,classNum,myText,parentId,isParent,isParagraph){
/*types = 	child
			parent
			childwithparagraph */
		
	var myPara = "<p class='leftnav" + classNum + "'>";
	var imgLink ="<a href='javascript:toggleList(" + id + ");'>";
	var myImg = (isParent)?"collapsed.gif":"space.gif";

item.innerHTML = (isParagraph ? myPara : "")
					+(isParent ? imgLink : "")
						+"<img name='folder" + id + "' src='"+IMG_DIR + myImg +"' width='9' height='9' border='0'>"
							+(isParent ? "<\/a>" : "")						
								+ "&#160;<a class='leftnav"+ classNum + "' href='#' id='dx" + id + "' parentId='" + parentId +"' rank='" + rank + "' state='"+state+"' onClick='highlight(" + id +");changePage("+id+","+classNum+")'>" + myText + "<\/a>" 
					+(isParagraph ? "<\/p>" : "");
}

//re-usable function to update rank when a new item is added
function updateRank(myItem,myParent,newRank){
	var numChildren = myParent.childNodes.length;
	var myChild = "";
	var compRank = "";
	var changedRank = "";
	var myState = "";
		for (var i=0; i<numChildren; i++){				
				if(myParent.childNodes.item(i).nodeName =="P"){
							myChild = myParent.childNodes.item(i).lastChild;
							compRank = parseInt(myChild.getAttribute("rank"));
						if (compRank >= newRank){
								changedRank = parseInt(compRank) + 1;
								myChild.setAttribute("rank", parseInt(changedRank));
								myState = myChild.getAttribute("state");
									if(myState=="unchanged"){
											myChild.setAttribute("state", "updated");
											}
								}
						}
			}// for numChildren

}

//function that allows moving nav item up or down (under its parent)
//re-ranks all siblings 
function move(dir){

	if (NAV_ID == "")
	{
			alert("Please select a link to move up or down.");
			return;
	}
	else
	{
		if(NAV.className == "leftnav1")
		{
			alert("You cannot move a top level navigation item.");
		}
		else
		{
			var myParent = PARENT.nextSibling;
			var numChildren = eval(myParent.childNodes.length);
			var myChild = "";
			var compRank = "";
			var changedRank = "";
			var myState = "";
			var myRank = 1;
			//make the ranks make sense first.
			for (var i=0; i<numChildren; i++)
			{			
				if(myParent.childNodes.item(i).nodeName =="P")
				{	
					myChild = myParent.childNodes.item(i).lastChild;
					myChild.setAttribute("rank", parseInt(myRank));												
					myRank = eval(myRank+1);
				}
			}
			
			var changedRank = parseInt(NAV.lastChild.getAttribute("rank"));
			if(dir=="up")
			{
				compRank = parseInt(changedRank - 1);
				var PREV_NAV = NAV.previousSibling;
				var myPrev;
				var myItem = NAV.cloneNode(true);
				var myItemSub = false;
				if(compRank==0)
				{
					alert("You cannot move the ranking of this item up beyond its current position.\nYou may need to use 'move' to accomplish your goals.");
					return false;			
				}
				else
				{
					if (NEXT_NAV && NEXT_NAV.nodeName == "DIV")
					{
						myItemSub = true;							
					}
					if (PREV_NAV)
					{
						if(PREV_NAV.nodeName == "DIV")
						{
							myPrev = PREV_NAV.previousSibling;
						}
						else
						{
							myPrev = PREV_NAV;			
						}
					}	
					NAV.removeNode(true);
					myParent.insertBefore(myItem,myPrev);
					if(myItemSub)
					{
						var myNewItemSub = NEXT_NAV.cloneNode(true);
						NEXT_NAV.removeNode(true);
						myParent.insertBefore(myNewItemSub,myPrev);
					}											
							
				}	
			}
			else
			{	
				compRank = parseInt(changedRank + 2);
				var myNext;
				var myItem = NAV.cloneNode(true);
				var myItemSub = false;
				
				if (compRank>myRank)
				{
					alert("You cannot move the ranking of this item down beyond its current position.\nYou may need to use 'move' to accomplish your goals.");
					return false;
				}
				else
				{
					
					if (NEXT_NAV.nodeName == "DIV")
					{
						myNext = NEXT_NAV.nextSibling;
						myItemSub = true;
									
					}else if (NEXT_NAV.nodeName == "P"){	
						myNext = NEXT_NAV;
					}
			
					if(myNext.nextSibling)
					{
						if(myNext.nextSibling.nodeName == "DIV")
						{
							myNext = myNext.nextSibling.nextSibling;
						}
						else
						{
							myNext = myNext.nextSibling;		
						}
					}	
					
					if (compRank==myRank)
					{	
						NAV.removeNode(true);
						myParent.appendChild(myItem);
						if(myItemSub)
						{
							var myNewItemSub = NEXT_NAV.cloneNode(true);
							NEXT_NAV.removeNode(true);
							myParent.appendChild(myNewItemSub);
						}
						
					}
					else
					{					
						NAV.removeNode(true);
						myParent.insertBefore(myItem,myNext);					
						if(myItemSub)
						{
							var myNewItemSub = NEXT_NAV.cloneNode(true);
							NEXT_NAV.removeNode(true);
							myParent.insertBefore(myNewItemSub,myNext);		
						}
					}								
				}//end of can move
			}//end of dir down	
			var myNewRank = 1;	
			for (var i=0; i<numChildren; i++)
			{				
				if(myParent.childNodes.item(i).nodeName =="P")
				{
					myChild = myParent.childNodes.item(i).lastChild;
					myChild.setAttribute("rank", parseInt(myNewRank));
	
					myState = myChild.getAttribute("state");
					if(myState=="unchanged")
					{
							myChild.setAttribute("state", "updated");
					}								
					myNewRank = myNewRank+1;					
				}
			}																		
		sendId(0);
		highlight(0);		
					
		}//end of not top level	
	}//end of something is selected
}

//delete unsaved nav items
//saved items must be deleted in the content area
function deleteNavItem(){

	var isBlank = isEmpty(HIGHLIGHTED_NAME);
	if (isBlank){
			alert("Please select a link to delete.");
			return;
		}else{
	HIGHLIGHTED_NAME = HIGHLIGHTED_NAME.replace(/&amp;/g,"&");
		if (!((STATE=="new")||(STATE=="withchildren"))){	
			alert("This item, "+HIGHLIGHTED_NAME+", has already been saved.  The page must be deleted in the Content area.");
			}else{		
		if (NEXT_NAV&&(NEXT_NAV.nodeName == "DIV")){//if the item is new and has children
	//children must also all be new -- isNotNew can only be true in a move
			var numChildren = NEXT_NAV.childNodes.length;
			var myState = "";
			var isNotNew = false;
			for (var i=0; i<numChildren; i++){				
				if(NEXT_NAV.childNodes.item(i).nodeName =="P")
				{
					myChild = NEXT_NAV.childNodes.item(i).lastChild;
					myState = myChild.getAttribute("state");
					if(!((myState=="new")||(myState=="withchildren")))
					{
						isNotNew = true;
					}
				}
			}
	
				if(isNotNew){
					alert("This item, "+HIGHLIGHTED_NAME+", has subcategories that have already been saved.  Those pages must be deleted in the Content area.");					
				}
				else{
					if(confirm("Are you sure you want to delete "+HIGHLIGHTED_NAME+" and all of its subcategories?"))
						{
						
							NAV.removeNode(true);
							NEXT_NAV.removeNode(true);
						
						}
			}
												
			}else{//nav to be removed has no children
									if(confirm("Are you sure you to delete "+HIGHLIGHTED_NAME+"?")){
									
										NAV.removeNode(true);
									
									}
							}
						if((PARENT_ID)&&(!document.getElementById('cat'+PARENT_ID).hasChildNodes())){//either way, last child
									updateParentofNav();//updates parent to remove div for subnodes
								}//last child
								
				sendId(0);		
				highlight(0);		
										
				}// end isNew
			}	
}						

/*
on submit -- Change all nav items to textareas.
The text area names are formatted for processing by Java on submit.
*/
function submitNav(func){
	if (HAVE_NOT_SUBMITTED_FORM){
	HAVE_NOT_SUBMITTED_FORM = false;
	var myForm = document.forms[1];
	
	/*
	This function was replaced by move(dir)
	if(func=="editRank")
	{
		var isBlank = isEmpty(HIGHLIGHTED_NAME);
		if (isBlank)
		{
			alert("Please select a link to\nrank subcategories.");
			HAVE_NOT_SUBMITTED_FORM = true;
			return;
		}
		else
		{
			if(!(NEXT_NAV&&(NEXT_NAV.nodeName == "DIV")))
			{
				alert("This item has no subcategories.\nSelect an item with subcategories to change rank.");
				HAVE_NOT_SUBMITTED_FORM = true; 
				return;
			}
			else
			{
				myForm.nav_id.value = NAV_NUM;
			}
		}
	}
	*/
	
	myForm.style.display = "none";	
	var myColl = myForm.getElementsByTagName("P");
	var myLength = myColl.length;
	var myA = "";
	var myState = "";
	var myRank = "";
	var myNavId = "";
	var myParentId = "";
	var newItem = "";
	var myName = "";
	var myText = "";
		for (var k=0; k<myLength; k++){
					myA = myColl.item(k).lastChild;
					myState = myA.getAttribute('state');
						if(myState!="unchanged"){
							myNavId = myA.getAttribute('id');
							myNavId = myNavId.replace(/^dx/, "");
							myParentId = myA.getAttribute('parentId');
							if(!myParentId)myParentId="0";
							myRank = myA.getAttribute('rank');
							myText = fixUnsupportedChars(myA.innerHTML);						
							newItem = document.createElement("textarea");					
							//putting information in format for Java	
							myName = "nav"+myState + "_"+ myNavId + "_"+myRank+ "_"+myParentId;							
							
							newItem.innerHTML = myText;
							newItem.name = myName;
							myForm.appendChild(newItem);
					}
				}
				
	myForm.action.value=func;		
	myForm.submit();
	}	
		
}

//move functions
/*
This sets up the first part of the move -- processes the link selected to move 
and provides instructions for the second part.
*/
function moveIt(){
	var isBlank = isEmpty(HIGHLIGHTED_NAME);
	if (isBlank){
			alert("Please select a link\nto move with its subcategories.");
			return;
		}else{
			var myNewClass = NAV.className;
			if ((MOVE_PARENT_ID==NAV_ID)||(myNewClass=="leftnav1")){
				alert("This move is unauthorized.  Please try again.");
				sendMoveId(0);
				return false;
			}else{
					HIGHLIGHTED_NAME = HIGHLIGHTED_NAME.replace(/&amp;/g,"&");
					var subCatStr = "";
					if(NEXT_NAV&&(NEXT_NAV.nodeName == "DIV")){
						subCatStr = " and all its subcategories";
					}
					alert("Click on the link where you would like to move\n"+HIGHLIGHTED_NAME+subCatStr);			
					MOVE_MODE = true;
					document.getElementById("moveDir").innerHTML = "<strong>Please select the link where you will move<br \/><\/strong>";
		document.getElementById("moveName").innerHTML=HIGHLIGHTED_NAME;
			}		
		}	
}

/*
This function sets the global variables for the second part of the move --
the location to be moved to.  Also clears these variables when the move is
cancelled or completed.
*/
function sendMoveId(myId){
	//set variables based on item selected
	if (myId!=0){	
		MOVE_NAV_ID = myId;
		MOVE_NAV_NUM =  MOVE_NAV_ID.replace(/^dx/, "");
		MOVE_RANK = document.getElementById(myId).getAttribute('rank');
		MOVE_PARENT_ID = document.getElementById(myId).getAttribute('parentId');
		MOVE_NAV = document.getElementById(MOVE_NAV_ID).parentNode;
		if(MOVE_PARENT_ID)
		{
				MOVE_NEW_PARENT_ID = "dx" + MOVE_PARENT_ID;
				MOVE_PARENT = document.getElementById(MOVE_NEW_PARENT_ID).parentNode;
		}
		else if (!MOVE_PARENT_ID)
		{
				MOVE_PARENT = MOVE_NAV.parentNode;
		}
	MOVE_STATE = MOVE_NAV.lastChild.getAttribute("state");	
	MOVE_NEXT_NAV = MOVE_NAV.nextSibling;
	}
	else if(myId==0)
	{
		document.getElementById("moveName").innerHTML = "";
		document.getElementById("moveDir").innerHTML = "";
		MOVE_NAV_NAME = "";
		MOVE_NAV_ID 	= "";
		MOVE_RANK 	= "";
		MOVE_PARENT_ID = "";
		MOVE_NEW_PARENT_ID = "";
		MOVE_PARENT = "";
		MOVE_NAV = "";
		MOVE_NAV_NUM = "";
		MOVE_STATE = "";
		MOVE_NEXT_NAV = "";	
	}
}

//confirm that the user understands what they're doing.
function moveConfirm(){
HIGHLIGHTED_NAME = HIGHLIGHTED_NAME.replace(/&amp;/g,"&");
MOVE_NAV_NAME = MOVE_NAV_NAME.replace(/&amp;/g,"&");
var subCatStr = "";
if(NEXT_NAV&&(NEXT_NAV.nodeName == "DIV")){
	subCatStr = " and all its subcategories";
}
document.getElementById("moveDir").innerHTML = "You are moving <strong>"+HIGHLIGHTED_NAME+"<\/strong>"+subCatStr+" as a subcategory under ";

document.getElementById("moveName").innerHTML = MOVE_NAV_NAME;

MOVE_NAV_NAME;		

if(confirm("Do you want to move "+HIGHLIGHTED_NAME+subCatStr+"\nas a subcategory under "+MOVE_NAV_NAME+"?")){
				moveAsChild();
			}else{
				//if not confirmed, reset everything				
				MOVE_MODE = false;
				sendId(0);
				sendMoveId(0);
				highlight(0);	
		}

}

//generic function to update the classnames of nav items
function updateClass(myDiv,classDiff){
	var myDivColl = myDiv.getElementsByTagName("P");
	var myDivLength = myDivColl.length;
	var myP = "";
	var myPClass = "";
	var newClass = "";
		for (var k=0; k<myDivLength; k++){
						myP = myDivColl.item(k);
						myPClass = myP.className;
						myPClass = parseInt(myPClass.replace(/^leftnav/, ""));
						newClass = parseInt(myPClass + classDiff);
						
						newClass = "leftnav" + newClass;
						myP.className = newClass;
						myP.lastChild.className = newClass;												
					}		

}

function updateParentofNav(){
//if moved element was last child need to alter parent to reflect this
//of if parent now has new child								
						document.getElementById('cat'+PARENT_ID).removeNode(true);
						var parentState = PARENT.lastChild.getAttribute("state");
						var parentParentId = PARENT.lastChild.getAttribute("parentId");
						var parentRank = PARENT.lastChild.getAttribute("rank");
						var parentText = PARENT.lastChild.innerHTML;
						var parentClass = PARENT.className;
						parentClass = parseInt(parentClass.replace(/^leftnav/, ""));
							//rewrite Parent
							if (parentState=="withchildren"){
				rewriteInnerHtml(PARENT,"new",PARENT_ID,parentRank,parentClass,parentText,parentParentId,false,false);				
							}
							else{						
			rewriteInnerHtml(PARENT,parentState,PARENT_ID,parentRank,parentClass,parentText,parentParentId,false,false);
									
							}
}

/* this is the main move function */
	
function moveAsChild(){

			var myNewClass = NAV.className;
		    var myClass = MOVE_NAV.className;
			var myRank = "";
			var myState = "";
			var newRank = parseInt(MOVE_RANK)+1;
			var myNext = "";
			var myLast = "";
			
			myClass = parseInt(myClass.replace(/^leftnav/, ""));
			
			classNum = parseInt(myClass+1);
			
			myNewClassNum = parseInt(myNewClass.replace(/^leftnav/, ""));		
			var classDiff = parseInt(classNum - myNewClassNum);
			NAV.className = "leftnav" + classNum;
		
			if ((STATE=="unchanged")||(STATE=="updated")){
									myState = "moved";
						}else{
									myState = STATE;
						}
		//if the "move to" location already has children				
		if (MOVE_NEXT_NAV&&(MOVE_NEXT_NAV.nodeName == "DIV")){
					myLast = MOVE_NEXT_NAV.lastChild;
					if (myLast.nodeName == "DIV"){
						myLast = myLast.previousSibling;
						}
						
						myRank = parseInt(myLast.lastChild.getAttribute("rank"));
						myRank++;
						
						MOVE_NEXT_NAV.appendChild(NAV);	
								
				if (NEXT_NAV&&(NEXT_NAV.nodeName == "DIV")){//the item being moved is a parent
								rewriteInnerHtml(NAV,myState,NAV_NUM,myRank,classNum,HIGHLIGHTED_NAME,MOVE_NAV_NUM,true,false);
								updateClass(NEXT_NAV,classDiff);
								MOVE_NEXT_NAV.appendChild(NEXT_NAV);
														
					}else{//item being moved is not a parent
							
								rewriteInnerHtml(NAV,myState,NAV_NUM,myRank,classNum,HIGHLIGHTED_NAME,MOVE_NAV_NUM,false,false);
						
					}	
						if((PARENT_ID)&&(!document.getElementById('cat'+PARENT_ID).hasChildNodes())){//if moved element was last child at its former location				
							
							updateParentofNav();
						}
					//arbitrary decision to display what you just moved		
					document.getElementById("cat" + MOVE_NAV_NUM).style.display = "block";
					document["folder" + MOVE_NAV_NUM].src = folderImg.src;
					if(NEXT_NAV&&(NEXT_NAV.nodeName == "DIV")){
					document.getElementById("cat" + NAV_NUM).style.display = "block";
					document["folder" + NAV_NUM].src = folderImg.src;
					}
										
		}else if (MOVE_NAV){			
		//if the "move to" location has no children must create new div
					newDiv = document.createElement("DIV");
					newDiv.style.display='none';
					var newDivId = "cat"+MOVE_NAV_NUM;
					newDiv.setAttribute("id",newDivId);
						
					//rewriting the moved element
					if (NEXT_NAV&&(NEXT_NAV.nodeName == "DIV")){		
						rewriteInnerHtml(newDiv,myState,NAV_NUM,1,classNum,HIGHLIGHTED_NAME,MOVE_NAV_NUM,true,true);
					}else{
						rewriteInnerHtml(newDiv,myState,NAV_NUM,1,classNum,HIGHLIGHTED_NAME,MOVE_NAV_NUM,false,true);
					}
					//inserting the moved element 				
					if (MOVE_NEXT_NAV&&((MOVE_NEXT_NAV.nodeName == "P")||(MOVE_NEXT_NAV.nodeName=="FORM"))){
						
								MOVE_NEXT_NAV.parentNode.insertBefore(newDiv,MOVE_NEXT_NAV);
					}else{
								MOVE_NAV.parentNode.appendChild(newDiv);
					}
					//insert of the nav and its children are seperate here				
					if (NEXT_NAV&&(NEXT_NAV.nodeName == "DIV")){
					
							updateClass(NEXT_NAV,classDiff);
							//insert child div if it exists
							newDiv.appendChild(NEXT_NAV);
									
					}
				
					// we have recreated the nav Item so we have to delete it

					NAV.removeNode(true);
					if((PARENT_ID)&&(!document.getElementById('cat'+PARENT_ID).hasChildNodes())){
					//if moved element was last child
					updateParentofNav();
					}					
							
				// rewrite the newly created parent
			var myMoveState = "";
			if(MOVE_STATE=="new"){
					myMoveState="withchildren";}
			else{
					myMoveState = MOVE_STATE;
			}
			
			rewriteInnerHtml(MOVE_NAV,myMoveState,MOVE_NAV_NUM,MOVE_RANK,myClass,MOVE_NAV_NAME,MOVE_PARENT_ID,true,false);		
			
											
			document.getElementById("cat" + MOVE_NAV_NUM).style.display = "block";
			document["folder" + MOVE_NAV_NUM].src = folderImg.src;
			if(NEXT_NAV&&(NEXT_NAV.nodeName == "DIV")){
				document.getElementById("cat" + NAV_NUM).style.display = "block";
				document["folder" + NAV_NUM].src = folderImg.src;
			}
						
		}//end of "if no children previous to this move"
			//reset everything
			MOVE_MODE=false;
			sendId(0);
			sendMoveId(0);
			highlight(0);					
}
