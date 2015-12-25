function setup () {
    $('#adder').click(function (e) {
        var text = $('#channelBox').val();
        console.log('Adding Channels!');
        var pre = "<iframe width=\"560\" height=\"315\" src=\"";
        var post = "\" frameborder=\"0\" allowfullscreen></iframe>";
        $('#viewer').append(pre + parseYoutubeUrl(text) + post);
    });
}

function parseYoutubeUrl (url) {
    var parsing = url.trim().split('watch?v=');
    var http = parsing[0];
    var video = parsing[1];
    return http + 'embed/' + video;
}
