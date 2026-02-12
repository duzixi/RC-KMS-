// 当前页打开
function turn(url)
{
  window.location.href = url;
}

// 获取URL指定参数
function getParamOfURL(variable)
{
   var query = window.location.search.substring(1);
   var vars = query.split("&");
   for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if(pair[0] == variable){
          return pair[1];
      }
   }
   return(false);
}

// 清空dom所有子节点
function clearDomChildNodes(domNode)
{
	while(domNode.hasChildNodes()) //当div下还存在子节点时 循环继续
    {
        domNode.removeChild(domNode.firstChild);
    }
}

function getLiNode(id, text, type) 
{
  var domLi = document.createElement("li");
  var domA = document.createElement("a");
  domA.setAttribute("href","#");
  domA.setAttribute("id", id);
  domA.setAttribute("type", type);
  domA.innerHTML = text;
  domA.setAttribute("onclick", "select(this)");
  domLi.appendChild(domA);
  return domLi;
}

