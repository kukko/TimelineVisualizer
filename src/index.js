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
		if (item.id===null){
			item.id=this.generateItemID();
		}
		if (typeof item.previous==="object" && item.previous!==null){
			item.previous=this.addItem(item.previous);
		}
		this.items.push(item);
		return item.id;
	}
	generateItemID(checkExisting=true){
		let chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
			length=8,
			output="";
		do{
			for (let i=0; i<length; i++){
				output+=chars.charAt(Math.floor(Math.random()*chars.length));
			}
		} while (checkExisting && typeof this.items.find((item)=>{
			return item.id===output;
		})!=="undefined");
		return output;
	}
	getItemsWithPrevious(parent){
		return this.items.filter((item)=>{
			return item.previous===parent || (parent===null && (typeof item.previous==="undefined" || item.previous===parent));
		})
	}
	getItemByID(id){
		return this.items.find((item)=>{
			return item.id===id;
		})
	}
	render(items, depth=0){
		let context=this.canvas.getContext("2d");
		if (items.length>0){
			let fullWidth=0;
			context.textBaseline="middle";
			let fontSize=this.options.lineHeight-2*this.options.padding;
			for (let index in items){
				context.fillStyle="#000000";
				context.font=fontSize+"px Arial";
				let textWidth=context.measureText(items[index].name).width;
				context.fillStyle="#FF0000";
				items[index].x=fullWidth+((this.options.padding*2+this.options.margin)*index);
				items[index].y=depth*(this.options.lineHeight+2*this.options.padding+this.options.margin);
				items[index].width=textWidth+2*this.options.padding;
				items[index].height=this.options.lineHeight+2*this.options.padding;
				context.fillRect(items[index].x, items[index].y, items[index].width, items[index].height);
				context.fillStyle="#000000";
				context.font=fontSize+"px Arial";
				context.fillText(items[index].name, fullWidth+((this.options.padding*2+this.options.margin)*index)+this.options.padding, (depth*(this.options.lineHeight+2*this.options.padding+this.options.margin))+this.options.lineHeight/2+this.options.padding);
				fullWidth+=textWidth;
				if (items[index].previous!==null){
					let previous=this.getItemByID(items[index].previous);
					context.strokeStyle="#FF0000";
					context.lineWidth=5;
					context.beginPath();
					context.moveTo(items[index].x+items[index].width/2, items[index].y);
					context.lineTo(previous.x+previous.width/2, previous.y+previous.height);
					context.stroke();
				}
				this.render(this.getItemsWithPrevious(items[index].id), depth+1);
			}
		}
	}
}
class TimelineItem{
	constructor(name, previous, number, id){
		this._id=typeof id!=="undefined" && id!==null?id:"";
		this._name=name;
		this.previous=previous;
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
}