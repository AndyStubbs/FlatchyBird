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
	"startGame": null
};

( function () {

	// This is a module variable that stores all the data used to help setup the game
	const flatchy = {
		"fade": {
			"container": null,
			"action": null,
			"direction": null,
			"isActive": false
		}
	};

	// Wait for the HTML DOM to finish loading
	window.addEventListener( "DOMContentLoaded", init );

	// Fade in function
	g.fade = function ( container, direction, action ) {
		if( direction === undefined ) {
			direction = 1;
		}
		flatchy.fade.container = container;
		flatchy.fade.action = action;
		flatchy.fade.direction = direction;
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
		f.container.alpha += 0.05 * f.direction * delta;
	}

	// Initialize the game components
	function init() {

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
		const ratio1 = window.innerWidth / g.width;
		const ratio2 = window.innerHeight / g.height;
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
		flatchy.startButton = new PIXI.Sprite( g.titleTextures.textures[ "btns/start_btn_up.png" ] );
		flatchy.startButton.anchor.set( 0.5, 0.5 );
		flatchy.startButton.x = g.app.screen.width / 2;
		flatchy.startButton.y = g.app.screen.height * 0.80;
		flatchy.startButton.interactive = true;
		flatchy.startButton.buttonMode = true;
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
		g.app.ticker.remove( animateTitle );
		g.fade( flatchy.container, -1, g.startGame );
	}

} )();