app.directive('npwArena', function (user, gameState, bot, stage, $http) {
	return {
		restrict: 'E',
		scope: {
			arenaId: '@',
			width: '@',
			height: '@',
			stageDisplay: '@'
		},
		templateUrl: 'game/npw-arena.template.html',
		link: function(scope, element, attrs){
			stage.arena_locations = {
				NWC: {
					top: -12,
					left: 50
				},
				NEC: {
					top: -12,
					left: 340
				},
				SWC: {
					top: 92,
					left: 25
				},
				SEC: {
					top: 92,
					left: 363
				},
				AWN: {
					top:-12,
					left: 15
				},
				ASE: {
					top: 110,
					left: 365
				},
				AES: {
					top: 92,
					left: 405
				},
				ASW: {
					top: 110,
					left: 25
				},
				ACE: {
					top: 110,
					left: 195
				},
				ACW: {
					top: 110,
					left: 122
				},
				C1: {
					top: 40,
					left: 195
				},
				C2: {
					top: 14,
					left: 122
				}
			};
			scope.stageDisplay = attrs.stagedisplay;
			scope.arenaId = attrs.arenaid;
			scope.setRingOptions = function(options) {
				if (options.mat) {
					scope.selectSprite($('#stage div#mat'),options.mat);
				}
				if (options.logo) {
					scope.selectSprite($('#stage div#ringlogo'),options.logo);
				}
				if (options.apron) {
					scope.selectSprite($('#stage div#frontApron'),options.apron);
				}
			};
			scope.setRopesColor = function(rope, color) {
				var ropeColors = ['red','black','blue','white'];
				for (var key in ropeColors){
					$('#frontropes-'+rope).removeClass(ropeColors[key]);
					$('#leftropes-'+rope).removeClass(ropeColors[key]);
					$('#rightropes-'+rope).removeClass(ropeColors[key]);
					$('#backropes-'+rope).removeClass(ropeColors[key]);
				};
				$('#frontropes-'+rope).addClass(color);
				$('#leftropes-'+rope).addClass(color);
				$('#rightropes-'+rope).addClass(color);
				$('#backropes-'+rope).addClass(color);
			};
			scope.setRopesColors = function(colors) {
				scope.setRopesColor('top', colors.top);
				scope.setRopesColor('middle', colors.middle);
				scope.setRopesColor('bottom', colors.bottom);
			};
			scope.drawArena = function() {
				scope.ringDrawn = false;
				var checkElements = setInterval(function(){
					jQuery('div.stage-element:not(.sub-element)').each(function(key,obj){
						clearInterval(checkElements);
						var etop = parseInt(jQuery(this).attr('data-top'));
						var eleft = parseInt(jQuery(this).attr('data-left'));
						jQuery(this).appendTo('#stage');
						jQuery(this).css('top',etop);
						jQuery(this).css('left',eleft);
					});
					jQuery('div.barricades').each(function(key,obj){
						if (parseInt(jQuery(obj).attr('data-top')) > 440) { 
							jQuery(this).addClass('front');
						}
					});
					if (scope.arena.options.ropes_colors) {
						scope.setRopesColors(scope.arena.options.ropes_colors);
					}
					scope.setPostsColor(scope.arena.options.post_color || 'black');
					scope.setBucklesColor(scope.arena.options.buckles_color || 'black');
					for (var i in scope.arena.elements) {
						var el = scope.arena.elements[i];
						if (el.item_class == 'ring' && el.options) {
							scope.setRingOptions(el.options);
						}
						if (el.options.width) {
							jQuery('#'+el.id).css('width',el.options.width+'px');
						}
						if (el.options.height) {
							jQuery('#'+el.id).css('height',el.options.height+'px');
						}
						if (el.options.sprite) {
							scope.selectSprite($('#'+el.id),el.options.sprite);
						}
					}
					if (scope.arena.options.floor_color) {
						$('.floor').css('background',scope.arena.options.floor_color);
					}
					scope.ringDrawn = true;
					for (var actorId in stage.actors) {
					    if (stage.actors.hasOwnProperty(actorId)) {
							var actor = stage.actors[actorId];
							stage.placeActor(actorId,actor.location,actor.position,actor.facing);
							$('div.actor#'+actorId).show();
					    }
					}

				},300);
			}
			scope.setPostsColor = function(color) {
				var postColors = ['red','black','blue','white'];
				for (var key in postColors){
					$('#frontcorners').removeClass(postColors[key]);
					$('#backcorners').removeClass(postColors[key]);
				};
				$('#backcorners').addClass(color);
				$('#frontcorners').addClass(color);
			}
			scope.setBucklesColor = function(color) {
				var buckleColors = ['red','black','blue','white'];
				for (var key in buckleColors){
					$('#frontbuckles').removeClass(buckleColors[key]);
					$('#backbuckles').removeClass(buckleColors[key]);
				};
				$('#backbuckles').addClass(color);
				$('#frontbuckles').addClass(color);
			}
			scope.selectSprite = function(element,sprite_index,options) {
				var height = element.height();
				sprite_index--;
				element.css('background-position','0px -'+(height * sprite_index)+'px');
			}
			scope.getArena = function(arena_id) {
				$http.get('http://npw.electric-bungalow.com/' + 'arena/' + arena_id + '/json').then(function(response){
					scope.arena = { id: arena_id };
					scope.arena.info = response.data.arena;
					scope.arena.elements = response.data.arena_elements;
					for (var key in scope.arena.elements) {
						scope.arena.elements[key].options = JSON.parse(scope.arena.elements[key].options);
					}
					scope.arena.options = response.data.arena_options;
					if (scope.arena.options.ropes_colors && $.type(scope.arena.options.ropes_colors) == 'string') {
						scope.arena.options.ropes_colors = JSON.parse(scope.arena.options.ropes_colors);
					}
					scope.drawArena();
				});
			};
			stage.placeActor = function(id,location,position,facing){
				var actor = jQuery('div.actor#'+id);
				var ringPos = jQuery('div.stage-element.ring:not(.sub-element)').position();
				var ringTop = ringPos.top;
				var ringLeft = ringPos.left;
				var actorTop = ringTop + stage.arena_locations[location].top;
				var actorLeft = ringLeft + stage.arena_locations[location].left;
				var currentFps = 12;
				var animationSettings = {
					fps: currentFps,
					loop: false,
					autoplay: false,
					animations: {
						standingSE: [27],
						standingSW: [26],
						standingNE: [25],
						standingNW: [24],
						standingE: [28],
						standingW: [29],
						walkNW: [0, 1, 2, 3, 4, 5],
						walkSE: [6, 7, 8, 9, 10, 11],
						walkNE: [12, 13, 14, 15, 16, 17], 
						walkSW: [18, 19, 20, 21, 22, 23],
						lateralPressS: [31, 32, 33, 34],
						fallE: [36,37,38,39,40,41],
						fallW: [47,46,45,44,43,42],
						getUpSE: [49,50,51,52,53,27],
						getUpSW: [58,57,56,55,54,26],
						getUpNE: [49,50,51,52,53,25],
						getUpNW: [58,57,56,55,54,24],
						exitRingApronWNE: [72,73,74,75,76,25],
						exitRingApronWSE: [72,73,74,75,76,27],
						exitRingApronENW: [76,77,78,79,80,24],
						exitRingApronESW: [76,77,78,79,80,26],
						enterRingApronWNE: [76,75,74,73,72,25],
						enterRingApronWSE: [76,75,74,73,72,27],
						enterRingApronENW: [80,79,78,77,76,24],
						enterRingApronESW: [80,79,78,77,76,26],
						tagInE: [68,68,68,69,69,69,76,75,74,73,72,27],
						tagInW: [80,80,80,81,81,81,72,79,78,77,76,24],
						tagOutE: [70,70,70,71,71,71,76,77,78,79,72,24],
						tagOutW: [82,82,82,83,83,83,72,73,74,75,76,27],
						rollE: [60,61,62,63],
						rollW: [67,66,65,64],
						rollEUpSE: [61,62,63,50,51,52,53,27],
						rollEUpNE: [61,62,63,50,51,52,53,25],
						rollWUpSW: [66,65,64,57,56,55,54,26],
						rollWUpNW: [66,65,64,57,56,55,54,24]
					},
					animationOptions: {
						standingSE: { loop: false },
						standingSW: { loop: false },
						standingNE: { loop: false },
						standingNW: { loop: false },
						standingE: { loop: false },
						standingW: { loop: false },
						walkNW: { loop: true },
						walkSE: { loop: true },
						walkNE: { loop: true }, 
						walkSW: { loop: true },
						lateralPressS: { loop: false },
						fallE: { loop: false },
						fallW: { loop: false },
						getUpSE: { loop: false },
						getUpSW: { loop: false },
						getUpNE: { loop: false },
						getUpNW: { loop: false },
						exitRingApronWNE: { loop: false },
						exitRingApronWSE: { loop: false },
						exitRingApronENW: { loop: false },
						exitRingApronESW: { loop: false },
						enterRingApronWNE: { loop: false },
						enterRingApronWSE: { loop: false },
						enterRingApronENW: { loop: false },
						enterRingApronESW: { loop: false },
						tagInE: { loop: false },
						tagOutE: { loop: false },
						tagInW: { loop: false },
						tagOutW: { loop: false },
						rollE: { loop: false },
						rollW: { loop: false },
						rollEUpSE: { loop: false },
						rollEUpNE: { loop: false },
						rollWUpSW: { loop: false },
						rollWUpNW: { loop: false }
					},
					keyframes: {
						24: { parent_facing: 'NW', parent_position: 'standing' },
						25: { parent_facing: 'NE', parent_position: 'standing' },
						26: { parent_facing: 'SW', parent_position: 'standing' },
						27: { parent_facing: 'SE', parent_position: 'standing' },
						0: 	{ parent_facing: 'NW', parent_position: 'standing' },
						6: 	{ parent_facing: 'SE', parent_position: 'standing' },
						12: { parent_facing: 'NE', parent_position: 'standing' },
						18: { parent_facing: 'SW', parent_position: 'standing' },
						36: { parent_facing: 'E', parent_position: 'standing'},
						47: { parent_facing: 'W', parent_position: 'standing'},
						40: { parent_position: 'lying' },
						41: { parent_position: 'lying' },
						42: { parent_position: 'lying' },
						43: { parent_position: 'lying' }
					},
					keysteps: {
						exitRingApronWNE: {
							4: { parent_zone: 'apron-west', removeClass: 'zone-ring', addClass: 'zone-apron-west' },
							6: { css_left: '-39' }
						},
						exitRingApronWSE: {
							4: { parent_zone: 'apron-west', removeClass: 'zone-ring', addClass: 'zone-apron-west' },
							6: { css_left: '-39' }
						},
						exitRingApronENE: {
							4: { parent_zone: 'apron-east', removeClass: 'zone-ring', addClass: 'zone-apron-west' },
							6: { css_left: '+39' }
						},
						exitRingApronESE: {
							4: { parent_zone: 'apron-east', removeClass: 'zone-ring', addClass: 'zone-apron-west' },
							6: { css_left: '+39' }
						},
						tagOutW: {
							10: { parent_zone: 'apron-west', removeClass: 'zone-ring', addClass: 'zone-apron-west' },
							12: { css_left: '-39' }
						},
						tagOutE: {
							10: { parent_zone: 'apron-east', removeClass: 'zone-ring', addClass: 'zone-apron-east' },
							7: { css_left: '+39' }
						},
						enterRingApronENW: {
							1: { css_left: '+39' },
							3: { parent_zone: 'ring', addClass: 'zone-ring', removeClass: 'zone-apron-west' }
						},
						enterRingApronWSE: {
							1: { css_left: '+39' },
							3: { parent_zone: 'ring', addClass: 'zone-ring', removeClass: 'zone-apron-west' }
						},
						tagInE: {
							7: { css_left: '+39' },
							9: { parent_zone: 'ring', addClass: 'zone-ring', removeClass: 'zone-apron-west' }
						},
						tagInW: {
							12: { css_left: '-39' },
							10: { parent_zone: 'ring', addClass: 'zone-ring', removeClass: 'zone-apron-west' }
						},
						exitRingApronENW: {
							4: { parent_zone: 'apron-east' }
						},
						exitRingApronESW: {
							4: { parent_zone: 'apron-east' }
						}
					},
					complete: function(){

					}
				};
				actor.animateSprite(animationSettings);
				actor.animateSprite('play',position+facing);
				actor.css('top',actorTop);
				actor.css('left',actorLeft);
			}; 
			scope.gameState = gameState;
			scope.user = user;
			scope.bot = bot;
			scope.stage = stage;
			jQuery('document').ready(scope.getArena(attrs.arenaid));
		},
	};
});
$('#undertaker').animateSprite('play','tagOutW');
$('#bret').animateSprite('play','tagInE');

$('#bret').animateSprite('play','tagOutW');
$('#undertaker').animateSprite('play','tagInE');