// ======================
// common.js 更新记录
// ======================
// Designed for RC-KMS (run on client)            by 杜子兮 2009.06.29~
// Redesign for RC-KMS (run on client & web )     by 杜子兮 2009.11.21~
// Redesign for RC-KMS (run internationaly)       by 杜子兮 2013.06.21~
// 简化清理代码，为产品化做准备                   by 杜子兮 2015.12.12

// 文件编码统一为unicode(统一码)，否则保存不成功
XMLHEAD="<?xml version='1.0' encoding='unicode' ?>";

ELEMENT_NAME_LEN=30; //要素名称的适宜长度
PATH_IMG="..\\IMG\\";

var sysMessage="";



// 文件存取层 ===========

// 创建XML DOM：用于通过浏览器保存数据（仅IE内核浏览器支持）
function createXMLDOM() {  
	var arrSign = ["MSXML2.DOMDocument.5.0",
				   "MSXML2.DOMDocument.4.0",
				   "MSXML2.DOMDocument.3.0",
				   "MSXML2.DOMDocument",
				   "Microsoft.XmlDom",
		           "Microsoft.XMLDOM"];
	for (var i=0; i < arrSign.length; i++) {
		try {
			var oXmlDom = new ActiveXObject(arrSign[i]);
			return oXmlDom;
		} catch (oError) { }
	}
    if (document.implementation && document.implementation.createDocument) {            
        var oXmlDom = document.implementation.createDocument("","",null);  
        return oXmlDom;                    
    } else {  
        throw new Error("您的浏览器不支持 XML DOM 对象.");  
    }          
}

// 读取 XML文件
function getXMLFile(file,level){ 
	var xmlDoc = createXMLDOM();
	try{
		xmlDoc.setProperty("SelectionLanguage", "XPath");
	}catch (e){ }
	xmlDoc.async=false;

	var filePath="XML/"+file+".xml";	
	if (level!=0){
		filePath="../"+filePath;
	}
	
	var flag = xmlDoc.load(filePath); 
	if (flag){
		return xmlDoc;
	}else{
		alert(file+".xml文件读取失败. common.js");
		return false;
	}
}

// 文件的写入
function saveToFile(xml,file){ 
	file="/../"+file;
	var str = document.location.toString();

	var path= document.location.pathname;

	if (path.lastIndexOf('\\')>=0){
		path=path.slice(1,path.lastIndexOf('\\')); //IE 6.0 是这样的
	}else{
		path=path.slice(1,path.lastIndexOf('/')); //IE 7.0 是这样的
	}
	
	var fso= new ActiveXObject("Scripting.FileSystemObject");
	try{
		f1= fso.OpenTextFile(path+file);
		var str=f1.ReadAll();
	}catch (e){
		//如果没有，就直接创建新文件
	}
	var isOK=true;

	f2 = fso.OpenTextFile(path+"/../XML/sys_temp.xml");
	f2 = fso.CreateTextFile(path+"/../XML/sys_temp.xml",true,true); 

	try{
		f2.WriteLine(xml); 
		f2.Close();
		//记录最后更新时间
		f3= fso.OpenTextFile(path+"/../XML/dt_system.xml");

	}catch (e){
		isOK=false;
		f2.Close();
		alert("保存文件失败，请检查是否含有非Unicode编码字符\n例如：["+String.fromCharCode(12539)+"]");
		return false;
	}
	
	if (isOK){
		f1 = fso.CreateTextFile(path+file,true,true);
		f1.WriteLine(xml);
		f1.Close();
		return true;
	}
}

// 文件的删除
function deleteFile(file){ 
    var path= document.location.pathname;
	if (path.lastIndexOf('\\')>=0){
		path=path.slice(1,path.lastIndexOf('\\')); //IE 6.0 是这样的
	}else{
		path=path.slice(1,path.lastIndexOf('/')); //IE 7.0 是这样的
	}
    var isOK=true;
    // 客户端文件写入
	try{
		var fso= new ActiveXObject("Scripting.FileSystemObject");
	}catch (e){
		isOK=false;
	}

	if (isOK){
		var exist=fso.FileExists(path+'\\..\\XML\\dt_'+file+'.xml'); 

		if (exist){
			fso.DeleteFile(path+'\\..\\XML\\dt_'+file+'.xml'); 
		}else{
			alert("未找到相应文件删除失败");
		}
	}
}

