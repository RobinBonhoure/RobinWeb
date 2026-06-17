// Belt
export const BELT_WIDTH = 7;
export const Z_FRONT = -12;
export const Z_BACK = 10;
export const BELT_SPEED = 3.5;

// Player
export const MOVE_SPEED = 5;
export const FORWARD_BACK_SPEED = 8;
export const JUMP_FB_MULTIPLIER = 0.35; // forward/back control while airborne
export const Z_PLAYER_FRONT_LIMIT = 0;        // forward speed reaches 0 here
export const Z_PLAYER_FRONT_SLOWDOWN_ZONE = 4; // units before limit where deceleration begins
export const JUMP_VELOCITY = 6;
export const GRAVITY = -14;
export const PLAYER_HALF_W = 0.3;
export const PLAYER_HALF_D = 0.3;
export const PLAYER_HEIGHT = 0.9;

// Dash
export const DASH_SPEED = 14;
export const DASH_DURATION = 0.18;
export const DASH_COOLDOWN = 1.2;

// Obstacles
export const OBSTACLE_SPAWN_INTERVAL = 2.2;
export const OBSTACLE_SPAWN_JITTER = 0.8;
export const OBSTACLE_SHORT_HEIGHT = 0.6;
export const OBSTACLE_TALL_HEIGHT = 1.8;
export const OBSTACLE_HALF_W = 0.5;
export const OBSTACLE_HALF_D = 0.4;

// Cosy palette
export const BG_COLOR = "#15121e";
export const COLOR_BELT_SURFACE = "#1d1a2c";
export const COLOR_PLAYER_SKIN = "#f2c4a0";
export const COLOR_PLAYER_SHIRT = "#8464b4";
export const COLOR_PLAYER_PANTS = "#3d5a8a";
export const COLOR_LIMIT_BACK = "#c04838";
export const COLOR_LIMIT_SIDE = "#ff0000";
export const COLOR_LIMIT_FRONT = "#3870a0";

// Laser colors
export const COLOR_LASER_BELT = "#e03018";        // danger red — belt lines
export const COLOR_LASER_BEAM_SHORT = "#30d8c0";  // cyan — horizontal beam (jump over)
export const COLOR_LASER_BEAM_TALL = "#e03060";   // pink-red — vertical curtain (dodge)
export const COLOR_LASER_FRAME = "#28283a";       // dark frame / posts
