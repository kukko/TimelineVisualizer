class Timeline{
	constructor(canvas, items){
		this.canvas=canvas;
		this.context=this.canvas.getContext("2d");
		this.items=[];
		this.setItems(items);
		this.options={
			padding:5,
			lineHeight:30,
			margin:30
		};
		this.render(this.getItemsWithPrevious(null));
	}
	setItems(items){
		for (let index in items){
			this.addItem(items[index]);
		}
	}
	addItem(item){
		if (typeof this.items.find((currentItem)=>{
			return currentItem.id===item.id;
		})==="undefined"){
			if (item.id===null){
				item.id=this.generateItemID();
			}
			if (typeof item.previous==="object" && item.previous!==null && item.previous.constructor.name!=="Array"){
				item.previous=this.addItem(item.previous);
			}
			this.items.push(item);
			return item.id;
		}
		throw "Element with the same ID, already added.";
	}
	generateItemID(checkExisting=true){
		let length=8,
			output="";
		do{
			output=this.generateRandomStr(length);
		} while (checkExisting && typeof this.items.find((item)=>{
			return item.id===output;
		})!=="undefined");
		return output;
	}
	generateRandomStr(length, chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"){
		let output="";
		for (let i=0; i<length; i++){
			output+=chars.charAt(Math.floor(Math.random()*chars.length));
		}
		return output;
	}
	getItemsWithPrevious(parent){
		return this.items.filter((item)=>{
			return (item.previous!==null && item.previous.indexOf(parent)!==-1) || (parent===null && (typeof item.previous==="undefined" || item.previous===parent));
		});
	}
	getItemByID(id){
		return this.items.find((item)=>{
			return item.id===id;
		});
	}
	getItemsByIDs(IDs){
		let output=[];
		if (IDs.length>0){
			for (let index in this.items){
				if (IDs.indexOf(this.items[index].id)!==-1){
					output.push(this.items[index]);
					if (output.length===IDs.length){
						break;
					}
				}
			}
		}
		return output;
	}
	drawLine(context, previous, item){
		context.strokeStyle=previous.color;
		context.lineWidth=5;
		context.beginPath();
		context.moveTo(item.x+item.width/2, item.y);
		context.lineTo(previous.x+previous.width/2, previous.y+previous.height);
		context.stroke();
	}
	setElementColor(item){
		if (typeof item.color==="undefined"){
			if (item.hasPrevious){
				for (let index in item.previous){
					if (typeof item.color==="undefined"){
						let previous=this.getItemByID(item.previous[index]);
						if (previous._name===item._name){
							item.color=previous.color;
						}
						else{
							item.color="#"+this.generateRandomStr(6, "0123456789ABCDEF");
						}
					}
				}
			}
			else{
				item.color="#"+this.generateRandomStr(6, "0123456789ABCDEF");
			}
		}
	}
	getPossibleCoordinates(item){
		let textWidth=this.context.measureText(item.getName(this.getLastInLine(item))).width;
		item.width=textWidth+2*this.options.padding;
		item.height=this.options.lineHeight+2*this.options.padding;
		if (!item.hasCoordinates){
			if (item.previous!==null){
				let previouses=this.getItemsByIDs(item.previous);
				for (let index in previouses){
					if (previouses[index]._name===item._name){
						if ((!previouses[index].isGrouped || item.previous.length>1) && item.hasPrevious){
							if (this.getItemsWithPrevious(item.id).length<=1){
								let newX,
									newY;
								if (!previouses[index].hasCoordinates){
									this.getPossibleCoordinates(previouses[index], true);
								}
								do{
									newX=typeof newX==="undefined"?previouses[index].x:newX+previouses[index].width+this.options.margin,
									newY=previouses[index].y+previouses[index].height+this.options.margin;
								} while (this.coordinateIsCollisioning(newX, newY));
								item.x=newX;
								item.y=newY;
							}
						}
						else{
							if (!item.hasCoordinates){
								let previous=this.getFirstInLine(previouses[index].grouped);
								if (!previous.hasCoordinates){
									this.getPossibleCoordinates(previous, true);
								}
								let newX=previous.x,
									newY=previous.y+previous.height+this.options.margin;
								if (!this.coordinateIsCollisioning(newX, newY)){
									item.x=newX;
									item.y=newY;
								}
							}
						}
					}
					else{
						let newX,
							newY;
						if (item._name==="Fantastic Four"){
							this.getItemsWithPrevious(previouses[index].id).find((continuation)=>{
								if (continuation._name===previouses[index]._name){
									this.getPossibleCoordinates(continuation);
									return true;
								}
								return false;
							});
						}
						do{
							if (!previouses[index].hasCoordinates){
								this.getPossibleCoordinates(previouses[index], true);
							}
							newX=typeof newX==="undefined"?previouses[index].x:newX+previouses[index].width+this.options.margin;
							newY=previouses[index].y+previouses[index].height+this.options.margin;
						} while (this.coordinateIsCollisioning(newX, newY));
						item.x=newX;
						item.y=newY;
					}
					if (item.hasCoordinates){
						break;
					}
				}
				if (!item.hasCoordinates){
					for (let index in previouses){
						if (!previouses[index].hasCoordinates){
							this.getPossibleCoordinates(previouses[index], true);
						}
						let newX=previouses[index].x,
							newY=previouses[index].y+previouses[index].height+this.options.margin;
						if (!this.coordinateIsCollisioning(newX, newY)){
							item.x=newX;
							item.y=newY;
						}
					}
				}
			}
			else{
				let anotherRoots=this.items.filter((anotherRoot)=>{
					return anotherRoot.previous===null && anotherRoot.id!==item.id && anotherRoot.hasCoordinates;
				});
				if (anotherRoots.length>0){
					let latestRoot=anotherRoots[anotherRoots.length-1];
					item.x=latestRoot.x+latestRoot.width+this.options.margin;
					item.y=0;
				}
				else{
					item.x=0;
					item.y=0;
				}
			}
		}
	}
	coordinateIsCollisioning(x, y){
		return typeof this.items.find((item)=>{
			return item.x<=x && item.x+item.width>=x && item.y<=y && item.y+item.height>=y;
		})!=="undefined";
	}
	getLastInLine(item){
		let next=this.items.find((currentItem)=>{
			return currentItem._name===item._name && 
					currentItem.hasPrevious && 
					currentItem.previous.length===1 && 
					this.getItemsWithPrevious(item.id).length<=1 && 
					currentItem.previous[0]===item.id;
		});
		if (typeof next!=="undefined"){
			next.grouped=item.id;
			next.x=item.x;
			next.y=item.y;
			return this.getLastInLine(next);
		}
		return item.number;
	}
	getFirstInLine(id){
		let previous=this.getItemByID(id);
		if (previous.isGrouped){
			return this.getFirstInLine(previous.grouped);
		}
		return previous;
	}
	render(items){
		let context=this.canvas.getContext("2d");
		if (items.length>0){
			context.lineCap="round";
			context.textBaseline="middle";
			let fontSize=this.options.lineHeight-2*this.options.padding;
			context.font=fontSize+"px Arial";
			for (let index in items){
				this.setElementColor(items[index]);
				let coordinates=this.getPossibleCoordinates(items[index]),
					lastNumber=this.getLastInLine(items[index]);
				context.fillStyle=items[index].color;
				if (items[index].previous!==null && !items[index].isGrouped){
					this.getItemsByIDs(items[index].previous).forEach((previous)=>{
						if (previous.isGrouped){
							this.drawLine(context, this.getFirstInLine(previous.grouped), items[index]);
						}
						else{
							this.drawLine(context, previous, items[index]);
						}
					});
				}
				if (!items[index].isGrouped){
					context.fillRect(items[index].x, items[index].y, items[index].width, items[index].height);
					context.fillStyle=items[index].fontColor;
					context.fillText(items[index].getName(lastNumber), items[index].x+this.options.padding, items[index].y+this.options.lineHeight/2+this.options.padding);
				}
				this.render(this.getItemsWithPrevious(items[index].id));
			}
		}
	}
}
class TimelineItem{
	constructor(name, previous, number, id){
		this._id=typeof id!=="undefined" && id!==null?id:"";
		this._name=name;
		if (typeof previous==="number"){
			this.previous=[
				previous
			];
		}
		else{
			this.previous=previous;
		}
		this.number=number;
		this.grouped=null;
	}
	get id(){
		if (this._id!==""){
			return this._id;
		}
		return null;
	}
	set id(value){
		if (this._id===""){
			this._id=value;
		}
	}
	get name(){
		return this._name+(this.number!==null?(" #"+this.number):"");
	}

	getName(lastNumber){
		if (this.number!==null && lastNumber!==this.number){
			return this.name+"-"+lastNumber;
		}
		return this.name;
	}

	get hasPrevious(){
		return typeof this.previous!=="undefined" && this.previous!==null;
	}

	get hasCoordinates(){
		return typeof this.x!=="undefined" && typeof this.y!=="undefined";
	}

	get isGrouped(){
		return this.grouped!==null;
	}

	get fontColor(){
		let colorParts=this.color.replace("#", "").match(/.{2}/g),
			sum=0;
		for (let key in colorParts){
			sum+=colorParts[key]=parseInt(colorParts[key], 16);
		}
		return sum/colorParts.length<255/2?"#FFFFFF":"#000000";
	}
}