/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var DichopticManager = {};

DichopticManager.algorithms = {color: 1, half_color: 2, gray:3};
DichopticManager.methods = {photoshop: 1, naive:2};

DichopticManager.sRGB = [0.2126, 0.7152, 0.0722];

DichopticManager.chromaticity = {
    color: [0, 1.0, -1.0],
    gray: [0.0, 0.0, 0.0]
};

DichopticManager.init = function(game, currentPlayer){
    this.renderTexture = game.add.renderTexture(800, 600);
    this.photoshop = game.add.filter('Anaglyph',this.renderTexture, currentPlayer);
    this.naive = game.add.filter('NaiveAnaglyph',this.renderTexture, currentPlayer);
    this.applyMethod(currentPlayer.medical.method);
    
};

DichopticManager.applyAlgorithm = function(algorithm){
    if(this.currentMethod == this.methods.photoshop){
        this.filtro.applyAlgorithm(algorithm);
        this.filtro.updateMatrix();
    }
    else
        this.filtro.applyAlgorithm(algorithm);
};

DichopticManager.updateParameters = function(currentPlayer){
    if(this.currentMethod == this.methods.photoshop){
        this.filtro.updateParameters(currentPlayer);
        this.filtro.updateMatrix();
    }
    else
        this.filtro.updateParameters(currentPlayer);
};


DichopticManager.update = function(currentPlayer){
    //this.filtro.update();
    this.applyMethod(currentPlayer.method);
};

DichopticManager.applyMethod = function(method){
    this.currentMethod = method;
    if(this.currentMethod == this.methods.photoshop)
        this.filtro = this.photoshop;
    else
        this.filtro = this.naive;
};

DichopticManager.render = function(game){
    this.renderTexture.renderXY(game.world, -game.camera.x, -game.camera.y, true);
}


