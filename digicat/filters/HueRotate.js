/**
* Original shader by Daniil (https://www.shadertoy.com/view/4sl3DH)
* Tweaked, uniforms added and converted to Phaser/PIXI by Richard Davey
*/
Phaser.Filter.HueRotate = function (game) {

    Phaser.Filter.call(this, game);
    this.passes = [this];
    this.transformations = {color: {left: [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
            right: [0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]
        }
    }
    
    this.uniforms.contrast = {type: '1f', value: 1.0};
    this.uniforms.iChannel0 =  {type:'sampler2D', value: null};
    this.uniforms.P = {type: 'mat3', value: null};
    this.uniforms.left_matrix = {type: 'mat3', value: null};
    this.uniforms.right_matrix = {type: 'mat3', value: null};
    this.uniforms.R = {type: 'mat3', value: null};
    this.uniforms.gamma = {type: '1f', value: 2.0};

    this.fragmentSrc = [

        "precision mediump float;",
        'uniform sampler2D uSampler;',
        'uniform sampler2D iChannel0;',
        'varying vec2 vTextureCoord;',
        'uniform mat3 R;',
        'uniform mat3 P;',
        'uniform mat3 left_matrix;',
        'uniform mat3 right_matrix;',
        "void main(void)",
        "{",
            "gl_FragColor =  vec4(texture2D(uSampler, vTextureCoord).r,0.0, 0.0, 1.0);",
        "}"
    ];

};

Phaser.Filter.HueRotate.prototype = Object.create(Phaser.Filter.prototype);
Phaser.Filter.HueRotate.prototype.constructor = Phaser.Filter.HueRotate;

Phaser.Filter.HueRotate.prototype.init = function (texture, currentPlayer) {

    texture.baseTexture._powerOf2 = true;
    this.uniforms.iChannel0.value = texture;
    this.uniforms.contrast.value = contrast;
    this.uniforms.PL.value = PL;
    this.uniforms.PR.value = PR;
    this.uniforms.R.value = R;
    this.uniforms.gamma.value = gamma;
    this.uniforms.CH.value = CH;

};


