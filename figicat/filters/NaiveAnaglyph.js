/**
* A horizontal blur filter by Mat Groves http://matgroves.com/ @Doormat23
*/
Phaser.Filter.NaiveAnaglyph = function (game) {

    Phaser.Filter.call(this, game);

    this.passes = [this];
    
    // set the uniforms
    this.uniforms.left_contrast = {type: '1f', value: 1.0};
    this.uniforms.right_contrast = {type: '1f', value: 1.0};
    this.uniforms.iChannel0 =  {type:'sampler2D', value: null};
    this.uniforms.P = {type: 'mat3', value: null};
    this.uniforms.PL = {type: '3fv', value: null};
    this.uniforms.PR = {type: '3fv', value: null};
    this.uniforms.left_matrix = {type: 'mat3', value: this.transformations.half_color.left};
    this.uniforms.right_matrix = {type: 'mat3', value: this.transformations.half_color.right};
    this.uniforms.R = {type: 'mat3', value: null};
    this.uniforms.gamma = {type: '1f', value: 2.0};
    this.uniforms.amblyopicEye = {type: '1i', value: 0};
    this.fragmentSrc = [
        'precision mediump float;',
        'uniform vec2 resolution;',
        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',
        'uniform sampler2D uSampler;',
        'uniform mat3 R;',
        'uniform mat3 P;',
        'uniform vec3 PL;',
        'uniform vec3 PR;',
        'uniform mat3 left_matrix;',
        'uniform mat3 right_matrix;',
        'uniform sampler2D iChannel0;',
        'uniform float left_contrast;',
        'uniform float right_contrast;',
        'uniform float gamma;',
        'const float mid_gray = 0.5;',
        'void main(void) {',
        '   vec2 mapCoords = vTextureCoord.xy;',
        '   mapCoords.y = 1.0 - vTextureCoord.y;',
        '   vec3 left_color = (texture2D(uSampler, vTextureCoord)).rgb;',
        '   vec3 right_color = (texture2D(iChannel0, mapCoords)).rgb;',        
        '   vec3 auxl = vec3(mid_gray - left_color.r, mid_gray - left_color.g, mid_gray - left_color.b);',
        '   vec3 auxr = vec3(mid_gray - right_color.r, mid_gray - right_color.g, mid_gray - right_color.b);',
        '   left_color = left_color + auxl*(1.0 - left_contrast);',
        '   right_color = right_color + auxr*(1.0 - right_contrast);',
        
        //  Dinamic Range
        '   left_color.r = 1.0 - PL.r + (2.0 * PL.r - 1.0)*left_color.r;',
        '   right_color.r = 1.0 - PR.r + (2.0 * PR.r - 1.0)*right_color.r;',
        
        //  Ghosting reduction anaglyph
        '   vec3 color = left_color*left_matrix + right_color*right_matrix;',
        '   vec3 YYc = color*P;',
        '   color = YYc*R;',
        
        //  Ideal filters
        '   vec3 aux_color = vec3(pow(color.r,gamma), pow(color.g,gamma), pow(color.b,gamma));',
        '   float lum_left_red = PL.r * aux_color.r;',
        '   float lum_left_green = PL.g * aux_color.g;',
        '   float lum_left_blue = PL.b * aux_color.b;',
        '   float lum_right_red = PR.r * aux_color.r;',
        '   float lum_right_green = PR.g * aux_color.g;',
        '   float lum_right_blue = PR.b * aux_color.b;',
        
        '   float lum_red = lum_left_red + lum_left_green + lum_left_blue - lum_right_red;',
        '   float lum_green = lum_right_green - lum_left_green + lum_right_red/2.0;',
        '   float lum_blue = lum_right_blue - lum_left_blue + lum_right_red/2.0;',
        /*'   float lum_red = lum_left_red + lum_left_green + lum_left_blue;',
        '   float lum_green = lum_right_green + lum_right_red/2.0;',
        '   float lum_blue = lum_right_blue + lum_right_red/2.0;',*/
        '   vec3 final_color;',
        '   final_color.r = pow(lum_red/PL.r, (1.0/gamma));',
        '   final_color.g = pow(lum_green/PR.g, (1.0/gamma));',
        '   final_color.b = pow(lum_blue/PR.b, (1.0/gamma));',
        //'   final_color = vec3(pow(final_color.r, 1.0/gamma), pow(final_color.g, 1.0/gamma), pow(final_color.b, 1.0/gamma));',
        '   gl_FragColor = vec4(final_color.rgb, 1.0);',
        //'   gl_FragColor = vec4(color.rgb, 1.0);',
        //'   gl_FragColor = vec4(-0.5, -0.5, -0.5, 1.0);',
        '}'
    ];

};

