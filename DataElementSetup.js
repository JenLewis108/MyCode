/**
 *
 *	Used in:		The Creative New/Edit Screen
 *	Authored:		j.bobbie
 *	Description:	This is the basis of the Creative Setup.
 *						There are currently 6 different types of Creatives avaliable, this is the file that has common functions across all of them
 *						Individual functions are located in the Site, Media, & Facebook Creative Setup files
 *
 *	TOC:
 *
 *-----
 *	XHR:
 *		GETs:
 *		PUTs:
 *		POSTs:
 *
 */
define([
	"dojo/_base/declare",
	"xpo/form/_DetailsBase",
	"dojo/request",
	"dojo/on",
	"dojo/_base/lang",
	"dojo/dom-construct",

	//Form Configs
	"xpo/datahub/DataElement-Controls",
	"xpo/form/_FileUploader",

	"xpo/Helpers",

	"dojo/query",
	"dojo/NodeList-dom",
	"dojo/NodeList-traverse"
], function(declare,
			BASE,
			request,
			on,
			lang,
			create,

			//Form Config Objects
			DATAELEMENTCONTROLS,
			FileUploader,

			Helpers,

			query,
			queryDOM,
			queryTRAV) {

return declare([BASE],{

	detailsType:"New Data Element",
	parentTabName:"DataHub",
	getURL:"/ssvui/org/{0}/dataelement/{1}",
	_baseURL:"datahub/dataelement",

	_formType:null,
	_data:null,

	_crumbURL:"datahub/dataelements/list",
	_crumbName:"Data Element",
	_crumbNameAttr:null,

	_buttonColumns:1,
	guideable:true,

	_validCreativeCode:null,


	/**
	 * Add You button Choices below
	 * If there are more Object Types, then simply copy the object and change the values to match the new object
	 * The controls Value should match whatever the Form Config Object type is
	 */
	buttonChoices:[{
		name:"Data Element",
		desc:"",
		value:"dataelementid",
		url:"dataelement",
		controls:"DATAELEMENTCONTROLS"
	}], //end buttonChoices []


	postCreate:function(){
		var me = this;

		//Have to set up the validation holders so that we can hitch things correctly
		DATAELEMENTCONTROLS.validationHolder = me;

		me.inherited(arguments);
		me.type = "dataelement";
		me._data = [];
	},  //end postCreate()


	/**
	 * _buildForm()    - builds the form based on the File type we want to create
	 *     Sets up the new URL so that we can navigate
	 *
	 * @param  {string} type The type of file we want to make
	 * @return {me}      chainable
	 */
	_buildForm:function(){
		var me = this,
			mix = {},
			paneLen = null,
			FORMTYPE = null;

		me.inherited(arguments);

		FORMTYPE = DATAELEMENTCONTROLS;

		me._formType = "dataelement";

		me.form = new me._FORM(FORMTYPE,create.create("div",null,me.formHolder));

		$(".input-daterange",me.form.domNode).removeClass("col-lg-8").addClass("col-lg-12");

		xpo.loading.hide();

		return me;
	},  //end _buildForm()


	_buildConnects: function () {
				var me = this,
					dm = query(me.domNode);

				me.inherited(arguments);

				me.own(	dm.on(".remove-icon:click",lang.hitch(me,"_removeItem"))
					);

				return me;
	},

	preCompile:function(obj){
		var me = this;

		return obj;
	},	//end preCompile()


	postCompile:function(obj){
		var me = this,
			size = [];
			console.log(obj);
			//expiredays -- parseInt
		    (!(obj.expiredays) || obj.expiredays<1)? obj.expiredays = 30 : obj.expiredays = parseInt(obj.expiredays);
			if (!obj.identifier) obj.identifier = "dataelementvalueid";
			if (!obj.label) obj.label = "name";
			//if(!obj.datahits) obj.datahits = [];
			delete obj.multivalue;
			delete obj.datahits;
			//if (obj.items){console.log(obj.items);}
			obj.valuedescription = "";

		//if(me.isEdit){  }

		return obj;
	},	//end postCompile()


	populate:function(response){
		var me = this,
		//me.inherited(arguments);
		type = "";

			if(me.buttonChoices && me.buttonChoices.length === 1){
				type = me.buttonChoices[0].url;
			}

		me._setGroupType(type);


		me._startSection()
			._populateForm(response);

		return me;
	},	//end populate()


	_buildGetURL:function(uid){
		var me = this,
			uuid = uid ? uid : "";
			//If uid isn't passed in, then it should be an empty string

		return lang.replace(me.getURL,[orgid,uuid]); //+"?version=2";
	},	//end _buildGetURL()

	_updateExpVal:function(e){
		var me = this;
		//console.log("the items are ,", response.data);

		return me;
	},

	_moveValue:function(e){
			var me = this,
				node = (me.form.isGuide && me.guide) ? me.guide.domNode : me.form.domNode,
				myArr = [],
				myData = [],
				myMulti2 = me.form.findWidget("datavalues"),
				myMulti = $("[name=datavalues]",node)[0],
				myVal = myMulti.value;

				myArr = me._parseCSV(myVal);


				myGrid = me.form.findWidget("items");
				myData = myGrid.slickGrid.getData();

				myArr.forEach(function(val, ind){
					if (me._canAddItem(val.name,myData)){
						myData.push(myArr[ind]);
					}
				});

				myGrid.updateGrid(null, myData);
			return me;
	},//end _getValue Grid()


	/**
	 * _canAddItem()	- We can only add DataElementValues once
	 * @param  {object} creative DataElementValue that we want to add
	 * @return {boolean}          Is this DataElementValue eligible to be added?
	 */
	_canAddItem:function(item, data){
		var me = this;

		if(!data || data.length === 0){ return true; }
			return !data.some(function(val,ind){
						return val.name === item;
					});
	},	//end _canAddItem()


	_parseCSV:function(CSV){
		var me = this,
			rows = [],
			data = [];

		rows = CSV.split("\n");
		rows.forEach(function(val,ind){
			var vv = val.split(","),
				name = vv[0],
				alias = vv[1];

			if(typeof(alias) === "undefined" || !alias || alias === "" || alias.trim() === ""){
				alias = name;
			}

			data.push({
				name:name,
				alias:alias
			});

		});	//end rows.forEach()

			return data;
	},	//end _parseCSV()

	_removeItem:function(e){
			var me = this,
				myData = [],
				newArr = [],
				myGrid = me.form.findWidget("items");
				myName = myGrid.slickGrid.getActiveCellNode().parentNode.firstChild.innerHTML;
				myData = myGrid.slickGrid.getData();
				newArr = myData.filter(function(val,ind) { return val.name !== myName; });
				myGrid.updateGrid(null, newArr);

				return me;
	},//end _removeItem()

	/**
	 * @3 Validation
	 ****************/
	/**
	 * Put any Validation Functions that are defined in the panes of  below
	 * The validation functions are set up on the proper scope, so that me does indeed === this
	 */


	/**
	 * _multiName()	- corrects the name field according to single or multi radio
	 * @param  {string} title The Title of the Growl Notification
	 * @param  {string} mess The Message we want to say
	 * @return {void}
	 */
	_multiName:function(e){
			var me = this,
				myMulti	= null,
				mess = "",
				node = (me.form.isGuide && me.guide) ? me.guide.domNode : me.form.domNode,
				thisCheck	= e.target.value;

				myMulti = $("[name=name]",node)[0];
				myVal = myMulti.value;

				//TODO check for values 0 (single) or one (multi), and implement code similar to below.
				//me._checkName(myMulti, myVal, thisCheck, node);

				if(parseInt(thisCheck) == 0){
						if(myVal.startsWith("ssv_")){
							me._validName();
							return;
						} else {
						if(myVal.startsWith("ssvm_")){
							myVal = myVal.replace(/ssvm_/,"ssv_");
						} else if(!myVal.startsWith("ssv_")){
							myVal = ("ssv_" + myVal).substr(0,14);
						}
						mess = "Parameter must begin with 'ssv_' and be between 5 and 14 alphanumeric lowercase characters long.";
						me._invalidName("Single Value Parameter Checked", mess , myMulti);
						myMulti.value = myVal;
						me._validName();
						}
				} else {
						if(myVal.startsWith("ssvm_")){
							me._validName();
							return;
						} else {
							if(myVal.startsWith("ssv_")) {
								myVal = myVal.replace(/ssv_/,"ssvm_").substr(0,14);
							} else if(!myVal.startsWith("ssvm_")){
								myVal = ("ssvm_" + myVal).substr(0,14);
							}
						mess = "Parameter must begin with 'ssvm_' and be between 6 and 14 alphanumeric lowercase characters long."
						me._invalidName("Multi-value Parameter Checked", mess , myMulti);
						myMulti.value = myVal;
						me._validName();
						}
				}
				//end

				return me;
	}, // end _multiName()

	/**
	 * _validateName()	- corrects the name field according to single or multi radio
	 * @param  {string} title The Title of the Growl Notification
	 * @param  {string} mess The Message we want to say
	 * @return {void}
	 */
	_validateName:function(e){
			var me = this,
				myMulti	= null,
				mess = "",
				node = (me.form.isGuide && me.guide) ? me.guide.domNode : me.form.domNode,
				thisCheck = $("input:radio[name=multivalue]:checked").val(),
				thisName	= e.target.value;

				myMulti = $("[name=name]", node)[0];
				//myVal = myMulti.value;

					if(thisName.startsWith("ssv_")){
							if (parseInt(thisCheck) == 0){
								me._validName();
								return;
							}else{
								$("input[name='multivalue'][value='0']").prop("checked",true);
							}
					} else if(thisName.startsWith("ssvm_")){
						if (parseInt(thisCheck) == 1){
								me._validName();
								return;
						} else{
							$("input[name='multivalue'][value='1']").prop("checked",true);
						}

				} else {
							mess = "Parameter must begin with 'ssv_' or 'ssvm_' and be between 6 and 14 alphanumeric lowercase characters long."
							me._invalidName("Invalid Parameter Prefix", mess , myMulti);
				}
				return me;

		}, // end _multiName()


		/**
		 * invalidName()	- Makes the creative code text field invalid
		 * @param  {string} title The Title of the Growl Notification
		 * @param  {string} mess The Message we want to say
		 * @return {void}
		 */
		_invalidName: function(title, mess, node){
			var me = this,
				node = (me.form.isGuide && me.guide) ? me.guide.domNode : me.form.domNode,
				myMulti = $("[name=name]",node)[0];

			myMulti.parentNode.classList.add("has-error");
			Helpers.notify({
				type: 	"warning",
				title: 	title,
				text: 	mess
			});
			return me;
		},	//end invalidCode()

		/**
		 * validName()	- Makes the creative code text field valid
		 * @return {viod}
		 */
		_validName: function(){
			var me = this,
				node = (me.form.isGuide && me.guide) ? me.guide.domNode : me.form.domNode,
				myMulti = $("[name=name]",node)[0];

			myMulti.parentNode.classList.remove("has-error");
		},	//end validCode()

/**
	* @5. CSV Upload
	******************/
	_build_csv_upload:function(opts, form){
		var me = this,
			fu = null;

		delete opts.id;
		fu = new FileUploader(opts);
		return fu.domNode;
	},	//end _build_csv_upload()
	_uploadCSV:function(e){
		var me = this;


	},	//end _uploadCSV()


});
});
