module('Module')

test('Module.make always returns same resource for the same id', function(){
	var res = Module.make('jquery');
	equal(res, Module.make('jquery'))
})

test('loaded, run and completed are deferreds', function(){
	var res = Module.make('jquery')
	ok(TH.isDeferred(res.loaded))
	ok(TH.isDeferred(res.run))
	ok(TH.isDeferred(res.completed))
})

test('resource options will be extended if called twice for the same id', function(){
	var res = Module.make('jquery')
	var res2 = Module.make({id: 'jquery', foo: 'bar'})
	equal(res.options.foo, 'bar')
})

test('callback functions for deferreds should be called', 2, function(){
	var res = Module.make('jquery')
	var callbacks = ['completed', 'loaded'];
	for(var i = 0; i < callbacks.length; i++){
		res[callbacks[i]].then(function(){
			ok(true)
		})
	}
	res.complete();
	res.load();
})

test('calling execute should call deferred functions and steal.require.', 3, function(){
	var res = Module.make('jquery')
	var callbacks = ['completed', 'loaded'];
	var stealRequire = steal.require;
	steal.require = function(){
		ok(true)
	}
	for(var i = 0; i < callbacks.length; i++){
		res[callbacks[i]].then(function(){
			ok(true)
		})
	}
	res.execute();
	steal.require = stealRequire;
})

test('correct load functions should be called for every type', function(){
	var originalTypeFns = {};
	var types = steal.config().types;
	var typeLoadersCalled = [];
	var load = [
		'jquery.js',
		function(){},
		'foo.text',
		'foo.css'
	]
	var assertRequire = function(type){
		return function(){
			typeLoadersCalled.push(type);
		}
	}
	var assertFns = {};
	for(var type in types){
		originalTypeFns[type] = types[type].require;
		assertFns[type] = assertRequire(type);
	}
	steal.config({types: assertFns})
	for(var i = 0; i < load.length; i++){
		var r = Module.make(load[i]);
		r.execute();
	}
	equal(typeLoadersCalled.join(), "js,fn,text,css");
	steal.config({types: originalTypeFns})
})