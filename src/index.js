class Timeline{
	constructor(canvas, items){
		this.canvas=canvas;
		this.items=[];
		this.setItems(items);
		this.options={
			padding:5,
			lineHeight:30,
			margin:10
		};
		this.render();
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
	render(){
		let context=this.canvas.getContext("2d"),
			roots=this.items.filter((item)=>{
				return typeof item.previous==="undefined" || item.previous===null;
			});
		if (roots.length>0){
			let fullWidth=0;
			context.textBaseline="middle";
			let fontSize=this.options.lineHeight-2*this.options.padding;
			for (let index in roots){
				context.fillStyle="#000000";
				context.font=fontSize+"px Arial";
				let textWidth=context.measureText(roots[index].name).width;
				context.fillStyle="#FF0000";
				context.fillRect(fullWidth+((this.options.padding*2+this.options.margin)*index), 0, textWidth+2*this.options.padding, this.options.lineHeight+2*this.options.padding);
				context.fillStyle="#000000";
				context.font=fontSize+"px Arial";
				context.fillText(roots[index].name, fullWidth+((this.options.padding*2+this.options.margin)*index)+this.options.padding, this.options.lineHeight/2+this.options.padding);
				fullWidth+=textWidth;
			}
		}
		else{
			console.log("NO ROOTS");
		}
	}
}
class TimelineItem{
	constructor(name, previous, number, id){
		this._id="";
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