var server = function(config){

	var path = require('path')
	var _ = require('underscore')	
	var express = require('express')

	var app = express();

	var settings = {
		octavo: {},
		env: 'development',
		static_path: null,
		view_path: path.join(__dirname, 'views')
	}
	_.extend(settings, config)

	app.engine('html', require('ejs').renderFile)
	app.set('views', settings.view_path)
	app.set('view engine', 'html')
	app.set('env', settings.env)

	if('production' == app.get('env')) {
  		settings.octavo.auto_generate_toc = false;
	}

	if(settings.static_path){
		app.use(express.static(settings.static_path))
	}

	app.use(express.static(path.join(__dirname, 'public')))

	app.use(octavo(settings.octavo))

	app.get('/*', function(req, res){
	    res.send(404)
	})

	return app
}

var octavo = function(config){
	
	var async = require('async')
	var lazy = require("lazy")
	var path = require('path')
	var fs = require('fs')
	var _ = require('underscore')	
	var markdown = require('markdown').markdown

	var settings = {
		posts_path: null,
		toc_filename: 'toc.json',
		auto_generate_toc: true,
		ext: '.md',
		title: 'Octavo',
		default_post: 'index',
		base_url: '',
		theme: {
			template: 'octavo',
			css: '/css/octavo.css'
		}
	}
	_.extend(settings, config)

	var build_toc = function(toc_file, func){
		fs.readFile(toc_file, function(err, data){
			if(err == null){
				var toc = JSON.parse(data)
				async.map(
					toc, 
					function(meta, callback){
						var post_link = '- [' + meta[1] + "] (" + settings.base_url + "/" + meta[0] + ")\n"
						callback(null, post_link)
					}, 
					function(err, results){
						func(err, results.join(''))
					}
				)
			} else {
				console.log(err);
				func("Invalid toc file.")
			}		
		})
	}

	var render_post_json = function(post, req, res, next) {
		var file_path = path.join(settings.posts_path, post + settings.ext)
		var toc_file_path = path.join(settings.posts_path, settings.toc_filename)

		fs.readFile(file_path, function(err, data){
			if(err == null){
				res.json({id: post, content: markdown.toHTML(data.toString())})
			} else {
				console.log(err)
				next()
			}
		})
	}

	var render_post_html = function(post, req, res, next) {
		var file_path = path.join(settings.posts_path, post + settings.ext)
		var toc_file_path = path.join(settings.posts_path, settings.toc_filename)

		fs.readFile(file_path, function(err, data){
			if(err == null){
				if(settings.auto_generate_toc == false){
					res.render(settings.theme.template, {
						title: settings.title,
						css: settings.theme.css,
						content: markdown.toHTML(data.toString()),
						toc: markdown.toHTML(settings.toc_str)
					})
				} else {
					build_toc(toc_file_path, function(err, menu){
						if(err == null){
							res.render(settings.theme.template, {
								title: settings.title,
								css: settings.theme.css,
								content: markdown.toHTML(data.toString()),
								toc: markdown.toHTML(menu)
							})
						} else {
							console.log(err)
							res.send(500)	
						}
					})
				}
			} else {
				console.log(err)
				next()
			}
		})
	}

	if(settings.auto_generate_toc == false){
		var toc_file_path = path.join(settings.posts_path, settings.toc_filename)
		build_toc(toc_file_path, function(err, menu){
			if(err == null){
				settings.toc_str = menu
			}
		})		
	}

	return function(req, res, next){
		var base_url = settings.base_url.replace('/', '\/')
		
		if(req.xhr){
			var url_regex =  new RegExp("^" + base_url + "\/api\/posts\/([a-z\d]+[\/a-z\d\-]*[a-z\d]+)?$")
			url_match = req.path.match(url_regex)
			if(url_match == null || url_match[1] == undefined){
				next()		
				return
			}
			var post = url_match[1]
			render_post_json(post, req, res, next)
		} else {
			var url_regex =  new RegExp("^" + base_url + "\/([a-z\d]+[\/a-z\d\-]*[a-z\d]+)?$")
			url_match = req.path.match(url_regex)
			if(url_match == null){
				next()		
				return
			}
			var post = 	url_match[1]
			if(post == undefined) {
				post = settings.default_post
			}
			render_post_html(post, req, res, next)
		}
	}
}

exports.server = server
exports.octavo = octavo