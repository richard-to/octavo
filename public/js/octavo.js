var config = window.OCTAVO_CONFIG

var PostModel = Backbone.Model.extend({
    urlRoot: '/api/posts'
})

var PostCollection = Backbone.Collection.extend({
    model: PostModel,
    url: '/api/posts'
})

var PostView = Backbone.View.extend({
    initalize: function(){
        _.bindAll(this, 'render', 'setPost')
    },
    render: function() {

        $(this.el).html(this.model.get('content'))
    },
    setPost: function(postId){
        var view = this
        var post = this.collection.get(postId)
        if(!post) {
            view.model = new PostModel({id:postId})
            view.model.fetch({
                success: function(){
                    view.collection.add([view.model])
                    view.render()
                }
            })
        } else {
            this.model = post
            this.render()            
        }
    }
})

var AppView = Backbone.View.extend({
    initialize: function(options) {
        _.bindAll(this, 'render', 'viewPost')
        this.config = options.config
        this.router = options.router
        this.collection = options.collection
    },
    render: function(){
        this.postView = new PostView({
            el: this.$('.content .pad'), 
            collection: this.collection
        })
    },
    events: {
        'click .menu a': 'viewPost'
    },
    viewPost: function(e){
        e.preventDefault()
        this.router.navigate(e.target.href.replace(config.site_url, ''), {trigger: true})        
    }
})

var OctavoRouter = Backbone.Router.extend({
    initialize: function(options){
        this.collection = new PostCollection()
        this.app = new AppView({
            el: $(document.body),
            collection: this.collection,
            config: options.config,
            router: this
        })
        this.app.render()
    },
    routes: {
        ":post_id": "postAction"
    },
    postAction: function(post_id){
        this.app.postView.setPost(post_id)
    }
})

$(document).ready(function(){
    var router = new OctavoRouter({config: config})
    Backbone.history.start({pushState:true, silent:true})
})