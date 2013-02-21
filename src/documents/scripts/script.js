
(function(){
    /* setup toc */
    var toc = $('#menu .toc');
    $('a+h1, a+h2, a+h3').each(function() {
        var $h = $(this),
            $a = $h.prev();

        toc.append($('<li class="anchor-'+this.nodeName.toLowerCase()+'">'
            +'<a href="#' + $a.attr('name') + '">'+$h.text()
            +'</a></li>'
            ));
    });
    var mobile = true;
    var selector = mobile 
            ? $('#left select.toc-selector')
                .change(function () {
                    if (!selector.val()) return;
                    window.location = selector.val();
                    selector.val('');
                })
            : $('#left div.toc-button ul');

    $('#menu .nav a').each(function() {
        var $a = $(this);
        if (mobile)
            selector.append($('<option value="' + $a.attr('href') + '">' + $a.text() + '</option>'));
        else
            selector.append($('<li><a href="' + $a.attr('href') + '">' + $a.text() + '</a></li>'));
    });
    /*
    $('#menu div.toc-button').click(function() {
        var $this = $(this);
        setTimeout(function() {
            var dropdown = $('.dropdown-menu:visible', $this);
            var height = dropdown.length ?
                    dropdown.offset().top + dropdown.height() - $('#menu').offset().top + 200
                : 0;
            $('#menu').css('height', height ? height + 'px' : '');
            // after closing its safe to reset top to 0
            if (!height) $('#menu').css('top', '0px');

            $(window).trigger('resize.stickem');
            $(window).trigger('scroll.stickem');
        }, 10);
    //  selector.click();
    });
    */
    // $('#menu').affix()
    $('a[name]').next('h1,h2,h3').not('[id]').each(function(){ $(this).attr('id', $(this).prev().attr('name')); });

    $(function() {
        $('body').scrollspy();
        $('body').stickem({start:10});

        setTimeout(function() {
            $('body').stickem();
        }, 1000);
    });


})();