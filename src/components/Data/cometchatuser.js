var request = require("request");

const create_cometchat_user = function (email, username, avatar, groupname) {
    var user = '{"uid" : "' + username + '" , "name" : "' + email + '" , "avatar" : "' + avatar + '" , "scope" :"authOnly"}'
    var options = {
        method: 'POST',
        url: 'https://api-us.cometchat.io/v2.0/users',
        headers: {
            appid: '179356b6e66895b',
            apikey: 'fae743651e432f171ee21ba834d8af048bd9e841',
            'content-type': 'application/json',
            accept: 'application/json'
        },
        body: user
    };
    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        create_group(username, groupname, groupname);
        console.log(body);
    });
}
const create_group = function (uuid, guid, groupname) {
    var group = '{"guid" : "' + guid + '" , "name" : "' + groupname + '" , "type" : "public"}'
    var options = {
        method: 'POST',
        url: 'https://api-us.cometchat.io/v2.0/users/' + uuid + '/groups',
        headers: {
            appid: '179356b6e66895b',
            apikey: 'fae743651e432f171ee21ba834d8af048bd9e841',
            'content-type': 'application/json',
            accept: 'application/json'
        },
        body: group
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        joingroup (uuid,guid)
        console.log("you create a family");
    });
}
const joingroup = function (uuid, guid)
{
    var options = {
        method: 'POST',
        url: 'https://api-us.cometchat.io/v2.0/users/' + uuid + '/groups/' + guid + '/members',
        headers: {
            appid: '179356b6e66895b',
            apikey: 'fae743651e432f171ee21ba834d8af048bd9e841',
            'content-type': 'application/json',
            accept: 'application/json'
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log("You just joined family " + guid);
    });
}

//create_cometchat_user("kallen@honkaiimpact.com","Kallen1","https://unknown2020.s3-ap-southeast-1.amazonaws.com/60111.png")
//joingroup("captain2000","mu")
export { create_cometchat_user }