// 基础信息生成 ========

// 获取时间字串
function getTimeStr(){
	var lastTime=new Date();
    var lastYear  =lastTime.getFullYear();
	var lastMonth =lastTime.getMonth()+1;
	var lastDate  =lastTime.getDate();
    var lastHour  =lastTime.getHours();
	var lastMins  =lastTime.getMinutes();
	var lastSecnd =lastTime.getSeconds();
	var lastTimeStr=lastYear+"年"+lastMonth+"月"+lastDate+"日  "+lastHour+"时"+lastMins+"分"+lastSecnd+"秒";
	return lastTimeStr;
}

// 最后更新时间的写入
function recordLastEditTime(){
	//记录最后更新时间
    var lastTimeStr=getTimeStr();

    //获取XML文件
	var xmlDocSys = getXMLFile("dt_system");
	var xmlRoot=xmlDocSys.documentElement;

    //创建节点
	var xmlNode=xmlDocSys.createElement("lastedit");
	var txtNode=xmlDocSys.createTextNode(lastTimeStr);
    xmlNode.appendChild(txtNode);

	//替换旧结点
	var oOld=xmlRoot.selectSingleNode("lastedit");
	if (oOld){
		//如果旧的存在，就替换
		oOld.parentNode.replaceChild(xmlNode,oOld);
	}else{
		xmlRoot.appendChild(xmlNode);
	}	
	if (saveToFile(XMLHEAD+xmlRoot.xml,'/XML/dt_system.xml')){
		return true;
	}else{
		return false;
	}
}

// 知识要素ID生成
function getId(entity){
	var id="";
	var year,month,day,count,brief;
	var today = new Date();
	var todayYear=today.getFullYear();
	var todayMonth=today.getMonth()+1;
	var todayDate=today.getDate();

	var xmlDoc = getXMLFile("dt_system");

	if (xmlDoc){
		arr=xmlDoc.getElementsByTagName(entity);
		count=getXMLValue(arr[0],"count")-0;
		year=getXMLValue(arr[0],"year");
		month=getXMLValue(arr[0],"month");
		day=getXMLValue(arr[0],"day");
		brief=getXMLValue(arr[0],"brief");

		//如果当前日期与文件中的日期相同，count+1 替换count
		if((year==todayYear)&&(month==todayMonth)&&(day==todayDate)){
			count+=1;
			setXMLValue(arr[0],"count",count);
		}else{//否则count归一，将文件中的日期替换为当日日期
			count=1;
			year=todayYear;
			month=todayMonth;
			day=todayDate;
			setXMLValue(arr[0],"count",count);
		    setXMLValue(arr[0],"year",year);
		    setXMLValue(arr[0],"month",month);
		    setXMLValue(arr[0],"day",day);
		}
		id=brief+year+format(month,2)+format(day,2)+format(count,4);

		var oOld=xmlDoc.getElementsByTagName(entity)[0];
		oOld.parentNode.replaceChild(arr[0],oOld);
		
		var xmlRoot=xmlDoc.documentElement;
		saveToFile(XMLHEAD+xmlRoot.xml,'/XML/dt_system.xml')
	}else{
		alert("读取文件dt_system.xml失败 /n erron on: common.js -> getId();");
	}
	return id;
}

//获得指定ID的XML数据结点
function getFromXML(file,id){ 
	//2009-12-26 存在重复读取的嫌疑 这个不好，要改成 参数是  getNodeFromFile(xmlDoc,id) 的新函数
	var node;
	var xmlDoc=getXMLFile(file);
	node= xmlDoc.documentElement.selectSingleNode(""+file+"[@id ='"+id+"']");
	return node;
}

function getNodeFromFile(xmlDoc,id){
	try{
		return xmlDoc.documentElement.selectSingleNode("*[@id ='"+id+"']");
	}
	catch (e){
		alert("getNodeFromFile 失败" + id+":"+xmlDoc);
		return;
	}
}

//获取系统的基本参数

//通过ID 获取要素类别英文名
function getElementName(id){ //已知id，返回代表要素名
	var brief=id.charAt(0);
	var arr = new Array();
	var xmlDoc=getXMLFile("dt_system");
	var xPath="idcode/*[brief='"+brief+"']";
	arr= xmlDoc.documentElement.selectNodes(xPath);
	try{
		return arr[0].tagName;
	}catch (e){
		alert(id);
	}
}

