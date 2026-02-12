var elmNames; // 知识要素英文名 数组
var elmXmls = {}; // 知识要素Xml文件 字典  {知识要素英文名: XML文件}
var elmInfos = {}; // 知识要素对象 字典
var dicBriefName = {}; // 知识要素类型缩写-全称 数据字典
var propDictionary = {}; // 属性名字典  如，{reasearcher_name : "姓名"}
var xmlSystem; // 系统Xml文件

// 载入数据
function loadData() {
    console.log("LOAD 1: loadData()");
    xmlSystem = new XML("xml/system", loadCallbackSys); // 载入system.xml文件
}

// 载入数据 一次回调函数
function loadCallbackSys() {
    console.log("LOAD 2: loadCallbackSys()");
    xmlSystem.xmlDoc = this.responseXML;
    xmlSystem.root = xmlSystem.xmlDoc.documentElement;  

    // 最后更新时间
     document.getElementById("lastedit").innerHTML = xmlSystem.getSingleNodeTxtValue("lastedit");

    // 所有元素类别英文名
    elmNames = xmlSystem.getChildNames("datatag");

    // 遍历所有元素类别
    for (var i = 0; i < elmNames.length; i++) {
        // 加载所有元素XML文件
        elmXmls[elmNames[i]] = new XML("xml/" + elmNames[i], loadCallbackElement);
    }
}

// 载入数据 二次回调函数（最终调用页面visual）
function loadCallbackElement() {

    var nodeName = this.responseXML.documentElement.nodeName;
    nodeName = nodeName.substring(0, nodeName.length - 1); // 去掉最后一位s
    console.log("LOAD 3: loadCallbackElement()" + nodeName);

    elmXmls[nodeName].xmlDoc = this.responseXML; // 
    elmXmls[nodeName].root = elmXmls[nodeName].xmlDoc.documentElement;

    // 遍历当前元素所有属性并添加到 属性名字典
    var propNames = xmlSystem.getChildNames("datatag/" + nodeName);
    for (var i = 0; i < propNames.length; i++) {
        var propNameCN = xmlSystem.getSingleNodeTxtValue("datatag/" + nodeName + "/" + propNames[i]);
        propDictionary[nodeName + "_" + propNames[i]] = propNameCN;
    }

    // 初始化 元素类型对象
    elmInfos[nodeName] = new ElementInfo(nodeName);

    if (Object.keys(elmInfos).length == elmNames.length) {
        console.log("所有xml数据载入成功!");
        visual(); // 所有数据加载完毕后，刷新页面
    }
}

// 知识元素类型 构造函数
ElementInfo = function(elementName) 
{
    var sysNode = xmlSystem.selectSingleNodeByXPath("datatag/" + elementName);
    // 英文名
    this.enName = elementName;
    // 中文名
    this.chName = sysNode.getAttribute("text");
    // 图标
    this.img = sysNode.getAttribute("img");
    // 颜色
    this.color = sysNode.getAttribute("color");
    // 元素个数
    this.count = elmXmls[elementName].selectNodesByXPath("/" + elementName + "s/*").length;
    // 英文缩写
    this.brief = xmlSystem.getSingleNodeTxtValue("idcode/" + elementName + "/brief");

    dicBriefName[this.brief] = this.enName;

    // 年代属性字典{key:属性英文名,value:属性中文名}
    this.propYear = new Array();
    var xPath = "/system/datatag/" + elementName + "/*[@dataType ='time']";
    var xmlNode = xmlSystem.selectNodesByXPath(xPath);
    for(var i = 0; i < xmlNode.length; i++ ){
        this.propYear[xmlNode[i].nodeName] = xmlSystem.getNodeTxtValue(xmlNode[i]);
    }

    // 分类属性字典{key:属性英文名,value:属性中文名}
    this.propClass = new Array();
    xPath = "/system/datatag/" + elementName + "/*[@dataType ='class']";
    xmlNode = xmlSystem.selectNodesByXPath(xPath);
    for(var i = 0; i < xmlNode.length; i++ ){
        this.propClass[xmlNode[i].nodeName] = xmlSystem.getNodeTxtValue(xmlNode[i]);
    }

}

