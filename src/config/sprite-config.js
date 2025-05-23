/**
 * Sprite configuration based on the sprite sheet instructions
 * Maps entity types to their sprite coordinates in the sprite sheet
 */
export const SpriteConfig = {
  // Characters
  player: {
    frameCount: 3,
    loop: true,
    width: 40,
    height: 40,
    sourceY: 0,
    sourceX: 0
  },
  
  soldier: {
    frameCount: 2,
    loop: true,
    width: 20,
    height: 20,
    sourceY: 40,
    sourceX: 0
  },
  
  // Effects
  stickyArea: {
    frameCount: 2,
    loop: true,
    width: 100,
    height: 100,
    sourceY: 60,
    sourceX: 0
  },
  
  // Obstacles
  obstacle: {
    small: {
      frameCount: 4,
      loop: true,
      width: 30,
      height: 30,
      sourceY: 160,
      sourceX: 0
    },
    medium: {
      frameCount: 4,
      loop: true,
      width: 40,
      height: 40,
      sourceY: 190,
      sourceX: 0
    },
    large: {
      frameCount: 4,
      loop: true,
      width: 60,
      height: 60,
      sourceY: 230,
      sourceX: 0
    },
    hazard: {
      frameCount: 1,
      loop: false,
      width: 40,
      height: 40,
      sourceY: 290,
      sourceX: 0
    }
  },
  
  // Zombies
  zombie: {
    normal: {
      walking: {
        frameCount: 3,
        loop: true,
        width: 40,
        height: 40,
        sourceY: 330,
        sourceX: 0
      },
      dying: {
        frameCount: 2,
        loop: false,
        width: 40,
        height: 40,
        sourceY: 370,
        sourceX: 0
      }
    },
    armored: {
      walking: {
        frameCount: 3,
        loop: true,
        width: 40,
        height: 40,
        sourceY: 410,
        sourceX: 0
      },
      dying: {
        frameCount: 2,
        loop: false,
        width: 40,
        height: 40,
        sourceY: 450,
        sourceX: 0
      }
    },
    giant: {
      walking: {
        frameCount: 3,
        loop: true,
        width: 50,
        height: 50,
        sourceY: 490,
        sourceX: 0
      },
      dying: {
        frameCount: 2,
        loop: false,
        width: 50,
        height: 50,
        sourceY: 540,
        sourceX: 0
      }
    }
  },
  lane_bonus: {
    gun: {
      "glock_17": {
        frameCount: 1,
        loop: false,
        width: 50,
        height: 50,
        sourceY: 590,
        sourceX: 0
      },
      "desert_eagle": {
        frameCount: 1,
        loop: false,
        width: 50,
        height: 50,
        sourceY: 640,
        sourceX: 0
      },
      "benelli_m4": {
        frameCount: 1,
        loop: false,
        width: 50,
        height: 50,
        sourceY: 690,
        sourceX: 0
      },
      "ak47": {
        frameCount: 1,
        loop: false,
        width: 50,
        height: 50,
        sourceY: 740,
        sourceX: 0
      },
      "barrett_xm109": {
        frameCount: 1,
        loop: false,
        width: 50,
        height: 50,
        sourceY: 790,
        sourceX: 0
      }
    },
    grenade: {
      standard: {
        frameCount: 1,
        loop: false,
        width: 50,
        height: 50,
        sourceY: 840,
        sourceX: 0
      },
      sticky: {
        frameCount: 1,
        loop: false,
        width: 50,
        height: 50,
        sourceY: 890,
        sourceX: 0
      }
    },
    soldier: {
      frameCount: 1,
      loop: false,
      width: 50,
      height: 50,
      sourceY: 940,
      sourceX: 0
    }
  },
  // Bonuses
  bonus: {
    embedded: {
      frameCount: 3,
      loop: true,
      width: 32,
      height: 32,
      sourceY: 990,
      sourceX: 0
    }
  },
  
  // Damage areas
  damageArea: {
    gun: {
      "glock_17": {
        frameCount: 1,
        loop: false,
        width: 32,
        height: 16,
        sourceY: 1022,
        sourceX: 0
      },
      "desert_eagle": {
        frameCount: 1,
        loop: false,
        width: 80,
        height: 16,
        sourceY: 1038,
        sourceX: 0
      },
      "benelli_m4": {
        frameCount: 1,
        loop: false,
        width: 40,
        height: 84,
        sourceY: 1054,
        sourceX: 0
      },
      "ak47": {
        frameCount: 1,
        loop: false,
        width: 56,
        height: 16,
        sourceY: 1138,
        sourceX: 0
      },
      "barrett_xm109": {
        frameCount: 1,
        loop: false,
        width: 96,
        height: 16,
        sourceY: 1154,
        sourceX: 0
      }
    },
    grenade: {
      frameCount: 1,
      loop: false,
      width: 100,
      height: 100,
      sourceY: 1170,
      sourceX: 0
    },
    zombie: {
      normal: {
        frameCount: 1,
        loop: false,
        width: 24,
        height: 24,
        sourceY: 1270,
        sourceX: 0
      },
      armored: {
        frameCount: 1,
        loop: false,
        width: 24,
        height: 24,
        sourceY: 1270,
        sourceX: 0
      },
      giant: {
        frameCount: 1,
        loop: false,
        width: 80,
        height: 80,
        sourceY: 1294,
        sourceX: 0
      }
    },
    obstacle: {
      frameCount: 1,
      loop: false,
      width: 40,
      height: 40,
      sourceY: 1374,
      sourceX: 0
    }
  }
};