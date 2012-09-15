 $('document').ready(function(){
    
    var config = window.OCTAVO_CONFIG

    var PostModel = Backbone.Model.extend({
        urlRoot: '/api/posts'
    })

    var PostCollection = Backbone.Collection.extend({
        model: PostModel,
        url: '/api/posts'
    })

    var posts = new PostCollection()

    var PostView = Backbone.View.extend({
        render: function() {

        }
    })

    var OctavoRouter = Backbone.Router.extend({
        routes: {
            ":post_id": "post_action"
        },
        post_action: function(post_id){
            var post = posts.get(post_id)
            if(!post) {
                post = new PostModel({id:post_id})
                post.fetch({
                    success: function(){
                        $('.content .pad').html(post.get('content'))
                        posts.add([post])
                    }
                })
            } else {
                $('.content .pad').html(post.get('content'))    
            }
        }
    })

    var router = new OctavoRouter()
    Backbone.history.start({pushState:true, silent:true})

    $('.menu a').click(function(e){
        e.preventDefault()
        router.navigate(this.href.replace(config.site_url, ''), {trigger: true})
    })
})