var StorageManager = {};

StorageManager.eyes = {left: 0, right:1};
StorageManager.algorithms = {color: 1, half_color: 2, gray:3};
StorageManager.methods = {photoshop: 1, naive:2};

StorageManager.init = function(){
    var data = JSON.parse(localStorage.getItem("profiles") || 'null');
    if(data !== null)
        this.profiles = data;
    else{
        this.profiles = [{
            id:1,
            name: "user",
            medical:{
                method:this.methods.naive,
                amblyopicEye: this.eyes.right,
                algorithm: this.algorithms.color,
                suppression: 1.0
            },
            dichoptic:{
                al: 0.8387,
                bl: 0.1431,
                ar: 0.0282,
                br: 0.8201,
                gamma: 1.582 
            },
            state:{
                level: 1,
                lives: 3,
                score: 0
            }
        }
        ];
        this.save();
    }
};

StorageManager.save = function(){
    var data = JSON.stringify(this.profiles);
    localStorage.setItem("profiles", data);
};

StorageManager.firstUser = function(){
    return this.profiles[0];
};

StorageManager.usersList = function(){
    var users = [];
    for (var i=0; i< this.profiles.length; i++)
        users[i] = this.profiles[i].name;
    return users;
};

StorageManager.getUserByName = function(name){
    var users = this.usersList();
    var index = users.indexOf(name);
    if(index != -1)
        return this.profiles[index];
    else
        return null;
    
};

StorageManager.createProfile = function(userName){
    var profile = {
        id: this.profiles.length,
        name: userName,
        medical:{
            amblyopicEye: this.eyes.right,
            suppression: 1.0,
            algorithm: this.algorithms.color
        },
        dichoptic:{
            al: 0.8387,
            bl: 0.1431,
            ar: 0.0282,
            br: 0.8201,
            gamma: 1.582 
        },
        state:{
            level: 1,
            lives: 3,
            score: 0
        }
    }; 
    
    this.profiles.push(profile);
    this.save();
    return profile;
};

StorageManager.deleteProfile = function(userName){
    var users = this.usersList();
    var index = users.indexOf(userName);
    if(index != -1){
        this.profiles.splice(index, 1);
        this.save();
        return true;
    }
    return false;
};