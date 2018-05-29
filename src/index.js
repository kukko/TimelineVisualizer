class Timeline{
	constructor(canvas, items){
		this.canvas=canvas;
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
		if (!item.hasCoordinates){
			if (item.previous!==null){
				let previouses=this.getItemsByIDs(item.previous);
				for (let index in previouses){
					if (previouses[index]._name===item._name){
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
			return item.x<x && item.x+item.width>x && item.y<y && item.y+item.height>y;
		})!=="undefined";
	}
	render(items){
		let context=this.canvas.getContext("2d");
		if (items.length>0){
			context.textBaseline="middle";
			let fontSize=this.options.lineHeight-2*this.options.padding;
			context.font=fontSize+"px Arial";
			for (let index in items){
				this.setElementColor(items[index]);
				let coordinates=this.getPossibleCoordinates(items[index]);
				let textWidth=context.measureText(items[index].name).width;
				context.fillStyle=items[index].color;
				items[index].width=textWidth+2*this.options.padding;
				items[index].height=this.options.lineHeight+2*this.options.padding;
				if (items[index].previous!==null){
					this.getItemsByIDs(items[index].previous).forEach((previous)=>{
						this.drawLine(context, previous, items[index]);
					});
				}
				context.fillRect(items[index].x, items[index].y, items[index].width, items[index].height);
				context.fillStyle="#000000";
				context.fillText(items[index].name, items[index].x+this.options.padding, items[index].y+this.options.lineHeight/2+this.options.padding);
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

	get hasPrevious(){
		return typeof this.previous!=="undefined" && this.previous!==null;
	}

	get hasCoordinates(){
		return typeof this.x!=="undefined" && typeof this.y!=="undefined";
	}
}