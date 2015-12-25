function surfing () {
    'use strict';

    var channels = [];

    function setup () {
        $('#adder').click(function (e) {
            var text = $('#channelBox').val();
            console.log('Adding Channel ' + text + '!');
            channels.push(youtubeUrlToObject(text));
            $('#viewer').append(urlToIframe(parseYoutubeUrl(text)));
            generateButtons();
        });
    }
    
    function parseYoutubeUrl (url) {
        var parsing = url.trim().split('watch?v=');
        var http = parsing[0];
        var video = parsing[1];
        return http + 'embed/' + video;
    }

    function urlToIframe(url) {
        var pre = "<iframe width=\"560\" height=\"315\" src=\"",
            post = "\" frameborder=\"0\" allowfullscreen></iframe>";
        return pre + url + post;
    }

    function youtubeUrlToObject (url) {
        return {
            'url': url,
            'frameUrl': parseYoutubeUrl(url)
        };
    }

    function generateButtons () {
        var buttons = d3.select('#channelButtons').selectAll('div')
                        .data(channels);
        buttons.exit().remove();
        buttons.enter().append('div').attr({
            'class': 'channelButton'
        }).click(function (d) {

        }).text(function (d) { return d.url; });
    }

    setup();
}