//获取小图标
function getElementImg(element){//获取要素 图案
    if (element=="comment"){
         return "<img src='../IMG/speak.gif'/>";
    }
	var arr = new Array();
	var xmlDoc=getXMLFile("dt_system");
	var xPath="datatag/"+element;
	arr= xmlDoc.documentElement.selectNodes(xPath);
	if (arr[0].getAttribute("img")==null){
       return "<img src='../IMG/none.gif'/>";
	}else{
	    return "<img src='../IMG/"+arr[0].getAttribute("img")+"'/>";
	}
}

function getElementImgName(element){//已知id,返回要素 图案
	var arr = new Array();
	var xmlDoc=getXMLFile("dt_system");
	var xPath="datatag/"+element;
	arr= xmlDoc.documentElement.selectNodes(xPath);
	if (arr[0].getAttribute("img")==null){
		return "◇";
	}else{
	    return arr[0].getAttribute("img");
	}
}

//关联处理
function getRefers(refer){//已知refer字串，求得refers数组
    var refers=new Array();
    if (refer.indexOf("#")>-1){//如果为多个关联
		refers=refer.split("#");
		for (circle=0;circle<refers.length ;circle++ ){
			refers[circle]=refers[circle].substr(refers[circle].indexOf("$")+1);
		}
	}else{					   //如果是单个关联
		if (refer.indexOf("$")>-1){ //如果关联中指明关联字符
			refers[0]=refer.substr(refer.indexOf("$")+1);
		}else{ //老版本的关联标注
			refers[0]=refer;
		}
	}
	return refers;
}

function getKeyWords(refer){
	var KeyWords=new Array();
    if (refer.indexOf("#")>-1){//如果为多个关联
		refers=refer.split("#");
		for (circle=0;circle<refers.length ;circle++ ){
			KeyWords[circle]=refers[circle].substr(0,refers[circle].indexOf("$"));
			KeyWords[circle]=KeyWords[circle].replace("≠≠","#");
			KeyWords[circle]=KeyWords[circle].replace("∮","$");
		}
	}else{					   //如果是单个关联
		if (refer.indexOf("$")>-1){ //如果关联中指明关联字符
			KeyWords[0]=refer.substr(0,refer.indexOf("$"));
			KeyWords[0]=KeyWords[0].replace("≠≠","#");
			KeyWords[0]=KeyWords[0].replace("∮","$");
		}
	}
	return KeyWords;
}

function getRelativePath(sysPath,targetPath){//生成目标路径
	sysPath=sysPath.slice(1,sysPath.length);
	var re=new RegExp("/","g");
	sysPath=sysPath.replace(re,"\\");
	var arrSystemFile=sysPath.split("\\");
	var arrTargetFile=targetPath.split("\\");
	var k=0;
	while (arrSystemFile[k]==arrTargetFile[k]){
		k++;
	}
	if (k==0){ //如果系统路径和目标文件路径不在同一盘符下
		return targetPath;
	}else{ //否则生成相对路径
		var strPath="";
		var backNum=arrSystemFile.length-k-1;
		for (var j=0;j<backNum ;j++ ){ //将当前系统的路径和本地资源的路径相同的地方替换成"../"
			strPath+="../";
		}
		for (var j=k;j<arrTargetFile.length ;j++ ){
			strPath+=arrTargetFile[j];
			if (j!=arrTargetFile.length-1){
				strPath+="/";
			}
		}
		return strPath;
	}
}

function addToXML(arrData){ //添加新要素
	var xml="";
	var id="";  
	id=getId(arrData[0]);

	//获取XML文件
	var xmlDoc = getXMLFile("dt_"+arrData[0]);
	var xmlRoot=xmlDoc.documentElement;

	//创建节点
	var xmlNode=xmlDoc.createElement(arrData[0]);
	xmlNode.setAttribute("id",id);
	
	//创建数据元素
	for (var i=1;i<arrData.length ;i++ ){
		var xmlElm=xmlDoc.createElement(arrData[i]);
		var targetValue=getIdValue(arrData[i]);

		if (arrData[i]=="localsrc"){ //对于本地资源类要特殊处理
			var sysPath= document.location.pathname;
			targetValue=getRelativePath(sysPath,targetValue);
			//alert(targetValue);
		}
		var xmlElmTxt=xmlDoc.createTextNode(targetValue);
		xmlElm.appendChild(xmlElmTxt);
		xmlNode.appendChild(xmlElm);
	}
	xmlRoot.appendChild(xmlNode);
	if (saveToFile(XMLHEAD+xmlRoot.xml,'/XML/dt_'+arrData[0]+'.xml')){
		return true;
	}else{
		return false;
	}
}

