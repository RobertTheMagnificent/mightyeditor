/*
 * do not edit this file directly - as it will get updated automatically width MightyEditor update
 */

(function(){
	"use strict";
	Phaser.Text.prototype.updateText = function () {
		this.context.font = this.style.font;

		var outputText = this.text;
		var maxLineWidth = 0;

		// word wrap
		// preserve original text
		if (this.style.wordWrap)
		{
			outputText = this.runWordWrap(this.text);
			maxLineWidth = this.wordWrapWidth;
		}

		//split text into lines
		var lines = outputText.split(/(?:\r\n|\r|\n)/);

		//calculate text width
		var lineWidths = [];
		
		for (var i = 0; i < lines.length; i++)
		{
			var lineWidth = this.context.measureText(lines[i]).width;
			lineWidths[i] = lineWidth;
			maxLineWidth = Math.max(maxLineWidth, lineWidth);
		}

		this.canvas.width = maxLineWidth + this.style.strokeThickness;

		//calculate text height
		var lineHeight = this.determineFontHeight('font: ' + this.style.font + ';') + this.style.strokeThickness + this._lineSpacing + this.style.shadowOffsetY;

		this.canvas.height = lineHeight * lines.length;

		if (navigator.isCocoonJS)
		{
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}

		//set canvas text styles
		this.context.fillStyle = this.style.fill;
		this.context.font = this.style.font;

		this.context.strokeStyle = this.style.stroke;
		this.context.lineWidth = this.style.strokeThickness;

		this.context.shadowOffsetX = this.style.shadowOffsetX;
		this.context.shadowOffsetY = this.style.shadowOffsetY;
		this.context.shadowColor = this.style.shadowColor;
		this.context.shadowBlur = this.style.shadowBlur;

		this.context.textBaseline = 'top';
		this.context.lineCap = 'round';
		this.context.lineJoin = 'round';
		
		
		var linePosition = new PIXI.Point(0, 0);
		//draw lines line by line
		for (i = 0; i < lines.length; i++)
		{
			linePosition.x = this.style.strokeThickness / 2;
			linePosition.y = this.style.strokeThickness / 2 + i * lineHeight + this._lineSpacing;

			if (this.style.align === 'right')
			{
				linePosition.x += maxLineWidth - lineWidths[i];
			}
			else if (this.style.align === 'center')
			{
				linePosition.x += (maxLineWidth - lineWidths[i]) / 2;
			}

			if (this.style.stroke && this.style.strokeThickness)
			{
				this.context.strokeText(lines[i], linePosition.x, linePosition.y);
			}

			if (this.style.fill)
			{
				this.context.fillText(lines[i], linePosition.x, linePosition.y);
			}
		}

		this.updateTexture();
	};
	
	// add scaleX/Y and anchorX/Y - so we can skip extra tweens
	(function(){
		
		Object.defineProperty(Phaser.Sprite.prototype, "scaleX", {
			set: function(val){
				this.scale.x = val;
			},
			get: function(){
				return this.scale.x;
			}
		});
		
		Object.defineProperty(Phaser.Sprite.prototype, "scaleY", {
			set: function(val){
				this.scale.y = val;
			},
			get: function(){
				return this.scale.y;
			}
		});
		
		Object.defineProperty(Phaser.Sprite.prototype, "anchorX", {
			set: function(val){
				this.anchor.x = val;
			},
			get: function(){
				return this.anchor.x;
			}
		});
		
		Object.defineProperty(Phaser.Sprite.prototype, "anchorY", {
			set: function(val){
				this.anchor.y = val;
			},
			get: function(){
				return this.anchor.y;
			}
		});
		
		Object.defineProperty(Phaser.Group.prototype, "scaleX", {
			set: function(val){
				this.scale.x = val;
			},
			get: function(){
				return this.scale.x;
			}
		});
		
		Object.defineProperty(Phaser.Group.prototype, "scaleY", {
			set: function(val){
				this.scale.y = val;
			},
			get: function(){
				return this.scale.y;
			}
		});
		
	})();
	var TweenCollection = function(movieName, pack, fps, length, delay, manager){
		this.name = movieName;
		
		this.onComplete = new Phaser.Signal();
		this._pack = pack;
		this._tweens = [];
		this._subtweens = [];
		this._mainTimer = null;
		this._startPos = [];
		if(manager){
			this.manager = manager;
		}
		else{
			
			this.manager = new Phaser.TweenManager(mt.game);
			this.manager.destroy = function(){};
			this.manager.update = function() {
				var addTweens = this._add.length;
				var numTweens = this._tweens.length;
				
				if (numTweens === 0 && addTweens === 0){
					return false;
				}
				var i = 0;
				while (i < numTweens){
					if (this._tweens[i].update(this.game.time.now)){
						i++;
					}
					else{
						this._tweens.splice(i, 1);
						numTweens--;
					}
				}
				//  If there are any new tweens to be added, do so now - otherwise they can be spliced out of the array before ever running
				if (addTweens > 0){
					this._tweens = this._tweens.concat(this._add);
					this._add.length = 0;
				}
				
				
				return true;
			};
		}
		
		this._delay = delay;
		this._length = length;
		
		if(fps != void(0)){
			this._fps = fps;
			this._ifps = 1000/this._fps;
		}
		
		if(length != void(0)){
			this._lastFrame = length;
		}
		
		this._buildTweens(this._pack, true);
		
		if(movieName != mt.mainMovie){
			this._buildChildTweens(this._pack.children);
		}
		
	};
	
	TweenCollection.prototype = {
		isLooping: false,
		_fps: -1,
		_lastFrame: -1,
		_buildTweens: function(pack, isMain){
			var delay;
			var start, stop, tween, easings;
			if(!pack.data.movies){
				return;
			}
			var movie = pack.data.movies[this.name];
			if(!movie){
				return null;
			}
			if(isMain){
				if(this._fps == -1){
					if(movie.subdata){
						this._fps = mt.data.map.movieInfo.fps;
						
					}
					else{
						this._fps = movie.info.fps || mt.data.map.movieInfo.fps;
					}
					this._ifps = 1000/this._fps;
					
				}
				if(this._lastFrame == -1){
					if(movie.subdata){
						this._lastFrame = mt.data.map.movieInfo.lastFrame;
						
					}
					else{
						this._lastFrame =  movie.info.lastFrame || mt.data.map.movieInfo.lastFrame;
					}
					
				}
				this._mainTimer = mt.game.time.create(false);
				
				if(movie.subdata && movie.subdata.length > 0){
					this._buildSubTweens(movie.subdata);
				}
			}
			
			if(movie.frames.length === 0){
				return null;
			}
			
			var start = movie.frames[0];
			this._startPos.push({obj: pack.self, start: start});
			
			for(var k in start){
				tween = null;
				delay = this._delay;
				for(var i=0; i<movie.frames.length - 1; i++){
					start = movie.frames[i];
					stop = movie.frames[i+1];
					if(start.keyframe > this._lastFrame){
						break;
					}
					var ea = null;
					if(stop.easings){
						ea = stop.easings[k];
					}
					
					/*var ss = mt._mkDiff(start, stop);
					if(!ss[k]){
						continue;
					}*/
					var tmp = {};
					tmp[k] = stop[k];
					
					tween = this._addTween(pack.self, start, stop, ea, tween, tmp, delay);
					delay = 0;
				}
				if(tween){
					this._tweens.push(tween);
				}
			}
			return;
		},
		
		_buildChildTweens: function(children){
			var child;
			for(var key in children){
				child = children[key];
				if(!child.mt || !child.mt.data.movies || !child.mt.data.movies[this.name]){
					continue;
				}
				this._buildTweens(child.mt);
				this._buildChildTweens(child.mt.children);
			}
		},
		
		_buildSubTweens: function(sub){
			var st, innerData, delay, frame;
			var that = this;
			
			for(var i=0; i<sub.length; i++){
				innerData = sub[i].movies[this.name];
				if(!innerData || !innerData.frames || innerData.frames.length === 0){
					continue;
				}
				for(var c in this._pack.children){
					for(var fi=0; fi<innerData.frames.length; fi++){
						frame = innerData.frames[fi];
						
						st = new TweenCollection(sub[i].name, this._pack.children[c].mt, this._fps, Math.min(frame.length + frame.keyframe, this._lastFrame)*this._ifps, frame.keyframe);
						this._addSubTween(st);
					}
				}
			}
		},
		
		_mk_sub: function(timer, delay, name, children){
			var that = this;
			return function(){
				timer.add(delay, function(){
					that._playChildren(name, children);
				});
				timer.start();
			}
		},
		_playChildren: function(movie, children){
			for(var c in children){
				children[c].mt.movies[movie].start().loop();
			}
		},
 
		/*
		 * TODO: make easings work
		 */
		_addTween: function(obj, start, stop, easing, nextTween, to, delay){
			var tween;
			var st = start.keyframe * this._ifps;
			var et = (stop.keyframe - start.keyframe) * this._ifps;
			
			if(!nextTween){
				tween = new Phaser.Tween(obj, mt.game, this.manager);
				if(delay){
					tween = tween.delay(delay * this._ifps);
				}
			}
			else{
				tween = nextTween;
			}
			
			var ea = null;
			if(easing){
				ea = Phaser.Easing;
				var t = easing.split(".");
				while(t.length){
					ea = ea[t.shift()];
				}
			}
			
			tween = tween.to(to, et, ea);
			return tween;
		},
 
		_addSubTween: function(tween){
			this._subtweens.push(tween);
		},
		_stop: function(reset){
			mt.game.plugins.remove(this.manager);
			this.manager.removeAll();
			this.manager.update();
			
			var i, j, tween, l;
			this._mainTimer.stop();
			
			for(i=0; i<this._subtweens.length; i++){
				this._subtweens[i].stop(reset);
			}
			
			for(i=0; i<this._tweens.length; i++){
				this._tweens[i].stop();
				tween = this._tweens[i];
				for(j=0, l = tween._chainedTweens.length; j<l; j++){
					tween = tween._chainedTweens[j];
					tween.stop();
				}
			}
			
			if(reset){
				this.reset();
			}
		},
		start: function(){
			var i, j, l, tween;
			if(!this._subtweens.length && !this._tweens.length){
				return this;
			}
			
			if(!this._mainTimer){
				return this;
			}
			
			mt.game.plugins.add(this.manager);
			
			this._mainTimer.removeAll();
			
			this._mainTimer.add(this._ifps * this._lastFrame, this._complete, this);
			this._mainTimer.start();
			this.reset();
			this.resume();
			
			for(i=0; i<this._subtweens.length; i++){
				this._subtweens[i].start();
			}
			
			for(i=0; i<this._tweens.length; i++){
				tween = this._tweens[i];
				tween._paused = false;
				tween.pendingDelete = false;
				tween.start();
				
				
				for(j=0,l=tween._chainedTweens.length; j<l; j++){
					tween = tween._chainedTweens[j];
					tween._paused = false;
					tween.pendingDelete = false;
				}
			}
			
			
			return this;
		},
		stop: function(reset){
			
			this._stop();
			if(reset){
				this.reset();
			}
			this.isLooping = false;
			
			return this;
		},
		
		reset: function(){
			var op, sub;
			for(var i=0; i<this._startPos.length; i++){
				op = this._startPos[i];
				for(var k in op.start){
					op.obj[k] = op.start[k];
				}
			}
		},
		pause: function(){
			var i, j, tween;
			this._mainTimer.pause();
			for(i=0; i<this._tweens.length; i++){
				tween = this._tweens[i];
				tween.pause();
				for(j=0; j<tween._chainedTweens.length; j++){
					tween = tween._chainedTweens[j];
					tween.pause();
				}
			}
			for(i=0; i<this._subtweens.length; i++){
				this._subtweens[i].pause();
			}
			
			return this;
		},
		resume: function(){
			var i, j, tween;
			this._mainTimer.resume();
			for(i=0; i<this._tweens.length; i++){
				tween = this._tweens[i];
				tween.resume();
				for(j=0; j<tween._chainedTweens.length; j++){
					tween = tween._chainedTweens[j];
					tween.resume();
				}
				
				
			}
			for(i=0; i<this._subtweens.length; i++){
				this._subtweens[i].resume();
			}
			
			return this;
		},
		
		delay: function(ms){
			this.delay.removeAll();
			this._delay.add(ms, this.start, this);
			return this;
		},
		
		loop: function(){
			if(this.isLooping){
				return;
			}
			this.isLooping = true;
			for(var i=0; i<this._subtweens.length; i++){
				this._subtweens[i].loop();
			}
			return this;
		},
		
		_complete: function(){
			this.onComplete.dispatch(this);
			this._stop();
			if(this.isLooping){
				this.start();
			}
		}
	};
	
	mt.TweenCollection = TweenCollection;
})();
