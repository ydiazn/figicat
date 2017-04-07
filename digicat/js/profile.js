/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
//Diplay name of current user
$("#user").text("Hola: "+currentplayer.name);
$(".menu_button" ).button();

UIManager.setUIEventHandler("principalmenu_input", function(){
    $("#menu").show();
    showMainMenu();
    SoundPlayer.stopBackgroundMusic2();
})


$("#treatment_dialog").dialog({
    autoOpen: false,
    width: 400,
    height:400,
    draggable: false,
    modal:true,
    position: { my: "center", at: "center", of: "#menu" },
    open: function(event, ui){
        if(currentplayer.medical.amblyopicEye == StorageManager.eyes.left){
            $("#left_eye").prop("checked", true);
            $("#right_eye").prop("checked", false);
        }
        else{
            $("#right_eye").prop("checked", true);
            $("#left_eye").prop("checked", false);
        }
        
        if(currentplayer.medical.method == StorageManager.methods.photoshop){
            $("#photoshop").prop("checked", true);
            $("#naive").prop("checked", false);
        }
        else{
            $("#vaive").prop("checked", true);
            $("#photoshop").prop("checked", false);
        }
        
        if(currentplayer.medical.algorithm == StorageManager.algorithms.color){
            $("#color_anaglyph").prop("checked", true);
            $("#half_color_anaglyph").prop("checked", false);
            $("#gray_anaglyph").prop("checked", false);
        }
        else if(currentplayer.medical.algorithm == StorageManager.algorithms.half_color){
            $("#color_anaglyph").prop("checked", false);
            $("#half_color_anaglyph").prop("checked", true);
            $("#gray_anaglyph").prop("checked", false);
        }
        else{
            $("#color_anaglyph").prop("checked", false);
            $("#half_color_anaglyph").prop("checked", false);
            $("#gray_anaglyph").prop("checked", true);
        }
        
        $("#radioset_ambliopic_eye").buttonset();
        $("#radioset_algorithm").buttonset();
        $("#radioset_method").buttonset();
        $("#suppression").val(currentplayer.medical.suppression);
        
        
    },
    buttons: [
        {
            text: "Aceptar",
            click: function() {
                currentplayer.medical.amblyopicEye = ($("#left_eye").is(":checked")) ? StorageManager.eyes.left: StorageManager.eyes.right;
                if($("#color_anaglyph").is(":checked"))
                    currentplayer.medical.algorithm = StorageManager.algorithms.color;
                else if($("#half_color_anaglyph").is(":checked"))
                    currentplayer.medical.algorithm = StorageManager.algorithms.half_color;
                else
                    currentplayer.medical.algorithm = StorageManager.algorithms.gray;
                
                if($("#photoshop").is(":checked"))
                    currentplayer.medical.method = StorageManager.methods.photoshop;
                else 
                    currentplayer.medical.method = StorageManager.methods.naive;
                
                currentplayer.medical.suppression = parseFloat($("#suppression").val());
                
                DichopticManager.applyMethod(currentplayer.medical.method);
                DichopticManager.filtro.update(currentplayer);                
                game.stage.filters = [DichopticManager.filtro];
                StorageManager.save();
                $( this ).dialog( "close" );
            }
        },
        {
            text: "Cancelar",
            click: function() {
                $( this ).dialog( "close" );
            }
        }
    ]
});

$("#users_dialog").dialog({
    autoOpen: false,
    width: 400,
    draggable: false,
    modal:false,
    position: { my: "center", at: "center", of: "#menu" },
    open: function(){
        $("#autocomplete" ).val('');
        $("#autocomplete" ).autocomplete("option","source", StorageManager.usersList());        
    },
    buttons: [
        {
            text: "Eliminar usuario",
            click: function() {
               var userName = $("#autocomplete" ).val();
               StorageManager.deleteProfile(userName);
               $("#autocomplete" ).val('');
               $("#autocomplete" ).autocomplete("option","source", StorageManager.usersList());
            }
        },
        {
            text: "Aceptar",
            click: function() {
                var userName = $("#autocomplete" ).val();
                var user = StorageManager.getUserByName(userName);
                if(user !== null)
                    currentplayer = user;
                else
                    currentplayer = StorageManager.createProfile(userName);
                
                DichopticManager.applyMethod(currentplayer.medical.method);   
                DichopticManager.filtro.update(currentplayer);                
                $("#user").text("Hola: " + currentplayer.name);                
                $( this ).dialog( "close" );
            }
        },
        {
            text: "Cancelar",
            click: function() {
                    $( this ).dialog( "close" );
            }
        }
    ]
});

$("#calibration_dialog").dialog({
    autoOpen: false,
    width: 400,
    draggable: false,
    modal:true,
    position: { my: "center", at: "center", of: "#menu" },
    open: function(event, ui){
        var calibration = currentplayer.dichoptic;
        $("#al").val(calibration.al);
        $("#bl").val(calibration.bl);
        $("#ar").val(calibration.ar);
        $("#br").val(calibration.br);
        $("#gamma").val(calibration.gamma);
    },
    buttons: [
        {
            text: "Aceptar",
            click: function() {
                currentplayer.dichoptic.al = parseFloat($("#al").val());
                currentplayer.dichoptic.bl = parseFloat($("#bl").val());
                currentplayer.dichoptic.ar = parseFloat($("#ar").val());
                currentplayer.dichoptic.br = parseFloat($("#br").val());
                currentplayer.dichoptic.gamma = parseFloat($("#gamma").val());
                DichopticManager.updateParameters(currentplayer);
                StorageManager.save();
                $( this ).dialog("close");
            }
        },
        {
            text: "Cancelar",
            click: function() {
                    $( this ).dialog( "close" );
            }
        }
    ]
});

// Link to open the dialog
$( "#treatment_menu" ).click(function( event ) {
	$( "#treatment_dialog" ).dialog( "open" );
	event.preventDefault();
});

// Link to open the dialog
$( "#new_menu" ).click(function( event ) {
	$("#menu").hide();
        gameState=GameState.Menu;
        SoundPlayer.playBackgroundMusic();
	
});

$( "#continue_menu" ).click(function( event ) {
	$("#menu").hide();
        gameState=GameState.Menu;
        SoundPlayer.playBackgroundMusic();
	
});

// Link to open the dialog
/*$( "#new_user_menu" ).click(function( event ) {
	$( "#treatment_dialog" ).dialog( "open" );
	event.preventDefault();
});*/

// Link to open the dialog
$( "#calibration_menu" ).click(function( event ) {
	$( "#calibration_dialog" ).dialog( "open" );
	event.preventDefault();
});

// Link to open the dialog
$( "#users_menu" ).click(function( event ) {
	$( "#users_dialog" ).dialog( "open" );
	event.preventDefault();
});


// Hover states on the static widgets
$( "#dialog-link, #icons li" ).hover(
	function() {
		$( this ).addClass( "ui-state-hover" );
	},
	function() {
		$( this ).removeClass( "ui-state-hover" );
	}
);

$("#autocomplete").autocomplete();
$("#usersList").selectmenu();