function delFromXML(file,id){
	var xmlDoc=getXMLFile("dt_"+file);
	var node= xmlDoc.documentElement.selectSingleNode("*[@id ='"+id+"']");

	var xmlRoot=xmlDoc.documentElement;
	var txtNode=node.xml.toString();
	txtNode=txtNode.replace("<name>","〓 ");
	txtNode=txtNode.replace("</name>"," 〓\n\n\n要素内容：");
	var re=new RegExp("<([a-z]|[A-Z])*>|</([a-z]|[A-Z])*>","g");
	txtNode=txtNode.replace(re,"\n");
	var re=new RegExp("\n\n","g");
	txtNode=txtNode.replace(re,"\n");
	var re=new RegExp("<.*>","g");
	txtNode=txtNode.replace(re,"");
	if (txtNode.length>200){
		txtNode=txtNode.substring(0,200)+"…";
	}
	//alert(confirm("?"));
	if (confirm("确定要删除该知识要素吗？(不可恢复！！)\n\n"+txtNode)){
		//STEP 1 删掉相关的关联引用 
		//alert("step 1");
		var xmlDocSys=getXMLFile("dt_system");
		var nameTags=xmlDocSys.documentElement.selectNodes("datatag/*");
		var arrElement=[];
		var xmlDocElm=[];
		for (var i=0;i<5 ;i++ ){
			arrElement[i]=nameTags[i].tagName;
			xmlDocElm[i]=getXMLFile("dt_"+arrElement[i]);
			
			nodes=xmlDocElm[i].documentElement.selectNodes("//"+arrElement[i]+"/*[contains(@refer,'"+id+"')]");
			//alert(nodes.length);
			if (nodes.length){
				for (var j=0;j<nodes.length ;j++ ){
					var referStr=nodes[j].getAttribute("refer");
					var arrRefer=getRefers(referStr);
					var arrKeyWord=getKeyWords(referStr);
					referStr="";
					for (var k=0;k<arrRefer.length ;k++ ){
						if (referStr!=""){
							referStr+="#";
						}
						if (arrRefer[k]!=id){
							referStr+=arrRefer[k]+"$"+arrKeyWord[k];
						}
					}
					nodes[j].setAttribute("refer",referStr);
					var id=nodes[j].parentNode.getAttribute("id");
					var oOld=xmlDocElm[i].documentElement.selectSingleNode("//"+arrElement[i]+"[@id='"+id+"']");
					alert(oOld.xml);
					oOld.parentNode.replaceChild(nodes[j].parentNode,oOld)
					//return;

					//2010-11-2 有问题 以后再改
					//alert(nodes[j].xml);
					//alert(nodes[j].parentNode.parentNode.xml);
					//saveToFile(XMLHEAD+nodes[j].parentNode.parentNode.xml,'/XML/dt_'+xmlDocElm[i]+'.xml');
				}
				saveToFile(XMLHEAD+xmlDocElm[i].documentElement.xml,'/XML/dt_'+xmlDocElm[i]+'.xml');
			}
		}
		
		//return;
		//STEP 2 删除要素本身
		//alert("step 2");
		node.parentNode.removeChild(node);
		saveToFile(XMLHEAD+xmlRoot.xml,'/XML/dt_'+file+'.xml');

		//STEP 3 如果文件不是评论，要删除相关评论
		if (file!="comment"){
			xmlDoc=getXMLFile("dt_comment");
			var xPath="comment/object[contains(text(),'"+id+"')]"; //2010-1-27 有待改成精确的
			var node=xmlDoc.documentElement.selectNodes(xPath);
			for (var i=0;i<node.length ;i++ ){
				var tempNode=node[i].parentNode;
				tempNode.parentNode.removeChild(tempNode);
			}
			xmlRoot=xmlDoc.documentElement;
			saveToFile(XMLHEAD+xmlRoot.xml,'/XML/dt_comment.xml');
		}
		//STEP 4 关掉已经打开的要素编辑和评论窗口
		//2010-1-27 有待补充
		return true;
	}else{
		return false;
	}
}