// 获取引用计数字典
ElementInfo.prototype.RefersDic = function()
{
    // 引用计数字典
    var ref = new Array();
    // 遍历所有元素类型
    for (var nodeName in elmXmls) {
        var xPath = '//*[contains(@refer,"' + this.brief + '")]';
        ref[nodeName] = elmXmls[nodeName].selectNodesByXPath(xPath).length;
    }
    return ref;
} 



// 字符串扩展 分割标签
String.prototype.SplitTags = function()
{
    var str = this;
    //STEP 1: 消除括号内的任意字符
    var re = new RegExp("\\(.*\\)|（.*）|\\[.*\\]|-","g");
    str = str.replace(re, "");

    //STEP 2: 将所有的分割符都统一为","
    re = new RegExp("，|、|\n|:|：|\\?|？|\\(|\\)|（|）|;|；|/|\\[|\\]|\\+|and|&|\\\\","g");
    str = str.replace(re, ",");

    re = new RegExp('""');
    str = str.replace(re, '"');

    re = new RegExp(' ');
    str = str.replace(re, '');

    //STEP 3: 切分后计入字典
    arr = str.split(",");

    return arr;
}

// 字符串扩展 转为HTML字符
String.prototype.ToHTML = function(node)
{
    var str = this;
    var strHTML = "";
    if (str.indexOf("http") == 0) {
        var arr = str.split("\n");
        for (var j = 0; j < arr.length; j++) {
            strHTML += "<a href='"+ arr[j] +"' target='_blank'>" + arr[j] + "</a><br/>";
        } 
    } else {
        // STEP 1: 换行符替换
        var re = new RegExp("\n","g");
        strHTML = str.replace(re, "<br/>"); 

        // STEP 2: 获取内部关联信息
        var refer = node.getAttribute("refer");
        if ((refer!=null)&&(refer!="")) {
            var refers = refer.split("#");

            for (var j = 0; j < refers.length; j++) {

                var keyword = refers[j].split("$")[0];
                var referId = refers[j].split("$")[1];
                // 【未完待续】 keyword中特殊字符处理
                var regexp = new RegExp(keyword,"g");
                strHTML = strHTML.replace(regexp, 
                    '<a href="#" onclick="showDetail(\'' + referId + '\')">' + keyword + '</a>');
                
            }
        }
    }
    return strHTML;
} 

String.prototype.MarkKeyword = function(keyword)
{
    var str = this;
    var reg = new RegExp(keyword, "g");
    str = str.replace(reg, '<strong>' + keyword + '</strong>');
    return str;
}

String.prototype.getYear = function (){//从字符串中抽取年份 2010-5-11 逻辑上有问题，再考虑考虑
    if (this == "-" || this == "" || this == null){
        return "";
    }
    var str = this;

    //STEP 0: 预处理 宽体数字替换为阿拉伯数字
    var arrFat = ["０","１","２","３","４","５","６","７","８","９"];
    var arrThin = ["0","1","2","3","4","5","6","7","8","9"];
    for (var i = 0; i < arrThin.length; i++ ){
        var re = new RegExp(arrFat[i],"g");
        str = str.replace(re,arrThin[i]);
    }

    //STEP1: 提取数字部分
    var reYear = /\d{1,4}/;
    if (str.search(/BC|前/) >= 0){ 
        // CASE 1: 公元前的年代
        return "-" + reYear.exec(str);
    } else {
        // CASE 2: 公元后的年代
        return reYear.exec(str);
    }
}

// 统计数组 返回统计字典
function ToStaticDic(arr, dic) 
{
    for (var j = 0; j < arr.length; j++) {
        if (dic.hasOwnProperty(arr[j])) {
            dic[arr[j]]++;
        } else {
            dic[arr[j]] = 1;
        }
    }
    return dic;
}

function FilterByNum(dic, num)
{
    var filtered = new Array();
    for(var key in dic){
        if (dic[key] > num) {
            filtered[key] = dic[key];
        }
    }
    return filtered;
}

