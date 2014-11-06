var mongodb = require('./db');
function Post(username, post, time) {
	this.user = username;
	this.post = post;

	if (time) {
		this.time = time;
	} else {
		this.time = new Date();
	}
};

Post.prototype.save = function save(callback) {
	// 存入 Mongodb 的文档
	var that = this;
	mongodb.open(function(err, db) {
		var post = {
			user: that.user,
			post: that.post,
			time: that.time,
		};		
		if (err) {
		return callback(err);
		}
		// 读取 posts 集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			// 为 user 属性添加索引
			collection.ensureIndex('user');
			// 写入 post 文档
			collection.insert(post, {safe: true}, function(err, post) {
				mongodb.close();
				callback(err, post);
			});
		});
	});
};
Post.get = function get(username, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		// 读取 posts 集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			var query = {};
			if (username) {
				query.user = username;
			}
			collection.find(query).sort({time: -1}).toArray(function(err, docs) {
				mongodb.close();
				// 封装 posts 为 Post 对象
				var posts = [];
				docs.forEach(function(doc, index) {
					var post = new Post(doc.user, doc.post, doc.time);
					posts.push(post);
				});
				callback(null, posts);
			});
		});
	});
};
module.exports = Post;