function getXMLValue(obj,field){ //获得某个数据节点的值
	try{
		return obj.getElementsByTagName(field).item(0).childNodes[0].nodeValue;
	}
	catch (e){
		return "-";
	}
}	

function getXMLAttribute(obj,field,attribute){ //获得某个数据结点的属性名
	return obj.getElementsByTagName(field).item(0).getAttribute(attribute);
}	

function setXMLValue(obj,field,value){ //4
		obj.getElementsByTagName(field).item(0).childNodes[0].nodeValue=value;
	
}	

//==== Web 页面操作函数 ===

//从URL中获取ID
function getIDfromURL(){
	var str=new String(document.location);
	if (str.lastIndexOf("=") == -1) {
		return "";
	}
	var i=str.lastIndexOf("=")+1;
	var j=str.length;	
	str.substring(i,j);
	return str.substring(i,j);
}

function getParaFromURL(para){
	var str=new String(document.location);
	var i=str.indexOf("?");
	str=str.substring(i+1,str.length);
	var arr=str.split("&");
	for (var i=0;i<arr.length ;i++ ){
		var si=arr[i].indexOf("=");
		if (arr[i].substring(0,si)==para){
			return arr[i].substring(si+1,arr[i].length);
		}
	}
	return false;
}

//打开新窗口
function editInfo(info,id){ //进入id 编号的编辑画面 窗口名为info
	var oNewWin=window.open("_InfoEdit.html?id="+id,info,"location=yes,resizable=yes,left=50,scrollbars=yes,status=yes,toolbar=yes,menubar=yes");
	//oNewWin.close();
	//oNewWin=window.open("_InfoEdit.html?id="+id,info,"location=yes,resizable=yes,left=50,scrollbars=yes,status=yes,toolbar=yes,menubar=yes");
	oNewWin.focus();
}

function relationInfo(info,id){ //进入id 编号的 关联图画面 窗口名为 info
    var oNewWin=window.open("_ansLocalNet.html?id="+id,info,"location=yes,resizable=yes,left=50,scrollbars=yes,status=yes,toolbar=yes,menubar=yes");
	//oNewWin.close();
	//oNewWin=window.open("_visualRelation.html?id="+id,info,"location=yes,resizable=yes,left=50,scrollbars=yes,status=yes,toolbar=yes,menubar=yes");
	oNewWin.focus();
}

function showComment(id){
	var oNewWin=window.open("_InfoComment.html?id="+id,"comment_"+id,"location=yes,resizable=yes,width=600,height=600,left=50,scrollbars=yes,status=yes,toolbar=yes,menubar=yes");
	//oNewWin.close();
	//oNewWin=window.open("_InfoComment.html?id="+id,"comment_"+id,"location=yes,resizable=yes,width=600,height=600,left=50,scrollbars=yes,status=yes,toolbar=yes,menubar=yes");
	oNewWin.focus();
}

function searchRelation(elm1,prop,elm2){
	var oNewWin=window.open("_srcRelation.html?element1="+elm1+"&relation="+prop+"&element2="+elm2,"searchRelation","location=yes,resizable=yes,scrollbars=yes,status=yes,toolbar=yes,menubar=yes");
	
	oNewWin.focus();
}

//判别函数
function IsNull(id){ //12：判断Web页面中的值
	var object=document.getElementById(id);
	var str=object.value;
	if ((str==null)||(str=="")){
		return true;
	}else{
		return false;
	}
}

//生成Web页面HTML字串

function addTitle(title,size){
	return "<span class='"+size+"_title' >"+title+"</span>";
}

function addButton(buttonName,buttonEvent,mode,id){
	mode=(!mode)?"":mode;
	if (id){
		return "<input id='"+id+"' type='button' onclick='"+buttonEvent+"' value='"+buttonName+"' "+mode+"/>";
	}else{
		return "<input type='button' onclick='"+buttonEvent+"' value='"+buttonName+"' "+mode+"/>";
	}
}

function addLinkButton(buttonName,buttonEvent,buttonDsc){
    return "<a href='javascript:void(0);//"+buttonDsc+"' onclick='"+buttonEvent+"'> "+buttonName+" </a>";
}