Phaser.Filter.NaiveAnaglyph.prototype = Object.create(Phaser.Filter.prototype);
Phaser.Filter.NaiveAnaglyph.prototype.transformations = {
        gray: {left: [0.299, 0.587, 0.114,
                                    0, 0, 0,
                                    0, 0, 0], right: [0, 0, 0, 
                                                        0.299, 0.587, 0.114,
                                                        0.299, 0.587, 0.114]},
        color: {left: [1, 0, 0,
                        0, 0, 0,
                        0, 0, 0], right: [0, 0, 0,
                                                0, 1, 0,
                                                0, 0, 1]},
        half_color: {left: [0.2126, 0.7152, 0.0722,
                            0, 0, 0,
                            0, 0, 0], right: [0, 0, 0, 
                                                0, 1, 0,
                                                0, 0, 1]},
        true_anaglyph: {left: [0.299, 0.587, 0.114,
                                0, 0, 0, 
                                0, 0, 0], right: [0, 0, 0, 
                                                        0, 0, 0,
                                                        0.299, 0.587, 0.114]},
        optimized: {left: [0, 0.7, 0.3,
                                0, 0, 0, 
                                0, 0, 0], right: [0, 0, 0, 
                                                        0, 1, 0,
                                                        0, 0, 1]}};


Phaser.Filter.NaiveAnaglyph.prototype.constructor = Phaser.Filter.NaiveAnaglyph;

Phaser.Filter.NaiveAnaglyph.prototype.updateParameters = function(currentPlayer){
        var al = currentPlayer.dichoptic.al;
        var bl = currentPlayer.dichoptic.bl;
        var ar = currentPlayer.dichoptic.ar;
        var br = currentPlayer.dichoptic.br;

        var cl = 1.0-al-bl;
        var cr = 1.0-ar-br;
        this.uniforms.gamma.value = currentPlayer.dichoptic.gamma;
        this.uniforms.PL.value = [al, bl, cl];
        this.uniforms.PR.value = [ar, br, cr];
        this.uniforms.P.value = [1.0, 0.0, 0.0, 0.0, br/(br+cr), cr/(br+cr), 0.0, 1.0, -1.0];
        var RR = [br+cr, -bl-cl, br*cl-cr*bl, -ar, al, cr*al-ar*cl, -ar, al, ar*bl-br*al];
        this.uniforms.R.value = RR.map(function(x){return x * (1.0/(al-ar));});
};

Phaser.Filter.NaiveAnaglyph.prototype.setContrast = function (suppression) {

    if(this.uniforms.amblyopicEye.value == StorageManager.eyes.left){
        this.uniforms.left_contrast.value = 1.0;
        this.uniforms.right_contrast.value = suppression;
    }
    else{
        this.uniforms.right_contrast.value = 1.0;
        this.uniforms.left_contrast.value = suppression;
    }
    
};


Phaser.Filter.NaiveAnaglyph.prototype.init = function (texture, currentPlayer) {

    //this.setResolution(width, height);    
    texture.baseTexture._powerOf2 = true;
    this.uniforms.iChannel0.value = texture;
    this.update(currentPlayer);
    
};

Phaser.Filter.NaiveAnaglyph.prototype.applyAlgorithm = function(algorithm){
    if(algorithm == DichopticManager.algorithms.color){
        this.uniforms.left_matrix.value = this.transformations.color.left;
        this.uniforms.right_matrix.value = this.transformations.color.right;
    }
    else if(algorithm == DichopticManager.algorithms.half_color){
        this.uniforms.left_matrix.value = this.transformations.half_color.left;
        this.uniforms.right_matrix.value = this.transformations.half_color.right;
    }
    else{
        this.uniforms.left_matrix.value = this.transformations.gray.left;
        this.uniforms.right_matrix.value = this.transformations.gray.right;
    }
        
};

Object.defineProperty(Phaser.Filter.NaiveAnaglyph.prototype, 'contrast', {

    get: function() {
        return this.uniforms.contrast.value;
    },

    set: function(value) {
        this.uniforms.contrast.value = value;
    }

});

Object.defineProperty(Phaser.Filter.NaiveAnaglyph.prototype, 'amblyopicEye', {

    get: function() {
        return this.uniforms.amblyopicEye.value;
    },

    set: function(value) {
        this.uniforms.amblyopicEye.value = value;
    }

});

Phaser.Filter.NaiveAnaglyph.prototype.update = function(currentPlayer){
    this.updateParameters(currentPlayer);
    this.applyAlgorithm(currentPlayer.medical.algorithm);
    this.uniforms.amblyopicEye.value = currentPlayer.medical.amblyopicEye;
    this.setContrast(currentPlayer.medical.suppression);
    
    
};




