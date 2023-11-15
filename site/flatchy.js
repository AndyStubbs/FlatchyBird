"use strict";

// This is the starting script for the game
// It will load all the files and manage the titlescreen and start the game

// Store all the global variables in one object
const g = {
	"width": 768,
	"height": 1024,
	"fadeIn": null,
	"fadeOut": null,
	"loadGame": null,
	"startGame": null,
	"gameTextures": null,
	"titleTextures": null,
	"app": null,
	"bestScore": 0
};

( function () {

	// This is a module variable that stores all the data used to help setup the game
	const flatchy = {
		"fade": {
			"container": null,
			"action": null,
			"direction": null,
			"isActive": false,
			"speed": 0.05,
		},
		"blink": null
	};

	// Wait for the HTML DOM to finish loading
	window.addEventListener( "DOMContentLoaded", init );

	// Blink function
	g.blink = function( container ) {
		flatchy.blink = container;
		flatchy.blink.alpha = 0;
		g.app.ticker.add( blink );
	};

	g.stopBlink = function() {
		g.app.ticker.remove( blink );
	};

	function blink() {
		const f = flatchy.blink;
		f.alpha = Math.sin( g.app.ticker.lastTime / 250 ) * 0.5 + 0.5;
	}

	// Fade in function
	g.fade = function ( container, direction, action, speed ) {
		if( direction === undefined ) {
			direction = 1;
		}
		flatchy.fade.container = container;
		flatchy.fade.action = action;
		flatchy.fade.direction = direction;
		if( speed !== undefined ) {
			flatchy.fade.speed = speed;
		}
		if( flatchy.fade.isActive ) {
			g.app.ticker.remove( flatchy.fade.ticker );
		}
		flatchy.fade.isActive = true;
		g.app.ticker.add( fade);
	};

	function fade( delta ) {
		const f = flatchy.fade;
		if (
			( f.direction === 1 && f.container.alpha >= 1 ) ||
			( f.direction === -1 && f.container.alpha <= 0 )
		) {
			f.isActive = false;
			g.app.ticker.remove( fade );
			if ( f.action ) {
				f.action();
			}
			return;
		}
		f.container.alpha += f.speed * f.direction * delta;
	}

	// Initialize the game components
	function init() {

		// Load the best score
		const bestScore = localStorage.getItem( "bestScore" );
		if( bestScore ) {
			g.bestScore = parseInt( bestScore );
		}

		// Load the assets
		loadAssets();

		// Create the PIXI application
		g.app = new PIXI.Application( {
			"width": g.width,
			"height": g.height,
			"backgroundAlpha": 0
		} );
		document.body.appendChild( g.app.view );
		window.addEventListener( "resize", resize );
		resize();
	}

	// Resize the game to fit the window while maintaining the aspect ratio
	function resize() {
		g.app.renderer.resize( g.width, g.height );
		const ratio1 = document.body.clientWidth / g.width;
		const ratio2 = document.body.clientHeight / g.height;
		const newWidth = Math.floor( g.width * Math.min( ratio1, ratio2 ) );
		const newHeight = Math.floor( g.height * Math.min( ratio1, ratio2 ) );
		const canvas = document.querySelector( "canvas" );
		canvas.style.width = newWidth + "px";
		canvas.style.height = newHeight + "px";
	}

	// Load the assets
	async function loadAssets() {

		// Load the textures
		const titlePrompise = PIXI.Assets.load( "assets/title_textures.json" );
		const gamePrompise = PIXI.Assets.load( "assets/game_textures.json" );

		// Load the title screen first
		g.titleTextures = await titlePrompise;
		createTitleScreen();

		// Now load the game textures
		g.gameTextures = await gamePrompise;
		g.loadGame();
	}

	// Create the title screen
	function createTitleScreen() {

		// Create the container for the title screen
		flatchy.container = new PIXI.Container();
		g.app.stage.addChild( flatchy.container );

		// Create the background
		flatchy.background = new PIXI.Sprite( g.titleTextures.textures[ "title_bg.png" ] );
		flatchy.background.anchor.set( 0.5, 1 );
		flatchy.background.x = g.app.screen.width / 2;
		flatchy.background.y = g.app.screen.height;
		flatchy.container.addChild( flatchy.background );

		// Create the title text
		flatchy.title = new PIXI.Sprite( g.titleTextures.textures[ "title_logo.png" ] );
		flatchy.title.anchor.set( 0.5, 0.5 );
		flatchy.title.x = g.app.screen.width / 2;
		flatchy.title.y = flatchy.title.height * 2;
		flatchy.title.rotation = 0.1;
		flatchy.container.addChild( flatchy.title );

		// Create the flatchy bird
		flatchy.bird = new PIXI.Sprite( g.titleTextures.textures[ "title_flatchy.png" ] );
		flatchy.bird.anchor.set( 0.5, 0.5 );
		flatchy.bird.x = g.app.screen.width / 2;
		flatchy.bird.y = g.app.screen.height / 2;
		flatchy.container.addChild( flatchy.bird );

		// Create the start button
		flatchy.startButton = new PIXI.Sprite(
			g.titleTextures.textures[ "btns/start_btn_up.png" ]
		);
		flatchy.startButton.anchor.set( 0.5, 0.5 );
		flatchy.startButton.x = g.app.screen.width / 2;
		flatchy.startButton.y = g.app.screen.height * 0.80;
		flatchy.startButton.eventMode = "static";
		flatchy.startButton.on( "pointerdown", startGame );
		flatchy.startButton.on( "pointerover", function () {
			flatchy.startButton.tint = "#999999";
		} );
		flatchy.startButton.on( "pointerout", function () {
			flatchy.startButton.tint = "#ffffff";
		} );
		flatchy.container.addChild( flatchy.startButton );

		// Fade in the title screen
		flatchy.container.alpha = 0;
		g.fade( flatchy.container );

		// Animate the title screen
		g.app.ticker.add( animateTitle );
	}

	function animateTitle() {
		flatchy.bird.y = g.app.screen.height / 2 + Math.sin( g.app.ticker.lastTime / 500 ) * 20;
		flatchy.bird.rotation = Math.sin( g.app.ticker.lastTime / 500 ) * 0.05;
	}

	function startGame() {
		initSounds();
		flatchy.startButton.off( "pointerdown" );
		g.app.ticker.remove( animateTitle );
		g.fade( flatchy.container, -1, () => {
			g.startGame( true );
		} );
	}

	function initSounds() {
		g.sounds = {
			"click": loadSound( "assets/audio/click.wav", 0.35 ),
			"hit": loadSound( "assets/audio/hit.wav", 0.35 ),
			"medal": loadSound( "assets/audio/medal.wav", 0.35 ),
			"point": loadSound( "assets/audio/point.wav", 0.35 ),
			"rollover": loadSound( "assets/audio/rollover.wav", 0.35 ),
			"thud1": loadSound( "assets/audio/thud1.wav", 0.35 ),
			"woosh": loadSound( "assets/audio/woosh.wav", 0.35 ),
			"gases": [
				loadSound( "assets/audio/gas1.wav", 0.15 ),
				loadSound( "assets/audio/gas3.wav", 0.15 ),
				loadSound( "assets/audio/gas4.wav", 0.15 ),
				loadSound( "assets/audio/gas7.wav", 0.15 ),
				loadSound( "assets/audio/gas14.wav", 0.15 ),
				loadSound( "assets/audio/gas15.wav", 0.15 ),
				loadSound( "assets/audio/gas18.wav", 0.15 ),
				loadSound( "assets/audio/gas19.wav", 0.15 ),
				loadSound( "assets/audio/gas29.wav", 0.15 ),
				loadSound( "assets/audio/gas30.wav", 0.15 )
			]
		};
	}

	function loadSound( src, volume ) {
		return new Howl( {
			"src": [ src ], "autoplay": false, "loop": false, "volume": volume
		} );
	}

} )();