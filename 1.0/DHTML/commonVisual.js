// (c) LotusAwhaT.  2009.9.8

var arrColors_temperature=["#fc3e04","#fab500","#faed00","#ddfd04","#99ff06","#1bff41","#03ff84","#01f1d2","#01d5fd","#037af8","#001ad5","#000162"];   //12个颜色

// 通用绘图函数

function getTip(tip,x,y,z,link,size){ //获取字符标签
	var str="";
	if (size==null){
		size=12;
	}
	/* VML **/
	//alert(x+","+y);
	str+="<span style='position:absolute;z-index:"+z+";top:"+(y-7)+"px;left:"+x+"px;font-size:"+size+"px;'>";

	if ((link!=null)&&(link!="")){//如果有连接
		str+="<a href='"+link+"'>"+tip+"</a>";
	}else{
		str+=tip;
	}
	str+="</span>";
	
	/* SVG 

	str+="<g style='position:absolute;top:"+x+"px;left:"+y+"z-index:"+z+";'>";
	str+="<text style='font-size:"+size+";'>"
	    +tip+"</text>";
	str+='</g>';

	*/
	return str;
}
//----------------------------------------------------------------------
function getRect(x,y,w,h,z,fillcolor,dsc){ //获取矩形图
	var str="";
	/* VML
	str+="<v:rect ";
	if ((fillcolor!=null)&&(fillcolor!="")){
		str+="fillcolor='"+fillcolor+"' ";	
	}
	if (z==null){
		z=0;
	}
	str+="style='position:absolute;z-index:"+z+";left:"+x+"px;top:"+y+"px;width:"+w+";height:"+h+";'>";
	if (dsc!=null){
		str+=dsc;
	}
	str+="</v:rect>";
	*/
	/* SVG */
	str+="";
	return str;
}

function getLine(x1,y1,x2,y2,z,w,color,lineId,mouseOverEvent,mouseOutEvent,clickEvent,rightClickEvent){ //获取直线
	var str="";
	if (z==null){
		z=0;
	}

	/* VML
	str+="<v:line from='"+x1+","+y1+"' to='"+x2+","+y2+"'";
	str+=" style='z-index:"+z+";position:absolute;left:0;top:0'";
	if (w==null){
		w=1;
	}
	if (lineId!=null){
		str+=" id='line"+lineId+"'";
	}
	str+=" strokeweight='"+w+"'";
	if (color!=null){
		str+=" strokecolor='"+color+"'";
	}
	str+=getEventString(mouseOverEvent,mouseOutEvent,clickEvent,rightClickEvent);
	str+="/>";
	*/
	/* SVG */
	str+='<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" '	
	if (lineId!=null){
		str+=" id='line"+lineId+"'";
	}
	str+='style="position:absolute;z-index:'+z+';stroke:'+color+';stroke-width:'+w+'"';
	//事件添加
	str+=getEventString(mouseOverEvent,mouseOutEvent,clickEvent,rightClickEvent);
	str+=" />";
	return str;
}

function getArc(x,y,w,h,sAngle,eAngle,color,z){  //获取弧
    var str="";
	str+="<v:arc style='position:absolute;z-index:"
	 +z+";left:"+x+";top:"+y+";width:"+w+";height:"+h+"' fillcolor='"+color+"' startangle='"+sAngle+"' endangle='"+eAngle+"'/>";
	return str;
}

function getTran(x1,y1,x2,y2,x3,y3,color,z){  //获取三角形
	var str="";
	/* VML
	str+="<v:polyline strokecolor='"+color+"' style='z-index:"+z+";left:-0.5;top:-0.5;position:absolute' ";
	str+="points='"+x1+","+y1+","+x2+","+y2+","+x3+","+y3+","+x1+","+y1+"' filled='t' fillcolor='"+color+"'/>";
	*/
	/* SVG */
	str+='<polygon points="'+x1+','+y1+' '+x2+','+y2+' '+x3+','+y3+'"'
	    +' style="fill:'+color+';stroke:'+color+';stroke-width:1;z-index:'+z+'"/>';
	//alert(str);
	return str;
}

function getCircle(x,y,w,h,strokecolor,fillcolor,dsc,z,circleId,mouseOverEvent,mouseOutEvent,clickEvent,rightClickEvent){//获取圆形
	var str="";
	if (z==null){
		z=0;
	}
	/* VML
	//str+=" style='z-index:"+z+";position:absolute;left:0;top:0'";
	str+="<v:Oval ";
    if (circleId!=null){
		str+=" id='circle"+circleId+"'";
	}
	str+=" style='z-index:"+z+";width:"+w+";height:"+h+";position:absolute;left:"+x+";top:"+y+"'";
	str+="strokecolor='"+strokecolor+"' fillcolor='"+fillcolor+"' alt='"+dsc+"' ";
	str+=getEventString(mouseOverEvent,mouseOutEvent,clickEvent,rightClickEvent);
	str+=" />";
	*/
	/* SVG */
	str+='<circle cx="'+x+'" cy="'+y+'" r="'+w+'" stroke="'+strokecolor+'" stroke-width="0" fill="'+fillcolor+'"';
	str+=getEventString(mouseOverEvent,mouseOutEvent,clickEvent,rightClickEvent);
	str+=' />';

	return str;

}

function getSimbolImg(x,y,z,src,dsc,simbolId,mouseOverEvent,mouseOutEvent,clickEvent,rightClickEvent){ //获得要素结点标识图
    var str="";
    if (src=="◇"){
	    //alert("◇");
	    src="../IMG/none.gif";
    }
    str+="<img ";
    if (simbolId!=null){
        str+="id='visual"+simbolId+"' ";
    }
    str+="style='z-index:"+z+";position:absolute;top:"+y+"px;left:"+x+"px' src='../IMG/"+src+"' alt='"+dsc+"' ";
  
	str+=getEventString(mouseOverEvent,mouseOutEvent,clickEvent,rightClickEvent);
	str+="/>";
    return  str;
}

function getEventString(mouseOverEvent,mouseOutEvent,clickEvent,rightClickEvent){
    var str="";
    if (mouseOverEvent!=null){
		str+=" onmouseover='"+mouseOverEvent+"'";
	}
	if (mouseOutEvent!=null){
		str+=" onmouseout='"+mouseOutEvent+"'";
	}
	if (clickEvent!=null){
		str+=" onclick='"+clickEvent+"'"; 
	}
	if (rightClickEvent!=null){
		str+=" oncontextmenu='"+rightClickEvent+"'";
	}
    return  str;
}