//获取Web页面的值
function getIdValue(id){ //获取Web页面的输入值 注！！为空返回"-"
	var isOk=true;
	var value;
	try{
		value=document.getElementById(id).value;
	}catch(e){  //当页面中不存在相应id时，取值会失败
		isOk=false;
	}
	
	if (isOk&&(typeof value!= "undefined")&&(value!=null)&&(value!="")){
		return value;
	}else{
		return "-";
	}
}

function getRadioValue(name){ //获取页面中radio的选择值
	var len=document.all.tagData.length;
	if (!len){
		return document.all.tagData.value;
	}else{
		for (var i=0;i<len ;i++ ){
			if (document.all.tagData[i].checked){
				return document.all.tagData[i].value;
				break;
			}
		}
	}
}

function getRadioValueX(name){ //获取页面radio选择值的加强版
    var radios=document.getElementsByName(name);
	for (var i=0;i<radios.length ;i++ ){
		if (radios[i].checked){
			return  radios[i].value;
		    break;
		}
	}
}

function selectRadio(value){
	var isOK=false;
	try{
		var len=document.all.tagData.length;
		for (i=0;i<len ;i++ ){
			if (document.all.tagData[i].value==value){
				document.all.tagData[i].checked=true;
				isOK=true;
				break;
			}
		}
	}catch (e){
        return false;
	}
	return isOK;
}

function getSelectedText(){ //获取所选中的字符串
	if (document.selection){      
		return document.selection.createRange().text;   
	}
}

//=== 字符串处理函数 ===
function format(obj,digit){//9
	var str=obj+"";
	var len=str.length;
	if (len<digit){
		for(i=0;i<digit-len;i++){
			str="0"+str;
		}
	}
	return str;
}

function len(s) { //判断中英文混合字符串长度
	var l = 0;
	var a = s.split("");
	for (var i=0;i<a.length;i++) {
		if (a[i].charCodeAt(0)<299) {
			l++;
		} else {
			l+=2;
		}
	}
	return l;
} 

function encode(str){ // 加密函数
	var cipher=1;
	for (i=0;i<str.length ;i++ ){
		cipher*=str.charCodeAt(i);
	}
	cipher-=str.charCodeAt(0);
	cipher+=str.charCodeAt(str.length-1);
	return cipher;
}

function getYear(str){//从字符串中抽取年份 2010-5-11 逻辑上有问题，再考虑考虑
	if (str=="-"){
		return str;
	}
	//step 0 预处理 —— 识别宽体数字
	var arrFat=["０","１","２","３","４","５","６","７","８","９"];
	var arrThin=["0","1","2","3","4","5","6","7","8","9"];
	for (var i=0;i<arrThin.length ;i++ ){
		var re=new RegExp(arrFat[i],"g");
		str=str.replace(re,arrThin[i]);
	}
	var si=-1;

	//step 1 考虑公元后年代为4位数的年代表示
	si=str.search(/\d{4}/); 
	if (si>=0){ 
		return str.substr(si,4);
	}

	//step 2 考虑公元前的年代表示
	var isBefore=str.search(/BC|前/);

	if (isBefore>=0){ //具有公元前的表述特征
		si=str.search(/\d{2,3}/);
		if (si>=0){
			return "-"+str.substr(si,3);
		}
	}
	si=str.search(/-/);
	if (si>=0){
		sj=str.search(/\d{3}/);
		if (sj>=0){
			//alert(str);
			return str.substr(si,4);
		}
	}
	//step 3 公元元年~公元999年
	si=str.search(/\d{3}/);
	if (si>=0){
		if (isBefore>=0){
			return  "-"+str.substr(si,3);
		}else{
			return  str.substr(si,3);
		}
	}
	si=str.search(/\d{2}/);
	if (si>=0){
		if (isBefore>=0){
			return  "-"+str.substr(si,2);
		}else{
			return  str.substr(si,2);
		}
		
	}
	return "-";
}

function getDateString(){ //获取当前时间字串 YYYY.MM.DD hh:mm
	var today = new Date();
	return today.getFullYear()+"."+(today.getMonth()+1)+"."+today.getDate()+" "+today.getHours()+":"+today.getMinutes();
}

function formatFloat(src, pos){
    return Math.round(src*Math.pow(10, pos))/Math.pow(10, pos);
}
