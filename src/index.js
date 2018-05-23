class Timeline{
	constructor(canvas, items){
		this.canvas=canvas;
		this.items=[];
		this.setItems(items);
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
		if (typeof item.previous!=="undefined"){
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
}
class TimelineItem{
	constructor(name, previous){
		this._id="";
		this.name=name;
		this.previous=previous;
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
}