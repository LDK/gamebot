// The Stage is for games that feature a graphical box that may include sprites, tilemaps and/or a clickable grid.
// We use "actor" to refer to a sprite that represents a character (versus a scenery sprite, e.g.)
app.factory('stage', function(user, $http, $timeout){
	var stage = {};
	stage.element_types = {};
	stage.addActor = function(options) {	

	};
	stage.getElementTypes = function() {
		
	}
	stage.drawGrid = function() {
		var width = stage.el.width();
		var height = stage.el.height();
		var grid = $('#grid');
		grid.css('height',height+'px');
		grid.css('width',width+'px');
		var x = 0;
		var xPos = 0;
		var y = 0;
		var yPos = 0;
		while (xPos < width) {
			y = 0;
			yPos = 0;
			while (yPos < height) {
				var square = $('<div></div>');
				square.attr('id',x+'-'+y);
				square.addClass('gridsquare');
				square.css('left',xPos+'px');
				square.css('top',yPos+'px');
				$('#grid').append(square);
				y++;
				yPos = y * 64;
			}
			x++;
			xPos = x * 64;
		}
	}
	stage.addElement = function(id,item_class,options) {
		item_class = item_class || '';
		options = options || {};
		var item = $('<div id="'+id+'" class="stage '+item_class+'"</div>');
		var item = $('<div></div>');
		item.attr('id',id);
		item.addClass('stage');
		if (!fn.empty(options.elements_key)) {
			item.attr('rel',options.elements_key);
		}
		if (item_class) {
			item.addClass(item_class);
		}
		if ($.isArray(options.classes)) {
			$.each(options.classes,function(key,val){
				item.addClass(val);
			});
		}
		if (options.sub_element) {
			item.addClass('sub_element');
		}
		$.each(['top','left','width','height'],function(key,val) {
			if (options[val]) {
				item.css(val,options[val]+'px');
			}
		});
		if (stage.options.edit_mode) {
			item.click(function(){ stage.itemClick($(this)) });
		}
		if (options.destination) {
			options.destination.append(item);
		}
		else {
			stage.el.append(item);
		}
		if ($.isNumeric(options.sprite)) {
			stage.selectSprite(item,options.sprite);
		}
		if (!options.enabled || options.enabled == 0) {
			item.hide();
		}
	};
	stage.selectSprite = function(element,sprite_index,options) {
		var height = element.height();
		sprite_index--;
		element.css('background-position','0px -'+(height * sprite_index)+'px');
	}
	return stage;
});