// 载入包含某个时间属性的细分类
ElementInfo.prototype.TimeTags = function(classProp, timeProp, threshold)
{
    // 细分类统计字典
    var allClass = new Array();
    var xPath = '//' + timeProp + "/../" + classProp;

    console.log(xPath);

    var xmlNode = elmXmls[this.enName].selectNodesByXPath(xPath);

    for (var i = 0; i < xmlNode.length; i++) {
        var str = elmXmls[this.enName].getNodeTxtValue(xmlNode[i]);
        var arr = str.SplitTags();
        allClass = ToStaticDic(arr, allClass);
    }
    // console.log(allClass);
    return FilterByNum(allClass, threshold);
}

// 载入当前属性的细分类
ElementInfo.prototype.AllTags = function(propName, threshold)
{
    // 细分类统计字典
    var allClass = new Array();
    var xmlNode = elmXmls[this.enName].selectNodesByXPath('//' + propName);
    for (var i = 0; i < xmlNode.length; i++) {
        var str = elmXmls[this.enName].getNodeTxtValue(xmlNode[i]);
        var arr = str.SplitTags();
        allClass = ToStaticDic(arr, allClass);
    }
    // 按计数阈值过滤后的字典
    return FilterByNum(allClass, threshold);
}

// 载入某个年份的领域词典
ElementInfo.prototype.AllViews = function(year)
{
    // 领域统计字典
    var dicView = new Array();
    var xPath="//" + this.enName + "[contains(@id,'"+ this.brief + year + "')]/view/text()";
    var xmlNodes = elmXmls[this.enName].selectNodesByXPath(xPath);

    for (var i = 0; i < xmlNodes.length; i++) {
        if (xmlNodes[i] == null) {
            continue;
        }
        // 根据id获取月份
        var month = xmlNodes[i].parentNode.parentNode.getAttribute("id").substring(5, 7);
        var str = xmlNodes[i].data;
        var arr = str.SplitTags();
        // 拼接月份

        for (var j = 0; j < arr.length; j++) {
            arr[j] = month + "_" + arr[j];
        }

        dicView = ToStaticDic(arr, dicView);
    }

    return dicView;
}


// 载入所有细分类
ElementInfo.prototype.AllTags = function(threshold)
{
    // 细分类统计字典
    var allClass = new Array();

    // 遍历所有属性类型
    for (var propName in this.propClass) {
        var allTag = new Array();
        // 从当前xml节点中搜索
        var xPath = '//' + propName;
        var xmlNode = elmXmls[this.enName].selectNodesByXPath(xPath);
        for (var i = 0; i < xmlNode.length; i++) {
            var str = elmXmls[this.enName].getNodeTxtValue(xmlNode[i]);
            var arr = str.SplitTags();
            allTag = ToStaticDic(arr, allTag);
        }
        allClass[propName] = FilterByNum(allTag, threshold);
    }
    return allClass;
}

// 返回EChart所需data对象
ElementInfo.prototype.ToEChartData = function()
{
    var data = new Object();
    data.id = this.enName;
    data.name = this.chName;
    data.value = this.count;
    data.symbolSize = this.count / 10.0 + 10;
    data.itemStyle = new Object();
    data.itemStyle.color = this.color;
    // data.symbol = "image://img/" + this.enName + "_w.png"; // 显示图片
    return data;
}

// 返回EChart所需links对象数组
ElementInfo.prototype.ToEChartLinks = function()
{
    var links = new Array();

    // 引用计数字典
    var refDic = this.RefersDic();
    for (var nodeName in refDic) {
        var link = new Object();
        link.id = this.enName + "-" + nodeName;
        link.name = this.chName + "-" + nodeName;
        link.source = this.enName;
        link.target = nodeName;
        link.value = refDic[nodeName];
        links[links.length] = link;
    }

    return links;
}

function GetMinYear() {
    var minYear = 999999;
    for (var elmClass in elmXmls) {
        var xPath = "/" + elmClass + "s/" + elmClass + "[1]";
        var firstYear = elmXmls[elmClass].getAttributeByNodeXPath(xPath, "id").substring(1, 5) - 0;
        if (firstYear < minYear) {
            minYear = firstYear;
        }
    }
    return minYear;
}



function showDetail(id){ //进入id 编号的编辑画面 窗口名为info
    window.open("detail.html?id=" + id, "_blank");
}

function showConnection(id) {
    window.open("connection.html?id=" + id, "_blank");
}

function turnConnection(id) {
    window.location.href = "connection.html?id=" + id;
}