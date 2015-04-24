define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/FileManagerColumnMapper.html",
    "dojo/_base/lang",
    "dojo/promise/all",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/query",
    "dojo/on",
    "dijit/registry",
    "xpo/form/DropDownTree",
    "dojo/NodeList-manipulate",
    "dojo/NodeList-dom",
    "dojo/NodeList-traverse"
], function (declare,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	TEMPLATE,
	lang,
	all,
	domStyle,
	domConstruct,
	query,
	on,
	registry,
	DropDownTree) {

	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		templateString: TEMPLATE,
		fieldname: "",
		valueId: "value",
		nameId: "name",
		_listSubItems: [],
		columns: [],
		//This is column selector for cloning
		columnSelectTemplate: null,
		//This is operation selector for cloning
		operationSelectTemplate: null,
		//This is operation selector setUnset dropdown
		setUnsetTemplate: domConstruct.create("select", {
			"class": "filemanager-column-mapper-attribute-value-select",
			innerHTML: "<option value=\"1\" selected=\"true\">Set Attribute</option><option value=\"0\">Unset Attribute</option>"
		}),

		postCreate: function () {
			var me = this;

			me.inherited(arguments);

			me._buildColumnSelectTemplate()
				._buildOperationSelectTemplate()
				._addHeader()
				._addRow();


			//me._setValue();
		}, //end postCreate()

		_addHeader: function () {
			var me = this,
				rowNode;
				//add columns of various widths with the inner html
				rowNode = domConstruct.create("div", {
									"class": "filemanager-column-header-row"
				}, me.headHolder);
				domStyle.set(rowNode, "display", "block");
				domStyle.set(rowNode, "font-size", "12px");


				var firstCell = domConstruct.create("div", {
													"class": "help-block",
													innerHTML: "Imported File<br/ > Column Header"
								}, rowNode);
							domStyle.set(firstCell, "width", "150px");
				var secondCell = domConstruct.create("div", {
													"class": "help-block",
													innerHTML: "Condition/ Operator"
												}, rowNode);
							domStyle.set(secondCell, "width", "80px");
							domStyle.set(secondCell, "margin-left", "5px");
				var thirdCell = domConstruct.create("div", {
													"class": "help-block",
													innerHTML: "Imported Column Value"
												}, rowNode);
							domStyle.set(thirdCell, "width", "155px");
							domStyle.set(thirdCell, "margin-right", "5px");
				var fourthCell = domConstruct.create("div", {
													"class": "help-block",
													innerHTML: "&nbsp;"
												}, rowNode);
							domStyle.set(fourthCell, "width", "40px");
				var fifthCell = domConstruct.create("div", {
													"class": "help-block",
													innerHTML: "Action"
												}, rowNode);
							domStyle.set(fifthCell, "width", "108px");

				var sixthCell = domConstruct.create("div", {
													"class": "help-block",
													innerHTML: "Attribute/Value"
												}, rowNode);
							domStyle.set(sixthCell, "width", "200px");
			return me;
		},

		_addRow: function (referenceNode, map, val, noshow) {
			var me = this,
				myId = "",
				pathId = "",
				myMap,
				rowNode;

			if(typeof map == "undefined")
				map = {
					columnIdentifier: "",
					matchType: "EQUALS",
					startValue: "",
					endValue: "",
					attributeid: -1,
					attributeValue: ""
				};

			if(typeof referenceNode != "undefined")
				rowNode = domConstruct.create("div", {
					"class": "filemanager-column-mapper-row"
				}, referenceNode, "after");
			else
				rowNode = domConstruct.create("div", {
					"class": "filemanager-column-mapper-row"
				}, me.rowHolder);

			var columnSelect = domConstruct.place(lang.clone(me.columnSelectTemplate), rowNode),
				operationSelect = domConstruct.place(lang.clone(me.operationSelectTemplate), rowNode),
				valueStart = domConstruct.create("input", {
					"class": "filemanager-column-mapper-value-start"
				}, rowNode),
				valueEnd = domConstruct.create("input", {
					"class": "filemanager-column-mapper-value-end"
				}, rowNode),
				ddtArg = {
						target: dojo.replace("/ssvui/org/{0}/segmentattribute", [orgid]),
						idAttribute: "attributeid",
						labelAttr: "name",
						persist: false,
						showRoot: false,
						openOnClick: false,
						modelType: "Attribute",
						onItemChange: function(item){
							if(val) item = val;
							if(item.idPath) pathId = item.idPath;
							var segmentValueIdx = query(".filemanager-column-mapper-attribute-value-select", rowNode )[0];
							segmentValueIdx.setAttribute("data-size", item.size);
							if(typeof item.sourcecode != "undefined")
								segmentValueIdx.setAttribute("data-sourcecode", item.sourcecode);
							else
								segmentValueIdx.setAttribute("data-sourcecode", item.segmentId + ":" + item.segmentValueIdx);

							if(item.size == "SM"){
								segmentValueIdx.removeAttribute("disabled");
								myId = "";
								domStyle.set(autoExpandButton, "display", "none");
							 } else {
								segmentValueIdx.setAttribute("disabled", "disabled");
								var idx = typeof item.sourcecode != "undefined" ? item.sourcecode.substring( item.sourcecode.indexOf(":") +1) : item.segmentValueIdx,
								os = query(".filemanager-column-mapper-operation-select",rowNode)[0];
								myId = item.attributeid;
								domStyle.set(autoExpandButton, "display", "inline-block");
								if(item.children === false){
									domStyle.set(autoExpandButton, "display", "none");
								}
								if((idx && !isNaN(idx) && parseInt(idx)) > 0 || os.value == "DIRECT")
									segmentValueIdx.value = "1";
								else
									segmentValueIdx.value = "0";
							}
						}
					};

			domStyle.set(valueStart, "width", "155px");
			domStyle.set(valueStart, "margin-right", "5px");
			domStyle.set(valueEnd, "display", "none");

			operationSelect.onchange = function () {
				var dropDownTree = registry.getEnclosingWidget(query(".filemanager-column-mapper-attribute-select",rowNode)[0]),
				segmentValueIdx = query(".filemanager-column-mapper-attribute-value-select", rowNode )[0];
				if(this.value == "BETWEEN" || this.value == "DAYSBET") {
					domStyle.set(valueEnd, "display", "inline-block");
					domStyle.set(valueStart, "width", "75px");
				} else {
					domStyle.set(valueStart, "width", "155px");
					domStyle.set(valueStart, "margin-right", "5px");
					domStyle.set(valueEnd, "display", "none");
				};

				if(this.value == "DIRECT") {
					ddtArg.modelType = "Segment";
					segmentValueIdx.setAttribute("disabled", "disabled");
					segmentValueIdx.value = "1";
				} else {
					ddtArg.modelType = "Attribute";
					segmentValueIdx.removeAttribute("disabled");
					var size = segmentValueIdx.getAttribute("data-size");
					if(size == null || size == "SM")
						segmentValueIdx.removeAttribute("disabled");
					 else {
						segmentValueIdx.setAttribute("disabled", "disabled");
						var idx = segmentValueIdx.getAttribute("data-sourcecode") == null ? null : segmentValueIdx.getAttribute("data-sourcecode").substring( segmentValueIdx.getAttribute("data-sourcecode").indexOf(":") +1);
						if((idx && !isNaN(idx)) || this.value == "DIRECT")
							segmentValueIdx.value = "1";
						else
							segmentValueIdx.value = "0";
					}
				}

				if(this.value == "ANY" || this.value == "DIRECT") {
						valueStart.setAttribute("disabled", "disabled");
						valueStart.value = "";
						valueEnd.value = "";
					} else {
						valueStart.removeAttribute("disabled");
				}

				var oldDDt = registry.getEnclosingWidget(query(".filemanager-column-mapper-attribute-select",rowNode)[0]);
				var dropDownTree = null;
				if(oldDDt && ddtArg.modelType != oldDDt.modelType) {
					dropDownTree = new DropDownTree(ddtArg);
					domConstruct.place(dropDownTree.domNode,oldDDt.domNode, "after");// changed from before
					oldDDt.destroy();
				} else if(oldDDt == null) {
					dropDownTree = new DropDownTree(ddtArg);
					domConstruct.place(dropDownTree.domNode,segmentValueIdx, "after");// changed from before
				}

				if(dropDownTree){
					domStyle.set(dropDownTree.domNode, "width", "200px");
					domStyle.set(dropDownTree.domNode.firstChild, "display", "block");
					domStyle.set(dropDownTree.containerNode, "width", "180px");
					dropDownTree.domNode.classList.add("filemanager-column-mapper-attribute-select");
				}
			};

			var myStatementCell = domConstruct.create("div", {
									"class": "help-block",
									title: "THEN",
									innerHTML: "THEN"
				}, rowNode);
			domStyle.set(myStatementCell, "width", "40px");
			domStyle.set(myStatementCell, "display", "inline-block");

			var attributeValueSelect =
				domConstruct.place(lang.clone(me.setUnsetTemplate), rowNode),
				removeHolder = domConstruct.create("div", { "class": "remove-btn-holder btn-holder" }, rowNode),
				removeButton = domConstruct.create("button", {
					"class": "btn btn-default top-action-button btn-xs minus-btn",
					title: "Remove Mapping",
					value: "",
					type:"button",
					innerHTML: "<i class=\"fa fa-minus\" style=\"color: red;\"></i>"
				}, removeHolder),
				addHolder = domConstruct.create("div", { "class": "add-btn-holder btn-holder" }, rowNode),
				addButton = domConstruct.create("button", {
					"class": "btn btn-default top-action-button btn-xs plus-btn",
					title: "Add Mapping",
					value: "",
					type:"button",
					innerHTML: "<i class=\"fa fa-plus\" style=\"color: green;\"></i>"
				}, addHolder);

				addButton.onclick = function () {
					me._addRow(rowNode);
				};

				removeButton.onclick = function () {
					me.rowHolder.removeChild(rowNode);
					me._handleDeleteButtonVisibility();
				};

				me._handleDeleteButtonVisibility();

				var autoExpandButton =  domConstruct.create("button", {
					"class": "btn btn-default expand-button",
					title: "Auto Expand",
					value: "",
					type:"button",
					innerHTML: "Auto-Expand All States"
				}, rowNode);
				if(me.myId != "" && !(noshow)){
					domStyle.set(autoExpandButton, "display", "inline-block");
				}
				if(noshow || pathId.length > 18){
					domStyle.set(autoExpandButton, "display", "none");
				}

				autoExpandButton.onclick = function() {
						map.columnIdentifier = columnSelect.value;
						map.endValue = valueEnd.value;
						map.startValue = valueStart.value;
						map.matchType = operationSelect.value;
						me._explodeListItems(rowNode,map,myId);

						domStyle.set(autoExpandButton, "display", "none");
				};

			if(map.matchType == "BETWEEN" || map.matchType == "DAYSBET") {
				domStyle.set(valueEnd, "display", "inline-block");
				domStyle.set(valueStart, "width", "75px");
			}
			if(typeof map != "undefined"){
				columnSelect.value = map.columnIdentifier;
				operationSelect.value = map.matchType;
				operationSelect.onchange();
				dropDownTree = registry.getEnclosingWidget(query(".filemanager-column-mapper-attribute-select",rowNode)[0]);
				if(typeof val != "undefined"){
					dropDownTree.populate(val);
				} else {
					dropDownTree.populate(map);
				}
				if(typeof map.startValue != "undefined")
					valueStart.value = map.startValue;
				if(typeof map.endValue != "undefined")
					valueEnd.value = map.endValue;

				if(typeof map.segmentValueIdx != "undefined" && map.segmentValueIdx < 2)
					attributeValueSelect.value = "" + map.segmentValueIdx;
				if(typeof val != "undefined"){
					if(typeof val.size == "undefined" || val.size != "SM")
						attributeValueSelect.setAttribute("disabled", "disabled");
				} else {
					if(typeof map.size != "undefined" && map.size != "SM")
						attributeValueSelect.setAttribute("disabled", "disabled");
				}
				if(typeof val != "undefined"){
					if(typeof val.size == "undefined" || val.size == "SM")
						domStyle.set(autoExpandButton, "display", "none");
				} else {
					if(typeof map.size == "undefined" || map.size == "SM" || pathId.length >18 ){
						domStyle.set(autoExpandButton, "display", "none");
					}
					if(map.size == "LG" && pathId == "" ){
						domStyle.set(autoExpandButton, "display", "none");
					}
				}
			}

			return me;
		},


		_explodeListItems: function(referenceNode,map,id){
				var me = this,
					myObjArr = [],
					myNewData = null,
					myUrl = dojo.string.substitute("/ssvui/org/${0}/segmentattribute/?parent=${1}", [orgid, id]),
					myNewUrl = "";
					xpo.loading.show("Loading auto expand of all states");

					dojo.xhrGet({
							url: myUrl,
							handleAs: "json",
								load: function (data) {
									data.reverse();
									var promises = [];
									data.forEach(function (val, ind) {
										myNewUrl = dojo.string.substitute("/ssvui/org/${0}/segmentattribute/", [orgid]) + val.attributeid;
										promises.push(me._getListItem(myNewUrl, referenceNode, map));

									});// end data forEach

									all(promises).then(function(res){
										//Delete row itself
										me.rowHolder.removeChild(referenceNode);
										me._handleDeleteButtonVisibility();
										xpo.loading.hide();
									});

								}, error: function(error){
									xpo.loading.hide();
								} //end load()

						}); //end dojo.xhrGet()*/


					return me;
		},// end _explodeListItems

		_getListItem: function(thisUrl, referenceNode, map){
				var me = this,
				promise = dojo.xhrGet({
							url: thisUrl,
							handleAs: "json",
								load: function (data) {

									data.segmentId = data.segmentid;
									data.segmentValueIdx = data.orderidx;
									me._addRow(referenceNode, map, data, true);

								} //end load()
					}); //end dojo.xhrGet()*/

					return promise;
		},// end _getListItem

		//If it's last button we can not show it cause last row can't be removed
		_hideCollapse: function(){
			var nodes = query(".collapse-button", rowNode);

			if(nodes.length == 1)
				nodes[0].style.display = "none";
		},

		//If it's last button we can not show it cause last row can't be removed
		_handleDeleteButtonVisibility: function(){
			var nodes = query(".minus-btn", this.domNode);

			if(nodes.length == 1) {
				nodes[0].classList.add("hide");
			} else {
				nodes.forEach(function(node){
					node.classList.remove("hide");
				});
			}
		},

		_buildColumnSelectTemplate: function () {
			var me = this;
			me.options = [];

			me.columnSelectTemplate = domConstruct.create("select", {
				"class": "filemanager-column-mapper-column-select"
			});

			if(typeof me.columns != "Undefined") {
				me.columns.forEach(function (column) {
					domConstruct.create("option", {
						value: column.columnIdentifier,
						innerHTML: column.columnAlias
					}, me.columnSelectTemplate);
				});
			}

			//We need to iterate through all existing dropdowns and set options
			query(".filemanager-column-mapper-column-select", me.domNode).forEach(function(select){
				var value = null;
				if(select.selectedIndex >= 0)
					value = select.options[select.selectedIndex].value;
				var newSelect = lang.clone(me.columnSelectTemplate);
				select.innerHTML = newSelect.innerHTML;

				if(value)
					select.value = value;
			});

			return me;
		},

		_buildOperationSelectTemplate: function () {
			var me = this,
				options = [{
					value: "EQUALS",
					label: "if value ="
				},
				{
					value: ">",
					label: "if value >"
				},
				{
					value: "<",
					label: "if value <"
				},
				{
					value: ">=",
					label: "if value >="
				},
				{
					value: "<=",
					label: "if value <="
				},
				{
					value: "BETWEEN",
					label: "if between"
				},
				{
					value: "DAYS>",
					label: "if days >"
				},
				{
					value: "DAYS<",
					label: "if days <"
				},
				{
					value: "DAYSBET",
					label: "if days bet."
				},
				{
					value: "DIRECT",
					label: "if direct"
				},
				{
					value: "ANY",
					label: "if any"
				}
				];

			me.operationSelectTemplate = domConstruct.create("select", {
				"class": "filemanager-column-mapper-operation-select"
			});

			options.forEach(function (option) {
				domConstruct.create("option", {
					value: option.value,
					innerHTML: option.label
				}, me.operationSelectTemplate);
			});

			return me;
		},

		validate: function(){
		 	var me = this,
		 	rows = query(".filemanager-column-mapper-row", me.domNode)
		 	valid = true;

			rows.forEach(function(rowNode){
				var columnSelect = query(".filemanager-column-mapper-column-select",rowNode)[0],
				operationSelect = query(".filemanager-column-mapper-operation-select",rowNode)[0],
			    valueStart = query(".filemanager-column-mapper-value-start",rowNode)[0],
			    valueEnd = query(".filemanager-column-mapper-value-end",rowNode)[0],
			    attributeSelect = query(".filemanager-column-mapper-attribute-select", rowNode)[0];
			    attributeValueSelect = query(".filemanager-column-mapper-attribute-value-select", rowNode)[0],
			    map = registry.getEnclosingWidget(attributeSelect).compile();

			    if(!columnSelect.value){
			    	valid = false;
			    	columnSelect.classList.add("has-error");
			    } else
			    	columnSelect.classList.remove("has-error");

			    if(operationSelect.value != "DIRECT" && operationSelect.value != "ANY" && operationSelect.value != "EQUALS"){
			    	if(!valueStart.value){
				    	valid = false;
				    	valueStart.classList.add("has-error");
				    } else
				    	valueStart.classList.remove("has-error");
			    	if((operationSelect.value == "BETWEEN" || operationSelect.value == "DAYSBET") && !valueEnd.value) {
					    	valid = false;
					    	valueEnd.classList.add("has-error");
					    } else
					    	valueEnd.classList.remove("has-error");
			    }

			    if(operationSelect.value == "EQUALS" && valueStart.value == null){
			    	valueStart.value = "";
					valueEnd.value = "";
			    }

			    if(typeof map == "undefined" || typeof map.attributeid == "undefined" || !map.attributeid || map.attributeid < 0){
			    	valid = false;
			    	attributeSelect.classList.add("has-error");
			    } else
			    	attributeSelect.classList.remove("has-error");
			});


			if(!valid){
				me.domNode.classList.add("has-error");
				query(me.domNode)
				.parents(".form-group")
				.addClass("has-error");

			} else {
				me.domNode.classList.remove("has-error");
				query(me.domNode)
				.parents(".form-group")
				.removeClass("has-error");
			}

			return valid;
		},

		populate:function(transformSets) {
			var me = this;
			//We need to let file column header processing to run so we can have small Delay here
			setTimeout(function(){
				me.transformSets = transformSets;

				transformSets.forEach(function(transformSet,index){
					if(index == 0)
						me.rowHolder.innerHTML = "";//clear row holder
					if(!(typeof transformSet.columnIdentifier!="undefined"))transformSet.columnIdentifier="1";
					me._addRow(undefined, transformSet);
				});
			},1000);
		},

		compile:function(){
			var me = this,
			transformSets = [];
			rowNodes = query(".filemanager-column-mapper-row", me.domNode);
			rowNodes.forEach(function(rowNode){
				var transformSet = {};
				var columnSelect = query(".filemanager-column-mapper-column-select",rowNode)[0],
					operationSelect = query(".filemanager-column-mapper-operation-select",rowNode)[0],
				    valueStart = query(".filemanager-column-mapper-value-start",rowNode)[0],
				    valueEnd = query(".filemanager-column-mapper-value-end",rowNode)[0],
				    attributeSelect = query(".filemanager-column-mapper-attribute-select", rowNode)[0];
				    attributeValueSelect = query(".filemanager-column-mapper-attribute-value-select", rowNode)[0];

				if(columnSelect.value){
					transformSet.columnIdentifier = columnSelect.value;
					transformSet.matchType = operationSelect.value;
					transformSet.startValue = valueStart.value;
					if(transformSet.matchType == "BETWEEN" || transformSet.matchType == "DAYSBET")
						transformSet.endValue = valueEnd.value;
					var map = registry.getEnclosingWidget(attributeSelect).compile(),
					obj = {};

					if(typeof map != "undefined"){
						if(typeof map.attributeid != "undefined")
							obj.attributeid = map.attributeid;
						if(typeof map.segmentId != "undefined")
							obj.segmentId = map.segmentId;
						if(typeof map.segmentValueIdx != "undefined")
							obj.segmentValueIdx = map.segmentValueIdx;

						if(!attributeValueSelect.getAttribute("disabled"))
							obj.segmentValueIdx = parseInt(attributeValueSelect.value);

						dojo.mixin(transformSet,obj);
					}

					if(transformSet.matchType == "DIRECT" && map.size != "SM")
						delete transformSet.segmentValueIdx;

					transformSets.push(transformSet);
				}

			});
			return transformSets;
		}
	});
});
