"use strict";

( function () {
	const game = {
		"container": null,
		"ground": null,
		"clouds": null,
		"background": null,
		"trees": null,
	};

	// Load the game's sprites and animations
	g.loadGame = function () {
		loadGame();
	};

	// Start the game
	g.startGame = function () {
		startGame();
	};

	function loadGame() {

		// Create the game container
		game.container = new PIXI.Container();
		game.container.visible = false;
		game.container.alpha = 0;
		g.app.stage.addChild( game.container );

		// Create the hills background
		game.background = createTilingSprite(
			g.gameTextures.textures[ "hills.png" ], 2, 0.5, g.app.screen.height - 50
		);

		// Create the clouds
		createClouds();

		// Create the trees
		game.trees = [ createTree(), createTree() ];
		game.trees[ 0 ].container.x = g.app.screen.width / 2;
		game.trees[ 0 ].container.y = 0;

		// Move the second tree about 1/2 screen width to the right
		game.trees[ 1 ].container.x = game.trees[ 0 ].container.x +
			g.app.screen.width / 2 + game.trees[ 1 ].container.width / 2;

		// Sort the clouds by speed - faster in front
		game.clouds.sort( ( a, b ) => {
			return a.speed - b.speed;
		} );

		// Create the ground
		game.ground = createTilingSprite(
			g.gameTextures.textures[ "ground.png" ], 2, 3, g.app.screen.height
		);
	}

	function createClouds() {

		// Create the clouds background
		const cloudTextures = [
			g.gameTextures.textures[ "cloud_01.png" ],
			g.gameTextures.textures[ "cloud_01.png" ],
			g.gameTextures.textures[ "cloud_01.png" ],
			g.gameTextures.textures[ "cloud_01.png" ],
			g.gameTextures.textures[ "cloud_02.png" ],
			g.gameTextures.textures[ "cloud_02.png" ],
			g.gameTextures.textures[ "cloud_03.png" ],
			g.gameTextures.textures[ "cloud_04.png" ]
		];
		game.clouds = [];

		// Constant for calculate cloud speed
		const largestCloudSize = 15000;

		// Create the clouds
		for( let i = 0; i < cloudTextures.length; i++ ) {

			// Calcualte the cloud x position
			// Should not be too close together in the x direction so adding a gap
			const gap = i * ( g.app.screen.width * 1.5 ) / cloudTextures.length;
			const x = gap + Math.random() * 100 - 50;

			// Calculate the cloud y position
			const y = Math.random() * g.app.screen.height * 0.5;

			const cloud = createWrappingSprite( cloudTextures[ i ], x, y );

			// Calculate the speed based on the size of the cloud with some random varience
			const size = cloud.sprite.width * cloud.sprite.height;
			cloud.speed = ( size / largestCloudSize ) + Math.random() * 0.05;
			game.clouds.push( cloud );
		}
	}

	function createTree() {
		const tree = {
			"top": null,
			"bottom": null,
			"container": null,
			"speed": 2
		};
		tree.container = new PIXI.Container();
		tree.container.x = 0;
		tree.container.y = 0;
		tree.top = new PIXI.Sprite( g.gameTextures.textures[ "tree.png" ] );
		tree.top.anchor.set( 0.5, 1 );
		tree.top.x = 0;
		tree.top.y = g.app.screen.height / 2 - 150;
		tree.container.addChild( tree.top );

		tree.bottom =  new PIXI.Sprite( g.gameTextures.textures[ "tree.png" ] );
		tree.bottom.anchor.set( 0.5, 0 );
		tree.bottom.x = 0;
		tree.bottom.y = g.app.screen.height / 2 + 150;
		tree.bottom.tint = 0x00ff00;
		tree.container.addChild( tree.bottom );

		game.container.addChild( tree.container );

		setTreePosition( tree );
		setTreeHeight( tree );
		return tree;
	}

	function setTreeHeight( tree ) {
		const gap = 150;
		const height = ( Math.random() * ( g.app.screen.height - gap ) ) + gap;
		tree.top.y = height - gap;
		tree.bottom.y = height + gap;
	}

	function setTreePosition( tree, offsetX ) {
		if( !offsetX ) {
			offsetX = 0;
		}
		tree.container.x = g.app.screen.width + tree.container.width / 2 + offsetX;
	}

	function createTilingSprite( texture, count, speed, y ) {
		const tileObj = {
			"sprites": [],
			"speed": speed
		};
		for( let i = 0; i < count; i++ ) {
			const sprite = new PIXI.Sprite( texture );
			sprite.anchor.set( 0, 1 );
			sprite.x = i * ( sprite.width - 1 );
			sprite.y = y;
			tileObj.sprites.push( sprite );
			game.container.addChild( sprite );
		}
		return tileObj;
	}

	function createWrappingSprite( texture, x, y ) {
		const wrap = {
			"sprite": null,
			"speed": 0
		};
		const sprite = new PIXI.Sprite( texture );
		sprite.anchor.set( 0.5, 0.5 );
		sprite.x = x;
		sprite.y = y;
		wrap.sprite = sprite;
		game.container.addChild( sprite );

		return wrap;
	}

	function startGame() {
		game.container.visible = true;
		g.fade( game.container, 1, function () {
			g.app.ticker.add( run );
		} );
	}

	function run( delta ) {

		// Parallax scrolling
		moveTiledSprites( game.background, delta );
		moveClouds( game.clouds, delta );
		moveTiledSprites( game.ground, delta );
		moveTrees( delta );

	}

	function moveTiledSprites( tileObj, delta ) {
		const sprites = tileObj.sprites;
		const speed = tileObj.speed;
		for( let i = 0; i < sprites.length; i++ ) {
			if( i === 0 ) {
				sprites[ i ].x -= speed * delta;
				if( sprites[ i ].x < -sprites[ i ].width ) {
					sprites[ i ].x = 0;
				}
			} else {
				sprites[ i ].x = sprites[ i - 1 ].x + sprites[ i - 1 ].width - 1;
			}
		}
	}

	function moveClouds( wraps, delta ) {
		wraps.forEach( ( wrap ) => {
			const sprite = wrap.sprite;
			sprite.x -= wrap.speed * delta;
			if( sprite.x < -sprite.width ) {
				sprite.x = g.app.screen.width + Math.random() * g.app.screen.width / 2;
				sprite.y = Math.random() * g.app.screen.height * 0.5;
			}
		} );
	}

	function moveTrees( delta ) {
		game.trees.forEach( ( tree ) => {
			tree.container.x -= tree.speed * delta;
			if( tree.container.x < -tree.container.width / 2 ) {
				setTreePosition( tree );
				setTreeHeight( tree );
			}
		} );
	}

} )();
