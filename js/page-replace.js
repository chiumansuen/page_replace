// 全局变量
var memoryNumber = 7;
var pageLost = 0;
var stack = [];
// var memoryStack = [];
var method = 'fifo';
var timer = null;
var cache = {
	memoryNumberInput: $('#memoryNumber'),
	stackInput: $('#stack'),
	stackWait: $('#stackWait'),
	stackFinish: $('#stackFinish'),
	stackStatus: $('#manages .stack .content'),
	methodStatus: $('#manages .method .content'),
	loseStatus: $('#manages .lose .content'),
	cpuStatus: $('#manages .cpu .content'),
	boxs: $('#boxs')
}; // 缓存DOM

// 页块数 初始化
function initMemoryNumber() {

	// 设置页块数
	var _memoryNumber = parseInt(cache.memoryNumberInput.val().trim());
	memoryNumber =_memoryNumber;
	if(isNaN(_memoryNumber))
		memoryNumber = 7;

	// 渲染页块
	var boxs = cache.boxs;
	var width = (480 / memoryNumber) + 'px';
	boxs.html("");
	for(var i = 0; i < memoryNumber; i++) {
		var box = $('<div/>').addClass('box').attr('width', width);
		box.html("空闲");
		boxs.append(box);
	}
	// flashPage();
}

//随机创建页块



// 队列 初始化
function initStack() {
	// 清空队列
	cache.stackWait.html("");
	cache.stackFinish.html("");
	clearStatus();
	// 设置页面队列 
	var _stack = cache.stackInput.val().trim().split(',');
	for(var i = 0; i < _stack.length; i++) {
		_stack[i] = parseInt(_stack[i]);
	}
	stack = _stack.concat();

	// 渲染等待队列
	var stackWait = cache.stackWait;
	stackWait.html("");
	for(var i = 0; i < stack.length; i++) {
		var span = $("<span/>").addClass("button yellow").html(stack[i])
					.attr('style', 'margin-left: 9px;');
		stackWait.append(span);
		// memoryStack[i] = -1;
	}

	// 渲染页面状态
	cache.stackStatus.html(stack.length);
	$('.manage.stack').attr('class', 'stack yellow manage');
}

//随机创建页面
function random(){
	cache.stackWait.html("");
	cache.stackFinish.html("");
	clearStatus();
	var iArray =[];
	function getRandom(iStart,iEnd){
		var iChoice = iStart-iEnd+1;
		return Math.abs(Math.floor(Math.random()*iChoice))+iStart;
	}
	for(var i=0;i<7;i++){
		iArray.push(getRandom(0,7))
	}
	stack = iArray.concat();
	cache.stackInput.val(stack);
	var stackWait = cache.stackWait;
	stackWait.html("");
	for(var i = 0; i < stack.length; i++) {
		var span = $("<span/>").addClass("button yellow").html(stack[i])
					.attr('style', 'margin-left: 9px;');
		stackWait.append(span);
		// memoryStack[i] = -1;
	}

	// 渲染队列状态
	cache.stackStatus.html(stack.length);
	$('.manage.stack').attr('class', 'stack yellow manage');
	
}


// 重置
function clearAll() {
	// stopAll();
	// memoryNumber = 7;
	// pageLost = 0;
	// stack = [];
	// memoryStack = [];
	// method = 'fifo';
	// clearMemory();
	// cache.stackWait.html("");
	// cache.stackFinish.html("");
	// clearStatus();
	window.location.reload();
}

function clearStatus() {
	cache.cpuStatus.html("0");
	$('#manages .cpu').attr('class', 'manage cpu blue');
	cache.loseStatus.html("0");
	$('#manages .lose').attr('class', 'manage lose blue');
	cache.stackStatus.html("0");
	$('#manages .stack').attr('class', 'manage stack blue');
	cache.methodStatus.html("FIFO");
	$('#manages .method').attr('class', 'manage method blue');
}

// function clearMemory() {
// 	var boxs = cache.boxs;
// 	boxs.html("");
// 	for(var i = 0; i < memoryNumber; i++) {
// 		var box = $('<div/>').addClass('box');
// 		box.html("空闲");
// 		boxs.append(box);
// 	}
// 	flashPage();
// 	console.log('clear');
// }


function stopAll() {
	window.clearInterval(timer);
}

// 运行程序 
function run() {
	// memoryStackReset();
	if(method == 'fifo') {
		FIFO();
	} else if(method == 'lru') {
		LRU();
	} 

}

// 重置缓存数组
// function memoryStackReset() {
// 	for(var i = 0; i < memoryNumber; i++) {
// 		memoryStack[i] = -1;
// 	}
// }

