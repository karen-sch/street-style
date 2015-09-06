var menu, front_layer, back_layer, emojiCursor, cameraSound;
var imagedata = JSON.parse(data);
var width = 400;
var height = 600;
var menuHeight = 75;		
var game = new Phaser.Game(width, height, Phaser.AUTO, 'game', { preload: preload, create: create, update: update}, true, false);
var npc = {};
var initialScale = 0;
var initialX = 95;
var initialY = -400;
var hover = false;
var writing = false;
var fashionPhrases = ["Tres chic!", "So stylish", "<3 this look", "Cool outfit!", "Very hip"];

$("#toggle_blog").click(function() {
	$( "#blog, #game" ).toggle();
	$("#toggle_blog").text($("#blog").is(":visible") ? "Street" : "Blog");
	
});

function createRandomSprite(type){
	object = imagedata[type];
	var index = Math.floor((Math.random() * object.length));
	var frame1 = type + '/' + (index + 1) + '/' + object[index]["1"];
	var frame2 = type + '/' + (index + 1) + '/' + object[index]["2"];
	var sprite = back_layer.create(initialX, initialY, 'fashion', frame1);
	sprite.scale.setTo(initialScale, initialScale);
	sprite.animations.add('walk', [frame1, frame2], 2.5, true, false);
	sprite.animations.play('walk');
	sprite.name = type;
	return sprite;
}


function newNPC(){
	var npc = {};
	var spriteGroup = game.add.group();
	back_layer.add(spriteGroup);
	spriteGroup.add(createRandomSprite('body'));
	spriteGroup.add(createRandomSprite('hair'));

	var random = Math.floor((Math.random() * 2));
	if (random == 0){
		spriteGroup.add(createRandomSprite('jumpsuits'));
	}
	else {
		spriteGroup.add(createRandomSprite('pants'));
		spriteGroup.add(createRandomSprite('tops'));		
	}

	spriteGroup.add(createRandomSprite('shoes'));
	spriteGroup.forEach(function(item) {
		item.inputEnabled = true;
		item.input.useHandCursor = true; 
		item.events.onInputOver.add(function(){
			hover = true;
			emojiCursor.visible = true;
		}, this);
		item.events.onInputOut.add(function(){
			hover = false;
			emojiCursor.visible = false;
		}, this);
		item.events.onInputDown.add(clickOnStyle, this);			   
	}, this);

	npc.x = initialX;
	npc.y = initialY;
	npc.scale = initialScale;
	npc.sprites = spriteGroup;
	npc.blogged = false;
	return npc;
}

function clickOnStyle(){
	if (npc.blogged){
		return;
	}
	writing = true;
	cameraSound.play();
	text = new Phaser.BitmapText(game, 10, 50, "superscript", "I love your\noutfit!", 30);
	game.time.events.add(1000, text.destroy, text);
	front_layer.add(text);
	var bitmap = new Phaser.BitmapData(game, "bitmap", 78, 190);
	npc.sprites.forEach(function(item) {
		item.y = 0;
		item.x = 0;
		item.scale.setTo(1, 1);
		bitmap.draw(item);
		item.y = npc.y;
		item.x = npc.x;
		item.scale.setTo(npc.scale, npc.scale);
	}, this);
	var data = bitmap.baseTexture.source;
	var test = data.toDataURL("image/png");
	var index = Math.floor((Math.random() * fashionPhrases.length));
	$('body').append("<div id='writepost'><h2>Write a blog post!</h2><form><textarea rows='5' class='emojis-wysiwyg'></textarea></form><button id='emojibutton'>Emoji</button><button id='post'>Post</button><button id='cancel'>Cancel</button></div>");
	$('.emojis-wysiwyg').emojiarea({wysiwyg: true, button: '#emojibutton'});
	$('#post').click(function(){
		var entry = $('.emoji-wysiwyg-editor').html();
		$("#blog").append("<div><h1>" + fashionPhrases[index] + "</h1><h3>Posted on "
			+ new Date($.now()) + "</h3><div class='entry'>" + entry + "</div><img class='blogimg' src='"
			+ test + "' /></div>");
		$('#writepost').remove();
		npc.blogged = true;
		writing = false;
	});
	$('#cancel').click(function(){
		$('#writepost').remove();
		writing = false;
	});	
	
}

function preload() {
	game.load.atlasJSONHash('fashion', 'images/fashion.png', 'images/fashion.json');
	game.load.bitmapFont('superscript', 'font/superscript.png', 'font/superscript.fnt');
	game.load.audio('camera', 'audio/166500__thompsonman__camera-shutter.wav');
	game.load.image('emojiCursor', 'emojiarea/packs/basic/images/camera.png')
}

function create() {	
	back_layer = game.add.group();
	front_layer = game.add.group();
	cameraSound = game.add.audio('camera');
	emojiCursor = front_layer.create(0, 0, 'emojiCursor');
	emojiCursor.visible = false;
	emojiCursor.scale.setTo(0.5, 0.5);
	npc= newNPC();
}

function update() {
	if (!hover && !writing){				
		npc.y += 1.5;
		npc.scale = (((npc.y)/height)*(1.5))+3;
		npc.sprites.forEach(function(item) {
			item.y = npc.y;
			item.scale.setTo(npc.scale, npc.scale);
		}, this);

		if (npc.y > height){
			npc = newNPC();
		}
	}
	else {
		emojiCursor.x = game.input.x;
		emojiCursor.y = game.input.y;
	}
}