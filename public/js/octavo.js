var config = window.OCTAVO_CONFIG

var PostModel = Backbone.Model.extend({
    urlRoot: '/api/posts'
})

var PostCollection = Backbone.Collection.extend({
    model: PostModel,
    url: '/api/posts'
})

var PostListView = Backbone.View.extend({
    template: _.template('<div class="post_wrap"><%= content %></div>'),
    initalize: function(){
        _.bindAll(this, 'render')
    },
    render: function() {
        var view = this
        $(this.el).html('')
        this.collection.each(function(model){
            $(view.el).append(view.template({content:model.get('content')}))
        })
    }
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

var MenuView = Backbone.View.extend({
    initialize: function(options) {
        _.bindAll(this, 'render', 'navigate')
        this.config = options.config
        this.router = options.router
    },
    render: function(){},
    events: {
        'click .menu a': 'navigate'
    },
    navigate: function(e){
        e.preventDefault()
        this.router.navigate(e.target.href.replace(config.site_url, ''), {trigger: true})        
    }
})

var OctavoRouter = Backbone.Router.extend({
    initialize: function(options){
        this.collection = new PostCollection()
        
        this.menu = new MenuView({
            el: $(document.body),
            config: options.config,
            router: this
        })

        this.postView = new PostView({
            el: $('.content .pad'), 
            collection: this.collection
        })

        this.postListView = new PostListView({
            el: $('.content .pad'), 
            collection: this.collection
        })         
    },
    routes: {
        ":post_id": "postAction",
        "": "indexAction"
    },
    postAction: function(post_id){
        this.postView.setPost(post_id)
    },
    indexAction: function(){
        this.postListView.render()
    }
})

$(document).ready(function(){
    var router = new OctavoRouter({config: config})
    Backbone.history.start({pushState:true, silent:true})
})