// 内存状态更新
function cpuUpdate() {
	var use = 0;
	var box = $('#boxs .box');
	for(var k = 0; k < box.length; k++) {
		if(box[k].innerHTML != '空闲') {
			use++;
		}
	}
	var num = parseInt(use / memoryNumber * 100)
	cache.cpuStatus.html(num + '%');
	if(num < 33){
		$('#manages .cpu').attr('class', 'manage cpu blue');
	} else if (num < 66) {
		$('#manages .cpu').attr('class', 'manage cpu yellow');
	} else if (num <= 100) {
		$('#manages .cpu').attr('class', 'manage cpu red');
	}
}

//完成队列那一块的动态显示
function stackFinishUpdate() {
	var box = $('#boxs .box');
	for(var k = 0; k < box.length; k++) {
		var span = $('<span/>').addClass('button').text(box[k].innerHTML).attr('style', 'display:inline; margin-left: 9px;');
		cache.stackFinish.append(span);
	}
	var br = $('<br/>');
	cache.stackFinish.append(br);
}

// FIFO 算法
function FIFO() {
	var length = stack.length;
	var _stack = stack.concat();
	var i = 0;
	var resetid;
	var stackStatus = cache.stackStatus;
	var loseStatus = cache.loseStatus;
	var flog = 0;       //检测是否命中 命中为1 不命中为0
	var flogTime = 0;  //计算缺页率
	var use = 0;
	cache.stackFinish.html("");
	timer = setInterval(function() {
		if(i != length) {
			flog = 0;
			stackStatus.html(length - i - 1);
			
			if((length - i - 1) == 0) 
				$('.manage.stack').attr('class', 'stack green manage');
			var box = $('#boxs .box');
			for(var k = 0; k < box.length; k++) {
				if(box[k].innerHTML == _stack[i]) {
					flog = 1;
					flogTime++;
					box[k].className = 'box blue';
				}
			}
			loseStatus.html(parseInt(((i - flogTime +1) / stack.length)* 100) + '%');
			if(flog != 1) {
				var div = $('<div/>').addClass('box yellow').text(_stack[i]).attr('style', 'display:inline-block');
				cache.boxs.append(div);
				box[0].remove();
				box = $('#boxs .box');
			}
			i++;
		} 
		else {
			var box = $('#boxs .box');
			var div = $('<div/>').addClass('box green').text("空闲").attr('style', 'display:inline-block');
			cache.boxs.append(div);
			box[0].remove();
		}
		cpuUpdate();
		stackFinishUpdate();
	}, 1000);
	setTimeout(function() {
		window.clearInterval(timer);
	}, (length + memoryNumber ) * 1000);
}

//LRU算法

function LRU(){
	var length = stack.length;
	var _stack = stack.concat();
	var i = 0;
	var resetid;
	var stackStatus = cache.stackStatus;
	var loseStatus = cache.loseStatus;
	var flog = 0;       //检测是否命中 命中为1 不命中为0
	var flogTime = 0;  //计算缺页率
	var use = 0;
	cache.stackFinish.html("");
	timer = setInterval(function() {
		if(i != length) {
			flog = 0;
			stackStatus.html(length - i - 1);
			
			if((length - i - 1) == 0) 
				$('.manage.stack').attr('class', 'stack green manage');
			var box = $('#boxs .box');
			for(var k = 0; k < box.length; k++) {
				if(box[k].innerHTML == _stack[i]) {
					flog = 1;
					flogTime++;
					// box.splice(-1,0,box[k]);
					// box.splice(k,1);
					// box[k].className = 'box blue';
					var div = $('<div/>').addClass('box blue').text(_stack[i]).attr('style', 'display:inline-block');
					cache.boxs.append(div);
					box[k].remove();
				}
			}
			loseStatus.html(parseInt(((i - flogTime +1) / stack.length)* 100) + '%');
			if(flog != 1) {
				var div = $('<div/>').addClass('box yellow').text(_stack[i]).attr('style', 'display:inline-block');
				cache.boxs.append(div);
				box[0].remove();
				box = $('#boxs .box');
			}
			i++;
		} 
		else {
			var box = $('#boxs .box');
			var div = $('<div/>').addClass('box green').text("空闲").attr('style', 'display:inline-block');
			cache.boxs.append(div);
			box[0].remove();
		}
		cpuUpdate();
		stackFinishUpdate();
	}, 1000);
	setTimeout(function() {
		window.clearInterval(timer);
	}, (length + memoryNumber ) * 1000);
}

算法选择
function setMethod(event) {
	var color = '';
	cache.methodStatus.html(event.innerHTML);
	method = event.innerHTML.toLowerCase();
	if(method == 'fifo') {
		color = 'method blue manage';
	} else if(method == 'lru') {
		color = 'method green manage';
	} else {
		color = 'method yellow manage';
	}
	$('#manages .method').attr('class', color);
}

