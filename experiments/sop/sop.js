function sop () {
    var testData = [
        {
            'text': 'Lorem Ipsum',
            'page': 1,
            'links': [
                ['To page 3!', 3]
            ]
        },
        {
            'text': 'Also Lorem Ipsum',
            'page': 2,
            'links': [
                ['To page 1!', 1]
            ]
        },
        {
            'text': 'More testing',
            'page': 3,
            'links': [
                ['Goes to 1', 1],
                ['Goes to 2', 2]
            ]
        }
    ];

    //var pages = testData;
    var pages = {};
    var pageData = testData;
    var editorPage;

    setup();

    function dataToHash (data) {
        data.forEach(function (d) {
            pages[d.page] = {
                'page': d.page,
                'text': d.text,
                'links': d.links
            };
        });
    }

    function setup () {
        dataToHash(pageData);
        generateNavigation(pageData);
        generateEditor(pageData);
        d3.select('#page-button').on('click', saveEditor);
        d3.select('#add-button').on('click', function () {
            var newPage = {
                'page': Object.keys(pages).length + 1,
                'text': '',
                'links': []
            };
            pages[newPage.page] = newPage;

            var pageData = Object.keys(pages).map(function (d) { return pages[d]; });

            generateNavigation(pageData);
            generateEditor(pageData);
        });
        d3.select('#add-link-button').on('click', function () {
            var links = d3.select('#page-links').selectAll('div').data();
            links.push(['', 0]);
            loadEditorLinks({'links':links});
        });
    }

    function saveEditor () {
        pages[editorPage].text = $('#page-content').val();

        var newLinksList = [];

        var unsavedLinks = d3.selectAll('.link-edit');
        var n = unsavedLinks.node();
        var linkText;
        var linkNum;
        while (n) {
            linkText = $(d3.select(n).select('.link-text').node()).val();
            linkNum = parseInt($(d3.select(n).select('.link-page').node()).val());
            newLinksList.push([linkText, linkNum]);
            n = n.nextElementSibling;
        }

        pages[editorPage].links = newLinksList;

        var data = Object.keys(pages).map(function (d) {return pages[d];});
        generateNavigation(data);
    }

    function generateEditor (data) {
        generatePageEditorNavigation(data);
    }

    function generatePageEditorNavigation (data) {
        var pager = d3.select('#pages');
        var pagerButtons = pager.selectAll('div').data(data);
        pagerButtons.exit().remove();
        pagerButtons.enter().append('div').text(function (d) {
            return 'Page ' + d.page;
        }).on('click', function (d) {
            editorPage = d.page;
            loadEditorViewer(d);
            loadEditorLinks(d);
        });
    }

    function loadEditorViewer (page) {
        d3.select('#page-content').text(page.text);
    }

    function loadEditorLinks (page) {
        var links = d3.select('#page-links').selectAll('div').data(page.links);
        links.exit().remove();
        var divLinks = links.enter().append('div').attr('class', 'link-edit');
        
        divLinks.append('textarea').attr({
                'rows': '1',
                'cols': '10',
                'class': 'link-text'
            })
            .text(function (d) {return d[0];});
        divLinks.append('textarea').attr({
                'rows': '1',
                'cols': '4',
                'class': 'link-page'
            })
            .text(function (d) {return d[1];});
    }

    function generateNavigation (data) {
        var navigation = d3.select('#nav');
        var navigationButtons = navigation.selectAll('div').data(data);
        navigationButtons.exit().remove();
        navigationButtons.enter().append('div');
        navigationButtons.text(function (d) {
            return 'Page ' + d.page;
        }).on('click', function (d) {
            loadViewer(d);
        });
    }

    function loadViewer (page) {
        d3.select('#viewer-content').text(page.text);
        var links = d3.select('#viewer-links').selectAll('div')
            .data(page.links);
        links.exit().remove();
        links.enter().append('div');
        links.text(function (link) {
                return link[0];
            }).on('click', function (link) {
                loadViewer(pages[link[1]]);
            });
    }

}
