// 定义浏览器类型
if(typeof BrowserType == "undefined"){
    var BrowserType = {};
    BrowserType.IE = 0;
    BrowserType.Other = 1;
}

// 一个XML数据对象
XML = function (filePath, callback) {
    if (!!window.ActiveXObject || "ActiveXObject" in window)
    {
        console.log("IE");
        this.browsertype = BrowserType.IE;
    }

	this.filePath = filePath + ".xml";
    this.client = new XMLHttpRequest();
    this.client.callback = callback;
    this.client.onload = this.handler;// (this);
    try {
        this.client.open("GET", this.filePath);
        this.client.send();
        this.msg = "request success."; 
    } catch(e) {
        this.msg = "request failed."; 
    }
}

// 响应函数
XML.prototype.handler = function () {
    if(this.status == 200 && this.responseXML != null) {
        this.callback();

    } 
}

// 获取单一节点
XML.prototype.getSingleNode = function(nodeName) {
    
    if (this.browsertype == BrowserType.IE) {
        return this.root.selectSingleNode(nodeName);
    } else {
        var nsResolver = this.xmlDoc.createNSResolver (this.root);
        return this.xmlDoc.evaluate(nodeName, this.root, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
    }
}

// 根据id获取单一节点
XML.prototype.getSingleNodeById = function (id){
    var xPath = "*[@id ='"+id+"']";
    return this.selectSingleNodeByXPath(xPath);
}

// 已知节点，获取里面的文本值
XML.prototype.getNodeTxtValue = function(node) {
    if (this.browsertype == BrowserType.IE) {
        return node.childNodes[0].nodeValue;
    } else {
        return node.innerHTML;
    }
}

// 根据节点名获取里面的值
XML.prototype.getSingleNodeTxtValue = function(nodeName) {
    var node = this.getSingleNode(nodeName);
    if (this.browsertype == BrowserType.IE) {
        return node.childNodes[0].nodeValue;
    } else {
        return node.innerHTML;
    }
} 

// 判断是否为空的文本节点
XML.prototype.isEmpty = function (node){
    if (node == null) {
        return false;
    }
    return node.nodeType == 3 && /\s/.test(node.nodeValue);
}

XML.prototype.cleanEmptyTextNode = function (childNodes) {
    var parentNode = childNodes[0].parentNode;
    for(var i = 0; i < childNodes.length; i++) { 
        //如果是文本节点，并且值为空，则删除该节点 
        if(this.isEmpty(childNodes[i])) { 
            parentNode.removeChild(childNodes[i]);        
        }
    } 
    return parentNode;
}

// 获取所有子节点名
XML.prototype.getChildNames = function(nodeName) {
    var names = new Array();
    var node = this.getSingleNode(nodeName);

    node = this.cleanEmptyTextNode(node.childNodes);

    var count = node.childNodes.length;
    for (var i = 0; i < count; i++) {
       names[i] = node.childNodes[i].tagName;
    }
    return names;
}


// 返回XPath查询的一个结果
XML.prototype.selectSingleNodeByXPath = function (xPath) {
     if (this.browsertype == BrowserType.IE) {
        return this.root.selectSingleNode(xPath);
    } else {
        var nsResolver = this.xmlDoc.createNSResolver (this.root);
        var result = this.xmlDoc.evaluate(xPath, this.root, nsResolver, XPathResult.ANY_TYPE, null);
        var node = result.iterateNext(); //枚举第一个元素
        if(!this.isEmpty(node)) { 
            return node;
        }
    }
}

// 返回XPath查询的多个结果
XML.prototype.selectNodesByXPath = function (xPath) {
    if (this.browsertype == BrowserType.IE) {
        return this.root.selectNodes(xPath);
    } else {
        var arr = new Array();
        var nsResolver = this.xmlDoc.createNSResolver (this.root);
        var result = this.xmlDoc.evaluate(xPath, this.root, nsResolver, XPathResult.ANY_TYPE, null);
        var node = result.iterateNext(); //枚举第一个元素
        if(!this.isEmpty(node)) { 
            arr[arr.length] = node;
        }
        
        while (node) {
            node = result.iterateNext(); //枚举下一个元素
            if (!node) {
                break;
            }
            if(!this.isEmpty(node)) { 
                arr[arr.length] = node;
            }
        }
        return arr;
    }
}

// 返回文本叶节点中包含关键词keyword的所有节点
XML.prototype.selectNodeContains = function (keyword) {
    // 先对关键字做字符串处理
    keyword.replace(/'/g,"");
    keyword.replace(/"/g,"");
    var xPath="//*[contains(text(),'" + keyword + "')]";

    return this.selectNodesByXPath(xPath);
}

// 获取某个节点的某个属性
XML.prototype.getAttributeByNodeXPath = function(xPath, attribute) {
    var node = this.selectSingleNodeByXPath(xPath);
    return node.getAttribute(attribute);
}
