 $('document').ready(function(){
    
    var config = window.OCTAVO_CONFIG

    var OctavoRouter = Backbone.Router.extend({
        routes: {
            ":post": "post_action"
        },
        post_action: function(post){
            $.getJSON('/api/posts/' + post, function(data) {
                $('.content .pad').html(data.content)
            }, 'json');
        }
    })

    var router = new OctavoRouter()
    Backbone.history.start({pushState:true, silent:true})

    $('.menu a').click(function(e){
        e.preventDefault()
        router.navigate(this.href.replace(config.site_url, ''), {trigger: true})
    })
})