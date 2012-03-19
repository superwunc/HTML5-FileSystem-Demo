/**
    @fileOverview
    Util function 
    @author wunc <superwunc@gmail.com>
 */


(function() {

    function byId(id) {
        return document.getElementById(id);
    }

    function bind() {
        var ele = arguments[0];
        if(arguments.length == 3) {
            ele.addEventListener(arguments[1], arguments[2]);
        }
        if(arguments.length == 4) {
            ele.addEventListener(arguments[1], arguments[2], arguments[3]);
        }
    }

    function hasClass(ele, cls) {
        return ele.className && ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    }
    
    function isString(/*anything*/ it) {
        //  summary:
        //      Return true if it is a String
        return (typeof it == "string" || it instanceof String); // Boolean
    };
    
    function query() {
        if (arguments.length == 1) {
            return document.querySelectorAll(arguments[0]);
        }
        if (arguments.length == 2) {
            return arguments[0].querySelectorAll(arguments[1]);
        }
        return null;
    }
    
    function formatNumber(num) {
        return num.toString().length == 1 ? ("0" + num ): num;
    }
     
    function formatDate(time) {
        var year = time.getFullYear();
        var month = formatNumber(time.getMonth()+1);
        var date = formatNumber(time.getDate());
        var hours = formatNumber(time.getHours());
        var minutes = formatNumber(time.getMinutes());
        var seconds = formatNumber(time.getSeconds());
        return year + "-" + month + "-" + date +" "+
            hours + ":" + minutes + ":" + seconds;
    } 


    this.byId = byId;
    this.bind = bind;
    this.hasClass = hasClass;
    this.isString = isString;
    this.query = query;
    this.formatDate = formatDate;

})();
