import Phaser from 'phaser'

import InfiniteScrollScene from './InfiniteScrollScene'
import UIScene from './UIscene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	audio: {
		disableWebAudio: false,
	},
	parent: 'app',
	width:1600,
	height:900,
	scale: {
		mode:Phaser.Scale.FIT,
		autoCenter:Phaser.Scale.CENTER_BOTH
	},
	backgroundColor: '#479cde',
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 },
		},
	},
	scene: [UIScene,InfiniteScrollScene]
}

export default new Phaser.Game(config)
 