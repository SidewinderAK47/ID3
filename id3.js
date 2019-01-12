var globalCLabel=null;//类别标签
var golablDataSet=null; //样本集
var c=document.getElementById("myCanvas");
var ctx=c.getContext("2d");
ctx.fillStyle="#FF0000";
ctx.font="20px Arial";
var layer=0;
var offset =0;
//ctx.fillText("aaa",offset*100+100,100*layer+100);
window.onload=function(){
    

    //ctx.fillText("Hello World",0,300);
   // ctx.moveTo (100,100);       //设置起点状态
   // ctx.lineTo (700,700);       //设置末端状态
   // ctx.lineWidth = 5;          //设置线宽状态
   // ctx.strokeStyle = "#222" ;  //设置线的颜色状态
  //  ctx.stroke();               //进行绘制




    var btn1=document.getElementById("btn1");
    btn1.addEventListener("click", function(){
        var dataString= document.getElementById("textarea").value;
        //console.log(dataString);
        try {
            golablDataSet = eval('(' + dataString + ')');
            //删除选项
            var select1 =document.getElementById("select1");
            select1.innerHTML="";//清空选项

            //添加新 选项
            for(var t in golablDataSet[0]){
                document.getElementById("select1").options.add(new Option(t,t));
            }
            for(var i=0; i<golablDataSet.length; i++){
               // console.log(golablDataSet[i]);
            }
        }
        catch(err) {
            alert("输入数据集格式错误！");
            return;
        }
        alert("输入数据集格式正确");
        console.log(golablDataSet);
    });
    
    //类别属性选择按钮
    var btn2=document.getElementById("btn2");
    btn2.addEventListener("click", function(){
        var select1 =document.getElementById("select1");
        var value = select1.options[select1.selectedIndex].value; // 选中值
        clabel =value;
        alert("类别属性Y选择为："+value);
        console.log(golablDataSet);

    });

    //逐步生成决策树按钮
    var btn3=document.getElementById("btn3");
    btn3.addEventListener("click", function(){

        console.log("类别属性Y选择为："+clabel);
        ctx.clearRect(0,0,1800,900);  
        layer=0;
        offset =0;
        tree=createTree(golablDataSet);
        console.log(tree);
        plotTree(tree,0);
    
    });




};
    //id3 算法
    //计算信息熵
    function calculateXingxishang(dataSet,clabel){
        var len = dataSet.length;
        var labelsCount =new Object();
        for(var i=0 ;i<len; i++){
            currentLabel=dataSet[i][clabel];
            if(!labelsCount.hasOwnProperty( currentLabel)){
                labelsCount[ currentLabel] =0;    
            }
            labelsCount[currentLabel]+=1;
        }
       // console.log(labelsCount);
        var xingxishang =0.0;
        for(t in  labelsCount){
            var prob = labelsCount[t]/len;
            xingxishang -=prob* Math.log2(prob);
        }
        return xingxishang;
    }
    //分割数据集
    function splitDataSet(dataSet,property,value){
        var rDataSet = [];
        for(var i=0 ; i<dataSet.length; i++){
            var item = deepCopyObj(dataSet[i]);
            if(item[property]==value){
                delete item[property]
                rDataSet.push(item);
            }
        }
        return rDataSet;
    }
    //选择最好的特征
    function chooseBestPropertyToSplit(dataSet){
        var baseEntropy = calculateXingxishang(dataSet,clabel);
        console.log("当前数据集的信息熵为： "+baseEntropy);
        var bestInfoGain = -1;
        var bestProperty=null;
        console.log("用每一种属性划分数据集");
        for(var property in dataSet[0]){
            if(property==clabel)
                continue;
            var set = new Set();
            for(var i=0 ;i< dataSet.length; i++){
                set.add(dataSet[i][property]);
            }
            var newEntropy =0.0; //新的信息熵
            for( value of set){
                subDataSet = splitDataSet(dataSet,property,value);
                var prob = parseFloat(subDataSet.length)/dataSet.length;
                newEntropy += prob*calculateXingxishang(subDataSet,clabel);
            }
            
            var infoGain = baseEntropy-newEntropy;
            console.log("当前属性: "+property+" 划分数据集相对于 "+ clabel+" 的信息熵为： "+newEntropy);
            console.log("当前属性："+property+" 划分数据集相对于 "+ clabel+" 的信息增益"+infoGain);
            if(infoGain>bestInfoGain){
                bestInfoGain = infoGain;
                bestProperty=property;
            }
        }
        console.log("-->最大信息增益： "+bestInfoGain);
        console.log("-->最好的分类属性："+bestProperty);
        return bestProperty;
    }
    function majorityCount(classList){
        var classCount=new Object();
        for (var i=0; i<classList.length ; i++){
            if(!classCount.hasOwnProperty(classList[i])){
                classCount[classList[i]]=0;
            }
            classCount[classList[i]]+=1;
        }

        var temp = -1;
        var mc = null;
        for( t in classCount){
            if(classCount[t]>temp){
                temp =  classCount[t];
                mc = t;
            }
        }
        return mc;
    }



    //clabel是全局变量
    //生成决策树
    function createTree(dataSet){
        //观测分类

        var classList = [];
        for(var i=0; i<dataSet.length; i++){
            classList.push(dataSet[i][clabel]); 
        }
        var classSet = new Set(classList);
        if(classSet.size==1){                   //只有一种类型
            //console.log(classSet);
            console.log("只有一种类别： "+classList[0]);
            return classList[0];
        }
                                             //对象属性个数
        var count = 0;
        for(var i in dataSet[0]) {
            count++;
        }
        if(count==1){
            console.log("没有分类属性了，返回当前类别中个数最多类别："+majorityCount(classList));
            return majorityCount(classList);
        }
        console.log("当数据集继续划分");
        console.log(dataSet);
        var bestProperty = chooseBestPropertyToSplit(dataSet);
        //console.log("bestProperty:"+bestProperty);
        var myTree ={};
        myTree[bestProperty]={};

        //删除bestProperty的属性值
        var bestPropertyValues = [];
        for(var i=0; i<dataSet.length; i++){
            //console.log(dataSet[i][bestProperty]);
            bestPropertyValues.push(dataSet[i][bestProperty]);
        }
        //console.log(bestPropertyValues);
        var bestPropertyValueSet= new Set(bestPropertyValues);

       
        var str ="";
        for(x of bestPropertyValueSet){
            str+= x+" ";
        }
        console.log("将数据集按照找到最好的属性: "+ bestProperty+ " 进行划分为:" + bestPropertyValueSet.size + " 类："+str);
        for(x of bestPropertyValueSet){
            console.log("属性为: "+ x +" 的部分：");
            console.log(splitDataSet(dataSet,bestProperty,x));
            myTree[bestProperty][x]=createTree(splitDataSet(dataSet,bestProperty,x)); 
        }
        return myTree;
        
    }

    function deepCopyArr(arr){
        var newarr=[];
        for(var  i=0; i<arr.length; i++){
            var obj ={};
            for(var t in arr[i]){
                obj[t]=arr[i][t];
            }
              newarr.push(obj);
        }
        return newarr; 
    }
    function deepCopyObj(obj){
        var newobj ={};
        for(var t in obj){
            newobj[t]=obj[t];
        }
        return newobj;
    }

    function plotTree(tree,offset){
        var hasProZero = false;
        //console.log(typeof tree['不浮出水面是否可以生存']['否']);
        if(typeof tree== 'object'){
            var hasPro =0;
            for(var t in tree){
                hasPro ++;
            }
            for(var t in tree){
                plotTree(tree[t],offset+1);
                ctx.fillText(t,offset*100+50,50*layer+50);
                if(hasPro>1){
                    layer++;
                }
            } 
        }    
        else if(typeof tree== 'string'){
            ctx.fillText(tree,offset*100+50,50*layer+50);
        }
    }
