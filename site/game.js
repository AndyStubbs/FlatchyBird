"use strict";

( function () {

	const DEBUG = false;

	const game = {
		"container": null,
		"ground": null,
		"clouds": null,
		"background": null,
		"trees": null,
		"flatchy": null,
		"feathers": [],
		"gravity": 0.75,
		"baseVelocity": 15,
		"debug": null,
		"score": 0,
		"baseSpeed": 5,
		"speed": 5,
		"treeSpeed": 1,
		"hillSpeed": 0.5,
		"groundSpeed": 1,
		"cloudSpeed": 0.25,
		"scoreText": null,
		"isDemo": true,
		"textStyle": {
			"fontFamily": "Impact, Charcoal, sans-serif",
			"fontSize": 72,
			"fill": "#ffffff",
			"align": "center",
			"stroke": "#000000",
			"strokeThickness": 3,
			"dropShadow": true,
			"dropShadowColor": "#000000",
			"dropShadowDistance": 3,
			"dropShadowAngle": 2.4,
		},
		"gameOver": null
	};

	// Load the game's sprites and animations
	g.loadGame = function () {
		loadGame();
	};

	// Start the game
	g.startGame = startGame;

	function loadGame() {

		// Create the game container
		game.container = new PIXI.Container();
		game.container.visible = false;
		game.container.alpha = 0;
		g.app.stage.addChild( game.container );

		// Create the hills background
		game.background = createTilingSprite(
			g.gameTextures.textures[ "hills.png" ], 2, game.hillSpeed, g.app.screen.height - 50
		);

		// Create the clouds
		createClouds();

		// Create the trees
		createTrees();

		// Create the ground
		game.ground = createTilingSprite(
			g.gameTextures.textures[ "ground.png" ], 2, game.groundSpeed, g.app.screen.height
		);

		// Create Flatchy
		createFlatchy();

		// Create some feathers
		for( let i = 0; i < 30; i++ ){
			createFeather();
		}

		// Create the debug graphics
		if( DEBUG ) {
			game.debug = new PIXI.Graphics();
			game.container.addChild( game.debug );
		}

		// Create the score text
		const scoreText = new PIXI.Text( "0", game.textStyle );
		scoreText.anchor.set( 0.5, 0.5 );
		scoreText.x = g.app.screen.width / 2;
		scoreText.y = 100;
		scoreText.text = game.score;
		game.scoreText = scoreText;
		game.container.addChild( scoreText );

		// Create the tap button
		const tapButton = new PIXI.Sprite( g.gameTextures.textures[ "tap_text.png" ] );
		tapButton.anchor.set( 0.5, 0.5 );
		tapButton.x = g.app.screen.width / 2;
		tapButton.y = g.app.screen.height * 0.55;
		game.tapButton = tapButton;
		game.container.addChild( tapButton );

		// Create the game over screen
		createGameOverScreen();
	}

	function createClouds() {

		// Create the clouds background
		const cloudTextures = [
			g.gameTextures.textures[ "cloud_01.png" ],
			g.gameTextures.textures[ "cloud_01.png" ],
			g.gameTextures.textures[ "cloud_01.png" ],
			g.gameTextures.textures[ "cloud_01.png" ],
			g.gameTextures.textures[ "cloud_03.png" ],
			g.gameTextures.textures[ "cloud_03.png" ],
			g.gameTextures.textures[ "cloud_03.png" ],
			g.gameTextures.textures[ "cloud_02.png" ],
			g.gameTextures.textures[ "cloud_02.png" ],
			g.gameTextures.textures[ "cloud_04.png" ]
			
		];
		game.clouds = [];

		// Constant for calculate cloud speed
		const largestCloudSize = 17763;

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
			cloud.speed = ( size / largestCloudSize ) * game.cloudSpeed +
				Math.random() * game.cloudSpeed / 4;
			game.clouds.push( cloud );
		}
	}

	function createFlatchy() {
		const flatchy = {
			"container": null,
			"sprite": null,
			"velocity": 0,
			"maxVelocity": 17,
			"isDead": false,
			"deadSprite": null,
			"isInGap": false
		};
		const textures = [];
		const textureCount = 11;
		for( let i = 0; i < textureCount; i++ ) {
			const id = ( i + 1 ).toString().padStart( 2, "0" );
			textures.push( g.gameTextures.textures[ "flight/flatchy_" + id + ".png" ] );
		}
		flatchy.container = new PIXI.Container();
		flatchy.container.x = g.app.screen.width / 2;
		flatchy.container.y = g.app.screen.height / 2;
		flatchy.sprite = new PIXI.AnimatedSprite( textures );
		flatchy.sprite.animationSpeed = 0.2;
		flatchy.sprite.play();
		flatchy.sprite.anchor.set( 0.5, 0.5 );
		flatchy.container.addChild( flatchy.sprite );
		flatchy.deadSprite = new PIXI.Sprite( g.gameTextures.textures[ "flatchy_dead.png" ] );
		flatchy.deadSprite.anchor.set( 0.5, 0.5 );
		flatchy.deadSprite.visible = false;
		flatchy.container.addChild( flatchy.deadSprite );
		game.container.addChild( flatchy.container );
		game.flatchy = flatchy;
	}

	function createFeather() {
		const feather = {
			"container": new PIXI.Container(),
			"sprite": null,
			"speed": game.speed,
			"active": false
		};
		const frames = [
			g.gameTextures.textures[ "feather_1.png" ],
			g.gameTextures.textures[ "feather_2.png" ],
			g.gameTextures.textures[ "feather_3.png" ],
			g.gameTextures.textures[ "feather_4.png" ]
		];
		feather.sprite = new PIXI.AnimatedSprite( frames );
		feather.sprite.animationSpeed = 0.15;
		feather.sprite.loop = false;
		feather.sprite.anchor.set( 0.5, 0.5 );
		feather.sprite.visible = true;
		feather.container.visible = false;
		feather.container.addChild( feather.sprite );
		game.container.addChild( feather.container );
		game.feathers.push( feather );
	}

	function createTrees() {

		// Create the trees
		game.trees = [ createTree(), createTree() ];
		setInitialTreePositions();
	}

	function createTree() {
		const tree = {
			"top": null,
			"bottom": null,
			"container": null,
			"speed": 1
		};
		tree.container = new PIXI.Container();
		tree.container.x = 0;
		tree.container.y = 0;
		tree.top = new PIXI.Sprite( g.gameTextures.textures[ "tree.png" ] );
		tree.top.anchor.set( 0.5, 1 );
		tree.top.x = 0;
		tree.container.addChild( tree.top );

		tree.bottom =  new PIXI.Sprite( g.gameTextures.textures[ "tree.png" ] );
		tree.bottom.anchor.set( 0.5, 0 );
		tree.bottom.x = 0;
		tree.container.addChild( tree.bottom );

		game.container.addChild( tree.container );

		setTreePosition( tree );
		setTreeHeight( tree );
		return tree;
	}

	function createGameOverScreen() {
		const gameOver = {};
		gameOver.container = new PIXI.Container();
		gameOver.container.visible = false;
		gameOver.container.alpha = 0;

		// Create the background
		gameOver.background = new PIXI.Sprite( g.gameTextures.textures[ "end_bg.png" ] );
		gameOver.background.anchor.set( 0.5, 0.5 );
		gameOver.background.x = g.app.screen.width / 2;
		gameOver.background.y = g.app.screen.height / 2;
		gameOver.container.addChild( gameOver.background );

		// Create the title text
		gameOver.title = new PIXI.Sprite( g.gameTextures.textures[ "game_over_text.png" ] );
		gameOver.title.anchor.set( 0.5, 0.5 );
		gameOver.title.x = g.app.screen.width / 2;
		gameOver.title.y = gameOver.title.height * 2;
		gameOver.title.rotation = 0.1;
		gameOver.container.addChild( gameOver.title );

		// Create the medals
		const medals = [
			"medal_1.png",
			"medal_2.png",
			"medal_3.png"
		];
		gameOver.medals = [];
		for( let i = 0; i < medals.length; i++ ) {
			const medal = new PIXI.Sprite( g.gameTextures.textures[ medals[ i ] ] );
			medal.anchor.set( 0.5, 0.5 );
			medal.x = g.app.screen.width * 0.325;
			medal.y = g.app.screen.height * 0.52;
			medal.visible = false;
			gameOver.medals.push( medal );
			gameOver.container.addChild( medal );
		}

		// Create the new icon
		gameOver.newIcon = new PIXI.Sprite( g.gameTextures.textures[ "new_icon.png" ] );
		gameOver.newIcon.anchor.set( 0.5, 0.5 );
		gameOver.newIcon.x = g.app.screen.width * 0.58;
		gameOver.newIcon.y = g.app.screen.height * 0.62;
		gameOver.container.addChild( gameOver.newIcon );

		// Create the score text
		gameOver.scoreText = new PIXI.Text( game.score, game.textStyle );
		gameOver.scoreText.anchor.set( 0.5, 0.5 );
		gameOver.scoreText.x = g.app.screen.width * 0.725;
		gameOver.scoreText.y = g.app.screen.height * 0.46;
		gameOver.scoreText.text = game.score;
		gameOver.container.addChild( gameOver.scoreText );

		// Create the best score text
		gameOver.bestScoreText = new PIXI.Text( g.bestScore, game.textStyle );
		gameOver.bestScoreText.anchor.set( 0.5, 0.5 );
		gameOver.bestScoreText.x = g.app.screen.width * 0.725;
		gameOver.bestScoreText.y = g.app.screen.height * 0.62;
		gameOver.bestScoreText.text = g.bestScore;
		gameOver.container.addChild( gameOver.bestScoreText );

		// Create the play button
		gameOver.playButton = new PIXI.Sprite( g.titleTextures.textures[ "btns/play_btn_up.png" ] );
		gameOver.playButton.anchor.set( 0.5, 0.5 );
		gameOver.playButton.x = g.app.screen.width / 2;
		gameOver.playButton.y = g.app.screen.height * 0.80;
		gameOver.playButton.interactive = false;
		gameOver.playButton.buttonMode = false;
		gameOver.playButton.on( "pointerover", function () {
			gameOver.playButton.tint = "#999999";
		} );
		gameOver.playButton.on( "pointerout", function () {
			gameOver.playButton.tint = "#ffffff";
		} );
		gameOver.playButton.enabled = false;
		gameOver.playButton.interactive = true;
		gameOver.playButton.buttonMode = true;
		gameOver.container.addChild( gameOver.playButton );

		game.gameOver = gameOver;
		game.container.addChild( gameOver.container );
	}

	function setInitialTreePositions() {
		game.trees[ 0 ].container.x = g.app.screen.width * 1.5;
		game.trees[ 0 ].container.y = 0;

		// Move the second tree about 1/2 screen width to the right
		game.trees[ 1 ].container.x = game.trees[ 0 ].container.x +
			g.app.screen.width / 2 + game.trees[ 1 ].container.width / 2;
		game.trees[ 1 ].container.y = 0;
	}

	function setTreeHeight( tree ) {
		const gap = 140;
		const minY = gap;
		const maxY = g.app.screen.height - gap * 2;
		const height = Math.random() * ( maxY - minY ) + minY;
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

	function restartGame() {
		g.sounds.click.play();
		setInitialTreePositions();
		game.gameOver.playButton.off( "pointerdown" );
		g.app.ticker.remove( run );
		g.fade( game.gameOver.container, -1, function () {
			startGame();
		} );
	}

	function startGame( isDemo ) {
		game.isDemo = isDemo;

		if( isDemo ) {
			game.tapButton.visible = true;
			g.blink( game.tapButton );
		} else {
			game.tapButton.visible = false;
		}
		game.container.visible = true;
		game.gameOver.playButton.off( "pointerdown" );
		g.fade( game.container, 1, function () {
			game.speed = game.baseSpeed;
			game.flatchy.velocity = 0;
			game.flatchy.container.y = g.app.screen.height / 2;
			game.flatchy.container.rotation = 0;
			game.flatchy.sprite.visible = true;
			game.flatchy.sprite.gotoAndPlay( 0 );
			game.flatchy.deadSprite.visible = false;
			game.flatchy.isDead = false;
			game.flatchy.isInGap = false;
			game.score = 0;
			game.scoreText.text = game.score;
			game.scoreText.visible = true;
			game.gameOver.container.visible = false;
			g.app.ticker.add( run );
			if( !isDemo ) {
				flatchJump( false );
			}
			document.querySelector( "canvas" ).addEventListener( "pointerdown", pointerDown );
		} );
	}

	function pointerDown() {
		flatchJump( false );
	}

	function flatchJump( isDemo ) {
		if( game.flatchy.isDead ) {
			return;
		}
		g.sounds.gases[ Math.floor( Math.random() * g.sounds.gases.length ) ].play();
		game.flatchy.velocity = -game.flatchy.maxVelocity;
		game.flatchy.container.rotation = -Math.PI / 12;

		// Get some feathers
		showFeathers( 5 );

		if( !isDemo ) {
			game.isDemo = false;
			g.stopBlink( game.tapButton );
			game.tapButton.visible = false;
		}
	}

	function showFeathers( count, isDead ) {
		for( let i = 0; i < count; i++ ) {
			const feather = getFeather();
			if( feather ) {
				showFeather( feather, i, isDead );
			}
		}
	}

	function showFeather( feather, delay, isDead ) {
		let offsetX = -50 + Math.random() * 15;
		let offsetY = 30 + Math.random() * 30;
		let delay2 = 500 + delay * 100;
		
		if( isDead ) {
			offsetX = Math.random() * 60 - 30;
			//offsetY = Math.random() * 60 - 30;
			offsetY = -Math.random() * 30;
			delay = 0;
			delay2 = 300 + Math.random() * 150;
		}
		setTimeout( function () {
			feather.velocity = -Math.random() * 6 - 3;
			feather.container.visible = true;
			feather.container.x = game.flatchy.container.x + offsetX;
			feather.container.y = game.flatchy.container.y + offsetY;
			feather.container.rotation = Math.random() * Math.PI * 2;
			feather.sprite.gotoAndPlay( 0 );
		}, delay * 80 );

		setTimeout( function () {
			feather.active = false;
			feather.sprite.stop();
			feather.container.visible = false;
		}, delay2 );
	}

	function getFeather() {
		for( let i = 0; i < game.feathers.length; i++ ) {
			if( !game.feathers[ i ].active ) {
				game.feathers[ i ].active = true;
				return game.feathers[ i ];
			}
		}
		return null;
	}

	function run( delta ) {

		// Parallax scrolling
		moveTiledSprites( game.background, delta );
		moveClouds( game.clouds, delta );
		moveTiledSprites( game.ground, delta );

		if( game.isDemo ) {
			if( game.flatchy.container.y > g.app.screen.height / 2 - 50 ) {
				flatchJump( true );
			}
		} else {

			// Move the trees
			moveTrees( delta );
		}

		// Move Flatchy
		moveFlatchy( delta );
		moveFeathers( delta );

		if( DEBUG ) {
			const bounds = [
				getBoundsCheck( game.flatchy.container, true ),
				getBoundsCheck( game.trees[ 0 ].top.getBounds() ),
				getBoundsCheck( game.trees[ 0 ].bottom.getBounds() ),
				getBoundsCheck( game.trees[ 1 ].top.getBounds() ),
				getBoundsCheck( game.trees[ 1 ].bottom.getBounds() )
			];

			game.debug.clear();
			game.debug.lineStyle( 1, 0xff0000 );

			for( let i = 0; i < bounds.length; i++ ) {
				game.debug.drawRect(
					bounds[ i ].x,
					bounds[ i ].y,
					bounds[ i ].width,
					bounds[ i ].height
				);
			}
		}
	}

	function moveTiledSprites( tileObj, delta ) {
		const sprites = tileObj.sprites;
		const speed = tileObj.speed * game.speed;
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
			const speed = game.speed * wrap.speed
			const sprite = wrap.sprite;
			sprite.x -= speed * delta;
			if( sprite.x < -sprite.width ) {
				sprite.x = g.app.screen.width + Math.random() * g.app.screen.width / 2;
				sprite.y = Math.random() * g.app.screen.height * 0.5;
			}
		} );
	}

	function moveTrees( delta ) {
		game.trees.forEach( ( tree ) => {
			const speed = tree.speed * game.speed;
			tree.container.x -= speed * delta;
			if( tree.container.x < -tree.container.width / 2 ) {
				setTreePosition( tree );
				setTreeHeight( tree );
			}
		} );
	}

	function moveFlatchy( delta ) {
		const flatchy = game.flatchy;

		flatchy.velocity += game.gravity * delta;
		flatchy.container.y += flatchy.velocity * delta;

		// Make sure flatchy doesn't fly too high
		if( flatchy.container.y < -flatchy.container.height / 2 ) {
			flatchy.container.y = -flatchy.container.height / 2;
			flatchy.velocity = 0;
		}

		if( flatchy.velocity > 0 ) {
			flatchy.container.rotation += 0.05 * delta;
			if( flatchy.container.rotation > Math.PI / 2 ) {
				flatchy.container.rotation = Math.PI / 2;
			}
		}
		if( checkForCollision() ) {
			killFlatchy();
		}
		if( flatchy.container.y > game.ground.sprites[ 0 ].y - 120 ) {
			flatchy.container.y = game.ground.sprites[ 0 ].y - 120;
			killFlatchy();
		}
		if( flatchy.isDead ) {
			if( flatchy.velocity < 0 ) {
				flatchy.velocity = 0;
			}
			flatchy.sprite.gotoAndStop( 0 );
			flatchy.sprite.visible = false;
			flatchy.deadSprite.visible = true;
		} else {
			checkForScore();
		}
	}

	function killFlatchy() {
		if( !game.flatchy.isDead ) {
			g.sounds.thud1.play();
			setTimeout( function () {
				g.sounds.hit.play();
			}, 100 );
			showFeathers( 30, true );
			game.speed = 0;
			document.querySelector( "canvas" ).removeEventListener( "pointerdown", pointerDown );
			setTimeout( showGameOverScreen, 800 );
		}
		game.flatchy.isDead = true;
	}

	function showGameOverScreen() {
		game.scoreText.visible = false;
		game.gameOver.container.visible = true;
		game.gameOver.scoreText.text = game.score;
		game.gameOver.bestScoreText.text = g.bestScore;
		game.gameOver.newIcon.visible = false;
		game.gameOver.medals[ 0 ].visible = false;
		game.gameOver.medals[ 1 ].visible = false;
		game.gameOver.medals[ 2 ].visible = false;
		if( game.score > g.bestScore ) {
			g.bestScore = game.score;
			localStorage.setItem( "bestScore", g.bestScore );
			game.gameOver.newIcon.visible = true;
			game.gameOver.bestScoreText.text = g.bestScore;
		}
		if( game.score >= 10 && game.score < 20 ) {
			game.gameOver.medals[ 0 ].visible = true;
		}
		if( game.score >= 20 && game.score < 30 ) {
			game.gameOver.medals[ 1 ].visible = true;
		}
		if( game.score >= 30 ) {
			game.gameOver.medals[ 2 ].visible = true;
		}
		if( game.score >= 10 ) {
			g.sounds.medal.play();
		}
		game.gameOver.playButton.on( "pointerdown", restartGame );
		g.fade( game.gameOver.container, 1, function () {}, 0.025 );
	}

	function moveFeathers( delta ) {
		game.feathers.forEach( ( feather ) => {
			const speed = feather.speed;
			if( feather.active ) {
				feather.container.x -= speed * delta;
				feather.velocity += game.gravity * delta;
				feather.container.y += feather.velocity * delta;
				if( feather.container.y > game.ground.sprites[ 0 ].y - 80 ) {
					feather.container.y = game.ground.sprites[ 0 ].y - 80;
					feather.velocity = 0;
				}
			}
		} );
	}

	function checkForCollision() {
		const flatchy = game.flatchy;
		const flatchyBounds = getBoundsCheck( flatchy.container, true );
		const treeBounds = [
			game.trees[ 0 ].top.getBounds(),
			game.trees[ 0 ].bottom.getBounds(),
			game.trees[ 1 ].top.getBounds(),
			game.trees[ 1 ].bottom.getBounds()
		];
		for( let i = 0; i < treeBounds.length; i++ ) {
			const boundsCheck = getBoundsCheck( treeBounds[ i ] );
			if(
				flatchyBounds.x < boundsCheck.x + boundsCheck.width &&
				flatchyBounds.x + flatchyBounds.width > boundsCheck.x &&
				flatchyBounds.y < boundsCheck.y + boundsCheck.height &&
				flatchyBounds.height + flatchyBounds.y > boundsCheck.y
			) {
				return true;
			}
		}
		return false;
	}

	function checkForScore() {

		// Get the flatchy bounds
		const flatchyBounds = getBoundsCheck( game.flatchy.container, true );

		// Only need x and width for bounds check so just getting top bounds of trees
		const treeBounds = [
			getBoundsCheck( game.trees[ 0 ].top.getBounds() ),
			getBoundsCheck( game.trees[ 1 ].top.getBounds() )
		];

		// Check for entering the gap
		let isInGap = false;
		for( let i = 0; i < treeBounds.length; i++ ) {
			const boundsCheck = getBoundsCheck( treeBounds[ i ] );
			if(
				flatchyBounds.x < boundsCheck.x + boundsCheck.width &&
				flatchyBounds.x + flatchyBounds.width > boundsCheck.x
			) {
				if( game.flatchy.isInGap === false ) {
					g.sounds.point.play();
					game.score++;
					game.scoreText.text = game.score;
				}
				isInGap = true;
			}
		}
		game.flatchy.isInGap = isInGap;
	}

	function getBoundsCheck( bounds, isFlatchy ) {
		if( isFlatchy ) {
			return {
				"x": bounds.x - 30,
				"y": bounds.y - 30,
				"width": 70,
				"height": 60
			};
		}
		return {
			"x": bounds.x + 40,
			"y": bounds.y + 6,
			"width": bounds.width - 66,
			"height": bounds.height - 12
		};
	}

} )();
