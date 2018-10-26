/**
* A horizontal blur filter by Mat Groves http://matgroves.com/ @Doormat23
*/
Phaser.Filter.Anaglyph = function (game) {

    Phaser.Filter.call(this, game);

    this.passes = [this];
        
    // set the uniforms
    this.uniforms.left_contrast = {type: '1f', value: 1.0};
    this.uniforms.right_contrast = {type: '1f', value: 1.0};
    this.uniforms.iChannel0 =  {type:'sampler2D', value: null};
    this.uniforms.PL = {type: '3fv', value: null};
    this.uniforms.PR = {type: '3fv', value: null};
    this.uniforms.PPL = {type: '3fv', value: null};
    this.uniforms.PPR = {type: '3fv', value: null};
    this.uniforms.CH = {type: '3fv', value: null};
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
        'uniform vec3 PL;',
        'uniform vec3 PR;',
        'uniform vec3 PPL;',
        'uniform vec3 PPR;',
        'uniform vec3 CH;',
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
        '   left_color.r = 1.0 - PPL.r + (2.0 * PPL.r - 1.0)*left_color.r;',
        '   right_color.r = 1.0 - PPR.r + (2.0 * PPR.r - 1.0)*right_color.r;',
        
        '   left_color = vec3(pow(left_color.r, gamma), pow(left_color.g, gamma), pow(left_color.b, gamma));',
        '   right_color = vec3(pow(right_color.r, gamma), pow(right_color.g, gamma), pow(right_color.b, gamma));',
        //  Ghosting reduction anaglyph
        '   float Yl = dot(left_color, PL);',
        '   float Yr = dot(right_color, PR);',
        '   float chromaticity = dot(right_color, CH);',
        '   vec3 YYc = vec3(Yl,Yr,chromaticity);',
        '   vec3 color = YYc*R;',
        
        //  Ideal filters
        '   vec3 aux_color = vec3(pow(color.r,gamma), pow(color.g,gamma), pow(color.b,gamma));',
        '   float lum_left_red = PPL.r * aux_color.r;',
        '   float lum_left_green = PPL.g * aux_color.g;',
        '   float lum_left_blue = PPL.b * aux_color.b;',
        '   float lum_right_red = PPR.r * aux_color.r;',
        '   float lum_right_green = PPR.g * aux_color.g;',
        '   float lum_right_blue = PPR.b * aux_color.b;',
        
        '   float lum_red = lum_left_red + lum_left_green + lum_left_blue - lum_right_red;',
        '   float lum_green = lum_right_green - lum_left_green + lum_right_red/2.0;',
        '   float lum_blue = lum_right_blue - lum_left_blue + lum_right_red/2.0;',
        '   vec3 final_color;',
        '   final_color.r = pow(lum_red/PPL.r, (1.0/gamma));',
        '   final_color.g = pow(lum_green/PPR.g, (1.0/gamma));',
        '   final_color.b = pow(lum_blue/PPR.b, (1.0/gamma));',
        '   final_color = vec3(pow(final_color.r, 1.0/gamma), pow(final_color.g, 1.0/gamma), pow(final_color.b, 1.0/gamma));',
        '   gl_FragColor = vec4(final_color.rgb, 1.0);',
        //'   gl_FragColor = vec4(color.rgb, 1.0);',
        '}'
    ];

};

Phaser.Filter.Anaglyph.prototype = Object.create(Phaser.Filter.prototype);
Phaser.Filter.Anaglyph.prototype.constructor = Phaser.Filter.Anaglyph;

Phaser.Filter.Anaglyph.prototype.updateParameters = function(currentPlayer){
    var al = currentPlayer.dichoptic.al;
    var bl = currentPlayer.dichoptic.bl;
    var ar = currentPlayer.dichoptic.ar;
    var br = currentPlayer.dichoptic.br;

    var cl = 1.0-al-bl;
    var cr = 1.0-ar-br;
    this.uniforms.gamma.value = currentPlayer.dichoptic.gamma;
    this.uniforms.PPL.value = [al, bl, cl];
    this.uniforms.PPR.value = [ar, br, cr];
    var RR = [br+cr, -bl-cl, br*cl-cr*bl, -ar, al, cr*al-ar*cl, -ar, al, ar*bl-br*al];
    this.uniforms.R.value = RR.map(function(x){return x * (1.0/(al-ar));});
};

Phaser.Filter.Anaglyph.prototype.updateMatrix = function(){
    if(this.currentAlgorithm == DichopticManager.algorithms.color){
        this.uniforms.PL.value = this.uniforms.PPL.value;
        this.uniforms.PR.value = this.uniforms.PPR.value;
    }
    else{
        this.uniforms.PL.value = DichopticManager.sRGB;
        this.uniforms.PR.value = DichopticManager.sRGB;
    }
};

Phaser.Filter.Anaglyph.prototype.applyAlgorithm = function(algorithm){
    
    if(algorithm == DichopticManager.algorithms.color || algorithm == DichopticManager.algorithms.half_color)
        this.uniforms.CH.value = DichopticManager.chromaticity.color;
    else
        this.uniforms.CH.value = DichopticManager.chromaticity.gray;
    
    this.currentAlgorithm = algorithm;
};

Phaser.Filter.Anaglyph.prototype.setContrast = function (suppression) {

    if(this.uniforms.amblyopicEye.value == StorageManager.eyes.left){
        this.uniforms.left_contrast.value = 1.0;
        this.uniforms.right_contrast.value = suppression;
    }
    else{
        this.uniforms.right_contrast.value = 1.0;
        this.uniforms.left_contrast.value = suppression;
    }
    
};

Phaser.Filter.Anaglyph.prototype.init = function (texture, currentPlayer) {

    //this.setResolution(width, height);    
    texture.baseTexture._powerOf2 = true;
    this.uniforms.iChannel0.value = texture;
    this.update(currentPlayer);
    
};

Object.defineProperty(Phaser.Filter.Anaglyph.prototype, 'contrast', {

    get: function() {
        return this.uniforms.contrast.value;
    },

    set: function(value) {
        this.uniforms.contrast.value = value;
    }

});

Object.defineProperty(Phaser.Filter.Anaglyph.prototype, 'amblyopicEye', {

    get: function() {
        return this.uniforms.amblyopicEye.value;
    },

    set: function(value) {
        this.uniforms.amblyopicEye.value = value;
    }

});

Phaser.Filter.Anaglyph.prototype.update = function(currentPlayer){
    this.updateParameters(currentPlayer);
    this.applyAlgorithm(currentPlayer.medical.algorithm);
    this.updateMatrix();    
    this.uniforms.amblyopicEye.value = currentPlayer.medical.amblyopicEye;
    this.setContrast(currentPlayer.medical.suppression);
    
};
