/*轮播主键*/
if (window.$ === undefined) {
    throw new Error('无加载jQuery');
}
//定义html:div.container>div.item*x  其中第一个class='active' 第二个class='next' 最后一个class='prev'
//定义css :css文件
//定义js  :
jQuery.fn.broadcast = function () {
    // var $items, $element = $('.container');
    var $items, $element = this;

    /* 获取当前元素下标
        @param item:$active 当前元素
    */
    function getItemIndex(item) {
        $items = item.parent().children('.item');
        return $items.index(item);
    }

    /*获取active后一个操作元素
    * @param item:$active 当前元素
    * */
    function getItemNext(active) {
        /*active 元素的索引*/
        var activeIndex = getItemIndex(active);
        if (activeIndex < $items.length - 1) {//active不是在最后一个元素上时 ，即索引在最后一个之前
            /*定义后一个索引*/
            var nextIndex = activeIndex + 1;
        } else {
            /*active 在最后一个元素时，定义第一个索引*/
            var nextIndex = 0;
        }
        /*获取定义的索引的元素*/
        return $items.eq(nextIndex);
    }

    /*获取active前一个操作元素
    *  @param item:$active 当前元素
    * */
    function getItemPrev(active) {
        /*active 元素的索引$active*/
        var activeIndex = getItemIndex(active);
        if (activeIndex > 0) { //active不是在最后一个元素上时 ，即索引在最后一个之前
            // 定义后一个索引
            var prevIndex = activeIndex - 1;
        } else {
            // active 在最后一个元素时，定义第一个索引
            var prevIndex = $items.length - 1;
        }
        // 获取定义的索引的元素
        return $items.eq(prevIndex);
    }

    // 向左滑动
    function slideLf() {
        $('.item').addClass('right').removeClass('left next');
        setTimeout(function () {
            var $active = $element.find('.item.active'); //找到预定义的active
            var $next = getItemNext($active); //active 的下一个操作元素
            $active.addClass('prev').removeClass('active').siblings('.prev').removeClass('prev');
            $next.addClass('active');//这里是通过在html中给加的默认next，提前于第一次触发时
            changeBg();
        }, 0)

    }

    // 向右滑动
    function slideRf() {
        $('.item').addClass('left').removeClass('right prev');
        setTimeout(function () {
            var $active = $element.find('.item.active');  //找到预定义的$active= $('.item.active')
            var $prev = getItemPrev($active); //active的上一个操作元素
            $active.addClass('next').removeClass('active').siblings('.next').removeClass('next');
            $prev.addClass('active');//这里是通过在html中给加的默认prev，提前于第一次触发时
            changeBg();
        }, 0)
    }

    // 跳到指定元素
    // @param index：指定元素的索引
    function slideTo(index) {
        var $next = $element.children('.item:eq(' + index + ')');//需要移入的元素
        var $active = $('.active');//当前显示元素
        var $activeIndex = getItemIndex($active);//当前显示元素索引
        // 如果需要引入的元素索引大于当前显示的元素索引，则向左滑
        if (index > $activeIndex) { //如何提前将全部元素放置到next
            // $active加上left，$next加上active，
            $('.item').addClass('right').removeClass('left next');
            setTimeout(function () {
                $active.removeClass('active').addClass('prev').siblings('.prev').removeClass('prev');
                $next.addClass('active').siblings('.active').removeClass('active');
                changeBg()
            }, 0)
        }
        // 如果需要引入的元素索引小于当前显示的元素索引，则为向右滑
        if (index < $activeIndex) {//如何提前将$active放置到左边？？？setTimeout
            $('.item').addClass('left').removeClass('right prev');
            setTimeout(function () {
                $active.removeClass('active').addClass('next').siblings('.next').removeClass('next');
                $next.addClass('active').siblings('.active').removeClass('active');
                changeBg()
            }, 0)

        }
    }

    //定义定时器
    var timer = setInterval(function () {
        slideLf();
        changeBg();
    }, 2000);
    // 滑入暂停 滑出开始
    this.on('mouseover', function () {
        clearInterval(timer);
    });
    this.on('mouseleave', function () {
        timer = setInterval(function () {
            slideLf();
            changeBg();
        }, 2000);
    });

    // 定义按钮功能
    // 伪元素不是真实的dom节点，只是实现了一些特定的效果，无法绑定事件
    // html 添加div.broadcastBtn css编写定位
    var broadcastBtn = "<i class='lf '></i>"
        + "<i class='rf '></i>";
    $('.broadcastBtn').html(broadcastBtn);
    // 为什么bs的箭头没有出现 字体支撑与bs的引入
    $('.broadcastBtn').on('click', '.lf', function () {
        slideLf()
    });
    $('.broadcastBtn').on('click', '.rf', function () {
        slideRf()
    });


    //连续快速点击出现的问题???

    //定义圆点功能
    //鼠标滑入圆点播放相应图片 如何给第一个i添加默认初始背景（页面渲染后给统一生成的元素中的某一个默认添加class）？？？？
    /*html 添加div.broadcastDot css编写定位*/
    var broadcastDot = '';
    for (var i = 0; i < $('.item').length; i++) {/*这里为什么不能用$items*/
        broadcastDot += "<i class='dot" + i + "'></i>";
    }
    $('.broadcastDot').html(broadcastDot);
    $('.broadcastDot').on('mouseover', 'i', function () {
        var index = $(this).index();//滑入圆点的索引
        slideTo(index);
    });
    // $()(function(){$('.broadcast-dot>i:eq(1)').addClass('changeBg');});
    //active对应圆点自动添加背景   每个事件里面都添加这个方法？？？
    function changeBg() {
        var activeIndex = getItemIndex($('.active'));
        $('.broadcastDot>i:eq(' + activeIndex + ')').addClass('changeBg').siblings().removeClass('changeBg');
    }


    //定义鼠标拖动效果
    function drag() {
        var x1 = null, x2 = null, x3 = null, xPart = null, moveing;
        var width = $('.container')[0].offsetWidth;//jq对象转换为dom对象 outerWidth() jq方法
        xPart = width * 0.5;//如果滑动过一半的宽度则切换否则回弹
        $('.container').on('mousedown', function (e) {//记录鼠标按下的坐标
            x1 = e.offsetX;
            moveing = true;
        });
        $('.container').on('mouseup', function (e) {//记录鼠标松开的坐标
            x2 = e.offsetX;
            moveing = false;
            var x = x2 - x1;
            if (x > xPart) {
                slideRf();
            } else if (x < -xPart) {
                slideLf();
            } else if (x === 0) {
                return false;
            } else {
                /*如何实现反弹*/
            }
        });
        /*如果点击的是图片该如何？？？如果点击到外面如何处理*/
        //如何实现拖动的过程及回弹效果
        // $('.container').on('mousemove', function (e) {//鼠标移动
        //     if (moveing) {
        //         x3 = e.offsetX;
        //         if (x3 > x1) {//向右滑动
        //             $('.active').css('left', -(width - (x3 - x1)));
        //             $('.next').css('left', x3 - x1);
        //         }
        //         if (x3 < x1) {//向左滑
        //             $('.active').css('left', width - (x1 - x3));
        //             $('.prev').css('left', x3 - x1);
        //         }
        //     }
        // })
    }
drag()


}
;