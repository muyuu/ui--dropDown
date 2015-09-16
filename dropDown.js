(function(definition) {
    "use strict";

    var moduleName = "DropDown";

    var root = (typeof self === "object" && self.self === self && self) || (typeof global === "object" && global.global === global && global);

    if (typeof exports === "object"){
        module.exports = definition(root, require("jquery"), require("underscore"));
    } else {
        root[moduleName] = definition(root, $, _);
    }
})(function(root, $, _) {
    "use strict";

    var Module;

    // -------------------------------------------------------
    // utility functions
    // -------------------------------------------------------
    /**
     * judge exist function
     * @param  {any} x anything
     * @return {boolean}
     */
    function existy(x){
        return x != null;
    }


    /**
     * judge true
     * @param  {any} x anything
     * @return {boolean}
     */
    function truthy(x){
        return (x !== false) && existy(x);
    }

    /**
     * trim string "."
     * @param  {string} string text
     * @return {string}        cutted "." string
     */
    function trimDot(string){
        return string.replace(".", "");
    }

    /**
     * do callback function when if exist function
     * @param {function} func callback function
     * @returns {boolean} false
     */
    function doCallBack(func){
        if (_.isFunction(func)){
            func();
        }
        return false;
    }


    // -------------------------------------------------------
    // module
    // -------------------------------------------------------

    /**
     * module factory
     * this module is dependent on jQuery
     * @prop {string} rootElement default root element class or id
     * @prop {array} instance
     * @namespace
     */
    function Factory(param){

        var rootElement = ".js-dropDown";

        // param is option object
        var opt = existy(param) ? param : {};

        // set root element
        var $self = existy(opt.root) ? $(opt.root) : $(rootElement);

        // make instances and push array
        this.instance = $self.map(function(key, val){
            return new Module(opt, val);
        });
    }


    /**
     * markeForcetructor
     * @type {Function}
     */
    Module = function (param1, root1) {
        this.param = param1;
        this.root = root1;
        this.$root = null;
        this.$select = null;
        this.$selectEle = null;
        this.$list = null;
        this.$item = null;
        this.isOpen = false;
        this.opt = {
            root              : this.rootElement || param1.root,
            select            : ".js-dropDown__select" || param1.select,
            overlaySelect     : ".js-dropDown__overlaySelect" || param1.overlaySelect,
            overlaySelectInner: ".js-dropDown__overlaySelectInner" || param1.overlaySelect,
            list              : ".js-dropDown__list" || param1.list,
            item              : ".js-dropDown__item" || param1.item,
            itemAnchor        : ".js-dropDown__anchor" || param1.item,
            animation         : true || param1.animation,

            onOpen            : null || param1.onOpen,
            onSelect          : null || param1.onSelect
        };
        this.setElement(this.root);
        this.init();
    }


    /**
     * cache jQuery object
     * @param {string} root tab root html class name
     * @returns {boolean}
     */

    Module.prototype.setElement = function(root) {
        this.$root = $(root);
        this.$select = this.$root.find(this.opt.select);
        this.$selectEle = this.$select.find('select');
        this.$list = this.$root.find(this.opt.list);
        return false;
    };

    Module.prototype.init = function() {
        var self = this;
        this.setOverlaySelect();

        this.$select.on("click", function(){
            self.togglePullDown();
        });

        $('html').on("mousedown", function(e){
            var element = e.target;

            // not working when target is this module elements
            if( self.isSelect(element) ) return false;

            if (self.isAnchor(element)) {
                self.selectItem(element);
            } else {
                self.closePullDown();
            }
        });
        return false;
    };

    Module.prototype.hasClass = function(element, classString){
        return $(element).hasClass(classString);
    }

    Module.prototype.isSelect = function(element){
        return this.hasClass(element, "js-dropDown__overlaySelectInner");
    }

    Module.prototype.isAnchor = function(element){
        return this.hasClass(element, "js-dropDown__anchor");
    }

    Module.prototype.setOverlaySelect = function() {
        this.makeOverlaySelect();
        this.makeDropDown();
        this.setSelectData();
        this.addCss();
    };

    Module.prototype.makeOverlaySelect = function() {
        var overlaySelectString, template;
        overlaySelectString = this.opt.overlaySelect.replace('.', '');
        template = '<div class="dropDown__overlaySelect ' + overlaySelectString + '">';
        template += '<div class="dropDown__overlaySelectInner ' + overlaySelectString + 'Inner">';
        template += '<span class="dropDown__overlaySelectText  ' + overlaySelectString + 'Text"></span>';
        template += '</div></div>';
        return this.$select.append(template);
    };

    Module.prototype.setSelectData = function() {
        var selectedText, selectedVal;
        selectedText = this.$selectEle.find("option:selected").text();
        selectedVal = this.$selectEle.find("option:selected").val();
        if (selectedText) {
            this.$root.find(this.opt.overlaySelect + "Text").text(selectedText).attr({
                "data-val": selectedVal
            });
        }
    };

    Module.prototype.makeDropDown = function() {
        var _makeDropDown, opt, put;
        opt = this.opt;
        put = "";

        _makeDropDown = function(index, val) {
            put += '<li class="dropDown__item ' + opt.item.replace('.', '') + '">';
            put += '<a href="#" class="' + trimDot(opt.itemAnchor) + '" data-val="' + $(val).val() + '">' + $(val).text() + '</a>';
            return put += '</li>';
        };

        this.$select.find('option').each( _makeDropDown);

        this.$list.html(put);

        this.$list.find("a").addClass();

        return this.$item = this.$root.find(this.opt.item);
    };

    Module.prototype.addCss = function() {
        return this.$root.addClass("dropDown--is-active");
    };

    Module.prototype.togglePullDown = function() {
        this.isOpen = !this.isOpen;

        var addedClass = "dropDown--is-open";
        if (this.opt.animation) addedClass += " dropDown--is-transition";

        return this.$root.toggleClass(addedClass);
    };

    Module.prototype.closePullDown = function() {

        var addedClass = "dropDown--is-open";
        if (this.opt.animation) addedClass += " dropDown--is-transition";

        return this.$root.removeClass(addedClass);
    };

    Module.prototype.selectItem = function(target) {
        var text, val;

        val = $(target).data('val');
        text = $(target).text();

        this.$selectEle.val(val);

        this.$root.find('.dropDown__overlaySelectText').text(text);

        this.togglePullDown();

        if (typeof this.opt.onSelect === 'function' ) {
            this.opt.onSelect(target);
        }
        return false;
    };

    return Factory;
});

